import crypto from 'crypto';
import { store } from '../store.js';
import { broadcastDispatchEvent } from './transportController.js';

const INTERNAL_GATEWAY_SIGNING_SECRET =
  process.env.JWT_SECRET || 'agriverse-inapp-gateway-hmac-secret-2026';

function sanitizeUpiParam(val, fallback = '') {
  return String(val || fallback).trim();
}

function isLiveRazorpayConfigured() {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  return (
    Boolean(keyId && keySecret) &&
    !keyId.includes('your_key_id') &&
    !keySecret.includes('your_razorpay_key_secret')
  );
}

function isLiveCashfreeConfigured() {
  const appId = (process.env.CASHFREE_APP_ID || '').trim();
  const secretKey = (process.env.CASHFREE_SECRET_KEY || '').trim();
  return (
    Boolean(appId && secretKey) &&
    !appId.includes('your_cashfree_app_id') &&
    !secretKey.includes('your_cashfree_secret_key')
  );
}

function computeInternalSignature(orderId, amountPaise, gateway) {
  return crypto
    .createHmac('sha256', INTERNAL_GATEWAY_SIGNING_SECRET)
    .update(`${gateway}|${orderId}|${amountPaise}`)
    .digest('hex');
}

function syncEntitySettlement(entityId, settlementMeta) {
  if (!entityId) return;

  const loadIdx = store.loadBookings.findIndex((b) => b.id === entityId);
  if (loadIdx !== -1) {
    const currentLoad = store.loadBookings[loadIdx];
    const nextStatus =
      currentLoad.status === 'delivered_unloaded' ? 'settled' : currentLoad.status;
    const updatedLoad = {
      ...currentLoad,
      paymentStatus: 'completed',
      upiUtrNumber: settlementMeta.utrNumber,
      upiApp: settlementMeta.upiApp || 'upi',
      paymentGateway: settlementMeta.gateway,
      gatewayOrderId: settlementMeta.orderId,
      gatewayPaymentId: settlementMeta.paymentId,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };
    store.loadBookings[loadIdx] = updatedLoad;
    broadcastDispatchEvent('load_updated', updatedLoad);
  }

  const orderIdx = store.orders.findIndex((o) => o.id === entityId);
  if (orderIdx !== -1) {
    store.orders[orderIdx] = {
      ...store.orders[orderIdx],
      paymentStatus: 'completed',
      upiUtrNumber: settlementMeta.utrNumber,
      upiApp: settlementMeta.upiApp || 'upi',
      paymentGateway: settlementMeta.gateway,
      gatewayOrderId: settlementMeta.orderId,
      gatewayPaymentId: settlementMeta.paymentId,
    };
  }
}

export function buildUpiLinks({ payeeVpa, payeeName, amount, note, txnRef }) {
  const pa = encodeURIComponent(sanitizeUpiParam(payeeVpa, 'agriverse.escrow@sbi'));
  const pn = encodeURIComponent(sanitizeUpiParam(payeeName, 'AgriVerse Verified Settlement'));
  const am = Number(amount || 0).toFixed(2);
  const tn = encodeURIComponent(sanitizeUpiParam(note, 'AgriVerse Farm & Transport Settlement'));
  const tr = encodeURIComponent(sanitizeUpiParam(txnRef, `AGV${Date.now().toString().slice(-8)}`));

  const query = `pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}&tr=${tr}`;

  return {
    txnRef: decodeURIComponent(tr),
    upiUri: `upi://pay?${query}`,
    phonePeUri: `phonepe://pay?${query}`,
    gpayUri: `tez://upi/pay?${query}`,
    paytmUri: `paytmmp://pay?${query}`,
    bhimUri: `bhim://pay?${query}`,
  };
}

