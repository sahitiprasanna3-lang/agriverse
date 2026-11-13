export interface SectionAction {
  title: string;
  description: string;
  actionButtonLabel: string;
  actionType: 'irrigation' | 'fertilizer' | 'lime' | 'drainage' | 'canopy';
  estimatedImpact: string;
}

export interface SensorTelemetryHistory {
  time: string;
  moisture: number;
  temperature: number;
  humidity: number;
  ph: number;
}

export interface FarmSection {
  id: string;
  name: string;
  code: string;
  crop: string;
  variety: string;
  acreage: number;
  soilType: string;
  irrigationType: 'Drip Fertigation' | 'Micro-Sprinkler' | 'Furrow / Flood' | 'Rainfed';
  valveNumber: number;
  sensorId: string;
  lastSync: string;
  status: 'optimal' | 'warning' | 'critical';
  metrics: {
    soilMoisture: number; // percentage (0-100%)
    soilMoistureMin: number;
    soilMoistureMax: number;
    soilTemperature: number; // °C
    ambientHumidity: number; // %
    soilPh: number; // pH 0-14
    nitrogenPpm: number;
    phosphorusPpm: number;
    potassiumPpm: number;
    electricalConductivity: number; // dS/m
  };
  attentionReason?: string;
  recommendedAction?: SectionAction;
  historicalReadings: SensorTelemetryHistory[];
  dripPumpStatus: 'active' | 'idle' | 'scheduled';
}

