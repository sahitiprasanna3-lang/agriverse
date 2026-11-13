import mongoose from 'mongoose';

const farmZoneSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    farmId: { type: String, required: true, index: true },
    farmerId: { type: String, required: true, index: true },
    zoneCode: { type: String, required: true }, // e.g. Zone A, Zone B, Zone C
    name: { type: String, required: true, trim: true },
    crop: { type: String, required: true },
    variety: { type: String, default: 'Local Standard' },
    growthStage: { type: String, default: 'Vegetative Stage' },
    acreage: { type: Number, required: true, min: 0.1 },
    soilType: { type: String, default: 'Loam' },
    irrigationType: { type: String, default: 'Drip Fertigation' },
    status: {
      type: String,
      enum: ['Healthy', 'Needs Monitoring', 'Needs Attention', 'Insufficient Data'],
      default: 'Insufficient Data',
    },
    statusExplanation: { type: String, default: 'No manual or sensor soil measurements recorded yet.' },
    recommendedInspectionAction: { type: String, default: 'Record soil moisture, temperature, humidity, and pH to assess zone status.' },
    latestMeasurement: {
      soilMoisture: { type: Number, default: null },
      temperature: { type: Number, default: null },
      humidity: { type: Number, default: null },
      soilPh: { type: Number, default: null },
      source: { type: String, enum: ['manual', 'iot_sensor', 'demo'], default: 'manual' },
      recordedAt: { type: String, default: null },
    },
    thresholds: {
      moistureMin: { type: Number, default: 40 },
      moistureMax: { type: Number, default: 75 },
      tempMin: { type: Number, default: 18 },
      tempMax: { type: Number, default: 34 },
      phMin: { type: Number, default: 6.0 },
      phMax: { type: Number, default: 7.5 },
    },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const FarmZone = mongoose.models.FarmZone || mongoose.model('FarmZone', farmZoneSchema);
export default FarmZone;
