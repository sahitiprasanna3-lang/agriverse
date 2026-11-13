import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Transporter,
  Order,
  UserProfile,
  VegetableLoadBooking,
  VegetableLoadStatus,
  UpiPaymentReceipt,
} from '../types';
import {
  Truck,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle,
  CheckCircle2,
  Phone,
  ArrowRight,
  Bell,
  Volume2,
  VolumeX,
  Navigation,
  Package,
  Radio,
  Smartphone,
  Star,
  KeyRound,
  RefreshCw,
  X,
} from 'lucide-react';
import { FreeUpiPaymentModal } from './payments/FreeUpiPaymentModal';

interface TransporterPortalProps {
  currentUser: UserProfile;
  transporters: Transporter[];
  orders: Order[];
  onAssignTransportToOrder: (orderId: string, vehicleId: string) => void;
  onAdvanceOrderStatus: (orderId: string) => void;
}

const FALLBACK_VEGETABLE_LOADS: VegetableLoadBooking[] = [
  {
    id: 'LOAD-8492',
    farmerId: 'usr-farmer-bikshapathi',
    farmerName: 'Bikshapathi Goud',
    farmerPhone: '+91 98482 34119',
    farmerRating: 4.9,
    farmerUpiId: 'bikshapathi.farm@ybl',
    vegetables: 'Fresh Hybrid Tomatoes (Grade A)',
    vegetableTags: ['Tomato (Hybrid)', 'Firm Red Crates'],
    cropImage:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
    weightQuintals: 9,
    packagingInfo: '36 Ventilated Plastic Crates (25 kg each)',
    vehicleRequired: 'Mini Pickup (1.5T) / Tata Ace',
    pickupVillage: 'Atmakur Vegetable Cluster, Gate #2',
    pickupDistrict: 'Warangal',
    pickupDistanceKm: 2.1,
    pickupEtaMins: 6,
    dropMandi: 'Warangal APMC Enamamula Vegetable Shed 2',
    tripDistanceKm: 18.4,
    estimatedDurationMins: 32,
    estimatedFare: 1150,
    loadingSupport: '2 Farm Helpers Ready at Gate',
    paymentMode: 'Razorpay',
    paymentStatus: 'pending',
    status: 'pending',
    urgency: 'harvest_ready',
    pickupOtp: '4829',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'LOAD-8495',
    farmerId: 'usr-farmer-kavitha',
    farmerName: 'Kavitha Reddy',
    farmerPhone: '+91 97014 66280',
    farmerRating: 4.8,
    farmerUpiId: 'kavithareddy.agri@okaxis',
    vegetables: 'Guntur Teja Green Chillies & Tender Okra',
    vegetableTags: ['Green Chilli (Teja)', 'Okra (Bhindi)'],
    cropImage:
      'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop&q=80',
    weightQuintals: 14,
    packagingInfo: '28 Ventilated Mesh Gunny Sacks (50 kg each)',
    vehicleRequired: 'Tata 407 (2.5T) / Bolero Maxi',
    pickupVillage: 'Parkal Farm Road, Near Rythu Vedika',
    pickupDistrict: 'Warangal',
    pickupDistanceKm: 3.4,
    pickupEtaMins: 9,
    dropMandi: 'Bowenpally Wholesale Vegetable Yard, Hyderabad',
    tripDistanceKm: 54.0,
    estimatedDurationMins: 78,
    estimatedFare: 2480,
    loadingSupport: '3 Loaders Waiting at Shed',
    paymentMode: 'Razorpay',
    paymentStatus: 'pending',
    status: 'pending',
    urgency: 'harvest_ready',
    pickupOtp: '6194',
    createdAt: new Date().toISOString(),
  },
];

function playDispatchChime(enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.setValueAtTime(880, now + 0.14); // A5
    osc2.frequency.setValueAtTime(329.63, now);
    osc2.frequency.setValueAtTime(440, now + 0.14);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.44);
    osc2.stop(now + 0.44);
  } catch {
    // Browser autoplay policy may silence before user gesture
  }
}

