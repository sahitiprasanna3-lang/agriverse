import mongoose from 'mongoose';

const treatmentRecordSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    scanId: { type: String, required: true, index: true },
    zoneId: { type: String, default: null, index: true },
    farmerId: { type: String, required: true, index: true },
    actionType: {
      type: String,
      enum: ['cultural_inspection', 'non_chemical', 'verified_chemical', 'irrigation_nutrition', 'expert_consultation'],
      default: 'cultural_inspection',
    },
    actionTaken: { type: String, required: true },
    productUsed: { type: String, default: '' },
    dosageApplied: { type: String, default: '' },
    areaTreated: { type: String, default: '' },
    notes: { type: String, default: '' },
    appliedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const TreatmentRecord =
  mongoose.models.TreatmentRecord || mongoose.model('TreatmentRecord', treatmentRecordSchema);
export default TreatmentRecord;
