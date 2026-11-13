import mongoose from 'mongoose';

const cropScanSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    farmerId: { type: String, required: true, index: true },
    farmerName: { type: String, default: 'Farmer' },
    farmId: { type: String, default: null, index: true },
    zoneId: { type: String, default: null, index: true },
    zoneName: { type: String, default: 'Unassigned Zone' },
    plantPart: {
      type: String,
      enum: ['leaf', 'stem', 'flower', 'fruit', 'whole_plant'],
      default: 'leaf',
    },
    selectedCrop: { type: String, default: '' },
    identifiedCrop: { type: String, required: true },
    estimatedGrowthStage: { type: String, default: 'Not determinable from photo alone' },
    imageQualityStatus: {
      type: String,
      enum: ['clear', 'blurry_or_poor_light', 'incomplete', 'non_plant', 'mobile_or_screen_detected'],
      default: 'clear',
    },
    imageQualityNote: { type: String, default: '' },
    overallCondition: {
      type: String,
      enum: ['Healthy Appearance', 'Mild Stress / Watch Needed', 'Unhealthy / Possible Issue', 'Inconclusive Image'],
      default: 'Unhealthy / Possible Issue',
    },
    observedSymptoms: [{ type: String }],
    detectedDefects: [
      {
        defectName: { type: String },
        affectedPart: { type: String },
        severity: { type: String, default: 'Moderate' },
        description: { type: String },
      },
    ],
    howToFixSteps: [{ type: String }],
    healthyRecoveryPlan: [{ type: String }],
    possibleDiseases: [{ type: String }],
    possiblePestDamage: [{ type: String }],
    nutrientDeficiencySigns: [{ type: String }],
    environmentalStressSigns: [{ type: String }],
    possibleDiagnosis: { type: String, required: true },
    uncertaintyCategory: {
      type: String,
      enum: [
        'Preliminary Visual Match (Lab/Field Confirmation Needed)',
        'Moderate Visual Evidence (Multiple Causes Possible)',
        'High Uncertainty / Inconclusive Photograph',
      ],
      default: 'Moderate Visual Evidence (Multiple Causes Possible)',
    },
    visibleEvidence: [{ type: String }],
    alternativeCauses: [{ type: String }],
    recommendedNextSteps: [{ type: String }],
    requiresExpertAssistance: { type: Boolean, default: false },
    expertAssistanceReason: { type: String, default: '' },
    simpleFarmerExplanation: { type: String, default: '' },
    followUpQuestions: [
      {
        id: { type: String },
        question: { type: String },
        placeholder: { type: String },
        answer: { type: String, default: '' },
      },
    ],
    refinedDiagnosisSummary: { type: String, default: '' },
    treatmentPlan: {
      possibleProblem: { type: String, default: '' },
      immediateAction: [{ type: String }],
      nonChemicalTreatment: [{ type: String }],
      chemicalTreatmentAllowed: { type: Boolean, default: false },
      chemicalRestrictionReason: { type: String, default: '' },
      verifiedProducts: [
        {
          id: { type: String },
          activeIngredient: { type: String },
          productCategory: { type: String },
          intendedUse: { type: String },
          supportingEvidence: { type: String },
          approvedDosageAndDirections: { type: String },
          protectiveEquipment: { type: String },
          reEntryInterval: { type: String },
          preHarvestInterval: { type: String },
          environmentalPrecautions: { type: String },
          sourceAuthority: { type: String },
          verificationDate: { type: String },
        },
      ],
      verifiedNutrients: [
        {
          id: { type: String },
          nutrientName: { type: String },
          category: { type: String },
          targetDeficiency: { type: String },
          dosageAndApplication: { type: String },
          safetyNotes: { type: String },
          authoritySource: { type: String },
        },
      ],
      safetyDisclaimer: { type: String, default: '' },
    },
    imageUrl: { type: String, default: '' }, // Thumbnail / preview data URL
    language: { type: String, enum: ['en', 'te', 'hi'], default: 'en' },
    recoveryStatus: {
      type: String,
      enum: ['Initial Assessment', 'Monitoring', 'Appears Improving', 'Appears Worsening', 'Uncertain / Needs Expert'],
      default: 'Initial Assessment',
    },
    followUpComparisons: [
      {
        id: { type: String },
        date: { type: String },
        imageUrl: { type: String },
        visibleChanges: [{ type: String }],
        statusTrend: {
          type: String,
          enum: ['Appears Improving', 'Appears Worsening', 'Remaining Uncertain'],
        },
        comparisonNotes: { type: String },
        expertEscalationAdvised: { type: Boolean, default: false },
      },
    ],
    isSaved: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CropScan = mongoose.models.CropScan || mongoose.model('CropScan', cropScanSchema);
export default CropScan;