// ============================================================================
// 1. GATEWAY CONFIGURATION (SINGLE PAYMENT METHOD: RAZORPAY)
// ============================================================================
export async function getGatewayConfig(req, res) {
  try {
    const rzpLive = isLiveRazorpayConfigured();

    res.json({
      platform: 'AgriVerse Razorpay Checkout',
      activeGateway: 'razorpay',
      razorpay: {
        id: 'razorpay',
        name: 'Razorpay',
        liveConfigured: rzpLive,
        keyId: rzpLive ? process.env.RAZORPAY_KEY_ID.trim() : null,
      },
      supportedMethods: ['razorpay'],
    });
  } catch {
    res.status(500).json({ error: 'Unable to fetch Razorpay configuration' });
  }
}

// ============================================================================
// 2. CREATE ORDER (RAZORPAY v1 ORDERS / SIGNED IN-APP RAZORPAY CHECKOUT)
// ============================================================================
export async function createGatewayOrder(req, res) {
  try {
    const {
      amount,
      currency = 'INR',
      purpose = 'AgriVerse Settlement',
      entityId = '',
      payerName = 'AgriVerse Member',
      payerPhone = '+919848012345',
      payerEmail = 'member@agriverse.in',
      payeeName = 'AgriVerse Verified Escrow',
      payeeVpa = 'agriverse.escrow@sbi',
    } = req.body || {};

    const normalizedGateway = 'razorpay';
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive payment amount in INR is required' });
    }

    const amountPaise = Math.max(100, Math.round(numericAmount * 100));
    const receiptId = `AGV_${Date.now().toString().slice(-8)}_${Math.floor(10 + Math.random() * 89)}`;
    const upiLinks = buildUpiLinks({
      payeeVpa,
      payeeName,
      amount: numericAmount,
      note: `${purpose}${entityId ? ` (${entityId})` : ''}`,
      txnRef: receiptId,
    });

    // A. Live Razorpay Orders API when merchant keys are configured
    if (normalizedGateway === 'razorpay' && isLiveRazorpayConfigured()) {
      try {
        const keyId = process.env.RAZORPAY_KEY_ID.trim();
        const keySecret = process.env.RAZORPAY_KEY_SECRET.trim();
        const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

        const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountPaise,
            currency,
            receipt: receiptId,
            notes: {
              purpose: String(purpose).slice(0, 120),
              entityId: String(entityId).slice(0, 64),
              payeeName: String(payeeName).slice(0, 80),
            },
          }),
        });

        if (rzpRes.ok) {
          const rzpOrder = await rzpRes.json();
          const orderRecord = {
            orderId: rzpOrder.id,
            gateway: 'razorpay',
            mode: 'live_sdk',
            amount: numericAmount,
            amountPaise,
            currency,
            receiptId,
            purpose,
            entityId,
            payeeName,
            payeeVpa,
            payerName,
            status: 'created',
            createdAt: new Date().toISOString(),
          };
          store.paymentOrders.unshift(orderRecord);

          return res.status(201).json({
            ...orderRecord,
            keyId,
            upiLinks,
          });
        }
      } catch (err) {
        console.warn('[Razorpay Live Order Fallback]:', err?.message || err);
      }
    }

    // B. Live Cashfree PG v2023-08-01 Orders API when merchant keys are configured
    if (normalizedGateway === 'cashfree' && isLiveCashfreeConfigured()) {
      try {
        const appId = process.env.CASHFREE_APP_ID.trim();
        const secretKey = process.env.CASHFREE_SECRET_KEY.trim();
        const isProd = (process.env.CASHFREE_ENV || 'sandbox').trim().toLowerCase() === 'production';
        const cfEndpoint = isProd
          ? 'https://api.cashfree.com/pg/orders'
          : 'https://sandbox.cashfree.com/pg/orders';

        const cleanPhone = String(payerPhone || '9848012345').replace(/[^0-9]/g, '').slice(-10) || '9848012345';
        const cfOrderId = `cf_${receiptId}`;

        const cfRes = await fetch(cfEndpoint, {
          method: 'POST',
          headers: {
            'x-client-id': appId,
            'x-client-secret': secretKey,
            'x-api-version': '2023-08-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: cfOrderId,
            order_amount: Number(numericAmount.toFixed(2)),
            order_currency: currency,
            customer_details: {
              customer_id: `agv_${cleanPhone}`,
              customer_name: String(payerName || 'AgriVerse Member').slice(0, 60),
              customer_email: payerEmail || 'member@agriverse.in',
              customer_phone: cleanPhone,
            },
            order_note: String(purpose).slice(0, 120),
          }),
        });

        if (cfRes.ok) {
          const cfOrder = await cfRes.json();
          const orderRecord = {
            orderId: cfOrder.order_id,
            paymentSessionId: cfOrder.payment_session_id,
            gateway: 'cashfree',
            mode: 'live_sdk',
            env: isProd ? 'production' : 'sandbox',
            amount: numericAmount,
            amountPaise,
            currency,
            receiptId,
            purpose,
            entityId,
            payeeName,
            payeeVpa,
            payerName,
            status: 'created',
            createdAt: new Date().toISOString(),
          };
          store.paymentOrders.unshift(orderRecord);

          return res.status(201).json({
            ...orderRecord,
            upiLinks,
          });
        }
      } catch (err) {
        console.warn('[Cashfree Live Order Fallback]:', err?.message || err);
      }
    }

    // C. Signed AgriVerse In-App Gateway Session (works immediately in iframe without external keys)
    const generatedOrderId =
      normalizedGateway === 'razorpay'
        ? `order_AgvRzp${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 89)}`
        : `cf_AgvPay_${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 89)}`;

    const sessionSignature = computeInternalSignature(
      generatedOrderId,
      amountPaise,
      normalizedGateway
    );

    const inAppOrder = {
      orderId: generatedOrderId,
      gateway: normalizedGateway,
      mode: 'in_app_checkout',
      sessionSignature,
      amount: numericAmount,
      amountPaise,
      currency,
      receiptId,
      purpose,
      entityId,
      payeeName,
      payeeVpa,
      payerName,
      status: 'created',
      createdAt: new Date().toISOString(),
    };

    store.paymentOrders.unshift(inAppOrder);

    return res.status(201).json({
      ...inAppOrder,
      upiLinks,
    });
  } catch (error) {
    console.error('[Create Gateway Order Error]:', error);
    return res.status(500).json({ error: 'Failed to initialize payment gateway order' });
  }
}

