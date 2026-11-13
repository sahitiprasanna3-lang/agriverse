import { GoogleGenAI } from '@google/genai';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

let aiClient = null;
function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });
    } catch (e) {
      console.warn('GoogleGenAI init warning:', e);
    }
  }
  return aiClient;
}

async function fetchSpeechAudioBase64(text, lang) {
  try {
    const cleanText = (text || '').replace(/[*#_`]/g, '').trim();
    if (!cleanText) return null;
    const textSnippet = cleanText.length > 180 ? cleanText.substring(0, 180) + '...' : cleanText;
    const targetLang = lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en-IN';
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textSnippet)}&tl=${targetLang}&client=tw-ob`;

    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) return null;
    const arrayBuf = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuf).toString('base64');
    return `data:audio/mpeg;base64,${base64Audio}`;
  } catch {
    return null;
  }
}

function buildFallbackVoiceReply(queryStr, lang, isGreeting) {
  const q = queryStr.toLowerCase();
  if (isGreeting) {
    return {
      text:
        lang === 'te'
          ? 'నమస్కారం అండీ! బాగున్నారా? అగ్రివర్స్‌కు స్వాగతం. ఈ రోజు మీకు ఏ పంట ధర లేదా బయ్యర్ల సమాచారం కావాలో చెప్పండి.'
          : lang === 'hi'
          ? 'नमस्ते किसान भाई! राम-राम! एग्रीवर्स में आपका स्वागत है। आज आप कौन सी फसल का मंडी भाव जानना चाहते हैं?'
          : 'Hello! Welcome to AgriVerse! How can I help you today with crop prices or buyers?',
      actionTarget: 'market-prices',
      detectedIntent: 'Greeting / స్వాగతం',
    };
  }
  if (q.includes('tomato') || q.includes('టొమాటో') || q.includes('టమాట') || q.includes('टमाटर')) {
    return {
      text:
        lang === 'te'
          ? 'ఈ రోజు బోయిన్‌పల్లి మార్కెట్లో టొమాటో క్వింటాల్‌కు ₹2,350 (కేజీ సుమారు ₹24) గా నడుస్తోంది.'
          : lang === 'hi'
          ? 'आज बोवेनपल्ली मंडी में टमाटर ₹2,350 प्रति क्विंटल (लगभग ₹24/किग्रा) चल रहा है।'
          : "Today's tomato price in Bowenpally mandi is ₹2,350 per quintal (approx ₹24/kg).",
      actionTarget: 'market-prices',
      detectedIntent: 'Tomato Price / టొమాటో ధర',
    };
  }
  if (q.includes('cotton') || q.includes('పత్తి') || q.includes('कपास')) {
    return {
      text:
        lang === 'te'
          ? 'వరంగల్ ఎనుమాముల మార్కెట్లో పత్తి క్వింటాలుకు ₹7,400 గా ఉంది. నికర లాభం ₹7,100 వస్తుంది.'
          : lang === 'hi'
          ? 'वारंगल मंडी में आज कपास का भाव ₹7,400 प्रति क्विंटल है। शुद्ध मुनाफा ₹7,100 मिलेगा।'
          : "Today's cotton price in Warangal market is ₹7,400 per quintal, giving ₹7,100 net realization.",
      actionTarget: 'market-prices',
      detectedIntent: 'Cotton Price / పత్తి ధర',
    };
  }
  if (q.includes('paddy') || q.includes('rice') || q.includes('వరి') || q.includes('धान')) {
    return {
      text:
        lang === 'te'
          ? 'నిజామాబాద్ APMC మార్కెట్లో వరి ధాన్యం క్వింటాల్‌కు ₹2,600 గా ఉంది.'
          : lang === 'hi'
          ? 'निजामाबाद APMC मंडी में धान का भाव ₹2,600 प्रति क्विंटल है।'
          : "Today's paddy price in Nizamabad APMC is ₹2,600 per quintal.",
      actionTarget: 'market-prices',
      detectedIntent: 'Paddy Price',
    };
  }
  if (q.includes('buyer') || q.includes('offer') || q.includes('బయ్యర్') || q.includes('खरीदार')) {
    return {
      text:
        lang === 'te'
          ? 'మీ పంట కోసం 3 ధృవీకరించబడిన బయ్యర్లు సిద్ధంగా ఉన్నారు. గరిష్ట ఆఫర్ ₹7,400 ఉంది.'
          : lang === 'hi'
          ? 'आपकी फसल के लिए 3 सत्यापित खरीदार उपलब्ध हैं। उच्चतम ऑफर ₹7,400 प्रति क्विंटल है।'
          : 'You have 3 verified buyer offers active. Highest bid is ₹7,400/quintal.',
      actionTarget: 'farmer-lots',
      detectedIntent: 'Buyer Offers',
    };
  }
  if (q.includes('lorry') || q.includes('truck') || q.includes('transport') || q.includes('లారీ') || q.includes('लॉरी')) {
    return {
      text:
        lang === 'te'
          ? 'వేగరథ్ రవాణా సేవలో లారీలు అందుబాటులో ఉన్నాయి. మీ పొలం నుండి మండికి సులభంగా బుక్ చేసుకోవచ్చు.'
          : lang === 'hi'
          ? 'वेगरथ ट्रांसपोर्ट में लॉरी उपलब्ध है। आप सीधे खेत से मंडी के लिए बुकिंग कर सकते हैं।'
          : 'VegaRath Express lorries are available for pickup directly from your farm gate.',
      actionTarget: 'transport',
      detectedIntent: 'Transport Booking',
    };
  }
  return {
    text:
      lang === 'te'
        ? 'అగ్రివర్స్‌కు నమస్కారం. మీరు పత్తి, వరి, టొమాటో, మిర్చి ధరల గురించి లేదా సమీప లారీ బుకింగ్ గురించి అడగవచ్చు.'
        : lang === 'hi'
        ? 'एग्रीवर्स में स्वागत है। आप कपास, धान, टमाटर के भाव या लॉरी बुकिंग की जानकारी ले सकते हैं।'
        : 'Welcome to AgriVerse. You can ask about crop prices, mandi trends, or transport booking.',
    actionTarget: 'market-prices',
    detectedIntent: 'General Assistant',
  };
}

function handleIVRLogic(body) {
  const { step, language, digit } = body || {};
  let nextStep = 'menu';
  let promptText = '';
  let isComplete = false;

  if (step === 'start' || digit === '*') {
    nextStep = 'language_select';
    promptText = 'Welcome to AgriVerse IVR Toll-Free service. తెలుగు కోసం 1 నొక్కండి. हिंदी के लिए 2 दबाएं. For English press 3.';
  } else if (step === 'language_select') {
    const selectedLang = digit === '1' ? 'te' : digit === '2' ? 'hi' : 'en';
    nextStep = 'service_select';
    if (selectedLang === 'te') {
      promptText =
        'అగ్రివర్స్ సేవలకు స్వాగతం. పంట ధరల కోసం 1, ఉత్తమ మార్కెట్ కోసం 2, బయ్యర్ ఆఫర్ల కోసం 3, ఆర్డర్ స్థితి కోసం 4, చెల్లింపు స్థితి కోసం 5, సమీప FPO అధికారిని సంప్రదించడానికి 6 నొక్కండి.';
    } else if (selectedLang === 'hi') {
      promptText =
        'एग्रीवर्स में आपका स्वागत है। फसल भाव के लिए 1, सर्वश्रेष्ठ मंडी के लिए 2, खरीदार ऑफर के लिए 3, ऑर्डर स्थिति के लिए 4, भुगतान स्थिति के लिए 5, नजदीकी FPO अधिकारी से बात करने के लिए 6 दबाएं।';
    } else {
      promptText =
        'Welcome to AgriVerse voice portal. Press 1 for Crop Price, 2 for Best Market, 3 for Buyer Offers, 4 for Order Status, 5 for Payment Status, 6 to connect with nearby FPO Officer.';
    }
  } else if (step === 'service_select') {
    const lang = language || 'en';
    if (digit === '1') {
      promptText =
        lang === 'te'
          ? 'ఈ రోజు మీ సమీప మార్కెట్ లో పత్తి ధర క్వింటాలుకు ₹7,400, వరి ధర ₹2,600, టొమాటో ధర ₹2,350.'
          : lang === 'hi'
          ? 'आज की नजदीकी मंडी में कपास का भाव ₹7,400, धान ₹2,600 और टमाटर ₹2,350 प्रति क्विंटल है।'
          : "Today's estimated cotton price in your nearest market is ₹7,400 per quintal, paddy is ₹2,600, and tomato is ₹2,350.";
      isComplete = true;
    } else if (digit === '2') {
      promptText =
        lang === 'te'
          ? 'మీ పత్తి పంటకు వరంగల్ ఎనుమాముల మార్కెట్ ఉత్తమమైనది. నికర ఆదాయం క్వింటాలుకు ₹7,100.'
          : lang === 'hi'
          ? 'आपके कपास के लिए वारंगल मंडी सबसे उपयुक्त है। शुद्ध मूल्य ₹7,100 प्रति क्विंटल है।'
          : 'Recommended Market for Cotton is Warangal. Expected net realized value after transport is ₹7,100 per quintal.';
      isComplete = true;
    } else if (digit === '3') {
      promptText =
        lang === 'te'
          ? 'మీ 50 క్వింటాళ్ల పత్తి లాట్ కోసం 3 మంది ధృవీకరించబడిన బయ్యర్లు ఉన్నారు. గరిష్ట ఆఫర్ ₹7,400 తెలంగాణ స్పిన్నింగ్ మిల్స్ నుండి వచ్చింది.'
          : lang === 'hi'
          ? 'आपके 50 क्विंटल कपास पर 3 सत्यापित खरीदारों के ऑफर हैं। उच्चतम ₹7,400 का ऑफर है।'
          : 'You have 3 active buyer offers on your Cotton lot. Highest offer is ₹7,400 from Telangana Mega Spinning Mills.';
      isComplete = true;
    } else {
      promptText =
        lang === 'te'
          ? 'మీ సమీప FPO అధికారి శ్రీ కృష్ణారావు (+91 98491 56789) కు కాల్ కనెక్ట్ చేయబడుతోంది.'
          : lang === 'hi'
          ? 'आपके नजदीकी FPO अधिकारी श्री कृष्ण राव (+91 98491 56789) से संपर्क जोड़ा जा रहा है।'
          : 'Connecting to your nearby FPO Officer Mr. Krishna Rao (+91 98491 56789).';
      isComplete = true;
    }
  }

  return { nextStep, promptText, isComplete };
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  // 1. TTS stream endpoint (GET /api/ai/tts)
  if (req.method === 'GET' || pathname.endsWith('/tts')) {
    const text = (url.searchParams.get('text') || '').trim();
    const lang = (url.searchParams.get('lang') || 'te').trim();
    if (!text) {
      return jsonResponse({ error: 'Text is required' }, 400);
    }

    try {
      const targetLang = lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en-IN';
      const textSnippet = text.length > 180 ? text.substring(0, 180) : text;
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textSnippet)}&tl=${targetLang}&client=tw-ob`;
      const upstream = await fetch(ttsUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (!upstream.ok) {
        return jsonResponse({ error: 'TTS upstream unavailable' }, 502);
      }
      const audioBuffer = await upstream.arrayBuffer();
      return new Response(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
          ...CORS_HEADERS,
        },
      });
    } catch {
      return jsonResponse({ error: 'TTS error' }, 500);
    }
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // 2. IVR endpoint (POST /api/voice/ivr)
  if (pathname.endsWith('/ivr') || ('digit' in body && 'step' in body)) {
    return jsonResponse(handleIVRLogic(body));
  }

  // 3. Voice AI Query endpoint (POST /api/ai/voice-query)
  const { query, language } = body;
  let lang = language || 'te';
  const queryStr = (query || '').trim();
  const hasTelugu = /[\u0C00-\u0C7F]/.test(queryStr);
  const hasHindi = /[\u0900-\u097F]/.test(queryStr);
  if (hasTelugu) lang = 'te';
  else if (hasHindi) lang = 'hi';

  const lowerQuery = queryStr.toLowerCase();
  const isGreeting =
    lowerQuery === 'hi' ||
    lowerQuery === 'hello' ||
    lowerQuery === 'hey' ||
    lowerQuery.includes('హాయ్') ||
    lowerQuery.includes('హలో') ||
    lowerQuery.includes('నమస్కారం') ||
    lowerQuery.includes('బాగున్నారా') ||
    lowerQuery.includes('नमस्ते') ||
    lowerQuery.includes('हाय') ||
    lowerQuery.includes('राम राम') ||
    lowerQuery.includes('प्रणाम');

  const ai = getAIClient();
  if (ai && queryStr) {
    try {
      const prompt = `You are AgriVerse's friendly, warm agricultural voice assistant for Indian farmers.
Target language: "${lang}" (te = pure Telugu, hi = respectful Hindi, en = warm Indian English).
User Query: "${queryStr}"
Is this a greeting: ${isGreeting ? 'YES' : 'NO'}

Market context:
- Cotton: ₹7,400/quintal in Warangal (Net Value ₹7,100)
- Rice/Paddy: ₹2,600/quintal in Nizamabad
- Tomato: ₹2,350/quintal in Bowenpally / Madanapalle
- Red Chilli: ₹19,200/quintal in Guntur
- Maize: ₹2,200/quintal in Karimnagar

Return ONLY valid JSON:
{
  "text": "1-2 spoken sentences for farmer",
  "actionTarget": "market-prices" | "farmer-lots" | "transport" | "orders" | "fpo" | "community",
  "detectedIntent": "Brief intent label"
}`;

      const modelsToTry = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
      let response = null;
      for (const mName of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: mName,
            contents: prompt,
            config: { responseMimeType: 'application/json' },
          });
          if (response && response.text) break;
        } catch {
          // try next model
        }
      }

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        const speechAudio = await fetchSpeechAudioBase64(parsed.text, lang);
        return jsonResponse({
          text: parsed.text,
          actionTarget: parsed.actionTarget || 'market-prices',
          detectedIntent: parsed.detectedIntent || (isGreeting ? 'Greeting' : 'Voice Query'),
          speechAudio,
          language: lang,
        });
      }
    } catch {
      // fall through to deterministic reply
    }
  }

  const fallback = buildFallbackVoiceReply(queryStr, lang, isGreeting);
  const speechAudio = await fetchSpeechAudioBase64(fallback.text, lang);
  return jsonResponse({
    ...fallback,
    speechAudio,
    language: lang,
  });
};