export const TransporterPortal: React.FC<TransporterPortalProps> = ({
  currentUser,
  transporters,
  orders,
  onAdvanceOrderStatus,
}) => {
  const [selectedVehicleType, setSelectedVehicleType] = useState('All');
  const [dutyOnline, setDutyOnline] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [loadBookings, setLoadBookings] = useState<VegetableLoadBooking[]>([]);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [alertDismissedManually, setAlertDismissedManually] = useState<boolean>(false);
  const [countdownSec, setCountdownSec] = useState<number>(30);
  const [isAcceptingId, setIsAcceptingId] = useState<string | null>(null);
  const [isSimulatingNew, setIsSimulatingNew] = useState<boolean>(false);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpErrorById, setOtpErrorById] = useState<Record<string, string>>({});

  // Free UPI Payment Modal State
  const [upiModalTarget, setUpiModalTarget] = useState<{
    amount: number;
    payeeName: string;
    payeeVpa: string;
    purposeLabel: string;
    entityId: string;
    mode: 'pay' | 'receive';
  } | null>(null);

  const lastAlertedIdRef = useRef<string | null>(null);

  const driverName = currentUser.name || 'Shankar Rao';
  const driverPhone = currentUser.phone || '+91 97001 88990';
  const driverUpiId =
    currentUser.bankDetails?.upiId ||
    `${driverName.toLowerCase().replace(/[^a-z0-9]/g, '')}.vegarath@ybl`;
  const driverVehicleNumber = 'TS 03 UA 5678';

  const fetchLoadQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/transport/loads');
      if (res.ok) {
        const data: VegetableLoadBooking[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLoadBookings(data);
          return;
        }
      }
      setLoadBookings((prev) => (prev.length > 0 ? prev : FALLBACK_VEGETABLE_LOADS));
    } catch {
      setLoadBookings((prev) => (prev.length > 0 ? prev : FALLBACK_VEGETABLE_LOADS));
    }
  }, []);

  // Load initial queue + subscribe to real-time SSE dispatch stream
  useEffect(() => {
    fetchLoadQueue();

    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/transport/stream');

      es.addEventListener('new_load_request', (evt: MessageEvent) => {
        try {
          const incoming: VegetableLoadBooking = JSON.parse(evt.data);
          setLoadBookings((prev) => {
            const filtered = prev.filter((item) => item.id !== incoming.id);
            return [incoming, ...filtered];
          });
          setAlertDismissedManually(false);
          setCountdownSec(30);
          playDispatchChime(soundEnabled);
        } catch {
          // Ignore malformed event
        }
      });

      es.addEventListener('load_updated', (evt: MessageEvent) => {
        try {
          const updated: VegetableLoadBooking = JSON.parse(evt.data);
          setLoadBookings((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
          );
        } catch {
          // Ignore malformed event
        }
      });
    } catch {
      // SSE optional fallback
    }

    return () => {
      if (es) es.close();
    };
  }, [fetchLoadQueue, soundEnabled]);

  const pendingLoads = loadBookings.filter((b) => b.status === 'pending');
  const unskippedPendingLoads = pendingLoads.filter((b) => !skippedIds.includes(b.id));
  const activeAlertLoad =
    dutyOnline && !alertDismissedManually && unskippedPendingLoads.length > 0
      ? unskippedPendingLoads[0]
      : null;

  const activeAcceptedLoads = loadBookings.filter(
    (b) => b.status !== 'pending' && b.status !== 'cancelled'
  );

  // Chime + reset 30s timer whenever a new activeAlertLoad surfaces
  useEffect(() => {
    if (activeAlertLoad && activeAlertLoad.id !== lastAlertedIdRef.current) {
      lastAlertedIdRef.current = activeAlertLoad.id;
      setCountdownSec(30);
      playDispatchChime(soundEnabled);
    }
  }, [activeAlertLoad, soundEnabled]);

  // Countdown tick for incoming dispatch alert
  useEffect(() => {
    if (!activeAlertLoad) return;

    const timer = setInterval(() => {
      setCountdownSec((prev) => {
        if (prev <= 1) {
          setSkippedIds((old) =>
            old.includes(activeAlertLoad.id) ? old : [...old, activeAlertLoad.id]
          );
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAlertLoad]);

  const handleSkipLoad = (id: string) => {
    setSkippedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setCountdownSec(30);
  };

  const handleAcceptLoad = async (booking: VegetableLoadBooking) => {
    setIsAcceptingId(booking.id);
    try {
      const res = await fetch(`/api/transport/loads/${booking.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: currentUser.id || 'TRP-101',
          driverName,
          driverPhone,
          vehicleNumber: driverVehicleNumber,
          vehicleType: booking.vehicleRequired,
          driverUpiId,
        }),
      });

      if (res.ok) {
        const updated: VegetableLoadBooking = await res.json();
        setLoadBookings((prev) =>
          prev.map((item) => (item.id === booking.id ? updated : item))
        );
        setAlertDismissedManually(true);
        return;
      }
    } catch {
      // Fallback local state update if offline
    } finally {
      setIsAcceptingId(null);
    }

    // Optimistic fallback
    setLoadBookings((prev) =>
      prev.map((item) =>
        item.id === booking.id
          ? {
              ...item,
              status: 'driver_en_route',
              acceptedAt: new Date().toISOString(),
              assignedDriver: {
                id: currentUser.id || 'TRP-101',
                name: driverName,
                phone: driverPhone,
                vehicleNumber: driverVehicleNumber,
                vehicleType: booking.vehicleRequired,
                upiId: driverUpiId,
              },
            }
          : item
      )
    );
    setAlertDismissedManually(true);
  };

  const handleProgressLoadStage = async (
    booking: VegetableLoadBooking,
    nextStatus: VegetableLoadStatus
  ) => {
    if (nextStatus === 'vegetables_loaded') {
      const enteredPin = (otpInputs[booking.id] || '').trim();
      if (enteredPin && enteredPin !== booking.pickupOtp) {
        setOtpErrorById((prev) => ({
          ...prev,
          [booking.id]: `Incorrect Farm Gate PIN. Expected ${booking.pickupOtp}.`,
        }));
        return;
      }
    }

    setOtpErrorById((prev) => {
      const next = { ...prev };
      delete next[booking.id];
      return next;
    });

    try {
      const res = await fetch(`/api/transport/loads/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          otp: booking.pickupOtp,
        }),
      });

      if (res.ok) {
        const updated: VegetableLoadBooking = await res.json();
        setLoadBookings((prev) =>
          prev.map((item) => (item.id === booking.id ? updated : item))
        );
        return;
      }
    } catch {
      // Fallback local transition
    }

    setLoadBookings((prev) =>
      prev.map((item) =>
        item.id === booking.id ? { ...item, status: nextStatus } : item
      )
    );
  };

  const handleSimulateIncomingFarmerAlert = async () => {
    setIsSimulatingNew(true);
    setDutyOnline(true);
    setAlertDismissedManually(false);

    try {
      const res = await fetch('/api/transport/loads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useTemplate: true }),
      });

      if (res.ok) {
        const created: VegetableLoadBooking = await res.json();
        setLoadBookings((prev) => {
          const withoutDup = prev.filter((b) => b.id !== created.id);
          return [created, ...withoutDup];
        });
        setSkippedIds((prev) => prev.filter((id) => id !== created.id));
        setCountdownSec(30);
        playDispatchChime(soundEnabled);
        return;
      }
    } catch {
      // Client fallback if needed
    } finally {
      setIsSimulatingNew(false);
    }

    const fallbackNew: VegetableLoadBooking = {
      id: `LOAD-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerId: 'usr-farmer-live',
      farmerName: 'Venkateshwarlu Goud',
      farmerPhone: '+91 98485 71204',
      farmerRating: 4.9,
      farmerUpiId: 'venkatesh.farm@ybl',
      vegetables: 'Fresh Ridge Gourd, Bitter Gourd & Green Chilli',
      vegetableTags: ['Ridge Gourd', 'Bitter Gourd', 'Green Chilli'],
      cropImage:
        'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&auto=format&fit=crop&q=80',
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
      paymentMode: 'Razorpay',
      paymentStatus: 'pending',
      status: 'pending',
      urgency: 'harvest_ready',
      pickupOtp: '5284',
      createdAt: new Date().toISOString(),
    };
    setLoadBookings((prev) => [fallbackNew, ...prev]);
    setCountdownSec(30);
    playDispatchChime(soundEnabled);
  };

  const handleUpiPaymentSettled = (receipt: UpiPaymentReceipt) => {
    if (!receipt.entityId) return;
    setLoadBookings((prev) =>
      prev.map((item) =>
        item.id === receipt.entityId
          ? {
              ...item,
              paymentStatus: 'completed',
              upiUtrNumber: receipt.utrNumber,
              upiApp: receipt.upiApp,
              status: item.status === 'delivered_unloaded' ? 'settled' : item.status,
            }
          : item
      )
    );
  };

  const filteredVehicles = transporters.filter((t) => {
    if (selectedVehicleType !== 'All' && t.vehicleType !== selectedVehicleType) return false;
    return true;
  });

  const getStatusLabel = (status: VegetableLoadStatus) => {
    switch (status) {
      case 'driver_en_route':
        return 'En Route to Farm Gate';
      case 'arrived_farm':
        return 'Arrived at Farm Gate';
      case 'vegetables_loaded':
        return 'Crates Loaded & Verified';
      case 'in_transit_mandi':
        return 'In Transit to APMC Mandi';
      case 'delivered_unloaded':
        return 'Unloaded at Mandi Shed';
      case 'settled':
        return 'Trip Completed & UPI Settled';
      default:
        return 'Awaiting Driver';
    }
  };

  const totalSettledEarnings = activeAcceptedLoads
    .filter((b) => b.paymentStatus === 'completed')
    .reduce((sum, b) => sum + b.estimatedFare, 0);

  return (
    <div className="space-y-6 py-4 text-left" id="vegarath-transporter-portal">
      {/* 1. VEGARATH EXPRESS FARM DISPATCH CONTROL BAR */}
      <div className="bg-slate-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold font-heading tracking-tight text-white">
                  VegaRath Express Farm Dispatch
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${
                    dutyOnline
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700/70'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      dutyOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  {dutyOnline ? 'PILOT ON DUTY · RADAR LIVE' : 'OFF DUTY'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pilot: <strong className="text-white">{driverName}</strong> ({driverVehicleNumber}) · Zero-Commission Vegetable Crate &amp; Sack Dispatch · Razorpay Freight Settlement
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono text-slate-400 tabular-nums">
                <span>
                  Nearby Farm Requests:{' '}
                  <strong className="text-amber-300">{pendingLoads.length}</strong>
                </span>
                <span>•</span>
                <span>
                  Active Trips:{' '}
                  <strong className="text-emerald-300">{activeAcceptedLoads.length}</strong>
                </span>
                <span>•</span>
                <span>
                  Razorpay Settled Today:{' '}
                  <strong className="text-white">
                    ₹{totalSettledEarnings.toLocaleString('en-IN')}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Duty & Live Alert Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute dispatch chime' : 'Enable dispatch chime'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !dutyOnline;
                setDutyOnline(next);
                if (next) {
                  setSkippedIds([]);
                  setAlertDismissedManually(false);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                dutyOnline
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {dutyOnline ? '● Duty Online' : 'Go Online'}
            </button>

            {pendingLoads.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setDutyOnline(true);
                  setSkippedIds([]);
                  setAlertDismissedManually(false);
                  setCountdownSec(30);
                  playDispatchChime(soundEnabled);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                id="reopen-load-alert-btn"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Incoming Alerts ({pendingLoads.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSimulateIncomingFarmerAlert}
              disabled={isSimulatingNew}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/40 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              id="trigger-new-farmer-load-alert-btn"
              title="Broadcast a live nearby farmer vegetable pickup request"
            >
              <Radio className={`w-3.5 h-3.5 ${isSimulatingNew ? 'animate-spin' : ''}`} />
              <span>{isSimulatingNew ? 'Scanning...' : '+ Test Live Farmer Alert'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE ACCEPTED FARMER VEGETABLE TRIPS */}
      {activeAcceptedLoads.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Active Farmer Vegetable Pickups ({activeAcceptedLoads.length})
              </h3>
              <p className="text-xs text-slate-500">
                Verify farm-gate loading PIN, update transit stage, and collect zero-fee freight via Razorpay.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {activeAcceptedLoads.map((trip) => {
              const isPaid = trip.paymentStatus === 'completed';
              return (
                <div
                  key={trip.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {trip.cropImage && (
                        <img
                          src={trip.cropImage}
                          alt={trip.vegetables}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {trip.id}
                          </span>
                          <h4 className="font-heading font-bold text-sm sm:text-base text-slate-900">
                            {trip.vegetables}
                          </h4>
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200">
                            {getStatusLabel(trip.status)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600">
                          Farmer: <strong className="text-slate-900">{trip.farmerName}</strong> ({trip.farmerRating} ★) · Load:{' '}
                          <strong className="font-mono tabular-nums text-slate-900">
                            {trip.weightQuintals} Quintals
                          </strong>{' '}
                          ({trip.packagingInfo})
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              Pickup: <strong className="text-slate-900">{trip.pickupVillage}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">
                              Drop: <strong className="text-slate-900">{trip.dropMandi}</strong> ({trip.tripDistanceKm} km)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Earnings & Call Action */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200">
                      <div className="lg:text-right">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                          Net Driver Freight
                        </span>
                        <span className="text-xl font-extrabold font-mono tabular-nums text-slate-950">
                          ₹{trip.estimatedFare.toLocaleString('en-IN')}
                        </span>
                        <span
                          className={`block text-[10.5px] font-bold ${
                            isPaid ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {isPaid
                            ? `✓ Settled (${trip.upiUtrNumber || 'Razorpay'})`
                            : 'Collect via Razorpay'}
                        </span>
                      </div>

                      <a
                        href={`tel:${trip.farmerPhone}`}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs inline-flex items-center gap-1.5 no-underline"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Call {trip.farmerPhone}</span>
                      </a>
                    </div>
                  </div>

                  {/* Stage Controls + Free UPI Freight Button */}
                  <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {trip.status === 'driver_en_route' && (
                        <button
                          type="button"
                          onClick={() => handleProgressLoadStage(trip, 'arrived_farm')}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-300" />
                          <span>Reached Farm Gate</span>
                        </button>
                      )}

                      {trip.status === 'arrived_farm' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-300">
                            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                            <input
                              type="text"
                              maxLength={4}
                              value={otpInputs[trip.id] ?? trip.pickupOtp}
                              onChange={(e) =>
                                setOtpInputs((prev) => ({ ...prev, [trip.id]: e.target.value }))
                              }
                              placeholder="4-digit PIN"
                              className="w-20 text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                            />
                            <span className="text-[10px] font-mono text-slate-400">
                              (Gate PIN: {trip.pickupOtp})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleProgressLoadStage(trip, 'vegetables_loaded')}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>Verify PIN &amp; Confirm Crates Loaded</span>
                          </button>
                        </div>
                      )}

                      {trip.status === 'vegetables_loaded' && (
                        <button
                          type="button"
                          onClick={() => handleProgressLoadStage(trip, 'in_transit_mandi')}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5 text-amber-300" />
                          <span>Start Mandi Highway Transit</span>
                        </button>
                      )}

                      {trip.status === 'in_transit_mandi' && (
                        <button
                          type="button"
                          onClick={() => handleProgressLoadStage(trip, 'delivered_unloaded')}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Unloaded at APMC Mandi</span>
                        </button>
                      )}

                      {(trip.status === 'delivered_unloaded' || trip.status === 'settled') && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Unloaded at Mandi</span>
                        </span>
                      )}

                      {otpErrorById[trip.id] && (
                        <span className="text-xs text-rose-600 font-medium">
                          {otpErrorById[trip.id]}
                        </span>
                      )}
                    </div>

                    {/* Collect / Open Free UPI Button */}
                    {!isPaid ? (
                      <button
                        type="button"
                        onClick={() =>
                          setUpiModalTarget({
                            amount: trip.estimatedFare,
                            payeeName: driverName,
                            payeeVpa: driverUpiId,
                            purposeLabel: `Vegetable Load Freight ${trip.id} (${trip.vegetables})`,
                            entityId: trip.id,
                            mode: 'receive',
                          })
                        }
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          Collect ₹{trip.estimatedFare.toLocaleString('en-IN')} via Razorpay
                        </span>
                      </button>
                    ) : (
                      <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                        ✓ Settled · Ref {trip.upiUtrNumber}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. NEARBY FARMER VEGETABLE LOAD REQUESTS RADAR LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Live Farmer Vegetable Load Requests
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-mono text-[11px] font-bold">
                {pendingLoads.length} Waiting
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Direct farm-gate vegetable pickup bookings broadcast by nearby farmers. Accept any load with zero platform commission.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchLoadQueue}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Radar</span>
          </button>
        </div>

        {pendingLoads.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="text-sm font-semibold text-slate-800">
              All nearby farmer vegetable loads have been dispatched!
            </p>
            <p className="text-xs text-slate-500">
              Click "+ Test Live Farmer Alert" above or book a vegetable loader from the Farmer Portal to receive an instant dispatch alert.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {pendingLoads.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {req.cropImage && (
                      <img
                        src={req.cropImage}
                        alt={req.vegetables}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-300">
                          {req.pickupDistanceKm} km away · {req.pickupEtaMins} mins
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {req.weightQuintals} Quintals
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {req.vegetables}
                      </h4>
                      <p className="text-[11px] text-slate-600 truncate">
                        {req.packagingInfo} · {req.vehicleRequired}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-extrabold text-lg tabular-nums text-slate-950 block">
                      ₹{req.estimatedFare.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-medium text-emerald-700">Razorpay</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 border-t border-slate-200/80 pt-2.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      <strong>Pickup:</strong> {req.pickupVillage} ({req.farmerName})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Navigation className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">
                      <strong>Drop:</strong> {req.dropMandi} ({req.tripDistanceKm} km)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 truncate">{req.loadingSupport}</span>
                  <button
                    type="button"
                    onClick={() => handleAcceptLoad(req)}
                    disabled={isAcceptingId === req.id}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shrink-0 transition-colors"
                  >
                    {isAcceptingId === req.id ? 'Accepting...' : 'Accept Load'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. ASSIGNED BULK ORDER SHIPMENTS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-slate-900">
            Assigned Bulk Market Shipments
          </h3>
          <span className="text-xs text-slate-500">Razorpay Freight Settlement</span>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">
            No bulk buyer-farmer contracts currently assigned. Accept live vegetable loads above for instant farm-to-mandi trips.
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {order.id}
                    </span>
                    <span className="font-semibold text-slate-900 text-sm">
                      {order.crop} - {order.quantity} {order.unit}
                    </span>
                    <span className="bg-slate-100 text-slate-700 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-200">
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Pickup: <strong className="text-slate-900">{order.pickupLocation}</strong> ({order.farmerName})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Drop: <strong className="text-slate-900">{order.deliveryLocation}</strong> ({order.buyerCompany})
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                    Vehicle: {order.vehicleType || 'Heavy Lorry (10 Ton)'} • Plate: {order.vehicleNumber || 'TS 03 UA 5678'} • Freight: ₹8,500
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setUpiModalTarget({
                        amount: 8500,
                        payeeName: driverName,
                        payeeVpa: driverUpiId,
                        purposeLabel: `Bulk Order Freight ${order.id} (${order.crop})`,
                        entityId: order.id,
                        mode: 'receive',
                      })
                    }
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-blue-700" />
                    <span>Razorpay</span>
                  </button>

                  {order.currentStep < 7 ? (
                    <button
                      type="button"
                      onClick={() => onAdvanceOrderStatus(order.id)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Update Stage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-emerald-800 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Delivered
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. FLEET CAPACITY & AVAILABLE DRIVERS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Fleet Capacity &amp; Available Drivers
            </h3>
            <p className="text-xs text-slate-500">
              Mini Pickup (1T), Tata 407 (2.5T), Heavy Lorry (10T), Multi-Axle Truck (20T)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedVehicleType}
              onChange={(e) => setSelectedVehicleType(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white focus:outline-hidden"
            >
              <option value="All">All Vehicle Types</option>
              <option value="Mini Pickup">Mini Pickup (1T)</option>
              <option value="Tata 407">Tata 407 (2.5T)</option>
              <option value="Heavy Lorry">Heavy Lorry (10T)</option>
              <option value="Multi-Axle Truck">Multi-Axle Truck (20T)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-sm">{v.vehicleType}</span>
                <span className="text-xs font-mono tabular-nums font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {v.capacityTonnes || v.capacityTons || 2} T
                </span>
              </div>
              <p className="text-xs font-mono font-medium text-slate-900">
                {v.vehicleNumber || 'TS 03 UA 5678'}
              </p>
              <p className="text-xs text-slate-600">
                Driver: {v.driverName || v.name} ({v.driverPhone || v.contact})
              </p>
              <p className="text-[11px] text-slate-500">
                Base: {v.baseLocation || v.currentLocation}
              </p>
              <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-200">
                <span className="font-mono tabular-nums text-slate-700">
                  ₹{v.pricePerKm || v.ratePerKm}/km
                </span>
                <span className="text-emerald-700 font-mono text-[11px] font-medium">
                  ● Available
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIVE INCOMING FARMER VEGETABLE BOOKING DISPATCH OVERLAY */}
      {activeAlertLoad && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="Incoming Farmer Vegetable Load Booking Request"
          id="incoming-vegetable-load-alert-modal"
        >
          <div className="w-full max-w-md bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-amber-400/50">
            {/* Countdown Progress Bar */}
            <div className="h-1.5 w-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-1000 ease-linear"
                style={{ width: `${(countdownSec / 30) * 100}%` }}
              />
            </div>

            {/* Alert Top Header */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
                </span>
                <div>
                  <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-amber-300 block">
                    NEW FARMER VEGETABLE LOAD REQUEST
                  </span>
                  <span className="text-[11px] text-slate-400">
                    VegaRath Instant Dispatch · {unskippedPendingLoads.length} in queue
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/40 font-mono font-bold text-xs tabular-nums text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {countdownSec}s
                </span>
                <button
                  type="button"
                  onClick={() => setAlertDismissedManually(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  title="Minimize alert to view dashboard"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Guaranteed Driver Earnings & Distance Highlight */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Net Driver Earnings (0% Cut)
                  </span>
                  <span className="text-3xl font-extrabold font-mono tabular-nums text-emerald-400">
                    ₹{activeAlertLoad.estimatedFare.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-slate-300 block mt-0.5">
                    Instant Razorpay Freight Settlement
                  </span>
                </div>

                <div className="text-right space-y-1">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-mono font-extrabold text-xs tabular-nums">
                    {activeAlertLoad.pickupDistanceKm} km away
                  </span>
                  <span className="block text-[11px] text-slate-300 font-mono tabular-nums">
                    {activeAlertLoad.pickupEtaMins} mins to Farm Gate
                  </span>
                </div>
              </div>

              {/* Vegetable Cargo & Farmer Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-3.5">
                {activeAlertLoad.cropImage && (
                  <img
                    src={activeAlertLoad.cropImage}
                    alt={activeAlertLoad.vegetables}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="font-heading font-bold text-sm text-white truncate">
                    {activeAlertLoad.vegetables}
                  </h4>
                  <p className="text-xs font-semibold text-amber-300 font-mono tabular-nums">
                    {activeAlertLoad.weightQuintals} Quintals · {activeAlertLoad.packagingInfo}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
                    <span className="truncate flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Farmer: <strong className="text-white">{activeAlertLoad.farmerName}</strong>
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-amber-300 font-mono shrink-0">
                      <Star className="w-3 h-3 fill-amber-300" />
                      {activeAlertLoad.farmerRating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pickup -> Drop Route */}
              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 block">
                      Farm Gate Pickup
                    </span>
                    <p className="font-semibold text-white">{activeAlertLoad.pickupVillage}</p>
                    <p className="text-[11px] text-emerald-300">{activeAlertLoad.loadingSupport}</p>
                  </div>
                </div>

                <div className="border-t border-slate-800/90 pt-2.5 flex items-start gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 block">
                      Mandi Unloading Point ({activeAlertLoad.tripDistanceKm} km · ~{activeAlertLoad.estimatedDurationMins} mins)
                    </span>
                    <p className="font-semibold text-white">{activeAlertLoad.dropMandi}</p>
                    <p className="text-[11px] text-slate-400">
                      Vehicle: {activeAlertLoad.vehicleRequired}
                    </p>
                  </div>
                </div>
              </div>

              {/* Primary Accept / Skip Actions */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSkipLoad(activeAlertLoad.id)}
                  className="col-span-1 py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Skip / Next
                </button>

                <button
                  type="button"
                  onClick={() => handleAcceptLoad(activeAlertLoad)}
                  disabled={isAcceptingId === activeAlertLoad.id}
                  className="col-span-2 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  id="accept-vegetable-load-btn"
                >
                  <Truck className="w-4 h-4 stroke-[2.4]" />
                  <span>
                    {isAcceptingId === activeAlertLoad.id
                      ? 'Assigning Load...'
                      : `Accept Load · ₹${activeAlertLoad.estimatedFare.toLocaleString('en-IN')}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zero-Fee Direct UPI Payment / Collection Modal */}
      {upiModalTarget && (
        <FreeUpiPaymentModal
          isOpen={Boolean(upiModalTarget)}
          onClose={() => setUpiModalTarget(null)}
          amount={upiModalTarget.amount}
          payeeName={upiModalTarget.payeeName}
          payeeVpa={upiModalTarget.payeeVpa}
          purposeLabel={upiModalTarget.purposeLabel}
          entityId={upiModalTarget.entityId}
          payerName="Farmer / Mandi Consignee"
          mode={upiModalTarget.mode}
          onPaymentSuccess={handleUpiPaymentSettled}
        />
      )}
    </div>
  );
};
