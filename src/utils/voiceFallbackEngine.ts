export interface LocalVoiceResponse {
  text: string;
  actionTarget: string;
  detectedIntent: string;
  language: 'te' | 'hi' | 'en';
  speechAudio?: string;
}

export interface LocalIVRResponse {
  nextStep: 'language_select' | 'service_select' | 'result';
  promptText: string;
  isComplete: boolean;
}

export function detectQueryLanguage(query: string, preferred: 'te' | 'hi' | 'en'): 'te' | 'hi' | 'en' {
  const hasTelugu = /[\u0C00-\u0C7F]/.test(query);
  const hasHindi = /[\u0900-\u097F]/.test(query);
  if (hasTelugu) return 'te';
  if (hasHindi) return 'hi';
  return preferred || 'en';
}

export function processLocalVoiceQuery(query: string, preferredLang: 'te' | 'hi' | 'en' = 'te'): LocalVoiceResponse {
  const queryStr = (query || '').trim();
  const lang = detectQueryLanguage(queryStr, preferredLang);
  const q = queryStr.toLowerCase();

  const isGreeting =
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q.includes('how are you') ||
    q.includes('హాయ్') ||
    q.includes('హలో') ||
    q.includes('నమస్కారం') ||
    q.includes('బాగున్నారా') ||
    q.includes('नमस्ते') ||
    q.includes('हाय') ||
    q.includes('कैसे हैं') ||
    q.includes('राम राम') ||
    q.includes('प्रणाम');

  if (isGreeting) {
    return {
      text:
        lang === 'te'
          ? 'నమస్కారం అండీ! నేను బాగున్నాను. అగ్రివర్స్‌కు స్వాగతం. ఈ రోజు మీకు ఏ పంట ధర, బయ్యర్ ఆఫర్లు లేదా లారీ రవాణా సమాచారం కావాలో అడగండి.'
          : lang === 'hi'
          ? 'नमस्ते किसान भाई! मैं बिल्कुल ठीक हूँ। एग्रीवर्स में आपका स्वागत है। आज आप किस फसल का मंडी भाव, खरीदार या लॉरी बुकिंग जानना चाहते हैं?'
          : 'Hello! I am doing great, welcome to AgriVerse! Ask me about today’s mandi crop prices, verified buyer offers, or lorry transport.',
      actionTarget: 'market-prices',
      detectedIntent: lang === 'te' ? 'Greeting / స్వాగతం' : lang === 'hi' ? 'अभिवादन / Greeting' : 'Greeting',
      language: lang,
    };
  }

  if (q.includes('tomato') || q.includes('టొమాటో') || q.includes('టమాట') || q.includes('टमाटर')) {
    return {
      text:
        lang === 'te'
          ? 'ఈ రోజు బోయిన్‌పల్లి మరియు మదనపల్లె మార్కెట్లలో టొమాటో క్వింటాల్‌కు ₹2,350 (కిలో సుమారు ₹24) గా నడుస్తోంది. డిమాండ్ స్థిరంగా ఉంది.'
          : lang === 'hi'
          ? 'आज बोवेनपल्ली और मदनपल्ली मंडी में टमाटर ₹2,350 प्रति क्विंटल (लगभग ₹24 प्रति किलो) चल रहा है।'
          : 'Today’s tomato rate in Bowenpally and Madanapalle mandi is ₹2,350 per quintal (approx ₹24/kg) with steady buyer demand.',
      actionTarget: 'market-prices',
      detectedIntent: lang === 'te' ? 'టొమాటో ధర' : lang === 'hi' ? 'टमाटर मंडी भाव' : 'Tomato Price',
      language: lang,
    };
  }

  if (q.includes('cotton') || q.includes('పత్తి') || q.includes('कपास')) {
    return {
      text:
        lang === 'te'
          ? 'వరంగల్ ఎనుమాముల మార్కెట్లో పత్తి క్వింటాల్‌కు ₹7,400 గా ఉంది. రవాణా ఖర్చు తర్వాత నికర ఆదాయం ₹7,100 వస్తుంది.'
          : lang === 'hi'
          ? 'वारंगल एनुमामुला मंडी में आज कपास का भाव ₹7,400 प्रति क्विंटल है। ट्रांसपोर्ट के बाद शुद्ध मुनाफा ₹7,100 प्रति क्विंटल मिलेगा।'
          : 'Warangal APMC Enamamula Market currently offers the highest cotton rate at ₹7,400/quintal, giving ₹7,100 net profit after transport.',
      actionTarget: 'market-prices',
      detectedIntent: lang === 'te' ? 'పత్తి ధర' : lang === 'hi' ? 'कपास मंडी भाव' : 'Cotton Net Profit',
      language: lang,
    };
  }

  if (q.includes('paddy') || q.includes('rice') || q.includes('వరి') || q.includes('ధాన్యం') || q.includes('धान') || q.includes('चावल')) {
    return {
      text:
        lang === 'te'
          ? 'నిజామాబాద్ APMC మార్కెట్లో వరి ధాన్యం క్వింటాల్‌కు ₹2,600 గా ఉంది. మార్కెట్‌లో కొనుగోలు డిమాండ్ ఎక్కువగా ఉంది.'
          : lang === 'hi'
          ? 'निजामाबाद APMC मंडी में धान का भाव ₹2,600 प्रति क्विंटल है और खरीदारों की मांग तेज है।'
          : 'In Nizamabad APMC Market, paddy/rice is trading at ₹2,600 per quintal with high buyer demand.',
      actionTarget: 'market-prices',
      detectedIntent: lang === 'te' ? 'వరి ధాన్యం ధర' : lang === 'hi' ? 'धान मंडी भाव' : 'Paddy Price',
      language: lang,
    };
  }

  if (q.includes('chilli') || q.includes('mirchi') || q.includes('మిర్చి') || q.includes('मिर्च')) {
    return {
      text:
        lang === 'te'
          ? 'గుంటూరు మిర్చి యార్డ్‌లో ఎర్ర మిర్చి క్వింటాల్‌కు ₹19,200 వద్ద బలంగా నడుస్తోంది.'
          : lang === 'hi'
          ? 'गुंटूर मिर्ची यार्ड में लाल मिर्च ₹19,200 प्रति क्विंटल पर मजबूत चल रही है।'
          : 'Red Chilli at Guntur Mirchi Yard is trading strongly at ₹19,200 per quintal.',
      actionTarget: 'market-prices',
      detectedIntent: lang === 'te' ? 'మిర్చి ధర' : lang === 'hi' ? 'मिर्च भाव' : 'Chilli Price',
      language: lang,
    };
  }

  if (q.includes('maize') || q.includes('corn') || q.includes('మొక్కజొన్న') || q.includes('मक्का')) {
    return {
      text:
        lang === 'te'
          ? 'కరీంనగర్ APMC మండిలో మొక్కజొన్న క్వింటాల్‌కు ₹2,200 వద్ద స్థిరంగా ఉంది.'
          : lang === 'hi'
          ? 'करीमनगर APMC मंडी में मक्का ₹2,200 प्रति क्विंटल पर स्थिर है।'
          : 'Maize at Karimnagar APMC Mandi is steady at ₹2,200 per quintal.',
      actionTarget: 'market-prices',
      detectedIntent: lang === 'te' ? 'మొక్కజొన్న ధర' : lang === 'hi' ? 'मक्का भाव' : 'Maize Price',
      language: lang,
    };
  }

  if (
    q.includes('buyer') ||
    q.includes('offer') ||
    q.includes('bid') ||
    q.includes('కొనుగోలు') ||
    q.includes('బయ్యర్') ||
    q.includes('खरीदार') ||
    q.includes('ऑफर')
  ) {
    return {
      text:
        lang === 'te'
          ? 'మీ పంట లాట్ కోసం 3 ధృవీకరించబడిన బయ్యర్లు సిద్ధంగా ఉన్నారు. తెలంగాణ మెగా స్పిన్నింగ్ మిల్స్ క్వింటాల్‌కు ₹7,400 ఆఫర్ ఇచ్చింది.'
          : lang === 'hi'
          ? 'आपकी फसल के लिए 3 सत्यापित खरीदार उपलब्ध हैं। उच्चतम ऑफर ₹7,400 प्रति क्विंटल है।'
          : 'You have 3 verified buyer offers active. The highest offer is ₹7,400/quintal from Telangana Mega Spinning Mills.',
      actionTarget: 'farmer-lots',
      detectedIntent: lang === 'te' ? 'బయ్యర్ ఆఫర్లు' : lang === 'hi' ? 'खरीदार ऑफर' : 'Buyer Offers',
      language: lang,
    };
  }

  if (
    q.includes('lorry') ||
    q.includes('truck') ||
    q.includes('transport') ||
    q.includes('logistics') ||
    q.includes('లారీ') ||
    q.includes('రవాణా') ||
    q.includes('लॉरी') ||
    q.includes('ट्रक') ||
    q.includes('परिवहन')
  ) {
    return {
      text:
        lang === 'te'
          ? 'వేగరథ్ రవాణా సేవలో లారీలు అందుబాటులో ఉన్నాయి. మీ పొలం నుండి సమీప మండికి అద్దె కిలోమీటరుకు ₹18 నుండి ప్రారంభమవుతుంది.'
          : lang === 'hi'
          ? 'वेगरथ ट्रांसपोर्ट में लॉरी उपलब्ध है। खेत से मंडी तक भाड़ा ₹18 प्रति किमी से शुरू होता है।'
          : 'VegaRath Express Logistics lorries are available nearby starting at ₹18/km from farm gate to APMC mandi.',
      actionTarget: 'transport',
      detectedIntent: lang === 'te' ? 'లారీ రవాణా' : lang === 'hi' ? 'लॉरी बुकिंग' : 'Transport Booking',
      language: lang,
    };
  }

  if (
    q.includes('order') ||
    q.includes('payment') ||
    q.includes('ఆర్డర్') ||
    q.includes('చెల్లింపు') ||
    q.includes('ऑर्डर') ||
    q.includes('भुगतान')
  ) {
    return {
      text:
        lang === 'te'
          ? 'మీ ఇటీవలి ఆర్డర్లు మరియు UPI/ఎస్క్రో చెల్లింపులు సురక్షితంగా ప్రాసెస్ అవుతున్నాయి. ఆర్డర్ల స్క్రీన్‌లో పూర్తి వివరాలు చూడవచ్చు.'
          : lang === 'hi'
          ? 'आपके हाल के ऑर्डर और UPI भुगतान सुरक्षित रूप से प्रोसेस हो रहे हैं। ऑर्डर स्क्रीन पर विवरण देखें।'
          : 'Your active orders and UPI escrow settlements are on track. Open the Orders screen to view live status.',
      actionTarget: 'orders',
      detectedIntent: lang === 'te' ? 'ఆర్డర్ & చెల్లింపు' : lang === 'hi' ? 'ऑर्डर और भुगतान' : 'Orders & Payments',
      language: lang,
    };
  }

  if (q.includes('fpo') || q.includes('officer') || q.includes('అధికారి') || q.includes('अधिकारी')) {
    return {
      text:
        lang === 'te'
          ? 'మీ సమీప FPO ఫీల్డ్ ఆఫీసర్ శ్రీ కృష్ణారావు గారిని +91 98491 56789 లో లేదా FPO పోర్టల్ ద్వారా సంప్రదించవచ్చు.'
          : lang === 'hi'
          ? 'आप नजदीकी FPO अधिकारी श्री कृष्ण राव से +91 98491 56789 पर या FPO पोर्टल से जुड़ सकते हैं।'
          : 'You can reach your nearest FPO Officer Mr. Krishna Rao at +91 98491 56789 or via the FPO Portal.',
      actionTarget: 'fpo',
      detectedIntent: 'FPO Support',
      language: lang,
    };
  }

  return {
    text:
      lang === 'te'
        ? 'అగ్రివర్స్ సహాయకానికి స్వాగతం! ఈ రోజు వరంగల్‌లో పత్తి ₹7,400, నిజామాబాద్‌లో వరి ₹2,600, బోయిన్‌పల్లిలో టొమాటో ₹2,350 గా ఉన్నాయి. ఏ సమాచారం కావాలో అడగండి.'
        : lang === 'hi'
        ? 'एग्रीवर्स में आपका स्वागत है! आज कपास ₹7,400, धान ₹2,600 और टमाटर ₹2,350 प्रति क्विंटल है। आप खरीदार ऑफर या लॉरी बुकिंग भी पूछ सकते हैं।'
        : 'Welcome to AgriVerse! Today’s top rates: Cotton ₹7,400/qtl (Warangal), Paddy ₹2,600/qtl (Nizamabad), Tomato ₹2,350/qtl (Bowenpally). Ask about buyers or lorries anytime.',
    actionTarget: 'market-prices',
    detectedIntent: 'Market Discovery',
    language: lang,
  };
}