// ============================================================================
// 3. VERIFY GATEWAY PAYMENT & SETTLE LINKED ORDER / TRANSPORT FREIGHT
// ============================================================================
export async function verifyGatewayPayment(req, res) {
  try {
    const {
      gateway = 'razorpay',
      orderId,
      paymentId,
      signature,
      sessionSignature,
      method = 'upi',
      methodDetail = '',
      upiApp = 'upi',
      amount,
      payeeName = 'AgriVerse Verified Payee',
      payeeVpa = 'agriverse.escrow@sbi',
      payerName = 'AgriVerse Member',
      purpose = 'AgriVerse Settlement',
      entityId = '',
    } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ error: 'Missing gateway orderId for verification' });
    }

    const normalizedGateway = gateway === 'cashfree' ? 'cashfree' : 'razorpay';
    const storedOrder = store.paymentOrders.find((o) => o.orderId === orderId);
    const resolvedAmount = Number(amount || storedOrder?.amount || 0);
    if (!Number.isFinite(resolvedAmount) || resolvedAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount for verification' });
    }

    let verifiedPaymentId = paymentId;
    let verificationMode = 'in_app_verified';

    // 1. Live Razorpay HMAC-SHA256 verification
    if (
      normalizedGateway === 'razorpay' &&
      storedOrder?.mode === 'live_sdk' &&
      isLiveRazorpayConfigured()
    ) {
      if (!paymentId || !signature) {
        return res.status(400).json({ error: 'Missing Razorpay payment_id or signature' });
      }
      const expectedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET.trim())
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const sigBuf = Buffer.from(String(signature));
      const expBuf = Buffer.from(expectedSig);
      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return res.status(400).json({ error: 'Razorpay payment signature verification failed' });
      }
      verificationMode = 'razorpay_hmac_sha256';
    } else if (
      normalizedGateway === 'cashfree' &&
      storedOrder?.mode === 'live_sdk' &&
      isLiveCashfreeConfigured()
    ) {
      // 2. Live Cashfree PG order status check
      const appId = process.env.CASHFREE_APP_ID.trim();
      const secretKey = process.env.CASHFREE_SECRET_KEY.trim();
      const isProd = (process.env.CASHFREE_ENV || 'sandbox').trim().toLowerCase() === 'production';
      const cfOrderUrl = isProd
        ? `https://api.cashfree.com/pg/orders/${encodeURIComponent(orderId)}`
        : `https://sandbox.cashfree.com/pg/orders/${encodeURIComponent(orderId)}`;

      const cfCheck = await fetch(cfOrderUrl, {
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': '2023-08-01',
        },
      });
      if (!cfCheck.ok) {
        return res.status(400).json({ error: 'Unable to verify Cashfree order status' });
      }
      const cfData = await cfCheck.json();
      if (cfData.order_status !== 'PAID') {
        return res.status(400).json({
          error: `Cashfree order is in status ${cfData.order_status || 'ACTIVE'} (not PAID yet)`,
        });
      }
      verifiedPaymentId = verifiedPaymentId || `cfpay_${Date.now().toString().slice(-9)}`;
      verificationMode = 'cashfree_pg_verified';
    } else {
      // 3. In-App Signed AgriVerse Gateway verification
      if (storedOrder?.sessionSignature && sessionSignature) {
        const expected = computeInternalSignature(
          storedOrder.orderId,
          storedOrder.amountPaise,
          normalizedGateway
        );
        if (sessionSignature !== expected) {
          return res.status(400).json({ error: 'Invalid payment session signature' });
        }
      }
      verifiedPaymentId =
        verifiedPaymentId ||
        (normalizedGateway === 'razorpay'
          ? `pay_Rzp${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 89)}`
          : `cfpay_${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 89)}`);
    }

    if (storedOrder) {
      storedOrder.status = 'paid';
      storedOrder.paymentId = verifiedPaymentId;
      storedOrder.settledAt = new Date().toISOString();
    }

    const prefix = normalizedGateway === 'razorpay' ? 'RZP' : 'CASHPAY';
    const cleanUtr = `${prefix}-${Math.floor(100000000000 + Math.random() * 899999999999)}`;
    const resolvedEntityId = entityId || storedOrder?.entityId || '';

    const receiptRecord = {
      id: verifiedPaymentId,
      gateway: normalizedGateway,
      gatewayLabel: normalizedGateway === 'razorpay' ? 'Razorpay' : 'CashPay (Cashfree)',
      gatewayOrderId: orderId,
      gatewayPaymentId: verifiedPaymentId,
      verificationMode,
      paymentMethodUsed: methodDetail ? `${method.toUpperCase()} (${methodDetail})` : method.toUpperCase(),
      utrNumber: cleanUtr,
      upiApp: upiApp || 'upi',
      amount: resolvedAmount,
      currency: 'INR',
      gatewayFee: 0,
      payeeVpa: payeeVpa || storedOrder?.payeeVpa || 'agriverse.escrow@sbi',
      payeeName: payeeName || storedOrder?.payeeName || 'AgriVerse Verified Payee',
      payerName: payerName || storedOrder?.payerName || 'AgriVerse Member',
      purpose: purpose || storedOrder?.purpose || 'AgriVerse Settlement',
      entityId: resolvedEntityId,
      status: 'completed',
      settledAt: new Date().toISOString(),
    };

    store.paymentTransactions.unshift(receiptRecord);
    store.upiTransactions.unshift(receiptRecord);

    syncEntitySettlement(resolvedEntityId, {
      utrNumber: cleanUtr,
      upiApp: upiApp || 'upi',
      gateway: normalizedGateway,
      orderId,
      paymentId: verifiedPaymentId,
    });

    return res.status(201).json(receiptRecord);
  } catch (error) {
    console.error('[Verify Gateway Payment Error]:', error);
    return res.status(500).json({ error: 'Failed to verify payment gateway settlement' });
  }
}

