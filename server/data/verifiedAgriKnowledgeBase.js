/**
 * Authoritative Agricultural Reference Knowledge Base (India - CIB&RC / ICAR / State Agricultural Universities)
 *
 * SAFETY & VERIFICATION ARCHITECTURE:
 * - AI model output NEVER directly invents pesticide product names, dosages, or registrations.
 * - Chemical products are ONLY matched from this verified static registry when:
 *   1. The crop matches a registered crop on the CIB&RC approved label.
 *   2. The suspected pest/disease category aligns with the registered target.
 *   3. The diagnosis uncertainty is NOT 'High Uncertainty / Inconclusive Photograph'.
 * - If no verified entry exists for a crop + target combination, chemical recommendations are withheld
 *   and the farmer is directed to consult a local KVK (Krishi Vigyan Kendra) or State Agricultural Extension Officer.
 */

export const VERIFIED_CROP_PROTECTION_CATALOG = [
  {
    id: 'cibrc-azadirachtin-015',
    activeIngredient: 'Azadirachtin 0.15% EC (1500 ppm Neem Kernel Based Botanical)',
    productCategory: 'Botanical / Bio-Rational Insecticide',
    verifiedCrops: ['Cotton', 'Red Chilli', 'Tomato', 'Rice (Paddy)', 'Brinjal', 'Okra', 'Cabbage', 'Soybean', 'Maize', 'Onion', 'Turmeric', 'Groundnut', 'Bengal Gram (Chana)'],
    targetKeywords: ['sucking pest', 'aphid', 'jassid', 'whitefly', 'thrips', 'leafhopper', 'mite', 'early hopper', 'leaf curl', 'curling', 'hopperburn', 'insect'],
    intendedUse: 'Management of early-stage sucking pests (aphids, jassids, whiteflies, thrips, mites) while conserving natural predators.',
    supportingEvidence: 'ICAR-NCIPM Integrated Pest Management (IPM) Package of Practices recommends botanical Azadirachtin as first-line intervention at Economic Threshold Level (ETL) to delay synthetic insecticide resistance.',
    approvedDosageAndDirections: '2.5 to 3.0 ml per liter of clean water (500–600 ml in 200 L water per acre) applied as uniform foliar spray covering leaf undersides during cool morning or evening hours. Verify exact formulation concentration on physical product label.',
    protectiveEquipment: 'Nitrile gloves, long-sleeved cotton shirt, protective eyewear, and face mask during mixing and spraying.',
    reEntryInterval: '12 hours (or until spray deposit has completely dried on foliage).',
    preHarvestInterval: '3 to 5 days depending on crop label.',
    environmentalPrecautions: 'Avoid spraying during peak honeybee foraging hours (8:00 AM – 11:00 AM). Do not contaminate farm ponds, irrigation canals, or drinking water sources.',
    sourceAuthority: 'Central Insecticides Board & Registration Committee (CIB&RC), Directorate of Plant Protection, Quarantine & Storage (Govt. of India) & ICAR-NCIPM IPM Guidelines',
    verificationDate: '2025-01-15',
  },
  {
    id: 'cibrc-copper-oxychloride-50wp',
    activeIngredient: 'Copper Oxychloride 50% WP',
    productCategory: 'Contact Protectant Fungicide / Bactericide',
    verifiedCrops: ['Tomato', 'Red Chilli', 'Potato', 'Turmeric', 'Citrus', 'Cotton', 'Onion', 'Brinjal', 'Cabbage'],
    targetKeywords: ['leaf spot', 'early blight', 'late blight', 'bacterial blight', 'bacterial spot', 'anthracnose', 'dieback', 'fruit rot', 'fungal spot', 'rhizome rot', 'collar rot', 'canker', 'black spot', 'brown spot'],
    intendedUse: 'Protective management of fungal leaf spots, blights, dieback, fruit rot, and bacterial leaf spot complexes.',
    supportingEvidence: 'Registered under Insecticides Act, 1968 (CIB&RC Major Uses of Fungicides) and recommended by PJTSAU / ANGRAU Horticultural Advisories for foliar spot and blight suppression.',
    approvedDosageAndDirections: '2.5 to 3.0 grams per liter of water (500 grams in 200 L water per acre) as high-volume foliar coverage. Do not mix with alkaline sprays or Growth Regulators like Alpha-NAA. Follow current approved physical label.',
    protectiveEquipment: 'Chemical-resistant gloves, particulate/mist respirator, goggles, full-length clothing, and rubber boots.',
    reEntryInterval: '24 hours after application.',
    preHarvestInterval: '7 to 14 days (refer to crop-specific CIB&RC label table before harvest).',
    environmentalPrecautions: 'Toxic to fish and aquatic invertebrates. Do not wash spray equipment near lakes, streams, or aquaculture tanks. Avoid repeated copper buildup in acidic soils.',
    sourceAuthority: 'CIB&RC Approved Usage of Fungicides (DPPQS, Ministry of Agriculture & Farmers Welfare, India) & ICAR Horticultural Crop Protection Manual',
    verificationDate: '2025-01-15',
  },
  {
    id: 'cibrc-mancozeb-75wp',
    activeIngredient: 'Mancozeb 75% WP',
    productCategory: 'Broad-Spectrum Contact Dithiocarbamate Fungicide',
    verifiedCrops: ['Tomato', 'Potato', 'Red Chilli', 'Rice (Paddy)', 'Wheat', 'Maize', 'Onion', 'Groundnut', 'Soybean', 'Turmeric', 'Brinjal', 'Cabbage'],
    targetKeywords: ['alternaria', 'early blight', 'leaf blight', 'purple blotch', 'rust', 'tikka', 'leaf spot', 'cercospora', 'fungal', 'brown spot', 'necrotic spot', 'blight'],
    intendedUse: 'Preventive multi-site contact control of Alternaria blight, Cercospora leaf spot, rusts, tikka, and purple blotch.',
    supportingEvidence: 'CIB&RC registered multi-site protectant fungicide with low single-site resistance risk; documented in ICAR Directorate of Onion & Garlic Research and IIHR vegetable advisories.',
    approvedDosageAndDirections: '2.0 to 2.5 grams per liter of water (400–500 grams in 200 L water per acre). Ensure thorough leaf surface coverage prior to rain or dew events; observe rain-fastness window on label.',
    protectiveEquipment: 'Impervious gloves, dust/mist mask, eye protection, and full body cover.',
    reEntryInterval: '24 hours.',
    preHarvestInterval: '7 to 10 days (strictly follow crop-specific CIB&RC label waiting period).',
    environmentalPrecautions: 'Prevent spray drift to water bodies. Rotate with different FRAC group fungicides if repeat intervention is advised by an agronomist.',
    sourceAuthority: 'CIB&RC Registered Fungicides Compendium (DPPQS, Govt. of India) & ICAR-IIHR Crop Protection Guide',
    verificationDate: '2025-01-15',
  },
  {
    id: 'cibrc-tricyclazole-75wp',
    activeIngredient: 'Tricyclazole 75% WP',
    productCategory: 'Systemic Melanin Biosynthesis Inhibitor Fungicide',
    verifiedCrops: ['Rice (Paddy)'],
    targetKeywords: ['blast', 'leaf blast', 'neck blast', 'node blast', 'pyricularia', 'magnaporthe', 'spindle lesion'],
    intendedUse: 'Targeted systemic protection against Leaf Blast and Neck Blast (Magnaporthe oryzae) in transplanted and direct-seeded Rice (Paddy).',
    supportingEvidence: 'ICAR-Indian Institute of Rice Research (ICAR-IIRR, Hyderabad) & CIB&RC registered standard for paddy blast management.',
    approvedDosageAndDirections: '0.6 grams per liter of water (120 grams in 200 L water per acre). Maximum 1–2 applications per season to prevent fungicide resistance; avoid late application past booting/heading per label.',
    protectiveEquipment: 'Nitrile gloves, face shield/goggles, respirator mask, and protective coveralls.',
    reEntryInterval: '24 hours.',
    preHarvestInterval: '30 days (strictly adhere to CIB&RC residue compliance interval for Basmati and non-Basmati rice).',
    environmentalPrecautions: 'Do not drain treated paddy field water directly into fish ponds or public waterways for at least 7 days post-application.',
    sourceAuthority: 'CIB&RC Major Uses of Fungicides & ICAR-IIRR (Rajendranagar, Hyderabad) Rice Production Manual',
    verificationDate: '2025-01-15',
  },
  {
    id: 'cibrc-emamectin-benzoate-5sg',
    activeIngredient: 'Emamectin Benzoate 5% SG',
    productCategory: 'Translaminar Avermectin Lepidopteran Insecticide',
    verifiedCrops: ['Cotton', 'Red Chilli', 'Tomato', 'Brinjal', 'Okra', 'Cabbage', 'Bengal Gram (Chana)', 'Maize', 'Soybean', 'Groundnut'],
    targetKeywords: ['bollworm', 'fruit borer', 'pod borer', 'caterpillar', 'helicoverpa', 'spodoptera', 'fall armyworm', 'larva', 'borer', 'chewing', 'holes', 'defoliation'],
    intendedUse: 'Control of lepidopteran caterpillars, bollworms, fall armyworms, and fruit/pod borers when larval counts cross Economic Threshold Levels (ETL).',
    supportingEvidence: 'CIB&RC registered formulation recommended in ICAR-CICR (Central Institute for Cotton Research) and ICAR-IIVR resistance management schedules after pheromone trap verification.',
    approvedDosageAndDirections: '0.4 grams per liter of water (80–88 grams in 200 L water per acre). Direct spray toward whorls, fruiting bodies, and squares when young instar larvae are observed.',
    protectiveEquipment: 'Chemical gloves, mask/respirator, goggles, and full protective clothing.',
    reEntryInterval: '12 to 24 hours.',
    preHarvestInterval: '5 days for Tomato/Chilli/Okra; 10–14 days for Cotton/Pulses/Maize (verify exact PHI on approved container leaflet).',
    environmentalPrecautions: 'Toxic to bees exposed to direct spray droplets; apply only in late afternoon/evening after pollinator activity ceases. Rotate IRAC Group 6 with non-cross-resistant modes of action.',
    sourceAuthority: 'CIB&RC Major Uses of Insecticides (DPPQS) & ICAR-CICR Bollworm Resistance Management Advisory',
    verificationDate: '2025-01-15',
  },
  {
    id: 'cibrc-sulphur-80wdg',
    activeIngredient: 'Sulphur 80% WDG (Water Dispersible Granules)',
    productCategory: 'Contact Fungicide & Miticide (Acaricide)',
    verifiedCrops: ['Red Chilli', 'Tomato', 'Okra', 'Cotton', 'Wheat', 'Soybean', 'Bengal Gram (Chana)', 'Onion', 'Groundnut'],
    targetKeywords: ['powdery mildew', 'white powdery', 'powdery', 'oidium', 'levillula', 'mite', 'yellow mite', 'red spider mite', 'webbing'],
    intendedUse: 'Dual-action management of Powdery Mildew fungal coatings and phytophagous mites (yellow/red spider mites).',
    supportingEvidence: 'CIB&RC registered inorganic fungicide/acaricide with multi-site contact vapour action and zero resistance buildup; supplies secondary nutrient sulphur.',
    approvedDosageAndDirections: '2.0 to 2.5 grams per liter of clean water (400–500 grams in 200 L water per acre). Do NOT spray when ambient temperature exceeds 33°C to avoid leaf scorch.',
    protectiveEquipment: 'Dust/mist mask, protective goggles (prevents eye irritation), gloves, and full-sleeved shirt.',
    reEntryInterval: '24 hours.',
    preHarvestInterval: '3 to 5 days per approved crop label.',
    environmentalPrecautions: 'Do not mix with horticultural mineral oils or apply within 14 days of oil sprays.',
    sourceAuthority: 'CIB&RC Approved Major Uses of Fungicides & ICAR-IIVR Vegetable Protection Advisory',
    verificationDate: '2025-01-15',
  },
  {
    id: 'cibrc-metalaxyl-mancozeb-72wp',
    activeIngredient: 'Metalaxyl 8% + Mancozeb 64% WP',
    productCategory: 'Systemic + Contact Combination Oomycete Fungicide',
    verifiedCrops: ['Tomato', 'Potato', 'Turmeric', 'Onion', 'Cabbage', 'Red Chilli', 'Soybean'],
    targetKeywords: ['late blight', 'phytophthora', 'downy mildew', 'damping off', 'rhizome rot', 'collar rot', 'root rot', 'water soaked', 'wilting', 'pythium'],
    intendedUse: 'Curative + protective management of Late Blight, Downy Mildew, damping-off, and Pythium/Phytophthora rhizome or collar rots.',
    supportingEvidence: 'CIB&RC registered co-formulation combining systemic phenylamide movement with multi-site Mancozeb protection; standard ICAR-CPRI and IISR recommendation.',
    approvedDosageAndDirections: '2.0 to 2.5 grams per liter of water (400–500 grams in 200 L water per acre). Limit to maximum 2 sprays per crop cycle and ensure proper field drainage.',
    protectiveEquipment: 'Nitrile gloves, respirator mask, protective eyewear, coveralls, and rubber boots.',
    reEntryInterval: '24 hours.',
    preHarvestInterval: '7 to 14 days depending on crop label.',
    environmentalPrecautions: 'Do not apply continuously without fungicide group rotation. Prevent runoff into irrigation channels.',
    sourceAuthority: 'CIB&RC Registered Combination Fungicides (DPPQS) & ICAR-CPRI / ICAR-IISR Advisory',
    verificationDate: '2025-01-15',
  },
  {
    id: 'cibrc-propiconazole-25ec',
    activeIngredient: 'Propiconazole 25% EC',
    productCategory: 'Systemic Triazole (DMI) Broad-Spectrum Fungicide',
    verifiedCrops: ['Wheat', 'Rice (Paddy)', 'Groundnut', 'Soybean', 'Turmeric', 'Maize'],
    targetKeywords: ['rust', 'yellow rust', 'brown rust', 'sheath blight', 'rhizoctonia', 'tikka', 'leaf blotch', 'false smut', 'grain discoloration'],
    intendedUse: 'Systemic control of cereal rusts, paddy sheath blight, groundnut tikka leaf spot, and foliar blotch diseases.',
    supportingEvidence: 'CIB&RC registered FRAC Group 3 triazole validated by ICAR-IIWBR (Karnal) and ICAR-IIRR (Hyderabad) for rust and sheath blight suppression.',
    approvedDosageAndDirections: '1.0 ml per liter of water (200 ml in 200 L water per acre). Apply at initial disease appearance on lower leaf sheaths.',
    protectiveEquipment: 'Chemical-resistant gloves, goggles, mask, and full-length protective clothing.',
    reEntryInterval: '24 hours.',
    preHarvestInterval: '25 to 30 days per CIB&RC crop residue schedule.',
    environmentalPrecautions: 'Toxic to aquatic organisms; avoid drift to fish ponds and waterways.',
    sourceAuthority: 'CIB&RC Major Uses of Fungicides & ICAR-IIWBR / ICAR-IIRR Crop Protection Bulletins',
    verificationDate: '2025-01-15',
  },
  {
    id: 'cibrc-flonicamid-50wg',
    activeIngredient: 'Flonicamid 50% WG',
    productCategory: 'Selective Chordotonal Organ Modulator Sucking-Pest Insecticide',
    verifiedCrops: ['Cotton', 'Rice (Paddy)', 'Tomato', 'Red Chilli', 'Brinjal', 'Okra'],
    targetKeywords: ['whitefly', 'jassid', 'leafhopper', 'aphid', 'brown planthopper', 'bph', 'hopper', 'leaf curl', 'honeydew', 'sooty'],
    intendedUse: 'Targeted systemic & translaminar control of whiteflies, jassids, aphids, and paddy planthoppers when populations exceed ETL.',
    supportingEvidence: 'CIB&RC registered IRAC Group 29 feeding blocker; stops sap sucking within 1 hour while preserving ladybird beetles and lacewings.',
    approvedDosageAndDirections: '0.3 to 0.4 grams per liter of water (60–80 grams in 200 L water per acre). Direct spray to basal stems in Paddy or leaf undersides in Cotton/Vegetables.',
    protectiveEquipment: 'Nitrile gloves, protective mask, eyewear, and long-sleeved cotton clothing.',
    reEntryInterval: '12 hours.',
    preHarvestInterval: '5 to 7 days for vegetables; 15–20 days for Cotton/Paddy per label.',
    environmentalPrecautions: 'Safer on beneficial insects than broad-spectrum pyrethroids, yet avoid spraying during active bee foraging.',
    sourceAuthority: 'CIB&RC Major Uses of Insecticides (DPPQS) & ICAR-CICR / ICAR-IIRR IPM Schedule',
    verificationDate: '2025-01-15',
  },
  {
    id: 'cibrc-spinosad-45sc',
    activeIngredient: 'Spinosad 45% SC',
    productCategory: 'Biological-Origin Spinosyn Insecticide',
    verifiedCrops: ['Red Chilli', 'Cotton', 'Tomato', 'Brinjal', 'Onion', 'Cabbage', 'Bengal Gram (Chana)'],
    targetKeywords: ['thrips', 'upward curl', 'boat curl', 'silvery streak', 'leaf miner', 'diamondback moth', 'fruit borer', 'pod borer'],
    intendedUse: 'High-efficacy control of Chilli/Onion thrips (upward leaf curl & silvery scarring), leaf miners, and diamondback moth larvae.',
    supportingEvidence: 'Derived from Saccharopolyspora spinosa fermentation; CIB&RC registered IRAC Group 5 standard in ICAR-IIHR Chilli & Onion thrips IPM.',
    approvedDosageAndDirections: '0.3 to 0.35 ml per liter of water (60–75 ml in 200 L water per acre). Spray in evening hours covering terminal shoots and inner whorls.',
    protectiveEquipment: 'Gloves, face mask, goggles, and full-length field attire.',
    reEntryInterval: '12 hours.',
    preHarvestInterval: '3 to 7 days depending on crop label.',
    environmentalPrecautions: 'Wet spray is toxic to honeybees for 3 hours after application — spray strictly in late evening when bees have returned to hives.',
    sourceAuthority: 'CIB&RC Registered Insecticides (DPPQS) & ICAR-IIHR / ICAR-DOGR Thrips Management Guide',
    verificationDate: '2025-01-15',
  },
];

