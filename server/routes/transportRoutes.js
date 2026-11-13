import express from 'express';
import {
  getTransporters,
  getWarehouses,
  bookTransport,
  getLoadBookings,
  createLoadBooking,
  acceptLoadBooking,
  updateLoadBookingStatus,
  streamTransportDispatch,
} from '../controllers/transportController.js';

const router = express.Router();

router.get('/transporters', getTransporters);
router.get('/transport', getTransporters);
router.get('/warehouses', getWarehouses);
router.get('/storage', getWarehouses);
router.post('/transport/book', bookTransport);

// Live VegaRath Farmer-to-Transporter Vegetable Load Dispatch Routes
router.get('/transport/stream', streamTransportDispatch);
router.get('/transport/loads', getLoadBookings);
router.post('/transport/loads', createLoadBooking);
router.post('/transport/loads/:id/accept', acceptLoadBooking);
router.patch('/transport/loads/:id/status', updateLoadBookingStatus);

export default router;
