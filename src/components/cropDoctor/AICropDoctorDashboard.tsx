import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
  Leaf,
  FlaskConical,
  Compass,
  Clock,
  Plus,
  ArrowRight,
  Globe,
  FileWarning,
  Stethoscope,
  History,
  Check,
  RefreshCw,
  Info,
  Eye,
  ShieldAlert,
  ChevronRight,
  Smartphone,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Language, UserProfile } from '../../types';
import {
  agronomyService,
  CropScanRecord,
  FarmZoneData,
  TreatmentRecordItem,
} from '../../services/agronomyService';
import { AGRONOMY_LABELS } from '../../i18n/agronomyTranslations';
import {
  getPesticideVisual,
  getNutrientVisual,
  buildMobileScreenSpoofSampleDataUrl,
} from '../../utils/pesticideImages';

interface AICropDoctorDashboardProps {
  currentUser: UserProfile;
  preselectedZoneId?: string | null;
  onNavigateToPrecision?: (zoneId?: string | null) => void;
}

const CROP_OPTIONS = [
  '',
  'Cotton',
  'Red Chilli',
  'Rice (Paddy)',
  'Tomato',
  'Potato',
  'Turmeric',
  'Onion',
  'Maize',
  'Wheat',
  'Brinjal',
  'Okra',
  'Cabbage',
  'Groundnut',
  'Bengal Gram (Chana)',
];

const PLANT_PARTS: Array<{
  id: 'leaf' | 'stem' | 'flower' | 'fruit' | 'whole_plant';
  labelEn: string;
  labelTe: string;
  labelHi: string;
}> = [
  { id: 'leaf', labelEn: 'Leaf (ఆకు / पत्ती)', labelTe: 'ఆకు (Leaf)', labelHi: 'पत्ती (Leaf)' },
  { id: 'stem', labelEn: 'Stem (కాండం / तना)', labelTe: 'కాండం (Stem)', labelHi: 'तना (Stem)' },
  { id: 'flower', labelEn: 'Flower / Square', labelTe: 'పూత / మొగ్గ', labelHi: 'फूल / कली' },
  { id: 'fruit', labelEn: 'Fruit / Boll / Pod', labelTe: 'కాయ / పండు', labelHi: 'फल / टिंडा / फली' },
  {
    id: 'whole_plant',
    labelEn: 'Entire Plant',
    labelTe: 'మొత్తం మొక్క',
    labelHi: 'पूरा पौधा',
  },
];

const COMMON_SYMPTOM_CHIPS = [
  'Yellowing / Pale Leaves',
  'Brown or Black Leaf Spots',
  'Leaf Curl / Whitefly / Thrips',
  'Holes / Caterpillar / Borer',
  'White Powdery Coating',
  'Flower or Fruit Drop',
  'Wilting / Root or Stem Rot',
];