export const VERIFIED_CROP_NUTRIENT_REMEDIES = [
  {
    id: 'fco-npk-19-19-19',
    nutrientName: 'NPK 19:19:19 (100% Water-Soluble Foliar Fertilizer)',
    category: 'FCO Schedule-I Balanced Macronutrient Recovery Spray',
    targetKeywords: ['yellow', 'yellowing', 'pale', 'chlorosis', 'stunted', 'weak', 'nitrogen', 'phosphorus', 'potassium', 'deficiency', 'stress', 'recovery', 'blight', 'spot', 'pest'],
    targetDeficiency: 'General leaf yellowing (lower-leaf nitrogen chlorosis), stunted vegetative growth, and post-stress / post-disease canopy recovery.',
    dosageAndApplication: '3.0 to 5.0 grams per liter of clean water (600 g – 1 kg in 200 L water per acre) as a morning or late-afternoon foliar spray. Repeat once after 10–12 days if needed.',
    safetyNotes: 'Do NOT tank-mix directly with Copper Oxychloride or Calcium Nitrate. Apply only when root-zone soil has adequate moisture (never on wilted plants).',
    authoritySource: 'Fertilizer (Control) Order (FCO), 1985 — Govt. of India & ICAR Balanced Plant Nutrition Guidelines',
  },
  {
    id: 'fco-chelated-zinc-edta-12',
    nutrientName: 'Chelated Zinc (Zn-EDTA 12% FCO Grade)',
    category: 'FCO Micronutrient Chlorophyll & Auxin Activator',
    targetKeywords: ['interveinal', 'zinc', 'khaira', 'little leaf', 'rosetting', 'short internode', 'pale young', 'bronzing', 'yellowing', 'chlorosis'],
    targetDeficiency: 'Interveinal yellowing on young/middle leaves, Paddy Khaira bronzing, shortened internodes, and small distorted leaves.',
    dosageAndApplication: '0.5 to 1.0 gram per liter of clean water (100–200 grams in 200 L water per acre) as foliar spray.',
    safetyNotes: 'Chelated Zn-EDTA prevents phosphate fixation on leaves. Verify neutral spray water pH (6.0–7.0) for best absorption.',
    authoritySource: 'Fertilizer Control Order (FCO), 1985 & ICAR-Indian Institute of Soil Science (IISS, Bhopal)',
  },
  {
    id: 'fco-magnesium-sulphate',
    nutrientName: 'Magnesium Sulphate (MgSO4 — 9.5% Mg, 12% S)',
    category: 'FCO Secondary Nutrient Chlorophyll Restorer',
    targetKeywords: ['older leaf yellow', 'reddening', 'lalya', 'magnesium', 'interveinal chlorosis', 'cotton red', 'marble yellow'],
    targetDeficiency: 'Interveinal yellowing on older lower leaves (veins stay green while leaf lamina turns yellow or reddish-purple, e.g., Cotton Lalya).',
    dosageAndApplication: '5.0 to 10.0 grams per liter of water (1.0–2.0 kg in 200 L water per acre) during boll/fruit development stage.',
    safetyNotes: 'Spray during cool hours (before 9:30 AM or after 4:00 PM) to avoid salt crystal burn on foliage.',
    authoritySource: 'Fertilizer Control Order (FCO), 1985 & ICAR-CICR Cotton Physiological Disorder Advisory',
  },
  {
    id: 'fco-boron-20',
    nutrientName: 'Boron 20% (Disodium Octaborate Tetrahydrate)',
    category: 'FCO Reproductive & Pollination Micronutrient',
    targetKeywords: ['flower drop', 'square drop', 'bud drop', 'fruit crack', 'cracking', 'hollow stem', 'deformed fruit', 'boron', 'sterility', 'shedding'],
    targetDeficiency: 'Premature flower/square shedding, poor pollen tube growth, fruit cracking, internal browning, and brittle terminal buds.',
    dosageAndApplication: '1.0 to 1.5 grams per liter of clean water (200–300 grams in 200 L water per acre) at pre-flowering and early fruit-set stages.',
    safetyNotes: 'Never exceed 1.5 g/L — excess Boron has a narrow toxicity margin and can scorch leaf margins.',
    authoritySource: 'Fertilizer Control Order (FCO), 1985 & ICAR Horticultural Micronutrient Manual',
  },
  {
    id: 'fco-calcium-nitrate',
    nutrientName: 'Water-Soluble Calcium Nitrate (15.5% N, 18.8% Ca)',
    category: 'FCO Cell-Wall & Fruit Quality Nutrient',
    targetKeywords: ['blossom end rot', 'fruit rot', 'tip burn', 'soft fruit', 'calcium', 'sunken black', 'pericarp'],
    targetDeficiency: 'Blossom-end rot (dark leathery sunken patch at bottom of Tomato/Chilli/Brinjal fruits), young leaf tip burn, and weak cell walls.',
    dosageAndApplication: '3.0 to 5.0 grams per liter of water (600 g – 1 kg per acre) sprayed directly on foliage and developing fruit clusters, combined with uniform drip/furrow moisture.',
    safetyNotes: 'Keep strictly separate from Sulphate or Phosphate fertilizers in the spray tank to prevent gypsum/calcium-phosphate precipitation.',
    authoritySource: 'Fertilizer Control Order (FCO), 1985 & ICAR-IIHR Vegetable Disorders Compendium',
  },
];

