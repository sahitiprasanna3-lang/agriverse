import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import {
  analyzeCropImage,
  refineDiagnosis,
  getScans,
  recordTreatmentAction,
  compareRecoveryScan,
  getPrecisionOverview,
  upsertFarmProfile,
  createFarmZone,
  recordSoilMeasurement,
  loadSampleDemoZones,
  clearDemoZones,
  analyzeSoilAndBuildRoadmap,
  getSoilRoadmaps,
} from '../controllers/agronomyController.js';

const router = express.Router();

// Apply optionalAuth so JWT tokens populate req.user, while controller enforces farmer ownership
router.use(optionalAuth);

// AI Crop Doctor & Interactive Diagnosis
router.post('/crop-doctor/analyze', analyzeCropImage);
router.post('/crop-doctor/diagnose/:scanId', refineDiagnosis);

// Crop Scans & Recovery Tracking
router.get('/scans', getScans);
router.post('/scans/:scanId/treatments', recordTreatmentAction);
router.post('/scans/:scanId/recovery', compareRecoveryScan);

// Precision Farming: Soil Photo + Any-Language Description -> Best Profit Crops & 1-Year Roadmap
router.post('/precision/soil-roadmap', analyzeSoilAndBuildRoadmap);
router.get('/precision/soil-roadmap', getSoilRoadmaps);

// Legacy Precision Endpoints
router.get('/precision/overview', getPrecisionOverview);
router.post('/farms', upsertFarmProfile);
router.post('/zones', createFarmZone);
router.post('/zones/demo', loadSampleDemoZones);
router.delete('/zones/demo', clearDemoZones);
router.post('/zones/:zoneId/measurements', recordSoilMeasurement);

export default router;