export function processLocalIVR(
  step: 'start' | 'language_select' | 'service_select' | 'result',
  language: 'te' | 'hi' | 'en',
  digit: string
): LocalIVRResponse {
  if (digit === '*') {
    return {
      nextStep: 'language_select',
      promptText:
        'Welcome to AgriVerse IVR Toll-Free service. తెలుగు కోసం 1 నొక్కండి. हिंदी के लिए 2 दबाएं. For English press 3.',
      isComplete: false,
    };
  }

  if (digit === '#') {
    return {
      nextStep: 'result',
      promptText:
        language === 'te'
          ? 'అగ్రివర్స్ IVR సేవను ఉపయోగించినందుకు ధన్యవాదాలు. నమస్కారం.'
          : language === 'hi'
          ? 'एग्रीवर्स IVR सेवा का उपयोग करने के लिए धन्यवाद। नमस्ते।'
          : 'Thank you for calling AgriVerse Toll-Free IVR service. Goodbye.',
      isComplete: true,
    };
  }

  if (step === 'start') {
    return {
      nextStep: 'language_select',
      promptText:
        'Welcome to AgriVerse IVR Toll-Free service. తెలుగు కోసం 1 నొక్కండి. हिंदी के लिए 2 दबाएं. For English press 3.',
      isComplete: false,
    };
  }

  if (step === 'language_select') {
    const selectedLang = digit === '1' ? 'te' : digit === '2' ? 'hi' : 'en';
    const promptText =
      selectedLang === 'te'
        ? 'అగ్రివర్స్ సేవలకు స్వాగతం. పంట ధరల కోసం 1, ఉత్తమ మార్కెట్ కోసం 2, బయ్యర్ ఆఫర్ల కోసం 3, ఆర్డర్ స్థితి కోసం 4, చెల్లింపు స్థితి కోసం 5, సమీప FPO అధికారిని సంప్రదించడానికి 6 నొక్కండి.'
        : selectedLang === 'hi'
        ? 'एग्रीवर्स में आपका स्वागत है। फसल भाव के लिए 1, सर्वश्रेष्ठ मंडी के लिए 2, खरीदार ऑफर के लिए 3, ऑर्डर स्थिति के लिए 4, भुगतान स्थिति के लिए 5, नजदीकी FPO अधिकारी से बात करने के लिए 6 दबाएं।'
        : 'Welcome to AgriVerse voice portal. Press 1 for Crop Price, 2 for Best Market, 3 for Buyer Offers, 4 for Order Status, 5 for Payment Status, 6 to connect with nearby FPO Officer.';

    return {
      nextStep: 'service_select',
      promptText,
      isComplete: false,
    };
  }

  const lang = language || 'en';
  if (digit === '1') {
    return {
      nextStep: 'result',
      promptText:
        lang === 'te'
          ? 'ఈ రోజు మీ సమీప మార్కెట్ లో పత్తి ధర క్వింటాలుకు ₹7,400, వరి ధర ₹2,600, టొమాటో ధర ₹2,350.'
          : lang === 'hi'
          ? 'आज की नजदीकी मंडी में कपास का भाव ₹7,400, धान ₹2,600 और टमाटर ₹2,350 प्रति क्विंटल है।'
          : "Today's estimated cotton price in your nearest market is ₹7,400 per quintal, paddy is ₹2,600, and tomato is ₹2,350.",
      isComplete: true,
    };
  }
  if (digit === '2') {
    return {
      nextStep: 'result',
      promptText:
        lang === 'te'
          ? 'మీ పత్తి పంటకు వరంగల్ ఎనుమాముల మార్కెట్ ఉత్తమమైనది. నికర ఆదాయం క్వింటాలుకు ₹7,100.'
          : lang === 'hi'
          ? 'आपके कपास के लिए वारंगल मंडी सबसे उपयुक्त है। शुद्ध मूल्य ₹7,100 प्रति क्विंटल है।'
          : 'Recommended Market for Cotton is Warangal. Expected net realized value after transport is ₹7,100 per quintal.',
      isComplete: true,
    };
  }
  if (digit === '3') {
    return {
      nextStep: 'result',
      promptText:
        lang === 'te'
          ? 'మీ 50 క్వింటాళ్ల పత్తి లాట్ కోసం 3 మంది ధృవీకరించబడిన బయ్యర్లు ఉన్నారు. గరిష్ట ఆఫర్ ₹7,400 తెలంగాణ స్పిన్నింగ్ మిల్స్ నుండి వచ్చింది.'
          : lang === 'hi'
          ? 'आपके 50 क्विंटल कपास पर 3 सत्यापित खरीदारों के ऑफर हैं। उच्चतम ₹7,400 का ऑफर है।'
          : 'You have 3 active buyer offers on your Cotton lot. Highest offer is ₹7,400 from Telangana Mega Spinning Mills.',
      isComplete: true,
    };
  }
  if (digit === '4') {
    return {
      nextStep: 'result',
      promptText:
        lang === 'te'
          ? 'మీ తాజా ఆర్డర్ రవాణాలో ఉంది మరియు 4 గంటల్లో మండికి చేరుకుంటుంది.'
          : lang === 'hi'
          ? 'आपका नवीनतम ऑर्डर ट्रांजिट में है और 4 घंटे में मंडी पहुँच जाएगा।'
          : 'Your latest dispatch order is in transit and scheduled to arrive at the mandi in 4 hours.',
      isComplete: true,
    };
  }
  if (digit === '5') {
    return {
      nextStep: 'result',
      promptText:
        lang === 'te'
          ? 'మీ UPI ఎస్క్రో చెల్లింపు సురక్షితంగా ఉంది. నాణ్యత నిర్ధారణ తర్వాత మీ బ్యాంక్ ఖాతాకు జమ అవుతుంది.'
          : lang === 'hi'
          ? 'आपका UPI एस्क्रो भुगतान सुरक्षित है। गुणवत्ता जांच के बाद सीधे बैंक खाते में जमा होगा।'
          : 'Your UPI escrow payment is secured and will settle directly to your verified bank account upon delivery.',
      isComplete: true,
    };
  }

  return {
    nextStep: 'result',
    promptText:
      lang === 'te'
        ? 'మీ సమీప FPO అధికారి శ్రీ కృష్ణారావు (+91 98491 56789) కు కాల్ కనెక్ట్ చేయబడుతోంది.'
        : lang === 'hi'
        ? 'आपके नजदीकी FPO अधिकारी श्री कृष्ण राव (+91 98491 56789) से संपर्क जोड़ा जा रहा है।'
        : 'Connecting to your nearby FPO Officer Mr. Krishna Rao (+91 98491 56789).',
    isComplete: true,
  };
}