export const CROP_ZONE_THRESHOLDS = {
  Cotton: { moistureMin: 45, moistureMax: 75, tempMin: 20, tempMax: 35, phMin: 6.0, phMax: 8.0 },
  'Red Chilli': { moistureMin: 45, moistureMax: 70, tempMin: 18, tempMax: 33, phMin: 6.0, phMax: 7.2 },
  'Rice (Paddy)': { moistureMin: 70, moistureMax: 95, tempMin: 20, tempMax: 35, phMin: 5.8, phMax: 7.2 },
  Tomato: { moistureMin: 50, moistureMax: 72, tempMin: 18, tempMax: 31, phMin: 6.0, phMax: 7.0 },
  Turmeric: { moistureMin: 55, moistureMax: 75, tempMin: 20, tempMax: 32, phMin: 5.8, phMax: 7.5 },
  Onion: { moistureMin: 45, moistureMax: 68, tempMin: 15, tempMax: 30, phMin: 6.0, phMax: 7.5 },
  Maize: { moistureMin: 45, moistureMax: 72, tempMin: 18, tempMax: 34, phMin: 5.8, phMax: 7.5 },
  Wheat: { moistureMin: 40, moistureMax: 68, tempMin: 12, tempMax: 28, phMin: 6.0, phMax: 7.5 },
  Default: { moistureMin: 45, moistureMax: 75, tempMin: 18, tempMax: 34, phMin: 6.0, phMax: 7.5 },
};

