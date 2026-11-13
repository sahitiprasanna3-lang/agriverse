import express from 'express';
import {
  getGatewayConfig,
  createGatewayOrder,
  verifyGatewayPayment,
  getGatewayTransactions,
  createUpiIntent,
  confirmUpiPayment,
  getUpiTransactions,
} from '../controllers/paymentController.js';

const router = express.Router();

// Razorpay & CashPay (Cashfree PG) In-App Payment Gateway Routes
router.get('/payments/gateway/config', getGatewayConfig);
router.post('/payments/gateway/create-order', createGatewayOrder);
router.post('/payments/gateway/verify', verifyGatewayPayment);
router.get('/payments/gateway/transactions', getGatewayTransactions);

// Direct NPCI UPI Routes
router.post('/payments/upi/intent', createUpiIntent);
router.post('/payments/upi/confirm', confirmUpiPayment);
router.get('/payments/upi/transactions', getUpiTransactions);

export default router;
