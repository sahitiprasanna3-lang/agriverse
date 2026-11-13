import { Language } from '../types';

export interface VerifiedChemicalProduct {
  id: string;
  activeIngredient: string;
  productCategory: string;
  intendedUse: string;
  supportingEvidence: string;
  approvedDosageAndDirections: string;
  protectiveEquipment: string;
  reEntryInterval: string;
  preHarvestInterval: string;
  environmentalPrecautions: string;
  sourceAuthority: string;
  verificationDate: string;
}

export interface VerifiedNutrientRemedy {
  id: string;
  nutrientName: string;
  category: string;
  targetDeficiency: string;
  dosageAndApplication: string;
  safetyNotes: string;
  authoritySource: string;
}

export interface DetectedDefectItem {
  defectName: string;
  affectedPart: string;
  severity: 'Low' | 'Moderate' | 'High' | string;
  description: string;
}

export interface FollowUpQuestionItem {
  id: string;
  question: string;
  placeholder: string;
  answer: string;
}

export interface FollowUpComparisonItem {
  id: string;
  date: string;
  imageUrl: string;
  visibleChanges: string[];
  statusTrend: 'Appears Improving' | 'Appears Worsening' | 'Remaining Uncertain';
  comparisonNotes: string;
  expertEscalationAdvised: boolean;
}

export interface TreatmentRecordItem {
  id: string;
  scanId: string;
  zoneId?: string | null;
  farmerId: string;
  actionType:
    | 'cultural_inspection'
    | 'non_chemical'
    | 'verified_chemical'
    | 'irrigation_nutrition'
    | 'expert_consultation';
  actionTaken: string;
  productUsed?: string;
  dosageApplied?: string;
  areaTreated?: string;
  notes?: string;
  appliedAt: string;
}