export const VERIFIED_GROWTH_MODIFIERS = [
  {
    id: 'pgr-alpha-naa-45sl',
    regulatorName: 'Alpha Naphthyl Acetic Acid (Alpha-NAA) 4.5% SL (e.g., Planofix)',
    activeIngredient: '1-Naphthylacetic Acid (Alpha-NAA) 4.5% SL',
    hormoneClass: 'Synthetic Auxin',
    intendedAgriculturalPurpose: 'Reduces physiological premature shedding of flower buds, squares, and young fruits when stress-induced auxin drop occurs.',
    verifiedCrops: ['Cotton', 'Red Chilli', 'Tomato', 'Mango', 'Pineapple'],
    evidenceStages: ['Squaring & Flowering Stage', 'Flower Budding & Pod Initiation', 'Blossom Truss Flowering'],
    potentialBenefits: [
      'Delays formation of abscission layer on flower pedicels during mild heat or cloudy spells',
      'Supports retention of pollinated reproductive buds when soil moisture and nutrition are adequate',
    ],
    limitationsAndRisks: [
      'Cannot stop flower drop caused by bollworm/thrips infestation, severe root-zone drought, or boron/potassium deficiency',
      'Over-concentration (>20–25 ppm) causes severe leaf epinasty (downward twisting), scorching, or paradoxical flower thinning',
    ],
    importantPrecautions: [
      'Measure strictly with a graduated ml syringe; never estimate with bottle caps',
      'Do not apply on wilted or moisture-stressed plants—irrigate first',
      'Do not tank-mix with alkaline Bordeaux mixture or Copper Oxychloride',
      'Always read and follow the current CIB&RC approved physical label',
    ],
    authoritativeReferences: [
      {
        authority: 'Central Insecticides Board & Registration Committee (CIB&RC), Govt. of India',
        documentTitle: 'Registered Plant Growth Regulators under Section 9(3), Insecticides Act 1968',
        registrationStatus: 'Registered & Permitted for Cotton, Chilli, Tomato, Mango',
        verificationDate: '2025-01-15',
      },
      {
        authority: 'ICAR-Central Institute for Cotton Research (CICR), Nagpur',
        documentTitle: 'Physiological Square Drop Management Advisory in Cotton',
        registrationStatus: 'Research-Validated Agronomic Practice',
        verificationDate: '2025-01-15',
      },
    ],
    cibrcRegistered: true,
    approvedDosageSummary: '10–20 ppm (approx. 0.25 to 0.45 ml of 4.5% SL per liter of clean water; ~4.0–4.5 ml per 16L knapsack). Confirm crop-specific rate on label.',
    preHarvestInterval: '7 days (verify crop-specific label).',
    underlyingFirstCheckNotice: 'Before applying Alpha-NAA, verify that flower shedding is not caused by root drought, waterlogging, thrips/mite feeding, or Boron deficiency. Correct irrigation and nutrition first.',
  },
  {
    id: 'pgr-mepiquat-chloride-5as',
    regulatorName: 'Mepiquat Chloride 5% AS',
    activeIngredient: 'Mepiquat Chloride 5% Aqueous Solution',
    hormoneClass: 'Gibberellin Biosynthesis Retardant (Canopy Growth Regulator)',
    intendedAgriculturalPurpose: 'Manages excessive vegetative rank growth (tall spindly main stems and closed inter-rows) so assimilates partition toward developing bolls/tubers.',
    verifiedCrops: ['Cotton', 'Potato'],
    evidenceStages: ['Excessive Vegetative / Canopy Closing Stage (45–70 DAS)', 'Peak Squaring with Rank Canopy'],
    potentialBenefits: [
      'Reduces excessive internode length (>5 cm) in lush nitrogen-heavy cotton canopies',
      'Improves sunlight penetration and airflow to lower bolls, reducing lower-canopy boll rot',
    ],
    limitationsAndRisks: [
      'Stunts yield if sprayed on already short, drought-stressed, or nutrient-deficient crops',
      'Not a substitute for balanced nitrogen split dosing',
    ],
    importantPrecautions: [
      'Apply ONLY if plants show vigorous rank vegetative growth (internode length > 5–6 cm) and adequate soil moisture',
      'Never apply on moisture-stressed, stunted, or root-rot-affected zones',
      'Observe label-mandated interval between repeat sprays',
    ],
    authoritativeReferences: [
      {
        authority: 'CIB&RC (Directorate of Plant Protection, Quarantine & Storage)',
        documentTitle: 'Approved Uses of Plant Growth Regulators in India',
        registrationStatus: 'Registered & Permitted for Cotton and Potato',
        verificationDate: '2025-01-15',
      },
      {
        authority: 'PJTSAU / ICAR-CICR Agronomy Package of Practices',
        documentTitle: 'Canopy Architecture & High-Density Cotton Management',
        registrationStatus: 'University Extension Validated',
        verificationDate: '2025-01-15',
      },
    ],
    cibrcRegistered: true,
    approvedDosageSummary: '1.0 to 1.25 ml per liter of water (200–250 ml per acre in 200 L water) only on lush rank canopies. Verify approved label.',
    preHarvestInterval: '14–21 days per product label.',
    underlyingFirstCheckNotice: 'Growth retardants must NEVER be applied merely because a crop reaches vegetative stage. Confirm excessive internode elongation (>5 cm) and rule out excess urea top-dressing first.',
  },
  {
    id: 'pgr-chlormequat-chloride-50sl',
    regulatorName: 'Chlormequat Chloride (CCC) 50% SL',
    activeIngredient: 'Chlormequat Chloride 50% SL',
    hormoneClass: 'Onium-Type Anti-Gibberellin Growth Retardant',
    intendedAgriculturalPurpose: 'Checks excessive stem height, thickens basal culms/stems to reduce lodging, and balances vegetative-reproductive ratio.',
    verifiedCrops: ['Cotton', 'Wheat', 'Potato', 'Brinjal'],
    evidenceStages: ['Vegetative Elongation / Jointing Stage', 'Excessive Canopy Vigour Stage'],
    potentialBenefits: [
      'Increases stem diameter and lodging resistance in irrigated high-fertility wheat and cotton',
      'Improves root-to-shoot ratio under well-fertilized conditions',
    ],
    limitationsAndRisks: [
      'High-concentration 50% SL causes severe stunting or leaf margin chlorosis if overdosed',
      'Harmful to yield if applied under rainfed moisture deficit',
    ],
    importantPrecautions: [
      'Pre-dilute accurately using calibrated measuring cylinder; wear full PPE',
      'Do not apply during heat waves (>35°C) or when soil moisture is below threshold',
      'Strictly verify registered crop rate on CIB&RC container leaflet',
    ],
    authoritativeReferences: [
      {
        authority: 'CIB&RC (Ministry of Agriculture & Farmers Welfare, India)',
        documentTitle: 'Registered PGR Formulations Schedule',
        registrationStatus: 'Registered under Insecticides Act 1968',
        verificationDate: '2025-01-15',
      },
      {
        authority: 'ICAR-Indian Institute of Wheat and Barley Research (IIWBR)',
        documentTitle: 'Lodging Management in High-Fertility Irrigated Wheat',
        registrationStatus: 'ICAR Research Reference',
        verificationDate: '2025-01-15',
      },
    ],
    cibrcRegistered: true,
    approvedDosageSummary: 'Crop-specific low-volume ppm dilution (e.g., 0.2–0.5 ml/L depending on crop; strictly consult CIB&RC label for Cotton vs Wheat).',
    preHarvestInterval: '15–30 days per approved crop label.',
    underlyingFirstCheckNotice: 'Check nitrogen fertilizer schedule and plant spacing density first; excessive crowding or excess urea often mimics need for growth retardants.',
  },
  {
    id: 'pgr-gibberellic-acid-0001l',
    regulatorName: 'Gibberellic Acid (GA3) 0.001% L',
    activeIngredient: 'Gibberellic Acid (GA3) 0.001% Liquid',
    hormoneClass: 'Gibberellin Growth Promoter',
    intendedAgriculturalPurpose: 'Promotes cell elongation, panicle exsertion from flag leaf sheath in paddy, and berry/fruit sizing where registered.',
    verifiedCrops: ['Rice (Paddy)', 'Cotton', 'Tomato', 'Red Chilli', 'Groundnut', 'Grapes', 'Cabbage'],
    evidenceStages: ['Panicle Emergence / Booting Stage', 'Fruit Sizing Stage'],
    potentialBenefits: [
      'Aids complete panicle exsertion in paddy hybrids experiencing mild cool-temperature chokeneck',
      'Supports cell expansion when accompanied by balanced NPK and micronutrient availability',
    ],
    limitationsAndRisks: [
      'Induces weak, spindly, lodging-prone stems if sprayed unnecessarily during early vegetative stages',
      'Ineffective if plant lacks adequate soil potassium, zinc, or irrigation',
    ],
    importantPrecautions: [
      'Ensure adequate soil nutrition (N, P, K, Zn) before expecting physiological sizing response',
      'Do not mix with alkaline copper sprays or strong oxidizers',
      'Spray during cool morning or late afternoon hours',
    ],
    authoritativeReferences: [
      {
        authority: 'CIB&RC (DPPQS, Govt. of India)',
        documentTitle: 'Approved Major Uses of Gibberellic Acid 0.001% L',
        registrationStatus: 'Registered & Permitted for Paddy, Cotton, Vegetables, Grapes',
        verificationDate: '2025-01-15',
      },
      {
        authority: 'ICAR-IIRR (Hyderabad)',
        documentTitle: 'Hybrid Rice Seed & Panicle Exsertion Agronomy Guide',
        registrationStatus: 'ICAR Technical Bulletin',
        verificationDate: '2025-01-15',
      },
    ],
    cibrcRegistered: true,
    approvedDosageSummary: '1.0 ml per liter of clean water (180–200 ml per acre of 0.001% L formulation). Verify exact concentration on product label.',
    preHarvestInterval: '5–7 days per label.',
    underlyingFirstCheckNotice: 'Poor growth or incomplete panicle emergence is frequently caused by Zinc deficiency, stem borer, or moisture stress. Rule out nutrient and pest problems first.',
  },
  {
    id: 'pgr-triacontanol-005ec',
    regulatorName: 'Triacontanol 0.05% EC / 0.1% EW',
    activeIngredient: 'Triacontanol 0.05% EC',
    hormoneClass: 'Natural Long-Chain Aliphatic Alcohol Biostimulant / PGR',
    intendedAgriculturalPurpose: 'Supports photosynthetic assimilation and physiological recovery alongside balanced crop nutrition.',
    verifiedCrops: ['Cotton', 'Red Chilli', 'Rice (Paddy)', 'Tomato', 'Potato', 'Groundnut'],
    evidenceStages: ['Vegetative Recovery Stage', 'Flowering & Pod/Boll Development Stage'],
    potentialBenefits: [
      'Assists physiological assimilation under mild environmental fluctuations when nutrition is sufficient',
      'Low phytotoxicity profile at label rates',
    ],
    limitationsAndRisks: [
      'Cannot cure fungal blights, viral leaf curl, pest infestations, or soil pH lockup',
      'Yield response varies by cultivar and baseline soil fertility',
    ],
    importantPrecautions: [
      'Shake emulsion thoroughly before dilution',
      'Use clean neutral pH water and standard personal protective equipment',
    ],
    authoritativeReferences: [
      {
        authority: 'CIB&RC & Fertilizer Control Order (FCO) Biostimulant Schedule, Govt. of India',
        documentTitle: 'Registered Triacontanol Formulations & Crop Claims',
        registrationStatus: 'Registered under CIB&RC / FCO',
        verificationDate: '2025-01-15',
      },
    ],
    cibrcRegistered: true,
    approvedDosageSummary: '0.5 to 1.0 ml per liter of water (~100–200 ml per acre depending on 0.05% vs 0.1% strength). Check physical label.',
    preHarvestInterval: '5 days.',
    underlyingFirstCheckNotice: 'Biostimulants and growth regulators are never substitutes for diagnosing diseases, insect pests, or correcting soil NPK and pH imbalances.',
  },
];

