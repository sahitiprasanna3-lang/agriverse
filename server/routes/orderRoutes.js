import express from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  advanceOrder,
  getOffers,
  createOffer,
  updateOffer,
  getDisputes,
  createDispute,
  resolveDispute,
  getBlockchainBlocks,
  getFpoReviews,
} from '../controllers/orderController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders', optionalAuth, createOrder);
router.put('/orders/:id/advance', advanceOrder);
router.put('/orders/:id', updateOrder);

router.get('/offers', getOffers);
router.post('/offers', optionalAuth, createOffer);
router.put('/offers/:id', updateOffer);

router.get('/disputes', getDisputes);
router.post('/disputes', optionalAuth, createDispute);
router.put('/disputes/:id/resolve', resolveDispute);

router.get('/blockchain/blocks', getBlockchainBlocks);
router.get('/fpo/reviews', getFpoReviews);

export default router;