export interface CropScanRecord {
  id: string;
  farmerId: string;
  farmerName: string;
  farmId?: string | null;
  zoneId?: string | null;
  zoneName?: string;
  plantPart: 'leaf' | 'stem' | 'flower' | 'fruit' | 'whole_plant';
  selectedCrop: string;
  identifiedCrop: string;
  estimatedGrowthStage: string;
  imageQualityStatus:
    | 'clear'
    | 'blurry_or_poor_light'
    | 'incomplete'
    | 'non_plant'
    | 'mobile_or_screen_detected';
  imageQualityNote: string;
  overallCondition:
    | 'Healthy Appearance'
    | 'Mild Stress / Watch Needed'
    | 'Unhealthy / Possible Issue'
    | 'Inconclusive Image';
  observedSymptoms: string[];
  detectedDefects?: DetectedDefectItem[];
  howToFixSteps?: string[];
  healthyRecoveryPlan?: string[];
  possibleDiseases: string[];
  possiblePestDamage: string[];
  nutrientDeficiencySigns: string[];
  environmentalStressSigns: string[];
  possibleDiagnosis: string;
  uncertaintyCategory:
    | 'Preliminary Visual Match (Lab/Field Confirmation Needed)'
    | 'Moderate Visual Evidence (Multiple Causes Possible)'
    | 'High Uncertainty / Inconclusive Photograph';
  visibleEvidence: string[];
  alternativeCauses: string[];
  recommendedNextSteps: string[];
  requiresExpertAssistance: boolean;
  expertAssistanceReason: string;
  simpleFarmerExplanation: string;
  followUpQuestions: FollowUpQuestionItem[];
  refinedDiagnosisSummary?: string;
  treatmentPlan: {
    possibleProblem: string;
    immediateAction: string[];
    nonChemicalTreatment: string[];
    chemicalTreatmentAllowed: boolean;
    chemicalRestrictionReason: string;
    verifiedProducts: VerifiedChemicalProduct[];
    verifiedNutrients?: VerifiedNutrientRemedy[];
    safetyDisclaimer: string;
  };
  imageUrl: string;
  language: Language;
  recoveryStatus:
    | 'Initial Assessment'
    | 'Monitoring'
    | 'Appears Improving'
    | 'Appears Worsening'
    | 'Uncertain / Needs Expert';
  followUpComparisons: FollowUpComparisonItem[];
  treatments?: TreatmentRecordItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface FarmProfileData {
  id: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  totalSizeAcres: number;
  primaryCrops: string[];
  location: string;
  soilType: string;
  irrigationMethod: string;
  isDemo?: boolean;
}

export interface SoilMeasurementData {
  id: string;
  zoneId: string;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  soilPh: number;
  source: 'manual' | 'iot_sensor' | 'demo';
  sensorDeviceId?: string | null;
  notes?: string;
  evaluatedStatus: 'Healthy' | 'Needs Monitoring' | 'Needs Attention' | 'Insufficient Data';
  evaluationSummary: string;
  recordedAt: string;
}

export interface FarmZoneData {
  id: string;
  farmId: string;
  farmerId: string;
  zoneCode: string;
  name: string;
  crop: string;
  variety: string;
  growthStage: string;
  acreage: number;
  soilType: string;
  irrigationType: string;
  status: 'Healthy' | 'Needs Monitoring' | 'Needs Attention' | 'Insufficient Data';
  statusExplanation: string;
  recommendedInspectionAction: string;
  latestMeasurement: {
    soilMoisture: number | null;
    temperature: number | null;
    humidity: number | null;
    soilPh: number | null;
    source: 'manual' | 'iot_sensor' | 'demo';
    recordedAt: string | null;
  };
  thresholds: {
    moistureMin: number;
    moistureMax: number;
    tempMin: number;
    tempMax: number;
    phMin: number;
    phMax: number;
  };
  isDemo?: boolean;
  recentScans?: CropScanRecord[];
  totalScansCount?: number;
  latestScan?: CropScanRecord | null;
  previousScan?: CropScanRecord | null;
  measurementHistory?: SoilMeasurementData[];
}

export interface PrecisionOverviewResponse {
  farm: FarmProfileData | null;
  zones: FarmZoneData[];
  summary: {
    totalZones: number;
    healthyCount: number;
    monitoringCount: number;
    attentionCount: number;
    insufficientDataCount: number;
    recentScansCount: number;
    hasDemoData: boolean;
  };
}

function buildAuthHeaders(farmerId: string, farmerName = 'AgriVerse Farmer'): Record<string, string> {
  const token = localStorage.getItem('agriverse_token') || localStorage.getItem('kisansetu_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-farmer-id': farmerId || 'guest-farmer',
    'x-farmer-name': encodeURIComponent(farmerName || 'AgriVerse Farmer'),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export interface ApiErrorWithMeta extends Error {
  status?: number;
  errorCode?: string;
  isMobileScreenError?: boolean;
  evidence?: string;
}

async function handleApiResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: ApiErrorWithMeta = new Error(
      data.error || `Request failed with status ${res.status}`
    );
    err.status = res.status;
    err.errorCode = data.errorCode;
    err.isMobileScreenError = Boolean(data.isMobileScreenError);
    err.evidence = data.evidence;
    throw err;
  }
  return data as T;
}

export const agronomyService = {
  async analyzeCropImage(
    farmerId: string,
    farmerName: string,
    payload: {
      imageBase64: string;
      selectedCrop?: string;
      plantPart: 'leaf' | 'stem' | 'flower' | 'fruit' | 'whole_plant';
      zoneId?: string | null;
      reportedSymptoms?: string[];
      language: Language;
    }
  ): Promise<{ scan: CropScanRecord }> {
    const res = await fetch('/api/agronomy/crop-doctor/analyze', {
      method: 'POST',
      headers: buildAuthHeaders(farmerId, farmerName),
      body: JSON.stringify(payload),
    });
    return handleApiResponse(res);
  },

  async refineDiagnosis(
    farmerId: string,
    farmerName: string,
    scanId: string,
    payload: {
      answers: Array<{ id: string; question: string; answer: string }>;
      selectedCrop?: string;
      reportedSymptoms?: string[];
      language: Language;
    }
  ): Promise<{ scan: CropScanRecord }> {
    const res = await fetch(`/api/agronomy/crop-doctor/diagnose/${encodeURIComponent(scanId)}`, {
      method: 'POST',
      headers: buildAuthHeaders(farmerId, farmerName),
      body: JSON.stringify(payload),
    });
    return handleApiResponse(res);
  },

  async getScans(
    farmerId: string,
    farmerName: string,
    zoneId?: string
  ): Promise<{ scans: CropScanRecord[] }> {
    const qs = zoneId ? `?zoneId=${encodeURIComponent(zoneId)}` : '';
    const res = await fetch(`/api/agronomy/scans${qs}`, {
      headers: buildAuthHeaders(farmerId, farmerName),
    });
    return handleApiResponse(res);
  },

  async recordTreatment(
    farmerId: string,
    farmerName: string,
    scanId: string,
    payload: {
      actionType: TreatmentRecordItem['actionType'];
      actionTaken: string;
      productUsed?: string;
      dosageApplied?: string;
      areaTreated?: string;
      notes?: string;
    }
  ): Promise<{ treatment: TreatmentRecordItem }> {
    const res = await fetch(`/api/agronomy/scans/${encodeURIComponent(scanId)}/treatments`, {
      method: 'POST',
      headers: buildAuthHeaders(farmerId, farmerName),
      body: JSON.stringify(payload),
    });
    return handleApiResponse(res);
  },

  async compareRecovery(
    farmerId: string,
    farmerName: string,
    scanId: string,
    payload: {
      followUpImageBase64: string;
      farmerNotes?: string;
      language: Language;
    }
  ): Promise<{ scan: CropScanRecord; latestComparison: FollowUpComparisonItem }> {
    const res = await fetch(`/api/agronomy/scans/${encodeURIComponent(scanId)}/recovery`, {
      method: 'POST',
      headers: buildAuthHeaders(farmerId, farmerName),
      body: JSON.stringify(payload),
    });
    return handleApiResponse(res);
  },

  async getPrecisionOverview(
    farmerId: string,
    farmerName: string
  ): Promise<PrecisionOverviewResponse> {
    const res = await fetch('/api/agronomy/precision/overview', {
      headers: buildAuthHeaders(farmerId, farmerName),
    });
    return handleApiResponse(res);
  },

  async upsertFarmProfile(
    farmerId: string,
    farmerName: string,
    payload: {
      farmName: string;
      totalSizeAcres: number;
      primaryCrops: string[];
      location: string;
      soilType: string;
      irrigationMethod: string;
    }
  ): Promise<{ farm: FarmProfileData }> {
    const res = await fetch('/api/agronomy/farms', {
      method: 'POST',
      headers: buildAuthHeaders(farmerId, farmerName),
      body: JSON.stringify(payload),
    });
    return handleApiResponse(res);
  },

  async createZone(
    farmerId: string,
    farmerName: string,
    payload: {
      zoneCode?: string;
      name: string;
      crop: string;
      variety?: string;
      growthStage?: string;
      acreage: number;
      soilType?: string;
      irrigationType?: string;
    }
  ): Promise<{ zone: FarmZoneData }> {
    const res = await fetch('/api/agronomy/zones', {
      method: 'POST',
      headers: buildAuthHeaders(farmerId, farmerName),
      body: JSON.stringify(payload),
    });
    return handleApiResponse(res);
  },

  async recordSoilMeasurement(
    farmerId: string,
    farmerName: string,
    zoneId: string,
    payload: {
      soilMoisture: number;
      temperature: number;
      humidity: number;
      soilPh: number;
      source?: 'manual' | 'iot_sensor';
      notes?: string;
      growthStage?: string;
    }
  ): Promise<{ measurement: SoilMeasurementData; zone: FarmZoneData }> {
    const res = await fetch(`/api/agronomy/zones/${encodeURIComponent(zoneId)}/measurements`, {
      method: 'POST',
      headers: buildAuthHeaders(farmerId, farmerName),
      body: JSON.stringify(payload),
    });
    return handleApiResponse(res);
  },

  async loadSampleDemoZones(
    farmerId: string,
    farmerName: string
  ): Promise<{ farm: FarmProfileData; zones: FarmZoneData[] }> {
    const res = await fetch('/api/agronomy/zones/demo', {
      method: 'POST',
      headers: buildAuthHeaders(farmerId, farmerName),
    });
    return handleApiResponse(res);
  },

  async clearDemoZones(farmerId: string, farmerName: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/agronomy/zones/demo', {
      method: 'DELETE',
      headers: buildAuthHeaders(farmerId, farmerName),
    });
    return handleApiResponse(res);
  },

  async analyzeSoilRoadmap(
    farmerId: string,
    farmerName: string,
    payload: {
      soilImageBase64: string;
      farmerDescription?: string;
      landAcres: number;
      waterAvailability: string;
      location: string;
      outputLanguage?: string;
      soilPresetHint?: string;
    }
  ): Promise<{ plan: SoilCropRoadmapPlan }> {
    const res = await fetch('/api/agronomy/precision/soil-roadmap', {
      method: 'POST',
      headers: buildAuthHeaders(farmerId, farmerName),
      body: JSON.stringify(payload),
    });
    return handleApiResponse(res);
  },

  async getSoilRoadmaps(
    farmerId: string,
    farmerName: string
  ): Promise<{ plans: SoilCropRoadmapPlan[] }> {
    const res = await fetch('/api/agronomy/precision/soil-roadmap', {
      headers: buildAuthHeaders(farmerId, farmerName),
    });
    return handleApiResponse(res);
  },
};