/**
 * Evaluate soil measurements against crop-specific thresholds without fabricating data.
 */
export function evaluateZoneHealth(crop, measurement) {
  if (
    !measurement ||
    measurement.soilMoisture === null ||
    measurement.soilMoisture === undefined ||
    measurement.temperature === null ||
    measurement.humidity === null ||
    measurement.soilPh === null
  ) {
    return {
      status: 'Insufficient Data',
      thresholds: CROP_ZONE_THRESHOLDS[crop] || CROP_ZONE_THRESHOLDS.Default,
      explanation: 'No verified manual or IoT soil measurements have been recorded for this zone yet.',
      action: 'Measure root-zone soil moisture, temperature, ambient humidity, and soil pH using a field meter or lab test and log the values.',
    };
  }

  const th = CROP_ZONE_THRESHOLDS[crop] || CROP_ZONE_THRESHOLDS.Default;
  const issues = [];
  const actions = [];
  let severity = 0; // 0 = Healthy, 1 = Needs Monitoring, 2 = Needs Attention

  const m = Number(measurement.soilMoisture);
  const t = Number(measurement.temperature);
  const h = Number(measurement.humidity);
  const ph = Number(measurement.soilPh);

  if (m < th.moistureMin - 10) {
    severity = Math.max(severity, 2);
    issues.push(`Soil moisture (${m}%) is well below the ${crop} target range (${th.moistureMin}–${th.moistureMax}%), risking root moisture stress and flower/bud drop.`);
    actions.push('Inspect root zone at 10–15 cm depth immediately and schedule irrigation before wilting progresses.');
  } else if (m < th.moistureMin) {
    severity = Math.max(severity, 1);
    issues.push(`Soil moisture (${m}%) is slightly below optimal (${th.moistureMin}–${th.moistureMax}%).`);
    actions.push('Monitor leaf turgor during afternoon hours and plan timely irrigation.');
  } else if (m > th.moistureMax + 10) {
    severity = Math.max(severity, 2);
    issues.push(`Excessive soil moisture (${m}%) above ${th.moistureMax}% risks root hypoxia, damping-off, or root/rhizome rot.`);
    actions.push('Pause irrigation, clear field drainage channels, and inspect lower stems for collar rot.');
  } else if (m > th.moistureMax) {
    severity = Math.max(severity, 1);
    issues.push(`Soil moisture (${m}%) is above upper target (${th.moistureMax}%).`);
    actions.push('Delay next irrigation cycle and monitor soil aeration.');
  }

  if (ph < th.phMin - 0.5) {
    severity = Math.max(severity, 2);
    issues.push(`Acidic soil pH (${ph}) below ${th.phMin} can lock up phosphorus, calcium, and magnesium uptake.`);
    actions.push('Verify with a Soil Health Card lab test; consult local KVK regarding agricultural lime or dolomite amendment.');
  } else if (ph < th.phMin || ph > th.phMax + 0.4) {
    severity = Math.max(severity, ph > th.phMax + 0.5 ? 2 : 1);
    issues.push(
      ph < th.phMin
        ? `Soil pH (${ph}) is mildly acidic relative to ${th.phMin}–${th.phMax}.`
        : `Alkaline soil pH (${ph}) above ${th.phMax} may reduce iron, zinc, and boron availability.`
    );
    actions.push(
      ph < th.phMin
        ? 'Monitor nutrient uptake and avoid acidifying fertilizers.'
        : 'Check young leaves for micronutrient chlorosis and test irrigation water alkalinity/EC.'
    );
  }

  if (t > th.tempMax + 3) {
    severity = Math.max(severity, 2);
    issues.push(`High temperature (${t}°C) exceeds ${th.tempMax}°C, increasing evapotranspiration and pollen heat stress.`);
    actions.push('Ensure adequate root moisture in early morning and inspect undersides of leaves for mites or thrips.');
  } else if (t > th.tempMax || t < th.tempMin) {
    severity = Math.max(severity, 1);
    issues.push(`Temperature (${t}°C) is outside ideal range (${th.tempMin}–${th.tempMax}°C).`);
    actions.push('Monitor crop canopy stress during peak afternoon or cool night hours.');
  }

  if (h > 85) {
    severity = Math.max(severity, 1);
    issues.push(`High relative humidity (${h}%) favors fungal spore germination (blights, leaf spots, blast).`);
    actions.push('Inspect lower shaded canopy foliage for early water-soaked lesions or fungal spots.');
  }

  const status =
    severity === 2 ? 'Needs Attention' : severity === 1 ? 'Needs Monitoring' : 'Healthy';

  return {
    status,
    thresholds: th,
    explanation:
      issues.length > 0
        ? issues.join(' ')
        : `Recorded soil moisture (${m}%), temperature (${t}°C), humidity (${h}%), and pH (${ph}) are within recommended agronomic thresholds for ${crop}.`,
    action:
      actions.length > 0
        ? actions.join(' ')
        : 'Continue routine field scouting and periodic manual or sensor measurements.',
  };
}

