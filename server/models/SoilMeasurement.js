import mongoose from 'mongoose';

const soilMeasurementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    zoneId: { type: String, required: true, index: true },
    farmId: { type: String, index: true },
    farmerId: { type: String, required: true, index: true },
    soilMoisture: { type: Number, required: true, min: 0, max: 100 },
    temperature: { type: Number, required: true, min: -10, max: 65 },
    humidity: { type: Number, required: true, min: 0, max: 100 },
    soilPh: { type: Number, required: true, min: 3.0, max: 10.5 },
    source: {
      type: String,
      enum: ['manual', 'iot_sensor', 'demo'],
      default: 'manual',
    },
    sensorDeviceId: { type: String, default: null },
    notes: { type: String, default: '' },
    evaluatedStatus: {
      type: String,
      enum: ['Healthy', 'Needs Monitoring', 'Needs Attention', 'Insufficient Data'],
      default: 'Healthy',
    },
    evaluationSummary: { type: String, default: '' },
    recordedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const SoilMeasurement =
  mongoose.models.SoilMeasurement || mongoose.model('SoilMeasurement', soilMeasurementSchema);
export default SoilMeasurement;
