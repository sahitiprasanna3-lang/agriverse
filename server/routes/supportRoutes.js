import express from 'express';
import {
  getSupportInfo,
  getSupportQueries,
  createSupportQuery,
} from '../controllers/supportController.js';

const router = express.Router();

router.get('/support/info', getSupportInfo);
router.get('/support/queries', getSupportQueries);
router.post('/support/queries', createSupportQuery);

export default router;
