import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  Mic,
  MicOff,
  RotateCcw,
  RefreshCw,
  Printer,
  Trash2,
  Languages,
  Calendar,
  TrendingUp,
  Layers,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserProfile } from '../../types';
import {
  agronomyService,
  SoilCropRoadmapPlan,
  ApiErrorWithMeta,
} from '../../services/agronomyService';

interface PrecisionFarmingDashboardProps {
  currentUser?: UserProfile;
  focusedZoneId?: string | null;
  onScanZoneWithCropDoctor?: (zoneId: string, crop: string) => void;
}

const VOICE_LANGUAGES = [
  { code: 'te-IN', label: 'తెలుగు (Telugu)', outputName: 'Telugu (తెలుగు)' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)', outputName: 'Hindi (हिन्दी)' },
  { code: 'en-IN', label: 'English (India)', outputName: 'English' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)', outputName: 'Tamil (தமிழ்)' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)', outputName: 'Kannada (ಕನ್ನಡ)' },
  { code: 'mr-IN', label: 'मराठी (Marathi)', outputName: 'Marathi (मराठी)' },
  { code: 'gu-IN', label: 'ગુજરાતી (Gujarati)', outputName: 'Gujarati (ગુજરાતી)' },
  { code: 'bn-IN', label: 'বাংলা (Bengali)', outputName: 'Bengali (বাংলা)' },
  { code: 'pa-IN', label: 'ਪੰਜਾਬੀ (Punjabi)', outputName: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'ml-IN', label: 'മലയാളം (Malayalam)', outputName: 'Malayalam (മലയാളം)' },
];

const OUTPUT_LANGUAGE_OPTIONS = [
  { value: 'auto', label: 'Match My Description Language Automatically' },
  { value: 'English', label: 'English' },
  { value: 'Telugu (తెలుగు)', label: 'తెలుగు (Telugu)' },
  { value: 'Hindi (हिन्दी)', label: 'हिन्दी (Hindi)' },
  { value: 'Tamil (தமிழ்)', label: 'தமிழ் (Tamil)' },
  { value: 'Kannada (ಕನ್ನಡ)', label: 'ಕನ್ನಡ (Kannada)' },
  { value: 'Marathi (मराठी)', label: 'मराठी (Marathi)' },
  { value: 'Gujarati (ગુજરાતી)', label: 'ગુજરાતી (Gujarati)' },
  { value: 'Bengali (বাংলা)', label: 'বাংলা (Bengali)' },
  { value: 'Punjabi (ਪੰਜਾਬੀ)', label: 'ਪੰਜਾਬੀ (Punjabi)' },
];

const MULTILINGUAL_EXAMPLES = [
  {
    lang: 'తెలుగు',
    soilPreset: 'black_cotton' as const,
    text: 'మా పొలంలో నల్ల రేగడి నేల ఉంది, తేమ బాగా నిలుస్తుంది. బోరు మరియు డ్రిప్ నీటి వసతి ఉంది. ఏ పంట వేస్తే ఎక్కువ లాభం వస్తుంది మరియు 1 సంవత్సరం పంట ప్రణాళిక చెప్పండి.',
  },
  {
    lang: 'हिन्दी',
    soilPreset: 'red_loam' as const,
    text: 'हमारे खेत में लाल दोमट मिट्टी है जिसमें पानी जल्दी निकल जाता है और बोरवेल व ड्रिप सिंचाई उपलब्ध है। सबसे ज्यादा मुनाफा देने वाली फसल और 1 साल का रोडमैप बताएं।',
  },
  {
    lang: 'தமிழ்',
    soilPreset: 'red_loam' as const,
    text: 'எங்கள் நிலத்தில் செம்மண் உள்ளது, சொட்டு நீர் பாசனம் வசதி இருக்கிறது. அதிக லாபம் தரும் பயிர்கள் மற்றும் 1 வருட பயிர் திட்டத்தை கூறுங்கள்.',
  },
  {
    lang: 'English',
    soilPreset: 'alluvial_loam' as const,
    text: 'Soft brown river-belt silt loam soil, flat levelled land with assured borewell water. Suggest highest profit crops and a full 12-month crop rotation.',
  },
];

