import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    farmerId: { type: String, required: true, index: true },
    farmerName: { type: String, required: true },
    farmName: { type: String, required: true, trim: true },
    totalSizeAcres: { type: Number, required: true, min: 0.1 },
    primaryCrops: [{ type: String }],
    location: { type: String, default: '' },
    soilType: { type: String, default: 'Black Cotton Soil' },
    irrigationMethod: { type: String, default: 'Drip Fertigation' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Farm = mongoose.models.Farm || mongoose.model('Farm', farmSchema);
export default Farm;