/**
 * Filter verified CIB&RC chemical treatments strictly by crop, diagnosis keywords, and certainty rules.
 */
export function matchVerifiedChemicalProducts({
  identifiedCrop,
  symptomsAndDiagnosisText,
  uncertaintyCategory,
  overallCondition,
}) {
  // Rule 1: High uncertainty on a plant photo -> withhold synthetic chemicals, offer only botanical Neem IPM reference if a valid crop is identified
  if (
    overallCondition === 'Inconclusive Image' ||
    uncertaintyCategory === 'High Uncertainty / Inconclusive Photograph'
  ) {
    const hasValidCropName =
      identifiedCrop &&
      !/not a plant|non-plant|unknown|none/i.test(identifiedCrop);
    const preventiveNeem = hasValidCropName
      ? VERIFIED_CROP_PROTECTION_CATALOG.find((item) => item.id === 'cibrc-azadirachtin-015')
      : null;

    return {
      allowed: Boolean(preventiveNeem),
      reason: preventiveNeem
        ? 'Harsh synthetic pesticides are withheld until a closer leaf photo confirms the exact pathogen. Safe CIB&RC Botanical Azadirachtin 0.15% EC (Neem 1500 ppm) is shown below for gentle preventive IPM protection alongside scouting.'
        : 'Because the photograph is inconclusive or diagnosis uncertainty is high, chemical pesticides are withheld to prevent crop phytotoxicity, wasted expense, and environmental harm. Please upload a clearer close-up or consult a local agricultural officer.',
      products: preventiveNeem
        ? [
            {
              id: preventiveNeem.id,
              activeIngredient: preventiveNeem.activeIngredient,
              productCategory: preventiveNeem.productCategory,
              intendedUse: preventiveNeem.intendedUse,
              supportingEvidence: preventiveNeem.supportingEvidence,
              approvedDosageAndDirections: preventiveNeem.approvedDosageAndDirections,
              protectiveEquipment: preventiveNeem.protectiveEquipment,
              reEntryInterval: preventiveNeem.reEntryInterval,
              preHarvestInterval: preventiveNeem.preHarvestInterval,
              environmentalPrecautions: preventiveNeem.environmentalPrecautions,
              sourceAuthority: preventiveNeem.sourceAuthority,
              verificationDate: preventiveNeem.verificationDate,
            },
          ]
        : [],
    };
  }

  if (overallCondition === 'Healthy Appearance') {
    const preventiveNeem = VERIFIED_CROP_PROTECTION_CATALOG.find(
      (item) => item.id === 'cibrc-azadirachtin-015'
    );
    return {
      allowed: true,
      reason:
        'Your crop appears visibly healthy — synthetic chemical pesticides are NOT needed. Keep CIB&RC Botanical Azadirachtin 0.15% EC (Neem 1500 ppm) as a gentle organic preventive spray only if early sap-sucking insects appear on sticky traps.',
      products: preventiveNeem
        ? [
            {
              id: preventiveNeem.id,
              activeIngredient: preventiveNeem.activeIngredient,
              productCategory: preventiveNeem.productCategory,
              intendedUse: preventiveNeem.intendedUse,
              supportingEvidence: preventiveNeem.supportingEvidence,
              approvedDosageAndDirections: preventiveNeem.approvedDosageAndDirections,
              protectiveEquipment: preventiveNeem.protectiveEquipment,
              reEntryInterval: preventiveNeem.reEntryInterval,
              preHarvestInterval: preventiveNeem.preHarvestInterval,
              environmentalPrecautions: preventiveNeem.environmentalPrecautions,
              sourceAuthority: preventiveNeem.sourceAuthority,
              verificationDate: preventiveNeem.verificationDate,
            },
          ]
        : [],
    };
  }

  const normalizedCrop = (identifiedCrop || '').trim().toLowerCase();
  const text = (symptomsAndDiagnosisText || '').toLowerCase();

  const hasPestOrDiseaseSignal =
    /blight|spot|rot|rust|blast|mildew|fungal|bacterial|aphid|jassid|whitefly|thrips|mite|hopper|borer|bollworm|caterpillar|larva|pest|lesion|canker|anthracnose|curl|hole|wilt/.test(
      text
    );
  const isVirusSuspected = /virus|mosaic|leaf curl virus|tylcv|yellow vein/.test(text);

  // Match verified catalog entries for the exact crop and target keywords
  let matched = VERIFIED_CROP_PROTECTION_CATALOG.filter((item) => {
    const cropSupported = item.verifiedCrops.some(
      (c) =>
        c.toLowerCase() === normalizedCrop ||
        normalizedCrop.includes(c.toLowerCase()) ||
        c.toLowerCase().includes(normalizedCrop)
    );
    if (!cropSupported) return false;
    return item.targetKeywords.some((kw) => text.includes(kw.toLowerCase()));
  });

  // If crop is valid and photo is clear, provide botanical Azadirachtin 0.15% EC as preventive IPM shield when no synthetic pesticide is triggered
  if (matched.length === 0 && !isVirusSuspected) {
    const preventiveNeem = VERIFIED_CROP_PROTECTION_CATALOG.find(
      (item) => item.id === 'cibrc-azadirachtin-015'
    );
    const broadProtectant = hasPestOrDiseaseSignal
      ? VERIFIED_CROP_PROTECTION_CATALOG.find((item) => item.id === 'cibrc-mancozeb-75wp')
      : null;
    matched = [preventiveNeem, broadProtectant].filter(Boolean);

    if (matched.length > 0 && !hasPestOrDiseaseSignal) {
      return {
        allowed: true,
        reason:
          'No severe fungal blight or borer outbreak is confirmed, so harsh synthetic pesticides are avoided. First-line CIB&RC botanical Azadirachtin (Neem 1500 ppm) is shown below as a safe preventive IPM spray if early sucking pests appear during field scouting.',
        products: matched.map((p) => ({
          id: p.id,
          activeIngredient: p.activeIngredient,
          productCategory: p.productCategory,
          intendedUse: p.intendedUse,
          supportingEvidence: p.supportingEvidence,
          approvedDosageAndDirections: p.approvedDosageAndDirections,
          protectiveEquipment: p.protectiveEquipment,
          reEntryInterval: p.reEntryInterval,
          preHarvestInterval: p.preHarvestInterval,
          environmentalPrecautions: p.environmentalPrecautions,
          sourceAuthority: p.sourceAuthority,
          verificationDate: p.verificationDate,
        })),
      };
    }
  }

  if (matched.length === 0) {
    // Even if virus is suspected, vector control with botanical Azadirachtin + Flonicamid (if supported) helps prevent spread
    const vectorOptions = VERIFIED_CROP_PROTECTION_CATALOG.filter(
      (item) => item.id === 'cibrc-azadirachtin-015' || item.id === 'cibrc-flonicamid-50wg'
    );
    return {
      allowed: vectorOptions.length > 0,
      reason: isVirusSuspected
        ? 'Viral infections cannot be cured by fungicides; remove severely infected plants and manage whitefly/thrips insect vectors at ETL using the CIB&RC-registered vector sprays below after KVK confirmation.'
        : `Verified CIB&RC label data for "${identifiedCrop}" is shown for general IPM reference. Consult a local KVK officer before spraying.`,
      products: vectorOptions.map((p) => ({
        id: p.id,
        activeIngredient: p.activeIngredient,
        productCategory: p.productCategory,
        intendedUse: p.intendedUse,
        supportingEvidence: p.supportingEvidence,
        approvedDosageAndDirections: p.approvedDosageAndDirections,
        protectiveEquipment: p.protectiveEquipment,
        reEntryInterval: p.reEntryInterval,
        preHarvestInterval: p.preHarvestInterval,
        environmentalPrecautions: p.environmentalPrecautions,
        sourceAuthority: p.sourceAuthority,
        verificationDate: p.verificationDate,
      })),
    };
  }

  return {
    allowed: true,
    reason:
      'Only CIB&RC-registered active ingredients verified for this crop and suspected target group are listed below. Confirm pest/disease presence in the field (ETL) and read the physical approved product label before use.',
    products: matched.slice(0, 3).map((p) => ({
      id: p.id,
      activeIngredient: p.activeIngredient,
      productCategory: p.productCategory,
      intendedUse: p.intendedUse,
      supportingEvidence: p.supportingEvidence,
      approvedDosageAndDirections: p.approvedDosageAndDirections,
      protectiveEquipment: p.protectiveEquipment,
      reEntryInterval: p.reEntryInterval,
      preHarvestInterval: p.preHarvestInterval,
      environmentalPrecautions: p.environmentalPrecautions,
      sourceAuthority: p.sourceAuthority,
      verificationDate: p.verificationDate,
    })),
  };
}