export const AICropDoctorDashboard: React.FC<AICropDoctorDashboardProps> = ({
  currentUser,
  preselectedZoneId = null,
  onNavigateToPrecision,
}) => {
  const { language, setLanguage } = useLanguage();
  const { showSuccess, showError, showInfo } = useToast();
  const L = AGRONOMY_LABELS[language] || AGRONOMY_LABELS.en;

  const [subTab, setSubTab] = useState<'scan' | 'history'>('scan');

  // Zones for associating scan with farm section
  const [zones, setZones] = useState<FarmZoneData[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(preselectedZoneId || '');
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [plantPart, setPlantPart] = useState<'leaf' | 'stem' | 'flower' | 'fruit' | 'whole_plant'>('leaf');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const toggleSymptomChip = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((item) => item !== symptom) : [...prev, symptom]
    );
  };

  // Image & Camera capture state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Analysis & Interactive Q&A state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [mobileScreenError, setMobileScreenError] = useState<{
    message: string;
    evidence?: string;
  } | null>(null);
  const [brokenImgIds, setBrokenImgIds] = useState<Record<string, boolean>>({});
  const [activeScan, setActiveScan] = useState<CropScanRecord | null>(null);
  const [qaAnswers, setQaAnswers] = useState<Record<string, string>>({});
  const [isRefining, setIsRefining] = useState<boolean>(false);

  // Saved Scans & Recovery Tracking state
  const [scanHistory, setScanHistory] = useState<CropScanRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [selectedRecoveryScanId, setSelectedRecoveryScanId] = useState<string | null>(null);

  // Record Treatment Form state
  const [actionType, setActionType] = useState<TreatmentRecordItem['actionType']>('cultural_inspection');
  const [actionTaken, setActionTaken] = useState<string>('');
  const [productUsed, setProductUsed] = useState<string>('');
  const [dosageApplied, setDosageApplied] = useState<string>('');
  const [areaTreated, setAreaTreated] = useState<string>('');
  const [treatmentNotes, setTreatmentNotes] = useState<string>('');
  const [isSavingTreatment, setIsSavingTreatment] = useState<boolean>(false);

  // Follow-up Photo Comparison state
  const [followUpImage, setFollowUpImage] = useState<string | null>(null);
  const [followUpNotes, setFollowUpNotes] = useState<string>('');
  const [isComparingRecovery, setIsComparingRecovery] = useState<boolean>(false);
  const followUpInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (preselectedZoneId) {
      setSelectedZoneId(preselectedZoneId);
    }
  }, [preselectedZoneId]);

  // Load farmer's zones & scan history
  const fetchZonesAndHistory = async () => {
    if (!currentUser?.id) return;
    setIsLoadingHistory(true);
    try {
      const [overviewRes, scansRes] = await Promise.allSettled([
        agronomyService.getPrecisionOverview(currentUser.id, currentUser.name),
        agronomyService.getScans(currentUser.id, currentUser.name),
      ]);

      if (overviewRes.status === 'fulfilled') {
        setZones(overviewRes.value.zones || []);
        if (preselectedZoneId) {
          const matchedZone = overviewRes.value.zones?.find((z) => z.id === preselectedZoneId);
          if (matchedZone && !selectedCrop) {
            setSelectedCrop(matchedZone.crop);
          }
        }
      }

      if (scansRes.status === 'fulfilled') {
        const list = scansRes.value.scans || [];
        setScanHistory(list);
        if (!selectedRecoveryScanId && list.length > 0) {
          setSelectedRecoveryScanId(list[0].id);
        }
      }
    } catch (err) {
      console.warn('Agronomy initial fetch notice:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchZonesAndHistory();
    return () => {
      stopCamera();
    };
  }, [currentUser?.id]);

  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    stopCamera();
    setIsCameraOpen(true);

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      setIsCameraOpen(false);
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera access was declined. Please allow browser camera permission or use "Upload from Gallery".'
          : 'No active camera stream detected on this device. Please use "Upload from Gallery" to select a photo.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const captureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    let w = video.videoWidth || 800;
    let h = video.videoHeight || 600;
    const maxDim = 1024;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImagePreview(dataUrl);
    setAnalysisError(null);
    stopCamera();
  };

  const compressAndReadFile = (
    file: File,
    onLoaded: (dataUrl: string) => void,
    onErr: (msg: string) => void
  ) => {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type.toLowerCase())) {
      onErr('Unsupported image format. Please select a JPEG, PNG, or WebP photograph.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onErr('Image exceeds 10 MB limit. Please select a smaller photograph.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        const maxDim = 1024;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          onLoaded(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        onLoaded(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => onErr('Could not decode selected image file.');
      img.src = reader.result as string;
    };
    reader.onerror = () => onErr('Failed to read image file.');
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    compressAndReadFile(
      file,
      (dataUrl) => {
        setImagePreview(dataUrl);
        setAnalysisError(null);
        setMobileScreenError(null);
      },
      (msg) => {
        setAnalysisError(msg);
        showError(msg, 'Invalid Image');
      }
    );
    e.target.value = '';
  };

  const handleLoadRealSamplePhoto = async () => {
    stopCamera();
    setAnalysisError(null);
    setMobileScreenError(null);
    try {
      const resp = await fetch(
        'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80'
      );
      const blob = await resp.blob();
      const file = new File([blob], 'plant_leaf_sample.jpg', { type: blob.type || 'image/jpeg' });
      compressAndReadFile(
        file,
        (dataUrl) => {
          setImagePreview(dataUrl);
          if (!selectedCrop) setSelectedCrop('Tomato');
          if (selectedSymptoms.length === 0) {
            setSelectedSymptoms(['Brown or Black Leaf Spots', 'Yellowing / Pale Leaves']);
          }
        },
        (msg) => setAnalysisError(msg)
      );
    } catch {
      setAnalysisError('Unable to load sample leaf image. Please upload a crop photo from gallery.');
    }
  };

  const handleLoadMobileSpoofSample = () => {
    stopCamera();
    setAnalysisError(null);
    setMobileScreenError(null);
    const spoofUrl = buildMobileScreenSpoofSampleDataUrl();
    if (spoofUrl) {
      setImagePreview(spoofUrl);
      showInfo(
        'Loaded simulated mobile-screen photo. Click "Scan My Crop" to verify mobile-screen error detection.',
        'Mobile Screen Test Ready'
      );
    }
  };

  const handleSubmitCropScan = async () => {
    if (!imagePreview) {
      setAnalysisError('Please capture a camera photograph or upload an image from your gallery first.');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    setMobileScreenError(null);

    try {
      const { scan } = await agronomyService.analyzeCropImage(currentUser.id, currentUser.name, {
        imageBase64: imagePreview,
        selectedCrop: selectedCrop || undefined,
        plantPart,
        zoneId: selectedZoneId || null,
        reportedSymptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
        language,
      });

      setActiveScan(scan);
      const initAnswers: Record<string, string> = {};
      (scan.followUpQuestions || []).forEach((q) => {
        initAnswers[q.id] = q.answer || '';
      });
      setQaAnswers(initAnswers);

      setScanHistory((prev) => [scan, ...prev.filter((s) => s.id !== scan.id)]);
      setSelectedRecoveryScanId(scan.id);
      showSuccess('Crop photograph analyzed: neat treatment plan & verified pesticide guide ready.', 'Scan Complete');
    } catch (err: any) {
      const msg = err?.message || 'Unable to analyze crop photograph. Please try again.';
      const isScreenErr =
        Boolean(err?.isMobileScreenError) ||
        err?.errorCode === 'MOBILE_SCREEN_DETECTED' ||
        msg.toLowerCase().includes('mobile screen');

      if (isScreenErr) {
        setActiveScan(null);
        setMobileScreenError({
          message: msg,
          evidence: err?.evidence,
        });
        showError(msg, 'Mobile Screen Scan Blocked');
      } else {
        setAnalysisError(msg);
        showError(msg, 'Scan Failed');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefineDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScan) return;

    const formattedAnswers = (activeScan.followUpQuestions || []).map((q) => ({
      id: q.id,
      question: q.question,
      answer: (qaAnswers[q.id] || '').trim(),
    }));

    if (!formattedAnswers.some((a) => a.answer.length > 0) && selectedSymptoms.length === 0) {
      showInfo('Please fill in at least one follow-up answer or select visible symptoms before refining.', 'Answer Needed');
      return;
    }

    setIsRefining(true);
    try {
      const { scan } = await agronomyService.refineDiagnosis(
        currentUser.id,
        currentUser.name,
        activeScan.id,
        {
          answers: formattedAnswers,
          selectedCrop: selectedCrop || activeScan.identifiedCrop,
          reportedSymptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
          language,
        }
      );
      setActiveScan(scan);
      setScanHistory((prev) => prev.map((s) => (s.id === scan.id ? scan : s)));
      showSuccess('Defects, required chemicals & healthy recovery plan refined with your field observations.', 'Diagnosis Refined');
    } catch (err: any) {
      showError(err?.message || 'Could not refine diagnosis.', 'Refinement Error');
    } finally {
      setIsRefining(false);
    }
  };

  const selectedRecoveryScan =
    scanHistory.find((s) => s.id === selectedRecoveryScanId) || activeScan || null;

  const handleRecordTreatmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecoveryScan) return;
    if (!actionTaken.trim()) {
      showInfo('Please enter the action or inspection step you performed.', 'Missing Action');
      return;
    }

    setIsSavingTreatment(true);
    try {
      const { treatment } = await agronomyService.recordTreatment(
        currentUser.id,
        currentUser.name,
        selectedRecoveryScan.id,
        {
          actionType,
          actionTaken: actionTaken.trim(),
          productUsed: productUsed.trim(),
          dosageApplied: dosageApplied.trim(),
          areaTreated: areaTreated.trim(),
          notes: treatmentNotes.trim(),
        }
      );

      setScanHistory((prev) =>
        prev.map((s) =>
          s.id === selectedRecoveryScan.id
            ? {
                ...s,
                recoveryStatus:
                  s.recoveryStatus === 'Initial Assessment' ? 'Monitoring' : s.recoveryStatus,
                treatments: [treatment, ...(s.treatments || [])],
              }
            : s
        )
      );
      if (activeScan?.id === selectedRecoveryScan.id) {
        setActiveScan((prev) =>
          prev
            ? {
                ...prev,
                recoveryStatus:
                  prev.recoveryStatus === 'Initial Assessment' ? 'Monitoring' : prev.recoveryStatus,
                treatments: [treatment, ...(prev.treatments || [])],
              }
            : prev
        );
      }

      setActionTaken('');
      setProductUsed('');
      setDosageApplied('');
      setAreaTreated('');
      setTreatmentNotes('');
      showSuccess('Field action recorded in your crop recovery timeline.', 'Action Saved');
    } catch (err: any) {
      showError(err?.message || 'Unable to save treatment action.', 'Error');
    } finally {
      setIsSavingTreatment(false);
    }
  };

  const handleFollowUpFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressAndReadFile(
      file,
      (dataUrl) => setFollowUpImage(dataUrl),
      (msg) => showError(msg, 'Invalid Follow-Up Image')
    );
    e.target.value = '';
  };

  const handleCompareRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecoveryScan || !followUpImage) {
      showInfo('Please upload a follow-up crop photograph first.', 'Follow-Up Photo Needed');
      return;
    }

    setIsComparingRecovery(true);
    try {
      const { scan } = await agronomyService.compareRecovery(
        currentUser.id,
        currentUser.name,
        selectedRecoveryScan.id,
        {
          followUpImageBase64: followUpImage,
          farmerNotes: followUpNotes.trim(),
          language,
        }
      );

      setScanHistory((prev) =>
        prev.map((s) =>
          s.id === scan.id ? { ...scan, treatments: s.treatments || [] } : s
        )
      );
      if (activeScan?.id === scan.id) {
        setActiveScan((prev) =>
          prev ? { ...scan, treatments: prev.treatments || [] } : scan
        );
      }
      setFollowUpImage(null);
      setFollowUpNotes('');
      showSuccess('Follow-up photograph compared against baseline scan.', 'Recovery Updated');
    } catch (err: any) {
      showError(err?.message || 'Unable to run follow-up photo comparison.', 'Comparison Failed');
    } finally {
      setIsComparingRecovery(false);
    }
  };

  const getConditionStyle = (cond: CropScanRecord['overallCondition']) => {
    switch (cond) {
      case 'Healthy Appearance':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300';
      case 'Mild Stress / Watch Needed':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'Unhealthy / Possible Issue':
        return 'bg-rose-50 text-rose-900 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getRecoveryBadge = (status: string) => {
    if (status === 'Appears Improving') {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    if (status === 'Appears Worsening') {
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    if (status === 'Monitoring') {
      return 'bg-blue-50 text-blue-900 border-blue-200';
    }
    return 'bg-amber-50 text-amber-900 border-amber-300';
  };

  return (
    <div className="space-y-6 text-left" id="ai-crop-doctor-module">
      {/* Top Hero Banner with Multilingual Assistant Switcher */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 border border-emerald-700/50 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-semibold">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>ICAR &amp; CIB&amp;RC Safety-Aligned Plant Health Diagnostics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-white">
              {L.cropDoctorTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {L.cropDoctorSubtitle}
            </p>
          </div>

          {/* Multilingual Selector + Quick Tab Switch */}
          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-300 ml-1.5 mr-1" />
              {(
                [
                  { code: 'en', label: 'English' },
                  { code: 'te', label: 'తెలుగు' },
                  { code: 'hi', label: 'हिंदी' },
                ] as Array<{ code: Language; label: string }>
              ).map((langOpt) => (
                <button
                  key={langOpt.code}
                  type="button"
                  onClick={() => setLanguage(langOpt.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === langOpt.code
                      ? 'bg-emerald-500 text-slate-950 shadow-2xs'
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {langOpt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSubTab('scan')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  subTab === 'scan'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>{L.newScanTab}</span>
              </button>
              <button
                type="button"
                onClick={() => setSubTab('history')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  subTab === 'history'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {L.recoveryHistoryTab} ({scanHistory.length})
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SUB-TAB 1: SCAN MY CROP & INTERACTIVE DIAGNOSIS                      */}
      {/* ==================================================================== */}
      {subTab === 'scan' && (
        <div className="space-y-6">
          {/* Capture & Metadata Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 cols: Camera / Image Upload Dropzone */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>1. Capture or Upload Plant Photograph</span>
                  </h2>
                  <span className="text-[11px] font-mono text-slate-500">
                    JPEG / PNG / WebP • Max 10 MB
                  </span>
                </div>

                {/* Live Camera Stream */}
                {isCameraOpen && (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500 aspect-video flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 bg-slate-950/80 backdrop-blur-xs p-2.5 rounded-xl border border-white/15">
                      <button
                        type="button"
                        onClick={() => {
                          const next = cameraFacing === 'environment' ? 'user' : 'environment';
                          setCameraFacing(next);
                          startCamera(next);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Flip Lens</span>
                      </button>

                      <button
                        type="button"
                        onClick={captureFromVideo}
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Capture Frame</span>
                      </button>

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Preview */}
                {!isCameraOpen && imagePreview && (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 max-h-80 flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="Selected crop specimen"
                        className="max-h-80 w-auto object-contain"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/85 text-emerald-300 font-mono text-[11px] font-semibold border border-white/15">
                        Ready for Inspection • {plantPart.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer flex items-center gap-1.5 border border-slate-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                        <span>{L.retakePhotoBtn}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer flex items-center gap-1.5 border border-slate-200"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-600" />
                        <span>{L.uploadAnotherBtn}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty Capture Prompt */}
                {!isCameraOpen && !imagePreview && (
                  <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-6 sm:p-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-sm">
                      <Leaf className="w-7 h-7" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <p className="text-sm font-bold text-slate-900">
                        Hold camera 15–30 cm from the affected leaf, stem, flower, or fruit in clear daylight
                      </p>
                      <p className="text-xs text-slate-600">
                        Include both healthy margin and visible spots so symptom boundaries are clearly visible.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4 text-emerald-400" />
                        <span>{L.takePhotoBtn}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs border border-slate-300 shadow-2xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4 text-emerald-700" />
                        <span>{L.uploadGalleryBtn}</span>
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />

                {/* Quick Verification Presets: Real Field Sample vs Mobile Screen Spoof Test */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    Live Field Photo Required (Scanning off another mobile/laptop screen throws an error)
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLoadRealSamplePhoto}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                    >
                      Try Real Crop Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadMobileSpoofSample}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-[11px] font-semibold cursor-pointer flex items-center gap-1 whitespace-nowrap"
                    >
                      <Smartphone className="w-3 h-3 text-rose-700" />
                      <span>Test Mobile Screen Scan</span>
                    </button>
                  </div>
                </div>

                {cameraError && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>

              {/* Right 5 cols: Plant Part, Crop Selector, Farm Zone, & Prominent "Scan My Crop" CTA */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/90">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Field Context &amp; Zone Assignment
                  </h3>

                  {/* Plant Part Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      {L.plantPartLabel}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {PLANT_PARTS.map((part) => (
                        <button
                          key={part.id}
                          type="button"
                          onClick={() => setPlantPart(part.id)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                            plantPart === part.id
                              ? 'bg-emerald-700 border-emerald-700 text-white shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {language === 'te'
                            ? part.labelTe
                            : language === 'hi'
                            ? part.labelHi
                            : part.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Crop Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      {L.cropTypeOptionalLabel}
                    </label>
                    <select
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-emerald-600"
                    >
                      <option value="">Auto-Identify Crop from Photograph</option>
                      {CROP_OPTIONS.filter(Boolean).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Farm Zone Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        {L.farmZoneSelectLabel}
                      </label>
                      {onNavigateToPrecision && (
                        <button
                          type="button"
                          onClick={() => onNavigateToPrecision(selectedZoneId || null)}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                        >
                          Manage Zones →
                        </button>
                      )}
                    </div>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => {
                        const zId = e.target.value;
                        setSelectedZoneId(zId);
                        const found = zones.find((z) => z.id === zId);
                        if (found && !selectedCrop) {
                          setSelectedCrop(found.crop);
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-emerald-600"
                    >
                      <option value="">General Farm Plot (No specific zone)</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.zoneCode}: {z.name} ({z.crop} • {z.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Optional Visible Defect Tags */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Visible Defects in Field (Optional — Helps Match Exact Remedy)
                      </label>
                      {selectedSymptoms.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedSymptoms([])}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Clear ({selectedSymptoms.length})
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_SYMPTOM_CHIPS.map((sym) => {
                        const active = selectedSymptoms.includes(sym);
                        return (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => toggleSymptomChip(sym)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                              active
                                ? 'bg-emerald-700 border-emerald-700 text-white shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {sym}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Error & Prominent Scan My Crop Button */}
                <div className="space-y-3 pt-2">
                  {analysisError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{analysisError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    id="scan-my-crop-submit-btn"
                    disabled={isAnalyzing || !imagePreview}
                    onClick={handleSubmitCropScan}
                    className={`w-full py-3.5 px-5 rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                      isAnalyzing || !imagePreview
                        ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 active:scale-99 text-white cursor-pointer'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{L.analyzingCropMsg}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{L.scanMyCropBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* DEDICATED MOBILE / DIGITAL SCREEN SPOOF ERROR BANNER             */}
          {/* ================================================================ */}
          {mobileScreenError && (
            <div
              className="rounded-2xl bg-rose-50 border border-rose-300 p-5 sm:p-6 text-rose-950 space-y-4 shadow-xs"
              role="alert"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-rose-700">
                      Error · Mobile / Digital Screen Scan Blocked
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold font-heading text-rose-950">
                      Cannot Scan a Picture Displayed on Another Mobile or Screen
                    </h3>
                    <p className="text-xs sm:text-sm text-rose-900 leading-relaxed max-w-3xl">
                      {mobileScreenError.message}
                    </p>
                  </div>
                </div>
              </div>

              {mobileScreenError.evidence && (
                <div className="p-3.5 rounded-xl bg-white border border-rose-200 text-xs text-slate-800 space-y-1">
                  <span className="font-bold text-rose-900 block">
                    Optical Anti-Spoofing Detection Details:
                  </span>
                  <p className="text-slate-700">{mobileScreenError.evidence}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileScreenError(null);
                    setImagePreview(null);
                    startCamera('environment');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan Real Live Plant Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileScreenError(null);
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-100/50 text-rose-950 border border-rose-300 text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Upload className="w-4 h-4 text-rose-700" />
                  <span>Upload Original Field Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STRUCTURED ANALYSIS RESULTS                                      */}
          {/* ================================================================ */}
          {activeScan && (
            <div className="space-y-6" id="crop-doctor-analysis-results">
              {/* Preliminary Non-Confirmation Banner */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">{L.preliminaryNotice}</p>
                  {activeScan.imageQualityStatus !== 'clear' && (
                    <p className="text-rose-800 font-semibold">
                      Photograph Quality Alert ({activeScan.imageQualityStatus.replace(/_/g, ' ')}):{' '}
                      {activeScan.imageQualityNote ||
                        'Please upload a sharper, well-lit close-up photograph of the affected plant part or answer the questions below.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Primary Structured Diagnosis Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getConditionStyle(
                          activeScan.overallCondition
                        )}`}
                      >
                        {activeScan.overallCondition}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        Uncertainty: {activeScan.uncertaintyCategory}
                      </span>
                      {activeScan.zoneName && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                          {activeScan.zoneName}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 pt-1">
                      {activeScan.possibleDiagnosis}
                    </h2>
                    <p className="text-xs text-slate-600">
                      Identified / Selected Crop:{' '}
                      <strong className="text-slate-900">{activeScan.identifiedCrop}</strong> •
                      Estimated Growth Stage:{' '}
                      <strong className="text-slate-900">{activeScan.estimatedGrowthStage}</strong>
                    </p>
                  </div>

                  {/* Cross-Module Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {onNavigateToPrecision && (
                      <button
                        type="button"
                        onClick={() => onNavigateToPrecision(activeScan.zoneId || null)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold border border-slate-200 cursor-pointer flex items-center gap-1.5"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{L.openPrecisionZoneBtn}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Simple Farmer-Friendly Explanation */}
                {activeScan.simpleFarmerExplanation && (
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
                      Plain-Language Farmer Summary
                    </span>
                    <p className="text-sm text-slate-900 leading-relaxed font-medium">
                      {activeScan.simpleFarmerExplanation}
                    </p>
                    {activeScan.refinedDiagnosisSummary && (
                      <p className="text-xs text-emerald-900 pt-1 border-t border-emerald-200/70 mt-2">
                        <strong>Refined with your field answers:</strong>{' '}
                        {activeScan.refinedDiagnosisSummary}
                      </p>
                    )}
                  </div>
                )}

                {/* Structured Evidence & Multi-Factor Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Observed Symptoms &amp; Photo Evidence</span>
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      {(activeScan.observedSymptoms || []).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                      {(activeScan.visibleEvidence || []).map((ev, i) => (
                        <li key={`ev-${i}`} className="text-slate-600">
                          Evidence: {ev}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900">
                      Possible Biotic &amp; Abiotic Factors
                    </h4>
                    <div className="space-y-1.5 text-slate-700">
                      {activeScan.possibleDiseases?.length > 0 && (
                        <p>
                          <strong>Possible Diseases:</strong>{' '}
                          {activeScan.possibleDiseases.join(', ')}
                        </p>
                      )}
                      {activeScan.possiblePestDamage?.length > 0 && (
                        <p>
                          <strong>Possible Pest Damage:</strong>{' '}
                          {activeScan.possiblePestDamage.join(', ')}
                        </p>
                      )}
                      {activeScan.nutrientDeficiencySigns?.length > 0 && (
                        <p>
                          <strong>Nutrient Deficiency Signs:</strong>{' '}
                          {activeScan.nutrientDeficiencySigns.join(', ')}
                        </p>
                      )}
                      {activeScan.environmentalStressSigns?.length > 0 && (
                        <p>
                          <strong>Environmental Stress:</strong>{' '}
                          {activeScan.environmentalStressSigns.join(', ')}
                        </p>
                      )}
                      {!activeScan.possibleDiseases?.length &&
                        !activeScan.possiblePestDamage?.length &&
                        !activeScan.nutrientDeficiencySigns?.length &&
                        !activeScan.environmentalStressSigns?.length && (
                          <p className="text-slate-500">
                            No distinct disease, pest, or deficiency lesion isolated from this view.
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900">
                      Alternative Causes &amp; Next Steps
                    </h4>
                    {activeScan.alternativeCauses?.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          Alternative Possible Causes:
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                          {activeScan.alternativeCauses.map((alt, i) => (
                            <li key={i}>{alt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {activeScan.recommendedNextSteps?.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          Recommended Next Steps:
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                          {activeScan.recommendedNextSteps.map((st, i) => (
                            <li key={i}>{st}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expert Assistance Escalation Box */}
                {activeScan.requiresExpertAssistance && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">
                        Physical Field Inspection / Agricultural Expert Assistance Recommended
                      </p>
                      <p className="text-rose-800 mt-0.5">
                        {activeScan.expertAssistanceReason ||
                          'Please share affected plant samples with your nearest Krishi Vigyan Kendra (KVK) or Mandal Agricultural Officer before applying high-cost interventions.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================================ */}
              {/* NEAT 4-PART CROP ACTION PLAN WITH PESTICIDE & NUTRIENT PHOTOS */}
              {/* ============================================================ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 01. DETECTED DEFECTS & VISIBLE DAMAGE */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="text-xs font-mono text-rose-700 font-semibold">
                        01 · Visual Defect Inspection
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold font-heading text-slate-900 mt-0.5">
                        Detected Crop Defects &amp; Symptoms
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Observed on {activeScan.identifiedCrop} · {activeScan.plantPart.replace('_', ' ')}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-500 shrink-0">
                      {(activeScan.detectedDefects?.length || activeScan.observedSymptoms?.length || 1)}{' '}
                      {(activeScan.detectedDefects?.length || activeScan.observedSymptoms?.length || 1) === 1
                        ? 'item'
                        : 'items'}
                    </span>
                  </div>

                  {activeScan.detectedDefects && activeScan.detectedDefects.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {activeScan.detectedDefects.map((def, idx) => {
                        const sev = (def.severity || 'Moderate').toLowerCase();
                        const sevTextClass =
                          sev === 'high'
                            ? 'text-rose-700 font-bold'
                            : sev === 'low'
                            ? 'text-emerald-700 font-semibold'
                            : 'text-amber-700 font-bold';
                        return (
                          <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-bold text-slate-900">
                                {def.defectName}
                              </span>
                              <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                                <span>{def.affectedPart}</span>
                                <span aria-hidden="true">·</span>
                                <span className={sevTextClass}>{def.severity} Severity</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {def.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100 text-xs text-slate-700">
                      {(activeScan.observedSymptoms || []).map((sym, idx) => (
                        <li key={idx} className="py-2.5 first:pt-0 last:pb-0 font-medium">
                          {sym}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 02. NEAT STEP-BY-STEP FIELD SCHEDULE (HOW TO FIX IT) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <div className="text-xs font-mono text-emerald-700 font-semibold">
                      02 · Step-by-Step Remediation Schedule
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold font-heading text-slate-900 mt-0.5">
                      Neat Action Plan to Fix This Photo
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Follow these steps in order before and during field application
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {(activeScan.howToFixSteps?.length
                      ? activeScan.howToFixSteps
                      : [
                          ...(activeScan.treatmentPlan?.immediateAction || []),
                          ...(activeScan.treatmentPlan?.nonChemicalTreatment || []),
                        ]
                    )
                      .slice(0, 5)
                      .map((stepText, idx) => {
                        const dayLabels = [
                          'Day 1 · Immediate Sanitation',
                          'Day 1–2 · Moisture & Drainage',
                          'Day 2 · Organic / Trap IPM',
                          'Day 2–3 · Targeted Spray Window',
                          'Day 5–7 · Recovery Scouting',
                        ];
                        return (
                          <div
                            key={idx}
                            className="py-3 first:pt-0 last:pb-0 flex items-start gap-3.5 text-xs"
                          >
                            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="space-y-0.5">
                              <div className="text-[11px] font-mono font-semibold text-emerald-800">
                                {dayLabels[idx] || `Step ${idx + 1}`}
                              </div>
                              <p className="text-slate-800 leading-relaxed font-medium">
                                {stepText}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* 03. RECOMMENDED PESTICIDES & NUTRIENTS WITH PRODUCT IMAGES   */}
              {/* ============================================================ */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <div className="text-xs font-mono text-emerald-700 font-semibold">
                      03 · Verified Pesticides &amp; Foliar Nutrients Guide
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold font-heading text-slate-900 mt-0.5">
                      Recommended Crop Protection Sprays &amp; Nutrients (With Product Reference Images)
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      CIB&amp;RC-registered active ingredients &amp; FCO-approved foliar fertilizers matched to {activeScan.identifiedCrop}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    India CIB&amp;RC · FCO 1985 Aligned
                  </div>
                </div>

                {/* Part 3A: CIB&RC Crop Protection Pesticides with Visual Cards */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>A. Recommended Pesticides / Bio-Protection Sprays</span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      Always confirm active ingredient % on physical container label
                    </span>
                  </div>

                  {!activeScan.treatmentPlan?.chemicalTreatmentAllowed ||
                  !activeScan.treatmentPlan?.verifiedProducts?.length ? (
                    <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs space-y-1.5">
                      <p className="font-bold flex items-center gap-1.5">
                        <FileWarning className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Pesticide Withheld Until Clear Plant Photograph Is Provided</span>
                      </p>
                      <p className="text-amber-900 leading-relaxed">
                        {activeScan.treatmentPlan?.chemicalRestrictionReason ||
                          'Please upload a clear close-up photograph of the real crop leaf, stem, or fruit so verified CIB&RC sprays can be matched safely.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {activeScan.treatmentPlan.chemicalRestrictionReason}
                      </p>

                      <div className="grid grid-cols-1 gap-5">
                        {activeScan.treatmentPlan.verifiedProducts.map((prod) => {
                          const visual = getPesticideVisual(prod);
                          const imgBroken = Boolean(brokenImgIds[prod.id]);
                          return (
                            <div
                              key={prod.id}
                              className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden grid grid-cols-1 md:grid-cols-12"
                            >
                              {/* Left 4 Cols: High-Fidelity Pesticide Product Image */}
                              <div className="md:col-span-4 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 flex flex-col justify-between">
                                <div className="aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                                  {!imgBroken ? (
                                    <img
                                      src={visual.imageUrl}
                                      alt={`${prod.activeIngredient} agricultural formulation`}
                                      referrerPolicy="no-referrer"
                                      onError={() =>
                                        setBrokenImgIds((prev) => ({ ...prev, [prod.id]: true }))
                                      }
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="p-4 text-center space-y-1.5">
                                      <FlaskConical className="w-8 h-8 text-emerald-700 mx-auto" />
                                      <p className="text-xs font-bold text-slate-800">
                                        {prod.activeIngredient}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className="pt-3 space-y-0.5">
                                  <div className="text-[11px] font-mono font-semibold text-emerald-800">
                                    {visual.packTypeLabel}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    Reference illustration · Match active ingredient on approved pack
                                  </div>
                                </div>
                              </div>

                              {/* Right 8 Cols: Neat Structured Dosage, Target & Safety Plan */}
                              <div className="md:col-span-8 p-4 sm:p-5 space-y-4 flex flex-col justify-between">
                                <div className="space-y-3">
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-200/80 pb-3">
                                    <div>
                                      <div className="text-xs font-mono text-emerald-700 font-semibold">
                                        CIB&amp;RC Verified Active Ingredient · {prod.productCategory}
                                      </div>
                                      <h5 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                                        {prod.activeIngredient}
                                      </h5>
                                    </div>
                                    <div className="text-xs font-mono text-slate-500 shrink-0 tabular-nums">
                                      Verified {prod.verificationDate}
                                    </div>
                                  </div>

                                  {/* Key Tabular Metrics Row */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                                      <span className="text-[11px] text-slate-500 block">
                                        Pre-Harvest Wait (PHI)
                                      </span>
                                      <span className="font-bold text-slate-900 font-mono tabular-nums mt-0.5 block">
                                        {prod.preHarvestInterval}
                                      </span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                                      <span className="text-[11px] text-slate-500 block">
                                        Safe Field Re-Entry (REI)
                                      </span>
                                      <span className="font-bold text-slate-900 font-mono tabular-nums mt-0.5 block">
                                        {prod.reEntryInterval}
                                      </span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                                      <span className="text-[11px] text-slate-500 block">
                                        Required Safety Gear
                                      </span>
                                      <span className="font-semibold text-slate-900 mt-0.5 block">
                                        {prod.protectiveEquipment}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Dosage & Target Instructions */}
                                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-1.5 text-xs">
                                    <div className="font-bold text-emerald-950">
                                      Exact Mixing Dosage &amp; How to Spray:
                                    </div>
                                    <p className="text-slate-800 leading-relaxed font-medium">
                                      {prod.approvedDosageAndDirections}
                                    </p>
                                    <p className="text-slate-600 pt-1 border-t border-slate-100">
                                      <strong>Target Pest / Disease:</strong> {prod.intendedUse}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-[11px] text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
                                  <span>
                                    <strong>Pollinator &amp; Water Safety:</strong>{' '}
                                    {prod.environmentalPrecautions}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Part 3B: Required Foliar Nutrients with Product Images */}
                {activeScan.treatmentPlan?.verifiedNutrients &&
                  activeScan.treatmentPlan.verifiedNutrients.length > 0 && (
                    <div className="space-y-4 pt-5 border-t border-slate-100">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <FlaskConical className="w-4 h-4 text-teal-700" />
                          <span>
                            B. Recommended Foliar Nutrients &amp; Plant Tonics (For Healthy Green Recovery)
                          </span>
                        </h4>
                        <span className="text-xs font-mono text-slate-500">
                          FCO 1985 Approved Water-Soluble Grades
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                        {activeScan.treatmentPlan.verifiedNutrients.map((nut) => {
                          const nutVisual = getNutrientVisual(nut);
                          const nutBroken = Boolean(brokenImgIds[nut.id]);
                          return (
                            <div
                              key={nut.id}
                              className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden flex flex-col sm:flex-row"
                            >
                              <div className="sm:w-40 shrink-0 bg-white border-b sm:border-b-0 sm:border-r border-slate-200 p-3 flex flex-col justify-center">
                                <div className="aspect-4/3 w-full rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                                  {!nutBroken ? (
                                    <img
                                      src={nutVisual.imageUrl}
                                      alt={nut.nutrientName}
                                      referrerPolicy="no-referrer"
                                      onError={() =>
                                        setBrokenImgIds((prev) => ({ ...prev, [nut.id]: true }))
                                      }
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Leaf className="w-6 h-6 text-teal-700" />
                                  )}
                                </div>
                                <span className="text-[10px] font-mono text-teal-800 font-semibold mt-2 block">
                                  {nutVisual.packTypeLabel}
                                </span>
                              </div>

                              <div className="p-4 space-y-2 flex-1">
                                <div className="text-[11px] font-mono text-teal-800 font-semibold">
                                  {nut.category}
                                </div>
                                <h5 className="text-sm font-extrabold text-slate-900">
                                  {nut.nutrientName}
                                </h5>
                                <p className="text-slate-700 leading-relaxed">
                                  <strong>Purpose:</strong> {nut.targetDeficiency}
                                </p>
                                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-medium">
                                  <strong>Dosage:</strong> {nut.dosageAndApplication}
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  <strong>Tank-Mix Note:</strong> {nut.safetyNotes}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Mandatory Regulatory & Non-Guarantee Disclaimer */}
                <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs leading-relaxed">
                  <strong className="text-amber-300">Mandatory Label &amp; Safety Notice:</strong>{' '}
                  {activeScan.treatmentPlan?.safetyDisclaimer} Product images above represent
                  standard formulation packaging types (WP, EC, SG, Water-Soluble NPK); always check
                  your state-approved physical label and observe PHI before harvest.
                </div>
              </div>

              {/* ============================================================ */}
              {/* 04. 14-DAY HEALTHY CROP RECOVERY ROADMAP                     */}
              {/* ============================================================ */}
              <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
                  <div>
                    <div className="text-xs font-mono text-emerald-400 font-semibold">
                      04 · 14-Day Healthy Crop Care Plan
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold font-heading text-white mt-0.5">
                      Suggestions to Make Your {activeScan.identifiedCrop} Healthy &amp; High-Yielding
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecoveryScanId(activeScan.id);
                      setSubTab('history');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold cursor-pointer flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Track 5-Day Recovery</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {(activeScan.healthyRecoveryPlan?.length
                    ? activeScan.healthyRecoveryPlan
                    : activeScan.recommendedNextSteps || []
                  ).map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-slate-100 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ============================================================ */}
              {/* INTERACTIVE FOLLOW-UP DIAGNOSIS Q&A (REFINE RESULTS)         */}
              {/* ============================================================ */}
              {activeScan.followUpQuestions?.length > 0 && (
                <form
                  onSubmit={handleRefineDiagnosis}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-emerald-700" />
                        <span>{L.interactiveDiagnosisTitle}</span>
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">{L.interactiveDiagnosisDesc}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {activeScan.followUpQuestions.length} Field Questions
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeScan.followUpQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-800 block">
                          {idx + 1}. {q.question}
                        </label>
                        <input
                          type="text"
                          value={qaAnswers[q.id] ?? ''}
                          onChange={(e) =>
                            setQaAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          placeholder={q.placeholder || 'Type your field observation...'}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-600"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500">
                      Answers refine detected defects, required CIB&amp;RC sprays, and recovery steps.
                    </span>
                    <button
                      type="submit"
                      disabled={isRefining}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-2 disabled:opacity-60"
                    >
                      {isRefining ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>{L.refineDiagnosisBtn}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 2: CROP RECOVERY TRACKING & TIMELINE                         */}
      {/* ==================================================================== */}
      {subTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 cols: Saved Crop Scans List */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 space-y-3 h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">
                Your Saved Crop Scans ({scanHistory.length})
              </h3>
              <button
                type="button"
                onClick={() => setSubTab('scan')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Scan</span>
              </button>
            </div>

            {isLoadingHistory ? (
              <p className="text-xs text-slate-500 py-6 text-center">Loading scan records...</p>
            ) : scanHistory.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-slate-500">
                  No crop scans recorded yet. Take or upload a plant photo in the Scan tab to start
                  tracking recovery.
                </p>
                <button
                  type="button"
                  onClick={() => setSubTab('scan')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  {L.scanMyCropBtn}
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {scanHistory.map((sc) => {
                  const isSelected = selectedRecoveryScan?.id === sc.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setSelectedRecoveryScanId(sc.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {sc.imageUrl ? (
                        <img
                          src={sc.imageUrl}
                          alt={sc.identifiedCrop}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Leaf className="w-5 h-5 text-emerald-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {sc.identifiedCrop}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getRecoveryBadge(
                              sc.recoveryStatus
                            )}`}
                          >
                            {sc.recoveryStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1">
                          {sc.possibleDiagnosis}
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{sc.zoneName || 'General Plot'}</span>
                          <span>{new Date(sc.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right 8 cols: Recovery Comparison, Action Recorder, & Timeline */}
          <div className="lg:col-span-8 space-y-6">
            {!selectedRecoveryScan ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                Select a saved crop scan on the left to record treatments or compare follow-up
                photographs.
              </div>
            ) : (
              <>
                {/* Selected Scan Summary Header */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">
                          {selectedRecoveryScan.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getRecoveryBadge(
                            selectedRecoveryScan.recoveryStatus
                          )}`}
                        >
                          Status: {selectedRecoveryScan.recoveryStatus}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                        {selectedRecoveryScan.identifiedCrop} —{' '}
                        {selectedRecoveryScan.possibleDiagnosis}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Zone: <strong>{selectedRecoveryScan.zoneName || 'General Plot'}</strong> •
                        Baseline Scanned:{' '}
                        {new Date(selectedRecoveryScan.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScan(selectedRecoveryScan);
                        setSubTab('scan');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer self-start"
                    >
                      View Full Diagnosis Plan
                    </button>
                  </div>

                  {/* Deterioration Escalation Warning */}
                  {selectedRecoveryScan.recoveryStatus === 'Appears Worsening' && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">
                          Condition Appears Worsening — Consult an Agricultural Expert Immediately
                        </p>
                        <p className="text-rose-800 mt-0.5">
                          Visible symptoms appear to be progressing. Avoid repeating ineffective
                          sprays; take a fresh specimen to your nearest Krishi Vigyan Kendra (KVK)
                          plant clinic or Mandal Agricultural Officer for field verification.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Non-Causal Scientific Notice */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                    {L.nonCausalNotice}
                  </div>

                  {/* Side-by-Side Original vs Latest Follow-Up Comparison */}
                  {selectedRecoveryScan.followUpComparisons?.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Side-by-Side Visual Recovery Comparison
                      </h4>
                      {selectedRecoveryScan.followUpComparisons
                        .slice()
                        .reverse()
                        .map((cmp) => (
                          <div
                            key={cmp.id}
                            className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                Follow-Up Check ({new Date(cmp.date).toLocaleString('en-IN')})
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getRecoveryBadge(
                                  cmp.statusTrend
                                )}`}
                              >
                                {cmp.statusTrend}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className="text-[11px] font-mono text-slate-500 block">
                                  Original Baseline Photo (
                                  {new Date(selectedRecoveryScan.createdAt).toLocaleDateString(
                                    'en-IN'
                                  )}
                                  )
                                </span>
                                <img
                                  src={selectedRecoveryScan.imageUrl}
                                  alt="Original baseline"
                                  className="w-full h-44 object-cover rounded-xl border border-slate-200 bg-slate-900"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[11px] font-mono text-slate-500 block">
                                  Follow-Up Photo ({new Date(cmp.date).toLocaleDateString('en-IN')})
                                </span>
                                <img
                                  src={cmp.imageUrl}
                                  alt="Follow-up comparison"
                                  className="w-full h-44 object-cover rounded-xl border border-slate-200 bg-slate-900"
                                />
                              </div>
                            </div>

                            {cmp.visibleChanges?.length > 0 && (
                              <ul className="list-disc pl-4 text-xs text-slate-800 space-y-0.5">
                                {cmp.visibleChanges.map((vc, idx) => (
                                  <li key={idx}>{vc}</li>
                                ))}
                              </ul>
                            )}
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {cmp.comparisonNotes}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Two Forms Side-by-Side: 1. Record Action Taken | 2. Upload Follow-Up Photo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Form 1: Record Action Taken */}
                  <form
                    onSubmit={handleRecordTreatmentSubmit}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
                  >
                    <h4 className="text-sm font-bold text-slate-900">{L.recordActionTitle}</h4>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        Action Category
                      </label>
                      <select
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                      >
                        <option value="cultural_inspection">Field Scouting / Pruning / Sanitation</option>
                        <option value="irrigation_nutrition">Irrigation / Soil Nutrition Adjustment</option>
                        <option value="non_chemical">Non-Chemical / Traps / Botanical IPM</option>
                        <option value="verified_chemical">Label-Verified Crop Protection Spray</option>
                        <option value="expert_consultation">Consulted KVK / Agricultural Officer</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        What action did you take? *
                      </label>
                      <input
                        type="text"
                        required
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        placeholder="e.g., Installed 8 yellow sticky traps & pruned lower blighted leaves"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={productUsed}
                        onChange={(e) => setProductUsed(e.target.value)}
                        placeholder="Input/Product (optional)"
                        className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        value={dosageApplied}
                        onChange={(e) => setDosageApplied(e.target.value)}
                        placeholder="Rate / Area (optional)"
                        className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={treatmentNotes}
                      onChange={(e) => setTreatmentNotes(e.target.value)}
                      placeholder="Weather or field notes..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                    />

                    <button
                      type="submit"
                      disabled={isSavingTreatment}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isSavingTreatment ? 'Saving...' : 'Save Action to Timeline'}</span>
                    </button>
                  </form>

                  {/* Form 2: Upload Follow-Up Photo */}
                  <form
                    onSubmit={handleCompareRecoverySubmit}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-900">{L.uploadFollowUpTitle}</h4>
                      <p className="text-xs text-slate-600">
                        Photograph the same plant zone 3–7 days later in similar daylight to review
                        visible symptom changes.
                      </p>

                      {followUpImage ? (
                        <div className="space-y-2">
                          <img
                            src={followUpImage}
                            alt="Follow-up preview"
                            className="w-full h-36 object-cover rounded-xl border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => followUpInputRef.current?.click()}
                            className="text-xs font-bold text-emerald-700 cursor-pointer"
                          >
                            Choose Different Photo
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => followUpInputRef.current?.click()}
                          className="w-full py-6 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-900 text-xs font-bold cursor-pointer flex flex-col items-center gap-1.5"
                        >
                          <Upload className="w-5 h-5 text-emerald-700" />
                          <span>Select Follow-Up Photograph</span>
                        </button>
                      )}

                      <input
                        ref={followUpInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFollowUpFileSelect}
                        className="hidden"
                      />

                      <textarea
                        rows={2}
                        value={followUpNotes}
                        onChange={(e) => setFollowUpNotes(e.target.value)}
                        placeholder="Optional observation (e.g., 5 days after pruning & neem spray; new top leaves emerging)..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isComparingRecovery || !followUpImage}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isComparingRecovery ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Comparing Original vs Follow-Up...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Compare Recovery Progress</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Chronological Timeline of Scans & Actions */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>Chronological Crop Health &amp; Action Timeline</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    {/* Follow-up events */}
                    {(selectedRecoveryScan.followUpComparisons || []).map((cmp) => (
                      <div key={cmp.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                        <span className="font-mono text-[11px] text-slate-500">
                          {new Date(cmp.date).toLocaleString('en-IN')} • Follow-Up Photo Comparison
                        </span>
                        <p className="font-bold text-slate-900">Status: {cmp.statusTrend}</p>
                        <p className="text-slate-700">{cmp.comparisonNotes}</p>
                      </div>
                    ))}

                    {/* Recorded Farmer Actions */}
                    {(selectedRecoveryScan.treatments || []).map((tr) => (
                      <div key={tr.id} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-0.5">
                        <span className="font-mono text-[11px] text-emerald-700">
                          {new Date(tr.appliedAt).toLocaleString('en-IN')} • Action Logged (
                          {tr.actionType.replace(/_/g, ' ')})
                        </span>
                        <p className="font-bold text-slate-900">{tr.actionTaken}</p>
                        {(tr.productUsed || tr.dosageApplied) && (
                          <p className="text-slate-600">
                            Input: {tr.productUsed || 'N/A'} • Rate: {tr.dosageApplied || 'N/A'}
                          </p>
                        )}
                        {tr.notes && <p className="text-slate-500">{tr.notes}</p>}
                      </div>
                    ))}

                    {/* Baseline Scan */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                      <span className="font-mono text-[11px] text-slate-500">
                        {new Date(selectedRecoveryScan.createdAt).toLocaleString('en-IN')} •
                        Initial Baseline Crop Scan
                      </span>
                      <p className="font-bold text-slate-900">
                        {selectedRecoveryScan.identifiedCrop} ({selectedRecoveryScan.plantPart}) —{' '}
                        {selectedRecoveryScan.possibleDiagnosis}
                      </p>
                      <p className="text-slate-600">
                        Condition: {selectedRecoveryScan.overallCondition} •{' '}
                        {selectedRecoveryScan.uncertaintyCategory}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AICropDoctorDashboard;
