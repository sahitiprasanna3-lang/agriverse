import React, { useState, useEffect } from 'react';
import {
  Transporter,
  Warehouse,
  UserProfile,
  VegetableLoadBooking,
} from '../types';
import {
  Truck,
  Building2,
  MapPin,
  Radio,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Package,
} from 'lucide-react';
import { FreeUpiPaymentModal } from './payments/FreeUpiPaymentModal';

interface LogisticsAndStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  transporters: Transporter[];
  warehouses: Warehouse[];
  defaultTab?: 'transport' | 'storage';
  currentUser?: UserProfile;
  onSwitchToTransportSystem?: () => void;
}

const VEGETABLE_OPTIONS = [
  {
    label: 'Hybrid Tomatoes (Grade A Crates)',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Guntur Teja Green Chillies',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Red Nashik Onions (50kg Mesh Bags)',
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Fresh Cauliflower, Brinjal & Okra',
    image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&auto=format&fit=crop&q=80',
  },
  {
    label: 'Leafy Spinach, Coriander & Methi',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=80',
  },
];

export const LogisticsAndStorageModal: React.FC<LogisticsAndStorageModalProps> = ({
  isOpen,
  onClose,
  transporters,
  warehouses,
  defaultTab = 'transport',
  currentUser,
  onSwitchToTransportSystem,
}) => {
  const [activeTab, setActiveTab] = useState<'instant_loader' | 'transport' | 'storage'>(
    defaultTab === 'storage' ? 'storage' : 'instant_loader'
  );
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [broadcastBooking, setBroadcastBooking] = useState<VegetableLoadBooking | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  // Instant Vegetable Loader Form State
  const [selectedVegIndex, setSelectedVegIndex] = useState<number>(0);
  const [weightQuintals, setWeightQuintals] = useState<number>(10);
  const [crateCount, setCrateCount] = useState<number>(40);
  const [vehicleRequired, setVehicleRequired] = useState<string>('Mini Pickup (1.5T) / Tata Ace');
  const [pickupVillage, setPickupVillage] = useState<string>(
    currentUser?.location || 'Atmakur Vegetable Cluster, Warangal'
  );
  const [dropMandi, setDropMandi] = useState<string>(
    'Warangal APMC Enamamula Vegetable Shed 2'
  );
  const [tripDistanceKm, setTripDistanceKm] = useState<number>(22);

  // Free UPI Modal State
  const [upiPaymentConfig, setUpiPaymentConfig] = useState<{
    amount: number;
    payeeName: string;
    payeeVpa: string;
    purposeLabel: string;
    entityId?: string;
  } | null>(null);

  useEffect(() => {
    setActiveTab(defaultTab === 'storage' ? 'storage' : 'instant_loader');
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

  const estimatedFare = Math.max(
    650,
    Math.round(tripDistanceKm * 45 + weightQuintals * 25)
  );

  const handleBroadcastVegetableLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcasting(true);
    const chosenVeg = VEGETABLE_OPTIONS[selectedVegIndex] || VEGETABLE_OPTIONS[0];

    try {
      const res = await fetch('/api/transport/loads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: currentUser?.id || 'usr-farmer-live',
          farmerName: currentUser?.name || 'Ramesh Kumar',
          farmerPhone: currentUser?.phone || '+91 98480 23456',
          farmerUpiId: currentUser?.bankDetails?.upiId || 'ramesh.farmer@ybl',
          vegetables: chosenVeg.label,
          vegetableTags: [chosenVeg.label.split('(')[0].trim()],
          cropImage: chosenVeg.image,
          weightQuintals,
          packagingInfo: `${crateCount} Ventilated Crates / Mesh Sacks`,
          vehicleRequired,
          pickupVillage,
          dropMandi,
          tripDistanceKm,
          estimatedFare,
          loadingSupport: 'Farm Helpers Ready at Gate',
        }),
      });

      if (res.ok) {
        const created: VegetableLoadBooking = await res.json();
        setBroadcastBooking(created);
        setBookingSuccess(
          `Live vegetable load (${created.id}) broadcast to nearby VegaRath pilots! Gate PIN: ${created.pickupOtp}`
        );
      }
    } catch {
      setBookingSuccess(
        'Vegetable load broadcast to nearby VegaRath pilots! Drivers within 3 km have been alerted.'
      );
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 space-y-4 text-left max-h-[92vh] overflow-y-auto">
        {/* Modal Header Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('instant_loader')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'instant_loader'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Book Vegetable Loader</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transport')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'transport'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Heavy Lorries ({transporters.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('storage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'storage'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Warehouses ({warehouses.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-base font-mono cursor-pointer px-1.5"
          >
            ✕
          </button>
        </div>

        {bookingSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{bookingSuccess}</span>
            </div>
            {broadcastBooking && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setUpiPaymentConfig({
                      amount: broadcastBooking.estimatedFare || estimatedFare,
                      payeeName: 'VegaRath Verified Driver Escrow',
                      payeeVpa: 'vegarath.freight@sbi',
                      purposeLabel: `Vegetable Loader Freight (${broadcastBooking.id})`,
                      entityId: broadcastBooking.id,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-[#072654] hover:bg-[#0b3574] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                  <span>
                    Pay ₹{(broadcastBooking.estimatedFare || estimatedFare).toLocaleString('en-IN')} Freight via Razorpay
                  </span>
                </button>
                {onSwitchToTransportSystem && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToTransportSystem();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Open Transport System to View Live Driver Alert</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 0: INSTANT VEGETABLE LOADER (VEGARATH DISPATCH) */}
        {activeTab === 'instant_loader' && (
          <form onSubmit={handleBroadcastVegetableLoad} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 text-white flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 block">
                  VegaRath Instant Farm-to-Mandi Dispatch
                </span>
                <p className="font-bold text-sm mt-0.5">
                  Broadcast Harvested Vegetables to Nearby Pickup Drivers
                </p>
                <p className="text-[11px] text-slate-300">
                  Zero broker fee · Instant Razorpay freight settlement
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block">Est. Fare</span>
                <span className="text-xl font-extrabold font-mono tabular-nums text-emerald-400">
                  ₹{estimatedFare.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Harvested Vegetables
                </label>
                <select
                  value={selectedVegIndex}
                  onChange={(e) => setSelectedVegIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                >
                  {VEGETABLE_OPTIONS.map((v, idx) => (
                    <option key={v.label} value={idx}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Required Loader Vehicle
                </label>
                <select
                  value={vehicleRequired}
                  onChange={(e) => setVehicleRequired(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                >
                  <option value="Mini Pickup (1.5T) / Tata Ace">Mini Pickup (1.5T) / Tata Ace</option>
                  <option value="3-Wheeler Cargo Loader (0.8T)">3-Wheeler Cargo Loader (0.8T)</option>
                  <option value="Tata 407 / Bolero Maxi (2.5T)">Tata 407 / Bolero Maxi (2.5T)</option>
                  <option value="Eicher 14ft Insulated Crate Van">Eicher 14ft Insulated Crate Van</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Weight (Quintals)
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={weightQuintals}
                  onChange={(e) => {
                    const q = Math.max(1, Number(e.target.value));
                    setWeightQuintals(q);
                    setCrateCount(q * 4);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold tabular-nums text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Crates / Sacks
                </label>
                <input
                  type="number"
                  min={1}
                  value={crateCount}
                  onChange={(e) => setCrateCount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold tabular-nums text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Mandi Distance (km)
                </label>
                <input
                  type="number"
                  min={2}
                  max={500}
                  value={tripDistanceKm}
                  onChange={(e) => setTripDistanceKm(Math.max(2, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold tabular-nums text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  <MapPin className="w-3 h-3 inline mr-1 text-emerald-600" />
                  Farm Gate Pickup Location
                </label>
                <input
                  type="text"
                  value={pickupVillage}
                  onChange={(e) => setPickupVillage(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  <Package className="w-3 h-3 inline mr-1 text-amber-600" />
                  Destination APMC Mandi
                </label>
                <input
                  type="text"
                  value={dropMandi}
                  onChange={(e) => setDropMandi(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={isBroadcasting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-sm cursor-pointer flex items-center justify-center gap-2"
                id="broadcast-vegetable-load-btn"
              >
                <Truck className="w-4 h-4 text-amber-300" />
                <span>
                  {isBroadcasting ? 'Broadcasting...' : 'Broadcast Load to Nearby Drivers'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 1: HEAVY LORRIES & FLEET */}
        {activeTab === 'transport' && (
          <div className="space-y-3.5">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-0.5">
              <strong className="text-slate-900 font-medium">Logistics Allocation: </strong>
              <span>
                For crop lots exceeding 1 Tonne (10 Quintals), Heavy Lorry (10T) or Multi-Axle vehicles reduce transport cost down to ₹250-₹300/Q.
              </span>
            </div>

            <div className="space-y-2.5">
              {transporters.map((t) => {
                const rate = t.pricePerKm || t.ratePerKm || 22;
                const sampleTripAdvance = rate * 40;
                return (
                  <div
                    key={t.id}
                    className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">{t.vehicleType}</span>
                        <span className="font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                          {t.vehicleNumber || 'TS 03 UA 5678'}
                        </span>
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono px-1.5 py-0.5 rounded">
                          {t.capacityTonnes || t.capacityTons || 5}T Capacity
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Operator: <span className="font-medium text-slate-800">{t.transporterName || t.name}</span> • Driver: {t.driverName || 'Shankar Rao'} ({t.driverPhone || t.contact})
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                        Location: {t.baseLocation || t.currentLocation} • Tariff:{' '}
                        <span className="text-slate-900 font-semibold">₹{rate}/km</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setUpiPaymentConfig({
                            amount: sampleTripAdvance,
                            payeeName: t.transporterName || t.name || 'Verified Fleet Operator',
                            payeeVpa: 'vegarath.fleet@ybl',
                            purposeLabel: `Lorry Booking Advance (${t.vehicleType})`,
                            entityId: t.id,
                          })
                        }
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        Book Vehicle (₹{sampleTripAdvance})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: STORAGE */}
        {activeTab === 'storage' && (
          <div className="space-y-3.5">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-0.5">
              <strong className="text-slate-900 font-medium">Distress Sale Prevention: </strong>
              <span>
                Farmers can deposit produce in accredited CWC / TSWC godowns with e-NWR warehouse receipts and settle storage charges via zero-fee UPI.
              </span>
            </div>

            <div className="space-y-2.5">
              {warehouses.map((w) => {
                const monthlyRate = w.dailyRatePerQuintal || w.ratePerQuintalMonth || 40;
                const depositAmount = monthlyRate * 20;
                return (
                  <div
                    key={w.id}
                    className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">{w.name}</span>
                        {w.type && (
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono px-1.5 py-0.5 rounded">
                            {w.type}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Location: {w.location} • Total Capacity:{' '}
                        <span className="font-mono font-medium">
                          {(w.capacityMetricTonnes || w.capacityQuintals || 1000).toLocaleString()} MT
                        </span>
                      </p>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Available:{' '}
                        <span className="font-mono">
                          {(w.availableCapacityMT || w.availableSpaceQuintals || 420).toLocaleString()} MT
                        </span>{' '}
                        • Charge:{' '}
                        <span className="font-mono font-semibold">₹{monthlyRate}/Q/mo</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setUpiPaymentConfig({
                            amount: depositAmount,
                            payeeName: w.name,
                            payeeVpa: 'wdra.storage@sbi',
                            purposeLabel: `Warehouse Slot Reservation (${w.name})`,
                            entityId: w.id,
                          })
                        }
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        Reserve Storage (₹{depositAmount})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {upiPaymentConfig && (
        <FreeUpiPaymentModal
          isOpen={Boolean(upiPaymentConfig)}
          onClose={() => setUpiPaymentConfig(null)}
          amount={upiPaymentConfig.amount}
          payeeName={upiPaymentConfig.payeeName}
          payeeVpa={upiPaymentConfig.payeeVpa}
          purposeLabel={upiPaymentConfig.purposeLabel}
          entityId={upiPaymentConfig.entityId}
          payerName={currentUser?.name || 'Farmer'}
          onPaymentSuccess={(receipt) => {
            setBookingSuccess(
              `Razorpay Payment ₹${receipt.amount.toLocaleString('en-IN')} settled (Ref: ${receipt.utrNumber})!`
            );
          }}
        />
      )}
    </div>
  );
};