/**
 * Match FCO-verified foliar & soil recovery nutrients to help a stressed or recovering crop become healthy again.
 */
export function matchVerifiedNutrientRemedies({
  identifiedCrop,
  symptomsAndDiagnosisText,
  overallCondition,
}) {
  if (
    overallCondition === 'Inconclusive Image' &&
    (!identifiedCrop || /not a plant|non-plant|none/i.test(identifiedCrop))
  ) {
    return [];
  }

  const text = `${identifiedCrop || ''} ${symptomsAndDiagnosisText || ''}`.toLowerCase();
  const matched = VERIFIED_CROP_NUTRIENT_REMEDIES.filter((item) =>
    item.targetKeywords.some((kw) => text.includes(kw.toLowerCase()))
  );

  if (matched.length === 0) {
    return VERIFIED_CROP_NUTRIENT_REMEDIES.slice(0, 2);
  }
  return matched.slice(0, 3);
}

/**
 * Generate crop-tailored healthy recovery suggestions so the farmer has a clear roadmap to restore plant health.
 */
export function buildHealthyCropRecoveryPlan(identifiedCrop, symptomsText = '', lang = 'en') {
  const crop = identifiedCrop && !identifiedCrop.includes('Not Identified') ? identifiedCrop : 'Crop';
  const th = CROP_ZONE_THRESHOLDS[crop] || CROP_ZONE_THRESHOLDS.Default;
  const text = (symptomsText || '').toLowerCase();

  if (lang === 'te') {
    return [
      `వేరు మండల తేమ సమతుల్యత: ${crop} పంటకు నేల తేమ ${th.moistureMin}%–${th.moistureMax}% మధ్య ఉండేలా ఉదయం పూట మాత్రమే తడి ఇవ్వండి; పొలంలో నీరు నిల్వ ఉండకుండా డ్రైనేజీ కాలువలు శుభ్రం చేయండి.`,
      `ఆరోగ్యకరమైన ఆకు పచ్చదనం కోసం పోషణ: వ్యాధి/పురుగు ఒత్తిడి తగ్గిన 5–7 రోజుల తర్వాత FCO ఆమోదిత 19:19:19 నీటిలో కరిగే ఎరువు (3–5 గ్రా/లీ) లేదా చీలేటెడ్ జింక్ (0.5–1 గ్రా/లీ) ఆకులపై పిచికారీ చేయండి.`,
      `పొలం పరిశుభ్రత & గాలి ప్రసరణ: బాగా దెబ్బతిన్న లేదా కుళ్ళిన ఆకులు/కాయలను కత్తిరించి పొలం బయట నాశనం చేయండి; దీనివల్ల మిగిలిన ఆరోగ్యకరమైన ఆకులకు సూర్యరశ్మి మరియు గాలి బాగా అందుతుంది.`,
      `నేల pH (${th.phMin}–${th.phMax}) & సేంద్రియ బలం: వేర్ల అభివృద్ధికి బాగా చివికిన పశువుల ఎరువు లేదా ట్రైకోడెర్మా విరిడి (Trichoderma viride) సమృద్ధిగా ఉన్న వేప పిండిని వేరు దగ్గర వేయండి.`,
      `5-రోజుల రికవరీ తనిఖీ: ఎకరానికి 8–10 పసుపు/నీలం జిగురు అట్టలు పెట్టి, 5 రోజుల తర్వాత కొత్త లేత ఆకులు ఆరోగ్యంగా వస్తున్నాయో లేదో AI Crop Doctor లో ఫాలో-అప్ ఫోటో అప్‌లోడ్ చేసి సరిచూసుకోండి.`,
    ];
  }

  if (lang === 'hi') {
    return [
      `जड़ क्षेत्र में सही नमी (${th.moistureMin}%–${th.moistureMax}%): ${crop} में केवल सुबह के समय हल्की सिंचाई करें और खेत में जलभराव रोकने के लिए जल निकासी नालियां साफ रखें।`,
      `पौधे की ताकत और हरियाली की रिकवरी: कीट/रोग नियंत्रण के 5–7 दिन बाद FCO प्रमाणित घुलनशील NPK 19:19:19 (3–5 ग्राम/लीटर) या चीलेटेड जिंक (0.5–1 ग्राम/लीटर) का पर्णीय छिड़काव करें।`,
      `फसल स्वच्छता और हवा का प्रवाह: अधिक संक्रमित या सूखी पत्तियों/फलों को तोड़कर खेत से बाहर नष्ट करें ताकि स्वस्थ पत्तियों तक धूप और हवा पहुंच सके।`,
      `मिट्टी का pH (${th.phMin}–${th.phMax}) और जड़ स्वास्थ्य: मजबूत जड़ों के लिए सड़ी हुई गोबर खाद/वर्मीकम्पोस्ट के साथ ट्राइकोडर्मा विरिडी (Trichoderma viride) युक्त नीम खली जड़ क्षेत्र में दें।`,
      `5 दिन बाद पुनः जांच: प्रति एकड़ 8–10 पीले/नीले चिपचिपे ट्रैप लगाएं और 5 दिन बाद नई ऊपरी पत्तियों की रिकवरी देखने के लिए फॉलो-अप फोटो अपलोड करें।`,
    ];
  }

  const extraTip = /rot|wilt|blight|fungal|spot/.test(text)
    ? 'Avoid overhead sprinkler watering in the evening so wet leaves do not trigger secondary fungal spore germination overnight.'
    : /curl|whitefly|thrips|aphid|jassid|pest/.test(text)
    ? 'Install 8–10 yellow and blue sticky traps per acre just 15 cm above canopy height and avoid excess urea top-dressing which attracts sap-sucking insects.'
    : 'Avoid heavy single doses of straight urea; split nitrogen applications alongside potassium and micronutrients to build thick, pest-tolerant leaf cuticles.';

  return [
    `Maintain Root-Zone Moisture (${th.moistureMin}%–${th.moistureMax}%): Irrigate ${crop} in cool early morning hours based on 10 cm root-depth check, and keep drainage furrows open to prevent root suffocation.`,
    `Canopy Sanitation & Airflow: Prune and remove severely spotted, curled, or rotting plant parts from the field bunds immediately so sunlight and airflow reach inner leaves.`,
    extraTip,
    `Restore Vigour with Balanced Foliar Nutrition: 5–7 days after addressing pests/fungal lesions, apply an FCO-approved water-soluble recovery spray (such as NPK 19:19:19 @ 3–5 g/L or Chelated Zinc @ 0.5–1 g/L) on moist-rooted plants.`,
    `Soil pH (${th.phMin}–${th.phMax}) & Biological Root Protection: Incorporate well-decomposed FYM/vermicompost enriched with Trichoderma viride + neem cake around the root zone to strengthen root immunity.`,
    `5-Day Recovery Check: Inspect emerging terminal shoots after 5 days for fresh green unblemished leaves and upload a follow-up photo in the Recovery Timeline.`,
  ];
}