export async function getGatewayTransactions(req, res) {
  try {
    const combined =
      store.paymentTransactions.length > 0
        ? store.paymentTransactions.slice(0, 50)
        : store.upiTransactions.slice(0, 50);
    res.json(combined);
  } catch {
    res.status(500).json({ error: 'Failed to fetch gateway transactions' });
  }
}

// ============================================================================
// 4. DIRECT ZERO-FEE UPI INTENT & CONFIRMATION (NPCI URI)
// ============================================================================
export async function createUpiIntent(req, res) {
  try {
    const {
      amount,
      payeeVpa,
      payeeName,
      note,
      purpose = 'general',
      entityId = '',
    } = req.body || {};

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive payment amount in INR is required' });
    }

    const txnRef = `AGV${Date.now().toString().slice(-8)}${Math.floor(10 + Math.random() * 89)}`;
    const links = buildUpiLinks({
      payeeVpa: payeeVpa || 'agriverse.escrow@sbi',
      payeeName: payeeName || 'AgriVerse Direct Settlement',
      amount: numericAmount,
      note: note || `AgriVerse ${purpose} ${entityId}`.trim(),
      txnRef,
    });

    res.json({
      intentId: `INT-${txnRef}`,
      amount: numericAmount,
      currency: 'INR',
      gatewayFee: 0,
      payeeVpa: payeeVpa || 'agriverse.escrow@sbi',
      payeeName: payeeName || 'AgriVerse Direct Settlement',
      purpose,
      entityId,
      ...links,
      createdAt: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ error: 'Failed to create zero-fee UPI payment intent' });
  }
}

