import { Language } from '../types';

export const AGRONOMY_LABELS: Record<
  Language,
  {
    cropDoctorTitle: string;
    cropDoctorSubtitle: string;
    scanMyCropBtn: string;
    takePhotoBtn: string;
    uploadGalleryBtn: string;
    retakePhotoBtn: string;
    uploadAnotherBtn: string;
    plantPartLabel: string;
    cropTypeOptionalLabel: string;
    farmZoneSelectLabel: string;
    analyzingCropMsg: string;
    newScanTab: string;
    recoveryHistoryTab: string;
    preliminaryNotice: string;
    interactiveDiagnosisTitle: string;
    interactiveDiagnosisDesc: string;
    refineDiagnosisBtn: string;
    treatmentPlanTitle: string;
    possibleProblemTitle: string;
    immediateActionTitle: string;
    nonChemicalTitle: string;
    chemicalTreatmentTitle: string;
    verifiedLabelBadge: string;
    generalAiGuidanceBadge: string;
    openPrecisionZoneBtn: string;
    recordActionTitle: string;
    uploadFollowUpTitle: string;
    nonCausalNotice: string;
  }
> = {
  en: {
    cropDoctorTitle: 'AI Crop Doctor & Plant Health Assistant',
    cropDoctorSubtitle:
      'Capture or upload a clear photograph of leaves, stems, flowers, fruits, or whole plants for evidence-based symptom inspection, interactive follow-up diagnosis, CIB&RC-verified IPM guidance, and recovery tracking.',
    scanMyCropBtn: 'Scan My Crop',
    takePhotoBtn: 'Take Camera Photo',
    uploadGalleryBtn: 'Upload from Gallery',
    retakePhotoBtn: 'Retake Photograph',
    uploadAnotherBtn: 'Upload Another Image',
    plantPartLabel: 'Plant Part Scanned',
    cropTypeOptionalLabel: 'Crop Type (Select if known or leave Auto-Detect)',
    farmZoneSelectLabel: 'Affected Farm Zone (Optional)',
    analyzingCropMsg: 'Examining visible plant symptoms & checking CIB&RC safety registry...',
    newScanTab: 'Scan & Diagnose Crop',
    recoveryHistoryTab: 'Saved Scans & Recovery Tracking',
    preliminaryNotice:
      'Important: Visual photograph analysis cannot 100% confirm a plant disease without physical scouting or lab testing. Findings below are preliminary visual possibilities.',
    interactiveDiagnosisTitle: 'Interactive Follow-Up Questions',
    interactiveDiagnosisDesc:
      'Answer any of these field questions to refine the possible diagnosis and receive a clear, simple explanation.',
    refineDiagnosisBtn: 'Refine Diagnosis with My Answers',
    treatmentPlanTitle: 'Intelligent Integrated Crop Management Plan',
    possibleProblemTitle: 'A. Possible Problem',
    immediateActionTitle: 'B. Immediate Field Inspection & Action',
    nonChemicalTitle: 'C. Non-Chemical & Cultural IPM Measures',
    chemicalTreatmentTitle: 'D. Chemical Treatment (Verified CIB&RC Registry Only)',
    verifiedLabelBadge: 'Verified CIB&RC / ICAR Reference Data',
    generalAiGuidanceBadge: 'General AI Visual Guidance',
    openPrecisionZoneBtn: 'Analyze Soil & 1-Year Roadmap',
    recordActionTitle: 'Record Field Action or Treatment Taken',
    uploadFollowUpTitle: 'Upload Follow-Up Photo to Compare Recovery',
    nonCausalNotice:
      'Note: A healthier-looking follow-up photograph does not by itself prove that a treatment caused improvement—weather, irrigation, natural new leaf growth, and camera angle also influence plant appearance.',
  },
  te: {
    cropDoctorTitle: 'AI క్రాప్ డాక్టర్ & పంట ఆరోగ్య సహాయకుడు',
    cropDoctorSubtitle:
      'ఆకులు, కాండం, పూత, కాయలు లేదా మొత్తం మొక్క ఫోటోను తీసి లేదా గ్యాలరీ నుండి అప్‌లోడ్ చేసి లక్షణాల పరిశీలన, ప్రశ్న-సమాధాన నిర్ధారణ, CIB&RC ధృవీకరించిన సస్యరక్షణ సూచనలు మరియు పంట కోలుకునే పురోగతిని తెలుసుకోండి.',
    scanMyCropBtn: 'నా పంటను స్కాన్ చేయండి (Scan My Crop)',
    takePhotoBtn: 'కెమెరాతో ఫోటో తీయండి',
    uploadGalleryBtn: 'గ్యాలరీ నుండి ఫోటో ఎంచుకోండి',
    retakePhotoBtn: 'మళ్ళీ ఫోటో తీయండి',
    uploadAnotherBtn: 'మరొక ఫోటో అప్‌లోడ్ చేయండి',
    plantPartLabel: 'స్కాన్ చేస్తున్న మొక్క భాగం',
    cropTypeOptionalLabel: 'పంట రకం (తెలిస్తే ఎంచుకోండి లేదా ఆటో-గుర్తింపు ఉంచండి)',
    farmZoneSelectLabel: 'ప్రభావిత పొలం జోన్ (ఐచ్ఛికం)',
    analyzingCropMsg: 'మొక్కపై కనిపించే లక్షణాలను పరిశీలిస్తోంది మరియు CIB&RC భద్రతా సమాచారాన్ని తనిఖీ చేస్తోంది...',
    newScanTab: 'పంట స్కాన్ & నిర్ధారణ',
    recoveryHistoryTab: 'గత స్కాన్‌లు & పంట కోలుకునే ట్రాకింగ్',
    preliminaryNotice:
      'ముఖ్య గమనిక: కేవలం ఫోటో ఆధారంగా పంట వ్యాధిని 100% నిర్ధారించలేము. ఇవి ప్రాథమిక దృశ్య అంచనాలు మాత్రమే.',
    interactiveDiagnosisTitle: 'తదుపరి క్షేత్రస్థాయి ప్రశ్నలు (Interactive Diagnosis)',
    interactiveDiagnosisDesc:
      'అంచనాను మరింత ఖచ్చితంగా మార్చడానికి మరియు సులభమైన తెలుగు వివరణ పొందడానికి క్రింది ప్రశ్నలకు సమాధానం ఇవ్వండి.',
    refineDiagnosisBtn: 'నా సమాధానాలతో నిర్ధారణను మెరుగుపరచండి',
    treatmentPlanTitle: 'సమగ్ర పంట యాజమాన్య & చికిత్స ప్రణాళిక',
    possibleProblemTitle: 'A. అనుమానిత సమస్య',
    immediateActionTitle: 'B. తక్షణ క్షేత్ర పరిశీలన & చర్యలు',
    nonChemicalTitle: 'C. రసాయన రహిత / సేంద్రియ & సాగు పద్ధతులు',
    chemicalTreatmentTitle: 'D. రసాయన చికిత్స (CIB&RC ధృవీకరించిన మందులు మాత్రమే)',
    verifiedLabelBadge: 'CIB&RC / ICAR ధృవీకరించిన లేబుల్ సమాచారం',
    generalAiGuidanceBadge: 'సాధారణ AI మార్గదర్శనం',
    openPrecisionZoneBtn: 'మట్టి పరీక్ష & 1-సంవత్సర పంట ప్రణాళిక',
    recordActionTitle: 'తీసుకున్న చర్య లేదా పిచికారీ వివరాలను నమోదు చేయండి',
    uploadFollowUpTitle: 'కోలుకునే పురోగతిని పోల్చడానికి కొత్త ఫోటో అప్‌లోడ్ చేయండి',
    nonCausalNotice:
      'గమనిక: తదుపరి ఫోటో ఆరోగ్యంగా కనిపించినంత మాత్రాన వేసిన మందు వల్లే తగ్గిందని నిర్ధారించలేము—వాతావరణం, నీటి తడి, కొత్త ఆకుల పెరుగుదల కూడా కారణం కావచ్చు.',
  },
  hi: {
    cropDoctorTitle: 'AI क्रॉप डॉक्टर एवं फसल स्वास्थ्य सहायक',
    cropDoctorSubtitle:
      'पत्ती, तना, फूल, फल या पूरे पौधे की साफ फोटो लें या गैलरी से अपलोड करें—दृश्य लक्षण जांच, इंटरैक्टिव प्रश्नोत्तर निदान, CIB&RC सत्यापित उपचार और फसल सुधार ट्रैकिंग के लिए।',
    scanMyCropBtn: 'मेरी फसल स्कैन करें (Scan My Crop)',
    takePhotoBtn: 'कैमरे से फोटो लें',
    uploadGalleryBtn: 'गैलरी से फोटो चुनें',
    retakePhotoBtn: 'दोबारा फोटो लें',
    uploadAnotherBtn: 'दूसरी फोटो अपलोड करें',
    plantPartLabel: 'पौधे का प्रभावित भाग',
    cropTypeOptionalLabel: 'फसल का प्रकार (यदि ज्ञात हो तो चुनें या ऑटो-पहचान रखें)',
    farmZoneSelectLabel: 'प्रभावित खेत ज़ोन (वैकल्पिक)',
    analyzingCropMsg: 'दिखने वाले लक्षणों का विश्लेषण और CIB&RC सुरक्षा डेटाबेस की जांच हो रही है...',
    newScanTab: 'फसल स्कैन और निदान',
    recoveryHistoryTab: 'सहेजे गए स्कैन और फसल रिकवरी ट्रैकिंग',
    preliminaryNotice:
      'महत्वपूर्ण सूचना: केवल फोटो के आधार पर किसी रोग की पक्की पुष्टि नहीं की जा सकती। ये प्रारंभिक दृश्य संभावनाएं हैं।',
    interactiveDiagnosisTitle: 'इंटरैक्टिव अनुवर्ती प्रश्न (Interactive Diagnosis)',
    interactiveDiagnosisDesc:
      'संभावित निदान को और सटीक बनाने और सरल भाषा में समझने के लिए इन सवालों के उत्तर दें।',
    refineDiagnosisBtn: 'मेरे उत्तरों से निदान अपडेट करें',
    treatmentPlanTitle: 'समेकित फसल प्रबंधन एवं उपचार योजना',
    possibleProblemTitle: 'A. संभावित समस्या',
    immediateActionTitle: 'B. तत्काल खेत निरीक्षण एवं कदम',
    nonChemicalTitle: 'C. गैर-रासायनिक एवं जैविक/सस्य उपाय',
    chemicalTreatmentTitle: 'D. रासायनिक उपचार (केवल CIB&RC पंजीकृत एवं सत्यापित)',
    verifiedLabelBadge: 'सत्यापित CIB&RC / ICAR लेबल जानकारी',
    generalAiGuidanceBadge: 'सामान्य AI मार्गदर्शन',
    openPrecisionZoneBtn: 'मिट्टी जांच व 1-वर्षीय फसल रोडमैप',
    recordActionTitle: 'किए गए उपचार या खेत कार्य को दर्ज करें',
    uploadFollowUpTitle: 'सुधार की तुलना के लिए नई फॉलो-अप फोटो अपलोड करें',
    nonCausalNotice:
      'नोट: केवल बाद की फोटो बेहतर दिखने का यह अर्थ नहीं है कि सुधार किसी छिड़काव से ही हुआ है—मौसम, सिंचाई और नई पत्तियों का निकलना भी कारण हो सकता है।',
  },
};
