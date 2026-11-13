import Transporter from '../models/Transporter.js';
import Warehouse from '../models/Warehouse.js';
import { isDbConnected } from '../config/db.js';
import { store } from '../store.js';

// Connected SSE clients for instant VegaRath dispatch push alerts
const sseClients = new Set();

export function broadcastDispatchEvent(eventType, payload) {
  const frame = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const clientRes of sseClients) {
    try {
      clientRes.write(frame);
    } catch {
      sseClients.delete(clientRes);
    }
  }
}

export function streamTransportDispatch(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(
    `event: connected\ndata: ${JSON.stringify({
      ok: true,
      pendingCount: store.loadBookings.filter((b) => b.status === 'pending').length,
      timestamp: new Date().toISOString(),
    })}\n\n`
  );

  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat ${Date.now()}\n\n`);
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
}

export async function getTransporters(req, res) {
  try {
    if (isDbConnected()) {
      try {
        const list = await Transporter.find();
        if (list && list.length > 0) return res.json(list);
      } catch {
        // Fallback to store
      }
    }
    res.json(store.transporters);
  } catch {
    res.status(500).json({ error: 'Failed to fetch transporters' });
  }
}

export async function getWarehouses(req, res) {
  try {
    if (isDbConnected()) {
      try {
        const list = await Warehouse.find();
        if (list && list.length > 0) return res.json(list);
      } catch {
        // Fallback to store
      }
    }
    res.json(store.warehouses);
  } catch {
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
}

export async function bookTransport(req, res) {
  try {
    const { transporterId, pickup, destination } = req.body;
    const transporter = store.transporters.find((t) => t.id === transporterId) || store.transporters[0];
    if (!transporter) return res.status(404).json({ error: 'Transporter not found' });

    const bookingId = `TRP-BK-${Date.now().toString().slice(-6)}`;
    res.json({
      success: true,
      bookingId,
      transporterName: transporter.name,
      vehicleType: transporter.vehicleType,
      estimatedDistanceKm: 42,
      estimatedCost: 42 * (transporter.ratePerKm || 25),
      pickup,
      destination,
      status: 'Assigned & Dispatched',
    });
  } catch {
    res.status(500).json({ error: 'Failed to book transport' });
  }
}

export async function getLoadBookings(req, res) {
  try {
    const { status } = req.query;
    let items = [...store.loadBookings];
    if (status && typeof status === 'string') {
      items = items.filter((b) => b.status === status);
    }
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to load farmer vegetable dispatch queue' });
  }
}

const SAMPLE_FARMER_LOAD_TEMPLATES = [
  {
    farmerName: 'Venkateshwarlu Goud',
    farmerPhone: '+91 98485 71204',
    farmerRating: 4.9,
    farmerUpiId: 'venkatesh.farm@ybl',
    vegetables: 'Fresh Ridge Gourd, Bitter Gourd & Green Chilli',
    vegetableTags: ['Ridge Gourd', 'Bitter Gourd', 'Green Chilli'],
    cropImage: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&auto=format&fit=crop&q=80',
    weightQuintals: 11,
    packagingInfo: '44 Ventilated Plastic Crates (25 kg)',
    vehicleRequired: 'Mini Pickup (1.5T) / Tata Ace',
    pickupVillage: 'Dharmasagar Vegetable Belt, Plot #12',
    pickupDistrict: 'Hanamkonda',
    pickupDistanceKm: 1.9,
    pickupEtaMins: 5,
    dropMandi: 'Warangal APMC Enamamula Vegetable Block',
    tripDistanceKm: 19.5,
    estimatedDurationMins: 34,
    estimatedFare: 1220,
    loadingSupport: 'Crates Stacked at Main Road Gate',
  },
  {
    farmerName: 'Padmavathi Devi',
    farmerPhone: '+91 97042 88319',
    farmerRating: 5.0,
    farmerUpiId: 'padmavathi.horti@okicici',
    vegetables: 'Hybrid Red Tomatoes & Green Capsicum',
    vegetableTags: ['Tomato (Hybrid)', 'Green Capsicum'],
    cropImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
    weightQuintals: 16,
    packagingInfo: '64 Foam-Lined Plastic Crates',
    vehicleRequired: 'Tata 407 / Bolero Pickup (2.5T)',
    pickupVillage: 'Mulugu Road Polyhouse Cluster',
    pickupDistrict: 'Warangal',
    pickupDistanceKm: 2.7,
    pickupEtaMins: 7,
    dropMandi: 'Bowenpally Wholesale Shed #4, Hyderabad',
    tripDistanceKm: 48.0,
    estimatedDurationMins: 72,
    estimatedFare: 2650,
    loadingSupport: '3 Farm Workers Assisting Load',
  },
  {
    farmerName: 'Narasimha Chary',
    farmerPhone: '+91 99591 44028',
    farmerRating: 4.8,
    farmerUpiId: 'narasimha.agro@paytm',
    vegetables: 'Fresh Leafy Spinach, Coriander & Methi Bundles',
    vegetableTags: ['Spinach (Palak)', 'Coriander', 'Methi'],
    cropImage: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=80',
    weightQuintals: 7,
    packagingInfo: '28 Moisture-Cooled Bamboo & Plastic Baskets',
    vehicleRequired: 'Mini Pickup / 3-Wheeler Loader',
    pickupVillage: 'Kazipet Peri-Urban Green Farm',
    pickupDistrict: 'Hanamkonda',
    pickupDistanceKm: 1.4,
    pickupEtaMins: 4,
    dropMandi: 'Hanamkonda Rythu Bazar Gate #1',
    tripDistanceKm: 9.8,
    estimatedDurationMins: 18,
    estimatedFare: 780,
    loadingSupport: 'Immediate Fast Loading Ready',
  },
];

export async function createLoadBooking(req, res) {
  try {
    const body = req.body || {};
    const template =
      body.useTemplate
        ? SAMPLE_FARMER_LOAD_TEMPLATES[Math.floor(Math.random() * SAMPLE_FARMER_LOAD_TEMPLATES.length)]
        : null;

    const weightQuintals = Number(body.weightQuintals ?? template?.weightQuintals ?? 10);
    const tripDistanceKm = Number(body.tripDistanceKm ?? template?.tripDistanceKm ?? 22);
    const computedFare =
      Number(body.estimatedFare) ||
      template?.estimatedFare ||
      Math.max(650, Math.round(tripDistanceKm * 48 + weightQuintals * 25));

    const newLoad = {
      id: `LOAD-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerId: body.farmerId || 'usr-farmer-live',
      farmerName: body.farmerName || template?.farmerName || 'Ramesh Kumar',
      farmerPhone: body.farmerPhone || template?.farmerPhone || '+91 98480 23456',
      farmerRating: Number(body.farmerRating ?? template?.farmerRating ?? 4.9),
      farmerUpiId: body.farmerUpiId || template?.farmerUpiId || 'ramesh.farmer@ybl',
      vegetables: body.vegetables || template?.vegetables || 'Fresh Hybrid Tomatoes & Green Chillies',
      vegetableTags: Array.isArray(body.vegetableTags)
        ? body.vegetableTags
        : template?.vegetableTags || [body.vegetables || 'Fresh Vegetables'],
      cropImage:
        body.cropImage ||
        template?.cropImage ||
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
      weightQuintals,
      packagingInfo:
        body.packagingInfo ||
        template?.packagingInfo ||
        `${Math.max(4, Math.round(weightQuintals * 4))} Plastic Crates (25 kg each)`,
      vehicleRequired: body.vehicleRequired || template?.vehicleRequired || 'Mini Pickup (1.5T) / Tata Ace',
      pickupVillage: body.pickupVillage || template?.pickupVillage || 'Rayaparthi Farm Gate, Warangal',
      pickupDistrict: body.pickupDistrict || template?.pickupDistrict || 'Warangal',
      pickupDistanceKm: Number(body.pickupDistanceKm ?? template?.pickupDistanceKm ?? 2.3),
      pickupEtaMins: Number(body.pickupEtaMins ?? template?.pickupEtaMins ?? 6),
      dropMandi: body.dropMandi || template?.dropMandi || 'Warangal APMC Enamamula Vegetable Market',
      tripDistanceKm,
      estimatedDurationMins: Number(body.estimatedDurationMins ?? template?.estimatedDurationMins ?? Math.max(20, Math.round(tripDistanceKm * 1.6))),
      estimatedFare: computedFare,
      loadingSupport: body.loadingSupport || template?.loadingSupport || 'Farm Helpers Ready at Gate',
      paymentMode: body.paymentMode || 'Instant Free UPI (PhonePe / GPay / Paytm)',
      paymentStatus: body.paymentStatus || 'pending',
      upiUtrNumber: body.upiUtrNumber || undefined,
      status: 'pending',
      urgency: body.urgency || 'harvest_ready',
      pickupOtp: String(Math.floor(1000 + Math.random() * 9000)),
      createdAt: new Date().toISOString(),
    };

    store.loadBookings.unshift(newLoad);
    broadcastDispatchEvent('new_load_request', newLoad);

    res.status(201).json(newLoad);
  } catch (err) {
    res.status(500).json({ error: 'Failed to broadcast vegetable load request' });
  }
}