function buildRealisticSoilTextureDataUrl(
  preset: 'black_cotton' | 'red_loam' | 'alluvial_loam'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 460;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const palettes = {
    black_cotton: {
      base: '#2b2826',
      mid: '#3b3633',
      dark: '#191716',
      highlight: '#524b46',
      speck: '#8a8178',
    },
    red_loam: {
      base: '#7c3622',
      mid: '#96432a',
      dark: '#532113',
      highlight: '#b5593b',
      speck: '#cfa07e',
    },
    alluvial_loam: {
      base: '#6f583f',
      mid: '#876c4f',
      dark: '#4c3b29',
      highlight: '#a38665',
      speck: '#cbb698',
    },
  };

  const p = palettes[preset];
  const grad = ctx.createLinearGradient(0, 0, 720, 460);
  grad.addColorStop(0, p.mid);
  grad.addColorStop(0.55, p.base);
  grad.addColorStop(1, p.dark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 720, 460);

  // Deterministic pseudo-random generator for organic soil clods & furrows
  let seed = preset === 'black_cotton' ? 109 : preset === 'red_loam' ? 257 : 419;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // Ploughed furrow shadow bands
  for (let y = 30; y < 460; y += 64) {
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 720; x += 60) {
      ctx.lineTo(x, y + (rand() - 0.5) * 14);
    }
    ctx.lineTo(720, y + 22);
    ctx.lineTo(0, y + 22);
    ctx.closePath();
    ctx.fill();
  }

  // Soil clods & mineral aggregates
  for (let i = 0; i < 620; i++) {
    const x = rand() * 720;
    const y = rand() * 460;
    const r = 3 + rand() * 18;
    ctx.fillStyle = rand() > 0.48 ? p.dark : p.highlight;
    ctx.globalAlpha = 0.25 + rand() * 0.42;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.62 + rand() * 0.4), rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine sand / lime / quartz grains
  for (let i = 0; i < 1100; i++) {
    const x = rand() * 720;
    const y = rand() * 460;
    const r = 0.8 + rand() * 2.1;
    ctx.fillStyle = rand() > 0.2 ? p.speck : '#d8cfc2';
    ctx.globalAlpha = 0.18 + rand() * 0.35;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Characteristic surface cracks on dry Black Cotton vertisol
  if (preset === 'black_cotton') {
    ctx.strokeStyle = '#12100f';
    ctx.lineWidth = 2.2;
    ctx.globalAlpha = 0.55;
    for (let c = 0; c < 14; c++) {
      let cx = rand() * 680 + 20;
      let cy = rand() * 420 + 20;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (let seg = 0; seg < 5; seg++) {
        cx += (rand() - 0.5) * 90;
        cy += (rand() - 0.5) * 75;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
  return canvas.toDataURL('image/jpeg', 0.86);
}

function classifyCanvasSoilTone(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): 'black_cotton' | 'red_loam' | 'alluvial_loam' {
  try {
    const sx = Math.floor(width * 0.2);
    const sy = Math.floor(height * 0.2);
    const sw = Math.max(1, Math.floor(width * 0.6));
    const sh = Math.max(1, Math.floor(height * 0.6));
    const data = ctx.getImageData(sx, sy, sw, sh).data;
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    let count = 0;
    const step = Math.max(4, Math.floor(data.length / 4000) * 4);
    for (let i = 0; i < data.length; i += step) {
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
      count++;
    }
    if (!count) return 'black_cotton';
    const r = rSum / count;
    const g = gSum / count;
    const b = bSum / count;
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    if (r > g * 1.24 && r > b * 1.45 && r > 85) {
      return 'red_loam';
    }
    if (luma > 92 && r > b * 1.15) {
      return 'alluvial_loam';
    }
    return 'black_cotton';
  } catch {
    return 'black_cotton';
  }
}

function compressUploadedImage(
  file: File
): Promise<{ dataUrl: string; toneHint: 'black_cotton' | 'red_loam' | 'alluvial_loam' }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format.'));
      img.onload = () => {
        const maxDim = 1080;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: reader.result as string, toneHint: 'black_cotton' });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const toneHint = classifyCanvasSoilTone(ctx, width, height);
        resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.85), toneHint });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function formatInr(amount: number): string {
  return `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;
}

export const PrecisionFarmingDashboard: React.FC<PrecisionFarmingDashboardProps> = ({
  currentUser: propUser,
}) => {
  const { currentUser: authFirebaseUser, userProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const farmerId = propUser?.id || authFirebaseUser?.uid || 'guest-farmer';
  const farmerName =
    propUser?.name ||
    userProfile?.displayName ||
    authFirebaseUser?.displayName ||
    'AgriVerse Farmer';

  // Soil Photo & Camera State
  const [soilImage, setSoilImage] = useState<string>('');
  const [soilPresetHint, setSoilPresetHint] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Farmer Description (Any Language) + Voice Dictation
  const [farmerDescription, setFarmerDescription] = useState<string>('');
  const [voiceLangCode, setVoiceLangCode] = useState<string>('te-IN');
  const [outputLanguage, setOutputLanguage] = useState<string>('auto');
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Farm Profit Context
  const [landAcresInput, setLandAcresInput] = useState<string>('2');
  const [waterAvailability, setWaterAvailability] = useState<string>('Borewell / Drip Irrigation');
  const [locationInput, setLocationInput] = useState<string>(
    propUser?.location || userProfile?.location || 'Warangal, Telangana'
  );

  // Analysis & Saved Plans State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<SoilCropRoadmapPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<SoilCropRoadmapPlan[]>([]);
  const [profitScaleMode, setProfitScaleMode] = useState<'total_farm' | 'per_acre'>('total_farm');

  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    agronomyService
      .getSoilRoadmaps(farmerId, farmerName)
      .then((res) => {
        if (mounted && Array.isArray(res.plans) && res.plans.length > 0) {
          setSavedPlans(res.plans);
          setActivePlan(res.plans[0]);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
      stopCamera();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [farmerId, farmerName]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const startCamera = async (facing: 'environment' | 'user' = 'environment') => {
    setErrorBanner(null);
    try {
      stopCamera();
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = mediaStream;
      setCameraFacing(facing);
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      }, 60);
    } catch {
      setErrorBanner(
        'Camera permission was declined or unavailable on this device. Please use "Upload Soil Photo" to choose an image from your gallery.'
      );
    }
  };

  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 960;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const toneHint = classifyCanvasSoilTone(ctx, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
    setSoilImage(dataUrl);
    setSoilPresetHint(toneHint);
    stopCamera();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorBanner(null);
    try {
      const { dataUrl, toneHint } = await compressUploadedImage(file);
      setSoilImage(dataUrl);
      setSoilPresetHint(toneHint);
      stopCamera();
    } catch (err: any) {
      setErrorBanner(err?.message || 'Unable to load the selected soil photo.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectSampleSoil = (
    preset: 'black_cotton' | 'red_loam' | 'alluvial_loam'
  ) => {
    setErrorBanner(null);
    stopCamera();
    const generated = buildRealisticSoilTextureDataUrl(preset);
    setSoilImage(generated);
    setSoilPresetHint(preset);
  };

  const toggleVoiceDictation = () => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      showError(
        'Voice dictation is not supported in this browser. You can type directly in any language.',
        'Browser Mic Notice'
      );
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = voiceLangCode;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setFarmerDescription((prev) =>
            prev.trim() ? `${prev.trim()} ${transcript.trim()}` : transcript.trim()
          );
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleAnalyzeSoil = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!soilImage) {
      setErrorBanner('Please upload or capture a clear photo of your field soil before analyzing.');
      return;
    }

    const numericAcres = Math.max(0.25, Math.min(500, parseFloat(landAcresInput) || 1));
    setIsAnalyzing(true);

    try {
      const { plan } = await agronomyService.analyzeSoilRoadmap(farmerId, farmerName, {
        soilImageBase64: soilImage,
        farmerDescription: farmerDescription.trim(),
        landAcres: numericAcres,
        waterAvailability,
        location: locationInput.trim() || 'Warangal, Telangana',
        outputLanguage,
        soilPresetHint,
      });

      setActivePlan(plan);
      setSavedPlans((prev) => [plan, ...prev.filter((item) => item.id !== plan.id)]);
      showSuccess(
        `Identified ${plan.soilProfile.soilType} and generated your 1-Year Crop Profit Roadmap.`,
        'Soil Roadmap Ready'
      );

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch (err: any) {
      const apiErr = err as ApiErrorWithMeta;
      setErrorBanner(
        apiErr?.message ||
          'Could not complete soil analysis right now. Please check your soil photo and try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const displayAcres = Math.max(
    0.25,
    parseFloat(landAcresInput) || activePlan?.landAcres || 1
  );
  const scaleMultiplier = profitScaleMode === 'total_farm' ? displayAcres : 1;

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-left pb-12" id="soil-roadmap-precision-page">
      {/* Page Header */}
      <header className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium text-emerald-800">
            Precision Farming · Visual Soil Intelligence &amp; Annual Crop Planning
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Soil-to-Profit Advisor &amp; 1-Year Crop Roadmap
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Upload a daylight photo of your farm soil and describe your field in any language.
            We inspect your soil structure, identify the highest-profit crops for your land, and
            map out a complete 12-month crop rotation.
          </p>
        </div>

        {savedPlans.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="saved-soil-plans-select" className="text-xs text-slate-500">
              Saved Plans:
            </label>
            <select
              id="saved-soil-plans-select"
              value={activePlan?.id || ''}
              onChange={(e) => {
                const chosen = savedPlans.find((p) => p.id === e.target.value);
                if (chosen) {
                  setActivePlan(chosen);
                  setLandAcresInput(String(chosen.landAcres));
                }
              }}
              className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-emerald-700"
            >
              {savedPlans.map((p, idx) => (
                <option key={p.id} value={p.id}>
                  {idx + 1}. {p.soilProfile.soilType} ({p.landAcres} Ac)
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* Step 1: Soil Upload + Multilingual Input Studio */}
      <form
        onSubmit={handleAnalyzeSoil}
        className="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-2xs space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Soil Photo Upload / Camera */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                01. Upload Your Soil Photo
              </h2>
              <span className="text-xs text-slate-500">Required · Natural daylight</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="soil-photo-file-input"
            />

            {isCameraOpen ? (
              <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <div className="p-3 bg-slate-900 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      startCamera(cameraFacing === 'environment' ? 'user' : 'environment')
                    }
                    className="px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Flip</span>
                  </button>
                  <button
                    type="button"
                    onClick={captureFromCamera}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Soil</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : soilImage ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={soilImage}
                    alt="Selected farm soil"
                    className="w-full h-60 object-cover"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white/95 hover:bg-white text-slate-900 text-xs font-medium rounded-lg shadow-xs cursor-pointer"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSoilImage('');
                        setSoilPresetHint('');
                      }}
                      aria-label="Remove soil photo"
                      className="p-1.5 bg-slate-900/85 hover:bg-slate-900 text-white rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Soil photo attached · Ready for visual texture, color, and moisture-retention inspection.
                </p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-60 rounded-xl border border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50/70 hover:bg-emerald-50/30 transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer"
              >
                <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-700 mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  Click to upload a photo of your soil
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Hold phone 1–2 feet above freshly turned topsoil in daylight (JPG, PNG, WEBP)
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Upload Soil Photo</span>
              </button>
              <button
                type="button"
                onClick={() => startCamera('environment')}
                className="py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Use Camera</span>
              </button>
            </div>

            {/* Quick Soil Reference Samples for Desktop Testing */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-xs text-slate-500">
                Or test instantly with a sample Indian field soil photo:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectSampleSoil('black_cotton')}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-medium text-left transition-colors cursor-pointer ${
                    soilPresetHint === 'black_cotton'
                      ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Black Regur
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSampleSoil('red_loam')}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-medium text-left transition-colors cursor-pointer ${
                    soilPresetHint === 'red_loam'
                      ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Red Loam
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSampleSoil('alluvial_loam')}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-medium text-left transition-colors cursor-pointer ${
                    soilPresetHint === 'alluvial_loam'
                      ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Alluvial Silt
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Describe in Any Language + Farm Profit Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">
                  02. Describe Your Soil &amp; Field in Any Language
                </h2>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Voice dictation language"
                    value={voiceLangCode}
                    onChange={(e) => setVoiceLangCode(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-emerald-700"
                  >
                    {VOICE_LANGUAGES.map((vl) => (
                      <option key={vl.code} value={vl.code}>
                        {vl.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={toggleVoiceDictation}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isListening
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Stop Mic</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>Speak</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                rows={4}
                value={farmerDescription}
                onChange={(e) => setFarmerDescription(e.target.value)}
                placeholder="Write or speak in Telugu, Hindi, Tamil, Kannada, Marathi, English, or any language... (e.g. 'మా పొలంలో నల్ల రేగడి నేల ఉంది, బోరు నీరు ఉంది' / 'हमारे खेत में काली मिट्टी है' / 'Sticky black soil, holds water after rain, last crop was paddy')"
                className="w-full p-3.5 text-sm text-slate-900 bg-slate-50/60 border border-slate-300 rounded-xl focus:bg-white focus:outline-emerald-700 leading-relaxed"
              />

              {/* Quick Multilingual Prompt Starters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500">Try in your language:</span>
                {MULTILINGUAL_EXAMPLES.map((ex) => (
                  <button
                    key={ex.lang}
                    type="button"
                    onClick={() => {
                      setFarmerDescription(ex.text);
                      if (!soilImage) {
                        handleSelectSampleSoil(ex.soilPreset);
                      }
                    }}
                    className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                  >
                    {ex.lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Farm Size, Water & Output Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Land Area (Acres) — Scales Profit Math
                </label>
                <input
                  type="number"
                  min="0.25"
                  max="500"
                  step="0.25"
                  value={landAcresInput}
                  onChange={(e) => setLandAcresInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Water &amp; Irrigation Source
                </label>
                <select
                  value={waterAvailability}
                  onChange={(e) => setWaterAvailability(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-700"
                >
                  <option value="Borewell / Drip Irrigation">Borewell / Drip Irrigation</option>
                  <option value="Canal / Abundant Water">Canal / Assured Abundant Water</option>
                  <option value="Rainfed / Monsoon Only">Rainfed / Monsoon Dependent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Village / District &amp; State
                </label>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g., Warangal, Telangana"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-slate-500" />
                  <span>Report Language</span>
                </label>
                <select
                  value={outputLanguage}
                  onChange={(e) => setOutputLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-700"
                >
                  {OUTPUT_LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {errorBanner && (
              <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorBanner}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAnalyzing}
              id="analyze-soil-roadmap-btn"
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Inspecting Soil Texture &amp; Building 1-Year Profit Roadmap...</span>
                </>
              ) : (
                <span>Analyze Soil &amp; Generate 1-Year Crop Roadmap</span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Results Section */}
      {activePlan && (
        <div ref={resultsRef} className="space-y-10">
          {/* Section A: Visual Soil Diagnosis */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <p className="text-xs text-slate-500">
                  Visual Soil Report · {activePlan.location} · Language: {activePlan.detectedLanguage}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {activePlan.soilProfile.soilType}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-2 self-start cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print 1-Year Plan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {activePlan.soilImagePreview && (
                <div className="lg:col-span-4 space-y-2">
                  <img
                    src={activePlan.soilImagePreview}
                    alt={activePlan.soilProfile.soilType}
                    className="w-full h-52 object-cover rounded-xl border border-slate-200"
                  />
                  {activePlan.farmerDescription && (
                    <p className="text-xs text-slate-500 italic leading-relaxed">
                      &ldquo;{activePlan.farmerDescription}&rdquo;
                    </p>
                  )}
                </div>
              )}

              <div
                className={`${
                  activePlan.soilImagePreview ? 'lg:col-span-8' : 'lg:col-span-12'
                } space-y-5`}
              >
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                  {activePlan.farmerSummaryNote}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 block">Color &amp; Crumb Texture</span>
                    <p className="font-medium text-slate-900 leading-relaxed">
                      {activePlan.soilProfile.colorAndTexture}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 block">Drainage &amp; Water Retention</span>
                    <p className="font-medium text-slate-900 leading-relaxed">
                      {activePlan.soilProfile.estimatedDrainage}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 block">Estimated pH &amp; Fertility</span>
                    <p className="font-medium text-slate-900 leading-relaxed">
                      {activePlan.soilProfile.estimatedPhCategory} ·{' '}
                      {activePlan.soilProfile.fertilityAndOrganicMatter}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h3 className="text-xs font-semibold text-slate-900">
                    Recommended Soil Preparation Before Sowing
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                    {activePlan.soilProfile.soilPreparationTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section B: Best Profitable Crops for This Soil */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <p className="text-xs text-slate-500">
                  Ranked by Soil Suitability &amp; Net Mandi Margin
                </p>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                  <span>Best Profitable Crops for Your Soil</span>
                </h2>
              </div>

              {/* Interactive Acreage Profit Toggle */}
              <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
                <button
                  type="button"
                  onClick={() => setProfitScaleMode('total_farm')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    profitScaleMode === 'total_farm'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Total Farm ({displayAcres} {displayAcres === 1 ? 'Acre' : 'Acres'})
                </button>
                <button
                  type="button"
                  onClick={() => setProfitScaleMode('per_acre')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    profitScaleMode === 'per_acre'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Per 1 Acre
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="py-3 pr-4 font-medium">Rank &amp; Crop</th>
                    <th className="py-3 px-4 font-medium">Duration &amp; Yield / Ac</th>
                    <th className="py-3 px-4 font-medium">Mandi Rate</th>
                    <th className="py-3 px-4 font-medium text-right">Est. Cost</th>
                    <th className="py-3 px-4 font-medium text-right">Gross Return</th>
                    <th className="py-3 pl-4 font-medium text-right">Est. Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activePlan.bestProfitCrops.map((crop) => (
                    <tr key={crop.rank} className="align-top">
                      <td className="py-4 pr-4 max-w-xs">
                        <div className="font-semibold text-slate-900">
                          0{crop.rank}. {crop.cropName}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {crop.suitabilityReason}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Risk: {crop.riskLevel} · Best Mandi Window: {crop.bestSellingWindow}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-700 whitespace-nowrap tabular-nums">
                        <div className="font-medium text-slate-900">{crop.durationDays} Days</div>
                        <div className="text-slate-500 mt-0.5">{crop.estimatedYieldPerAcre}</div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-700 whitespace-nowrap tabular-nums">
                        {crop.marketRateRange}
                      </td>
                      <td className="py-4 px-4 text-right text-xs text-slate-700 whitespace-nowrap tabular-nums">
                        {formatInr(crop.estimatedCostPerAcreInr * scaleMultiplier)}
                      </td>
                      <td className="py-4 px-4 text-right text-xs text-slate-800 font-medium whitespace-nowrap tabular-nums">
                        {formatInr(crop.estimatedGrossRevenuePerAcreInr * scaleMultiplier)}
                      </td>
                      <td className="py-4 pl-4 text-right whitespace-nowrap tabular-nums">
                        <span className="text-sm font-bold text-emerald-700">
                          {formatInr(crop.estimatedNetProfitPerAcreInr * scaleMultiplier)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section C: Complete 1-Year (12-Month) Crop Rotation Roadmap */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-8">
            <div className="space-y-4 border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <p className="text-xs text-slate-500">
                  12-Month Multi-Season Rotation · Soil Fertility Preserved
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-700" />
                  <span>{activePlan.oneYearRoadmap.roadmapTitle}</span>
                </h2>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
                {activePlan.oneYearRoadmap.rotationStrategySummary}
              </p>

              {/* Annual Financial Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 block">
                    1-Year Total Input Cost (
                    {profitScaleMode === 'total_farm' ? `${displayAcres} Ac` : '1 Ac'})
                  </span>
                  <span className="text-lg font-bold text-slate-900 tabular-nums mt-1 block">
                    {formatInr(
                      activePlan.oneYearRoadmap.annualEstimatedCostPerAcreInr * scaleMultiplier
                    )}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 block">
                    1-Year Gross Harvest Value (
                    {profitScaleMode === 'total_farm' ? `${displayAcres} Ac` : '1 Ac'})
                  </span>
                  <span className="text-lg font-bold text-slate-900 tabular-nums mt-1 block">
                    {formatInr(
                      activePlan.oneYearRoadmap.annualEstimatedGrossPerAcreInr * scaleMultiplier
                    )}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-emerald-950 text-white">
                  <span className="text-xs text-emerald-200 block">
                    Projected 1-Year Net Profit (
                    {profitScaleMode === 'total_farm' ? `${displayAcres} Ac` : '1 Ac'})
                  </span>
                  <span className="text-xl font-bold text-emerald-300 tabular-nums mt-1 block">
                    {formatInr(
                      activePlan.oneYearRoadmap.annualEstimatedNetProfitPerAcreInr * scaleMultiplier
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Seasonal Rotation Phases */}
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-slate-900">
                Season-by-Season Execution Plan
              </h3>

              <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
                {activePlan.oneYearRoadmap.phases.map((phase) => (
                  <div key={phase.phaseNumber} className="py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 space-y-2">
                      <p className="text-xs font-medium text-emerald-800">{phase.seasonName}</p>
                      <h4 className="text-lg font-bold text-slate-900">
                        0{phase.phaseNumber}. {phase.recommendedCrop}
                      </h4>
                      <p className="text-xs text-slate-500">{phase.roleInRotation}</p>

                      <div className="pt-2 space-y-1 text-xs tabular-nums">
                        <div className="flex justify-between text-slate-600">
                          <span>Est. Input Cost:</span>
                          <span>{formatInr(phase.expectedCostPerAcreInr * scaleMultiplier)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Est. Gross Return:</span>
                          <span>
                            {formatInr(phase.expectedRevenuePerAcreInr * scaleMultiplier)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t border-slate-100">
                          <span>Season Net Profit:</span>
                          <span>
                            {formatInr(phase.expectedNetProfitPerAcreInr * scaleMultiplier)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-8 space-y-3">
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                        {phase.keyActivities.map((act, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="font-mono text-xs text-slate-400 tabular-nums mt-0.5">
                              {phase.phaseNumber}.{i + 1}
                            </span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <strong className="text-slate-800">Soil &amp; Nutrient Care:</strong>{' '}
                        {phase.fertilizerAndSoilCare}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 12-Month Calendar Schedule */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  12-Month Field Operations &amp; Cashflow Calendar
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="py-2.5 pr-4 font-medium">Month</th>
                      <th className="py-2.5 px-4 font-medium">Active Crop</th>
                      <th className="py-2.5 px-4 font-medium">Key Field Operation</th>
                      <th className="py-2.5 pl-4 font-medium">Cashflow Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activePlan.oneYearRoadmap.monthlyCalendar.map((m, idx) => (
                      <tr key={idx}>
                        <td className="py-3 pr-4 font-semibold text-slate-900 whitespace-nowrap tabular-nums">
                          {m.monthLabel}
                        </td>
                        <td className="py-3 px-4 font-medium text-emerald-800 whitespace-nowrap">
                          {m.cropActive}
                        </td>
                        <td className="py-3 px-4 text-slate-700 leading-relaxed">
                          {m.primaryTask}
                        </td>
                        <td className="py-3 pl-4 text-xs text-slate-500 whitespace-nowrap">
                          {m.cashflowNote}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