export interface SoilProfileDiagnosis {
  soilType: string;
  colorAndTexture: string;
  estimatedDrainage: string;
  fertilityAndOrganicMatter: string;
  estimatedPhCategory: string;
  soilPreparationTips: string[];
}

export interface BestProfitCropOption {
  rank: number;
  cropName: string;
  suitabilityReason: string;
  durationDays: number;
  estimatedYieldPerAcre: string;
  marketRateRange: string;
  estimatedCostPerAcreInr: number;
  estimatedGrossRevenuePerAcreInr: number;
  estimatedNetProfitPerAcreInr: number;
  riskLevel: string;
  bestSellingWindow: string;
}

export interface RoadmapSeasonPhase {
  phaseNumber: number;
  seasonName: string;
  monthsCovered: string;
  recommendedCrop: string;
  roleInRotation: string;
  keyActivities: string[];
  fertilizerAndSoilCare: string;
  expectedCostPerAcreInr: number;
  expectedRevenuePerAcreInr: number;
  expectedNetProfitPerAcreInr: number;
}

export interface RoadmapMonthEntry {
  monthLabel: string;
  cropActive: string;
  primaryTask: string;
  cashflowNote: string;
}

export interface SoilCropRoadmapPlan {
  id: string;
  farmerId: string;
  farmerName: string;
  landAcres: number;
  waterAvailability: string;
  location: string;
  farmerDescription: string;
  soilImagePreview?: string;
  detectedLanguage: string;
  farmerSummaryNote: string;
  soilProfile: SoilProfileDiagnosis;
  bestProfitCrops: BestProfitCropOption[];
  oneYearRoadmap: {
    roadmapTitle: string;
    rotationStrategySummary: string;
    annualEstimatedCostPerAcreInr: number;
    annualEstimatedGrossPerAcreInr: number;
    annualEstimatedNetProfitPerAcreInr: number;
    phases: RoadmapSeasonPhase[];
    monthlyCalendar: RoadmapMonthEntry[];
  };
  createdAt: string;
}