export async function acceptLoadBooking(req, res) {
  try {
    const { id } = req.params;
    const {
      driverId,
      driverName,
      driverPhone,
      vehicleNumber,
      vehicleType,
      driverUpiId,
    } = req.body || {};

    const idx = store.loadBookings.findIndex((b) => b.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Load request not found' });
    }

    const existing = store.loadBookings[idx];
    if (existing.status !== 'pending') {
      return res.status(409).json({
        error: 'This load request was already accepted by another pilot',
        booking: existing,
      });
    }

    const updated = {
      ...existing,
      status: 'driver_en_route',
      acceptedAt: new Date().toISOString(),
      assignedDriver: {
        id: driverId || 'TRP-101',
        name: driverName || 'Shankar Rao',
        phone: driverPhone || '+91 97001 88990',
        vehicleNumber: vehicleNumber || 'TS 03 UA 5678',
        vehicleType: vehicleType || existing.vehicleRequired,
        upiId: driverUpiId || 'shankar.transport@ybl',
      },
    };

    store.loadBookings[idx] = updated;
    broadcastDispatchEvent('load_updated', updated);

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to accept vegetable load request' });
  }
}

export async function updateLoadBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, otp, paymentStatus, upiUtrNumber, upiApp } = req.body || {};

    const idx = store.loadBookings.findIndex((b) => b.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Load booking not found' });
    }

    const current = store.loadBookings[idx];

    if (status === 'vegetables_loaded' && otp && String(otp).trim() !== String(current.pickupOtp)) {
      return res.status(400).json({
        error: `Incorrect Farm Gate Load PIN. Ask farmer ${current.farmerName} for PIN (${current.pickupOtp}).`,
      });
    }

    const updated = {
      ...current,
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(upiUtrNumber ? { upiUtrNumber } : {}),
      ...(upiApp ? { upiApp } : {}),
      updatedAt: new Date().toISOString(),
    };

    store.loadBookings[idx] = updated;
    broadcastDispatchEvent('load_updated', updated);

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update load booking stage' });
  }
}