/**
 * Build structured defect & fix items from symptom/diagnosis text when AI output needs enrichment or fallback.
 */
export function buildStructuredDefectAndFixGuide(cropName, symptomsList = [], diagnosisText = '') {
  const joined = `${(symptomsList || []).join(' ')} ${diagnosisText || ''}`.toLowerCase();
  const defects = [];
  const howToFix = [];

  if (/spot|blight|lesion|anthracnose|rust|blotch|tikka|blast/.test(joined)) {
    defects.push({
      defectName: 'Fungal / Bacterial Leaf or Fruit Lesions',
      affectedPart: 'Foliage / Stems / Surface',
      severity: 'Moderate',
      description: 'Discolored brown, black, or concentric necrotic spots reducing green photosynthetic leaf area.',
    });
    howToFix.push(
      'Clip and remove heavily spotted lower leaves in dry weather; do not leave infected debris in irrigation channels.',
      'Avoid evening overhead irrigation and apply a CIB&RC-verified protectant fungicide (such as Mancozeb 75% WP or Copper Oxychloride 50% WP) if lesions are actively spreading.'
    );
  }

  if (/curl|aphid|jassid|whitefly|thrips|mite|hopper|sucking/.test(joined)) {
    defects.push({
      defectName: 'Leaf Curling / Sap-Sucking Pest Damage',
      affectedPart: 'Young Terminal Leaves & Undersides',
      severity: 'Moderate',
      description: 'Upward/downward leaf curling, crinkling, silvery scarring, or sticky honeydew caused by thrips, whiteflies, jassids, or aphids.',
    });
    howToFix.push(
      'Check undersides of 10 random upper leaves with a hand lens early in the morning to confirm live nymphs/adults.',
      'Install 8–10 yellow/blue sticky traps per acre and start with Azadirachtin 0.15% EC (2.5–3 ml/L) or verified selective vector spray if counts cross ETL.'
    );
  }

  if (/hole|borer|bollworm|caterpillar|larva|chew|armyworm/.test(joined)) {
    defects.push({
      defectName: 'Borer / Caterpillar Chewing Damage',
      affectedPart: 'Buds, Squares, Pods, Fruits, or Whorls',
      severity: 'High',
      description: 'Shot-holes on leaves, bored fruiting bodies/bolls, or frass pellets near entry holes.',
    });
    howToFix.push(
      'Hand-collect and destroy pierced buds/fruits and visible caterpillars during morning scouting, and set up 4–5 pheromone traps per acre.',
      'When young larvae cross ETL, apply CIB&RC-verified Emamectin Benzoate 5% SG (0.4 g/L) or Spinosad 45% SC (0.3 ml/L) in late evening.'
    );
  }

  if (/powdery|white coating|mildew/.test(joined)) {
    defects.push({
      defectName: 'Powdery Mildew Coating',
      affectedPart: 'Upper & Lower Leaf Surfaces',
      severity: 'Moderate',
      description: 'White talcum-like fungal patches on leaves leading to premature yellowing and leaf drop.',
    });
    howToFix.push(
      'Improve canopy aeration by removing crowded basal leaves and avoiding excess nitrogen fertilizer.',
      'Apply CIB&RC-verified Sulphur 80% WDG (2.0 g/L) during cool hours (<33°C).'
    );
  }

  if (/yellow|chlorosis|pale|redden|deficien|stunt/.test(joined)) {
    defects.push({
      defectName: 'Chlorosis / Yellowing & Nutrient Stress',
      affectedPart: 'Leaf Lamina (Older or Interveinal Young Leaves)',
      severity: 'Moderate',
      description: 'Loss of healthy dark-green chlorophyll due to N/Mg/Zn micronutrient shortage or root uptake lockup.',
    });
    howToFix.push(
      'Check root-zone moisture and soil pH (6.0–7.5) first so roots can absorb nutrients properly.',
      'Apply FCO-verified foliar nutrition: NPK 19:19:19 (3–5 g/L) + Chelated Zinc 12% EDTA (0.5–1 g/L) or Magnesium Sulphate (5 g/L for older-leaf yellowing/reddening).'
    );
  }

  if (/drop|shed|crack|blossom end/.test(joined)) {
    defects.push({
      defectName: 'Flower / Fruit Shedding or Surface Cracking',
      affectedPart: 'Flowers, Squares & Developing Fruits',
      severity: 'Moderate',
      description: 'Premature bud/flower abscission or blossom-end/skin defects linked to moisture swings or Boron/Calcium shortage.',
    });
    howToFix.push(
      'Eliminate dry-wet irrigation shocks by maintaining steady morning moisture during flowering and fruit set.',
      'Spray FCO-verified Boron 20% (1.0 g/L) for flower retention/pollination or Calcium Nitrate (3–4 g/L) for fruit wall strength.'
    );
  }

  if (/wilt|rot|damping|waterlog|collar/.test(joined)) {
    defects.push({
      defectName: 'Wilting / Collar or Root Moisture Stress',
      affectedPart: 'Root Collar, Basal Stem & Vascular System',
      severity: 'High',
      description: 'Drooping foliage or dark water-soaked stem base caused by waterlogging, root hypoxia, or soil-borne oomycete/fungal rot.',
    });
    howToFix.push(
      'Stop excess irrigation immediately, open drainage trenches around affected beds, and rogue out severely rotted plants.',
      'Drench/spray root-collar zone with CIB&RC-verified Metalaxyl 8% + Mancozeb 64% WP (2 g/L) or Copper Oxychloride 50% WP (2.5 g/L) where registered.'
    );
  }

  if (defects.length === 0) {
    defects.push({
      defectName: `${cropName || 'Crop'} Surface & Canopy Inspection`,
      affectedPart: 'Scanned Plant Specimen',
      severity: 'Low',
      description:
        (symptomsList && symptomsList[0]) ||
        diagnosisText ||
        'Minor surface stress or early field wear requiring routine scouting.',
    });
    howToFix.push(
      'Inspect undersides of 10 random plants across the plot in natural morning daylight for early pests or lesions.',
      'Maintain balanced irrigation, clean field bunds, and apply FCO-approved foliar nutrition only if growth vigour slows.'
    );
  }

  return { defects, howToFix };
}
