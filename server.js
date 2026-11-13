import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

import connectDB, { getDBStatus } from './server/config/db.js';
import { seedInitialData } from './server/seedData.js';

import authRoutes from './server/routes/authRoutes.js';
import cropRoutes from './server/routes/cropRoutes.js';
import vegetableRoutes from './server/routes/vegetableRoutes.js';
import orderRoutes from './server/routes/orderRoutes.js';
import communityRoutes from './server/routes/communityRoutes.js';
import voiceRoutes from './server/routes/voiceRoutes.js';
import fpoRoutes from './server/routes/fpoRoutes.js';
import transportRoutes from './server/routes/transportRoutes.js';
import agronomyRoutes from './server/routes/agronomyRoutes.js';
import paymentRoutes from './server/routes/paymentRoutes.js';
import supportRoutes from './server/routes/supportRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Request parsing with generous limits for crop image upload
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: getDBStatus(),
  });
});

// Database status
app.get('/api/mongodb/status', (req, res) => {
  res.json(getDBStatus());
});

// Static Mandi Markets catalog endpoint
const MANDI_DATA = [
  { mandiName: 'Warangal APMC Enamamula Market', district: 'Warangal', state: 'Telangana', cropName: 'Cotton', currentPrice: 7400, netValue: 7100, transportCostPerQuintal: 300, distanceKm: 28, demandLevel: 'Very High', trend: 'increasing', arrivalVolumeQuintals: 12500 },
  { mandiName: 'Nizamabad APMC Market', district: 'Nizamabad', state: 'Telangana', cropName: 'Paddy', currentPrice: 2600, netValue: 2450, transportCostPerQuintal: 150, distanceKm: 45, demandLevel: 'High', trend: 'increasing', arrivalVolumeQuintals: 18000 },
  { mandiName: 'Bowenpally Wholesale Market', district: 'Hyderabad', state: 'Telangana', cropName: 'Tomato', currentPrice: 2350, netValue: 2180, transportCostPerQuintal: 170, distanceKm: 32, demandLevel: 'Moderate', trend: 'stable', arrivalVolumeQuintals: 8500 },
  { mandiName: 'Guntur Mirchi Yard', district: 'Guntur', state: 'Andhra Pradesh', cropName: 'Chilli', currentPrice: 19200, netValue: 18700, transportCostPerQuintal: 500, distanceKm: 140, demandLevel: 'Very High', trend: 'increasing', arrivalVolumeQuintals: 22000 },
  { mandiName: 'Karimnagar APMC Mandi', district: 'Karimnagar', state: 'Telangana', cropName: 'Maize', currentPrice: 2200, netValue: 2050, transportCostPerQuintal: 150, distanceKm: 55, demandLevel: 'Moderate', trend: 'stable', arrivalVolumeQuintals: 9200 },
];

app.get('/api/markets', (req, res) => {
  const distinctMarkets = Array.from(
    new Set(MANDI_DATA.map((m) => `${m.mandiName} (${m.district}, ${m.state})`))
  );
  res.json(distinctMarkets);
});

app.get('/api/markets/prices', (req, res) => {
  const { crop } = req.query;
  if (crop && typeof crop === 'string') {
    const filtered = MANDI_DATA.filter(
      (m) => m.cropName.toLowerCase() === crop.toLowerCase()
    );
    return res.json(filtered);
  }
  res.json(MANDI_DATA);
});

// Mount modular MERN API routes
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api', cropRoutes);
app.use('/api', vegetableRoutes);
app.use('/api', orderRoutes);
app.use('/api', communityRoutes);
app.use('/api', voiceRoutes);
app.use('/api', fpoRoutes);
app.use('/api', transportRoutes);
app.use('/api', paymentRoutes);
app.use('/api', supportRoutes);
app.use('/api/agronomy', agronomyRoutes);

// Demo flow reset
app.post('/api/demo/reset-flow', (req, res) => {
  res.json({ success: true, message: 'Workflow state refreshed' });
});

async function startServer() {
  // Frontend Serving: Vite dev middleware in development, static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgriVerse Fullstack Application running at http://0.0.0.0:${PORT}`);
    // Connect to MongoDB and seed initial data in background
    connectDB()
      .then((conn) => {
        if (conn) seedInitialData();
      })
      .catch((err) => {
        console.error('Database connection notice:', err.message);
      });
  });
}

startServer();