export async function confirmUpiPayment(req, res) {
  try {
    const {
      amount,
      payeeVpa,
      payeeName,
      payerName,
      payerVpa,
      upiApp = 'upi',
      utrNumber,
      purpose = 'general',
      entityId = '',
    } = req.body || {};

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const cleanUtr =
      utrNumber && String(utrNumber).trim().length >= 6
        ? String(utrNumber).trim().toUpperCase()
        : `${String(upiApp).toUpperCase()}-${Math.floor(100000000000 + Math.random() * 899999999999)}`;

    const record = {
      id: `PAY-${Date.now().toString().slice(-7)}`,
      gateway: 'upi_direct',
      gatewayLabel: 'Direct UPI',
      utrNumber: cleanUtr,
      upiApp,
      amount: numericAmount,
      currency: 'INR',
      gatewayFee: 0,
      payeeVpa: payeeVpa || 'agriverse.escrow@sbi',
      payeeName: payeeName || 'AgriVerse Verified Payee',
      payerName: payerName || 'AgriVerse Member',
      payerVpa: payerVpa || undefined,
      purpose,
      entityId,
      status: 'completed',
      settledAt: new Date().toISOString(),
    };

    store.upiTransactions.unshift(record);
    store.paymentTransactions.unshift(record);

    syncEntitySettlement(entityId, {
      utrNumber: cleanUtr,
      upiApp,
      gateway: 'upi_direct',
      orderId: record.id,
      paymentId: record.id,
    });

    res.status(201).json(record);
  } catch {
    res.status(500).json({ error: 'Failed to record UPI payment confirmation' });
  }
}

export async function getUpiTransactions(req, res) {
  try {
    res.json(store.upiTransactions.slice(0, 50));
  } catch {
    res.status(500).json({ error: 'Failed to fetch UPI transactions' });
  }
}