export const INITIAL_FARM_SECTIONS: FarmSection[] = [
  {
    id: 'sec-zone-a',
    code: 'ZONE-A1',
    name: 'North Block (Teja Red Chilli)',
    crop: 'Red Chilli',
    variety: 'Teja Superior-4',
    acreage: 2.2,
    soilType: 'Red Sandy Loam',
    irrigationType: 'Drip Fertigation',
    valveNumber: 1,
    sensorId: 'IOT-SOIL-A104',
    lastSync: '2 mins ago',
    status: 'critical',
    metrics: {
      soilMoisture: 22, // Critical drop below 40% threshold!
      soilMoistureMin: 45,
      soilMoistureMax: 70,
      soilTemperature: 34.2,
      ambientHumidity: 48,
      soilPh: 6.5,
      nitrogenPpm: 180,
      phosphorusPpm: 45,
      potassiumPpm: 210,
      electricalConductivity: 1.2,
    },
    attentionReason: '🚨 Critically Low Soil Moisture (22%). Severe moisture stress detected during peak flowering. Immediate irrigation required to prevent flower bud abscission.',
    recommendedAction: {
      title: 'Emergency Drip Fertigation Cycle',
      description: 'Activate Drip Valve #1 for 55 minutes with 19:19:19 soluble NPK at 2.5 kg/acre. Restores root zone moisture to optimal 55%.',
      actionButtonLabel: 'Trigger Drip Valve #1 Now',
      actionType: 'irrigation',
      estimatedImpact: 'Prevents up to 35% flower drop & preserves pod weight',
    },
    dripPumpStatus: 'idle',
    historicalReadings: [
      { time: '00:00', moisture: 38, temperature: 24.1, humidity: 78, ph: 6.5 },
      { time: '04:00', moisture: 35, temperature: 22.8, humidity: 82, ph: 6.5 },
      { time: '08:00', moisture: 31, temperature: 27.5, humidity: 65, ph: 6.5 },
      { time: '12:00', moisture: 26, temperature: 33.8, humidity: 52, ph: 6.5 },
      { time: '16:00', moisture: 22, temperature: 34.2, humidity: 48, ph: 6.5 },
    ],
  },
  {
    id: 'sec-zone-b',
    code: 'ZONE-B2',
    name: 'Central Plot (BT-Cotton Long Staple)',
    crop: 'Cotton',
    variety: 'BT-II Long Staple Bollgard',
    acreage: 3.5,
    soilType: 'Deep Black Cotton Soil',
    irrigationType: 'Drip Fertigation',
    valveNumber: 2,
    sensorId: 'IOT-SOIL-B209',
    lastSync: 'Just now',
    status: 'optimal',
    metrics: {
      soilMoisture: 58,
      soilMoistureMin: 50,
      soilMoistureMax: 75,
      soilTemperature: 28.6,
      ambientHumidity: 62,
      soilPh: 6.8,
      nitrogenPpm: 220,
      phosphorusPpm: 60,
      potassiumPpm: 280,
      electricalConductivity: 1.4,
    },
    attentionReason: undefined,
    recommendedAction: {
      title: 'Balanced Vegetative Regimen',
      description: 'Soil parameters are within optimum ICAR agronomic thresholds. Next scheduled fertigation in 36 hours.',
      actionButtonLabel: 'View Sensor Logs',
      actionType: 'canopy',
      estimatedImpact: 'Optimal boll development & fiber elongation',
    },
    dripPumpStatus: 'idle',
    historicalReadings: [
      { time: '00:00', moisture: 62, temperature: 23.5, humidity: 80, ph: 6.8 },
      { time: '04:00', moisture: 61, temperature: 22.1, humidity: 85, ph: 6.8 },
      { time: '08:00', moisture: 60, temperature: 25.4, humidity: 72, ph: 6.8 },
      { time: '12:00', moisture: 59, temperature: 29.8, humidity: 60, ph: 6.8 },
      { time: '16:00', moisture: 58, temperature: 28.6, humidity: 62, ph: 6.8 },
    ],
  },
  {
    id: 'sec-zone-c',
    code: 'ZONE-C3',
    name: 'South Terrace (BPT-5204 Samba Paddy)',
    crop: 'Rice (Paddy)',
    variety: 'BPT-5204 Samba Masuri',
    acreage: 1.8,
    soilType: 'Clay Loam (Water Retention)',
    irrigationType: 'Furrow / Flood',
    valveNumber: 3,
    sensorId: 'IOT-SOIL-C301',
    lastSync: '5 mins ago',
    status: 'warning',
    metrics: {
      soilMoisture: 88,
      soilMoistureMin: 70,
      soilMoistureMax: 95,
      soilTemperature: 27.1,
      ambientHumidity: 84,
      soilPh: 5.3, // Acidic warning (below 6.0)
      nitrogenPpm: 160,
      phosphorusPpm: 32, // Phosphorus locked due to low pH
      potassiumPpm: 190,
      electricalConductivity: 0.9,
    },
    attentionReason: '⚠️ Soil Acidification Detected (pH 5.3). Acidic condition locks phosphorus uptake and encourages blast pathogen susceptibility.',
    recommendedAction: {
      title: 'Dolomite / Agricultural Lime Application',
      description: 'Broadcast 120 kg/acre Agricultural Lime (Calcium Carbonate) or Dolomite during drainage window to bring pH back to 6.2 - 6.8.',
      actionButtonLabel: 'Order Certified Ag Lime',
      actionType: 'lime',
      estimatedImpact: 'Unlocks 40% more soil phosphorus and boosts panicle emergence',
    },
    dripPumpStatus: 'idle',
    historicalReadings: [
      { time: '00:00', moisture: 92, temperature: 23.0, humidity: 90, ph: 5.2 },
      { time: '04:00', moisture: 90, temperature: 22.4, humidity: 92, ph: 5.2 },
      { time: '08:00', moisture: 89, temperature: 24.8, humidity: 88, ph: 5.3 },
      { time: '12:00', moisture: 88, temperature: 28.0, humidity: 80, ph: 5.3 },
      { time: '16:00', moisture: 88, temperature: 27.1, humidity: 84, ph: 5.3 },
    ],
  },
  {
    id: 'sec-zone-d',
    code: 'ZONE-D4',
    name: 'East Slope (Turmeric & Intercrop Ginger)',
    crop: 'Turmeric',
    variety: 'Salem High-Curcumin',
    acreage: 1.5,
    soilType: 'Well-Drained Red Loam with Organic Compost',
    irrigationType: 'Micro-Sprinkler',
    valveNumber: 4,
    sensorId: 'IOT-SOIL-D412',
    lastSync: '10 mins ago',
    status: 'optimal',
    metrics: {
      soilMoisture: 64,
      soilMoistureMin: 55,
      soilMoistureMax: 75,
      soilTemperature: 26.8,
      ambientHumidity: 70,
      soilPh: 6.7,
      nitrogenPpm: 240,
      phosphorusPpm: 68,
      potassiumPpm: 310,
      electricalConductivity: 1.1,
    },
    attentionReason: undefined,
    recommendedAction: {
      title: 'Rhizome Bulking Support',
      description: 'Soil temperature and aeration are optimal for underground rhizome enlargement. Maintain scheduled light micro-sprinkling.',
      actionButtonLabel: 'View Rhizome Logs',
      actionType: 'irrigation',
      estimatedImpact: 'Ensures 4.8%+ high curcumin content',
    },
    dripPumpStatus: 'idle',
    historicalReadings: [
      { time: '00:00', moisture: 68, temperature: 22.8, humidity: 82, ph: 6.7 },
      { time: '04:00', moisture: 66, temperature: 21.9, humidity: 86, ph: 6.7 },
      { time: '08:00', moisture: 65, temperature: 24.5, humidity: 76, ph: 6.7 },
      { time: '12:00', moisture: 64, temperature: 27.9, humidity: 68, ph: 6.7 },
      { time: '16:00', moisture: 64, temperature: 26.8, humidity: 70, ph: 6.7 },
    ],
  },
];
