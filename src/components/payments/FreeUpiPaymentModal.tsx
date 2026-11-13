import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  RefreshCw,
  CreditCard,
  Lock,
} from 'lucide-react';
import { UpiPaymentReceipt } from '../../types';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface FreeUpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  payeeName: string;
  payeeVpa?: string;
  purposeLabel: string;
  entityId?: string;
  payerName?: string;
  payerPhone?: string;
  payerEmail?: string;
  mode?: 'pay' | 'receive';
  defaultGateway?: 'razorpay' | 'cashfree' | 'upi_direct';
  allowCustomAmount?: boolean;
  onPaymentSuccess?: (receipt: UpiPaymentReceipt) => void;
}

interface UpiLinksBundle {
  txnRef: string;
  upiUri: string;
}

interface RazorpayOrderState {
  orderId: string;
  gateway: 'razorpay';
  mode: 'live_sdk' | 'in_app_checkout';
  keyId?: string;
  sessionSignature?: string;
  amount: number;
  currency: string;
  receiptId: string;
  upiLinks?: UpiLinksBundle;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.getElementById('razorpay-checkout-sdk');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const FreeUpiPaymentModal: React.FC<FreeUpiPaymentModalProps> = ({
  isOpen,
  onClose,
  amount: initialAmount,
  payeeName,
  payeeVpa = 'agriverse.escrow@sbi',
  purposeLabel,
  entityId,
  payerName = 'AgriVerse Member',
  payerPhone = '+919848012345',
  payerEmail = 'member@agriverse.in',
  mode = 'pay',
  allowCustomAmount = false,
  onPaymentSuccess,
}) => {
  const [editableAmount, setEditableAmount] = useState<number>(
    Math.max(1, Number(initialAmount || 100))
  );
  const [gatewayOrder, setGatewayOrder] = useState<RazorpayOrderState | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [payerNote, setPayerNote] = useState<string>('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<UpiPaymentReceipt | null>(null);

  useEffect(() => {
    setEditableAmount(Math.max(1, Number(initialAmount || 100)));
  }, [initialAmount, isOpen]);

  const effectiveAmount = allowCustomAmount
    ? Math.max(1, Number(editableAmount || 0))
    : Math.max(1, Number(initialAmount || 0));

  const fallbackUpiUri = useMemo(() => {
    const pa = encodeURIComponent(payeeVpa);
    const pn = encodeURIComponent(payeeName);
    const am = Number(effectiveAmount || 0).toFixed(2);
    const tn = encodeURIComponent(purposeLabel);
    return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
  }, [payeeVpa, payeeName, effectiveAmount, purposeLabel]);

  // Initialize single Razorpay Order when modal opens or amount changes
  useEffect(() => {
    if (!isOpen) {
      setReceipt(null);
      setErrorMsg(null);
      setPayerNote('');
      return;
    }

    let cancelled = false;

    async function initRazorpayOrder() {
      setIsInitializing(true);
      setErrorMsg(null);
      try {
        const res = await fetch('/api/payments/gateway/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gateway: 'razorpay',
            amount: effectiveAmount,
            currency: 'INR',
            purpose: purposeLabel,
            entityId: entityId || '',
            payerName,
            payerPhone,
            payerEmail,
            payeeName,
            payeeVpa,
          }),
        });

        const data = await res.json();
        if (!cancelled && res.ok) {
          setGatewayOrder(data);
          const qrSource = data?.upiLinks?.upiUri || fallbackUpiUri;
          const qr = await QRCode.toDataURL(qrSource, {
            width: 200,
            margin: 1,
            color: { dark: '#072654', light: '#ffffff' },
          });
          if (!cancelled) setQrDataUrl(qr);
        } else if (!cancelled) {
          const qr = await QRCode.toDataURL(fallbackUpiUri, {
            width: 200,
            margin: 1,
            color: { dark: '#072654', light: '#ffffff' },
          });
          if (!cancelled) setQrDataUrl(qr);
        }
      } catch {
        if (!cancelled) {
          QRCode.toDataURL(fallbackUpiUri, { width: 200, margin: 1 })
            .then((qr) => {
              if (!cancelled) setQrDataUrl(qr);
            })
            .catch(() => {});
        }
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    }

    initRazorpayOrder();

    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    effectiveAmount,
    payeeName,
    payeeVpa,
    purposeLabel,
    entityId,
    payerName,
    payerPhone,
    payerEmail,
    fallbackUpiUri,
  ]);

