import express from 'express';
import {
  getFpoOfficers,
  getSellRequests,
  createSellRequest,
  updateSellRequest,
  acceptSellRequest,
  travelToSeller,
  inspectSellRequest,
  negotiateSellPrice,
  selectSellTransport,
  dispatchSellProduce,
  deliverSellProduce,
  completeSellTransaction,
  aggregateRequests,
} from '../controllers/fpoController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/fpo/officers', getFpoOfficers);
router.get('/fpo/sell-requests', getSellRequests);
router.post('/fpo/sell-requests', optionalAuth, createSellRequest);
router.put('/fpo/sell-requests/:id', updateSellRequest);
router.post('/fpo/aggregate', aggregateRequests);

router.get('/sell-requests', getSellRequests);
router.post('/sell-requests', optionalAuth, createSellRequest);
router.put('/sell-requests/:id', updateSellRequest);
router.put('/sell-requests/:id/accept', acceptSellRequest);
router.put('/sell-requests/:id/travel', travelToSeller);
router.put('/sell-requests/:id/inspect', inspectSellRequest);
router.put('/sell-requests/:id/negotiate-price', negotiateSellPrice);
router.put('/sell-requests/:id/transport', selectSellTransport);
router.put('/sell-requests/:id/dispatch', dispatchSellProduce);
router.put('/sell-requests/:id/deliver', deliverSellProduce);
router.put('/sell-requests/:id/complete', completeSellTransaction);

export default router;