  if (!isOpen) return null;

  const handleCopyVpa = async () => {
    try {
      await navigator.clipboard.writeText(payeeVpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    } catch {
      // Ignore clipboard restriction
    }
  };

  const handleRazorpayPay = async () => {
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      let currentOrder = gatewayOrder;
      if (!currentOrder || currentOrder.amount !== effectiveAmount) {
        const orderRes = await fetch('/api/payments/gateway/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gateway: 'razorpay',
            amount: effectiveAmount,
            currency: 'INR',
            purpose: purposeLabel,
            entityId: entityId || '',
            payerName,
            payerPhone,
            payerEmail,
            payeeName,
            payeeVpa,
          }),
        });
        if (!orderRes.ok) {
          throw new Error('Could not initialize Razorpay order');
        }
        currentOrder = await orderRes.json();
        setGatewayOrder(currentOrder);
      }

      // Live Razorpay SDK Checkout when live merchant keys are configured
      if (currentOrder?.mode === 'live_sdk' && currentOrder.keyId && mode === 'pay') {
        const loaded = await loadRazorpayScript();
        if (loaded && window.Razorpay) {
          const rzpInstance = new window.Razorpay({
            key: currentOrder.keyId,
            amount: Math.round(effectiveAmount * 100),
            currency: 'INR',
            name: 'AgriVerse',
            description: purposeLabel,
            order_id: currentOrder.orderId,
            prefill: {
              name: payerName,
              email: payerEmail,
              contact: payerPhone,
            },
            theme: { color: '#072654' },
            handler: async (response: any) => {
              const verifyRes = await fetch('/api/payments/gateway/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  gateway: 'razorpay',
                  orderId: response.razorpay_order_id || currentOrder!.orderId,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  method: 'razorpay',
                  methodDetail: payerNote.trim() || 'Razorpay Verified Checkout',
                  amount: effectiveAmount,
                  payeeName,
                  payeeVpa,
                  payerName,
                  purpose: purposeLabel,
                  entityId: entityId || '',
                }),
              });
              const verifiedData = await verifyRes.json();
              if (!verifyRes.ok) {
                setErrorMsg(verifiedData?.error || 'Razorpay verification failed');
                setIsProcessing(false);
                return;
              }
              setReceipt(verifiedData);
              onPaymentSuccess?.(verifiedData);
              setIsProcessing(false);
            },
            modal: {
              ondismiss: () => setIsProcessing(false),
            },
          });
          rzpInstance.open();
          return;
        }
      }

      // Signed In-App Razorpay Verification
      const verifyRes = await fetch('/api/payments/gateway/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: 'razorpay',
          orderId: currentOrder?.orderId || `order_AgvRzp${Date.now().toString().slice(-8)}`,
          sessionSignature: currentOrder?.sessionSignature,
          method: 'razorpay',
          methodDetail: payerNote.trim() || 'Razorpay Instant Checkout',
          upiApp: 'upi',
          amount: effectiveAmount,
          payeeName,
          payeeVpa,
          payerName,
          purpose: purposeLabel,
          entityId: entityId || '',
        }),
      });

      const verifiedData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifiedData?.error || 'Razorpay payment verification failed');
      }

      setReceipt(verifiedData);
      onPaymentSuccess?.(verifiedData);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to complete Razorpay payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Razorpay Secure Checkout"
      id="agriverse-razorpay-checkout-modal"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto text-left">
        {/* Official Razorpay Header */}
        <div className="bg-[#072654] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base tracking-tight text-white">
                  Razorpay Checkout
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono font-bold">
                  VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-sky-200/90">
                Official AgriVerse Single Payment Gateway
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Razorpay Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {receipt ? (
            /* COMPLETED RAZORPAY RECEIPT */
            <div className="space-y-4 py-2">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-heading font-extrabold text-lg text-slate-900">
                  {mode === 'receive' ? 'Razorpay Freight Settled' : 'Razorpay Payment Successful'}
                </h4>
                <p className="text-2xl font-extrabold font-mono tabular-nums text-slate-950">
                  ₹{receipt.amount.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Method</span>
                  <strong className="text-[#072654] font-bold">Razorpay</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Razorpay Payment ID</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {receipt.gatewayPaymentId || receipt.id}
                  </span>
                </div>
                {receipt.gatewayOrderId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Razorpay Order ID</span>
                    <span className="font-mono text-slate-800">{receipt.gatewayOrderId}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bank / UTR Reference</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {receipt.utrNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Beneficiary</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                    {receipt.payeeName}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* ACTIVE SINGLE RAZORPAY CHECKOUT */
            <>
              {/* Beneficiary & Payable Amount Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      {mode === 'receive' ? 'Collect Freight For' : 'Paying Beneficiary'}
                    </span>
                    <p className="font-heading font-bold text-sm text-slate-900 truncate mt-0.5">
                      {payeeName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{purposeLabel}</p>
                  </div>

                  {!allowCustomAmount && (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Amount
                      </span>
                      <span className="text-xl font-extrabold font-mono tabular-nums text-slate-950">
                        ₹{effectiveAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>

                {allowCustomAmount && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Enter Amount (INR ₹)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5000000}
                      value={editableAmount}
                      onChange={(e) => setEditableAmount(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-extrabold text-base tabular-nums text-slate-950 focus:border-[#072654] focus:outline-hidden"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Razorpay Order ID:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {isInitializing
                      ? 'Generating...'
                      : gatewayOrder?.orderId || 'order_AgvRzpReady'}
                  </span>
                </div>
              </div>

              {/* Razorpay Scan & Pay QR + Merchant VPA */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center gap-4">
                <div className="w-32 h-32 rounded-xl border border-slate-200 p-2 bg-white flex items-center justify-center shrink-0">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Razorpay Payment QR"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrCode className="w-10 h-10 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 space-y-2 text-xs w-full">
                  <div className="inline-flex items-center gap-1.5 text-[#072654] font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Razorpay Instant Settlement</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Scan the Razorpay QR or click below to complete secure zero-commission settlement.
                  </p>
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-mono text-[11px] text-slate-800 truncate">
                      {payeeVpa}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyVpa}
                      className="text-[11px] font-bold text-[#072654] hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedVpa ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional Reference / Note */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Reference Note (Optional)
                </label>
                <input
                  type="text"
                  value={payerNote}
                  onChange={(e) => setPayerNote(e.target.value)}
                  placeholder="Optional UTR or remark for farmer/driver receipt"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#072654] focus:outline-hidden"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Primary Single Razorpay Action */}
              <button
                type="button"
                onClick={handleRazorpayPay}
                disabled={isProcessing || isInitializing}
                className="w-full py-3.5 px-4 rounded-xl bg-[#072654] hover:bg-[#0b3574] disabled:opacity-60 text-white font-extrabold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm"
                id="confirm-razorpay-payment-btn"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Razorpay Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-emerald-300" />
                    <span>
                      {mode === 'receive'
                        ? `Confirm ₹${effectiveAmount.toLocaleString('en-IN')} Received via Razorpay`
                        : `Pay ₹${effectiveAmount.toLocaleString('en-IN')} via Razorpay`}
                    </span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit HMAC Signed Razorpay Checkout · ₹0 Extra Platform Fee</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const AgriVersePaymentModal = FreeUpiPaymentModal;
export default FreeUpiPaymentModal;
