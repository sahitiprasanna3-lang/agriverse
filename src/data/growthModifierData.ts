export type HormoneCategory =
  | 'Auxin (Fruit / Flower Set)'
  | 'Growth Retardant (Canopy Control)'
  | 'Gibberellin (Elongation & Sizing)'
  | 'Cytokinin (Cell Division & Branching)'
  | 'Ethylene (Ripening & Defoliation)';

export interface GrowthRegulator {
  id: string;
  tradeName: string;
  activeIngredient: string;
  chemicalFormula?: string;
  hormoneCategory: HormoneCategory;
  manufacturerExample: string;
  suitableCrops: string[];
  suitableStages: string[];
  primaryBenefit: string;
  detailedBenefits: string[];
  dosage: {
    perLiter: string;
    perKnapsack16L: string;
    perAcreTank200L: string;
    ppmConcentration: string;
  };
  applicationMethod: string;
  idealConditions: {
    timeOfDay: string;
    weatherNote: string;
    rainFastnessHours: number;
  };
  precautions: string[];
  incompatibilities: string[];
  preHarvestIntervalDays: number; // PHI in days
  regulatoryApproval: string;
}

export interface CropStageInfo {
  id: string;
  crop: string;
  stageCode: string;
  stageName: string;
  daysAfterSowing: string;
  description: string;
  identifyingSigns: string[];
  physiologicalGoals: string[];
  recommendedPgrIds: string[];
}

export const CROP_GROWTH_STAGES: CropStageInfo[] = [
  // --- COTTON ---
  {
    id: 'cotton-seedling',
    crop: 'Cotton',
    stageCode: 'COT-S1',
    stageName: 'Seedling & Emergence Stage',
    daysAfterSowing: '0 - 25 DAS',
    description: 'Radicle protrusion, cotyledon unfolding, and development of first 3-4 true leaves. Root taproot anchoring into deep soil.',
    identifyingSigns: [
      'Two heart-shaped cotyledon leaves fully expanded',
      'First true leaf rosette appearing',
      'Stem height between 10 - 20 cm',
    ],
    physiologicalGoals: ['Deep taproot establishment', 'Resistance to early seedling damping-off', 'Vigorous early leaf area index'],
    recommendedPgrIds: ['pgr-humic-seaweed'],
  },
  {
    id: 'cotton-vegetative',
    crop: 'Cotton',
    stageCode: 'COT-S2',
    stageName: 'Early Vegetative & Branching Stage',
    daysAfterSowing: '25 - 45 DAS',
    description: 'Rapid production of main-stem nodes and sympodial (fruiting) branches. Risk of excessive lush vegetative rank growth during heavy rainfall.',
    identifyingSigns: [
      'Square initiation begins at 5th to 7th node',
      'Rapid internode elongation (distance between nodes > 5 cm indicates excessive growth)',
      'Dark green canopy closing across inter-row spaces',
    ],
    physiologicalGoals: ['Controlling excess vegetative rank growth', 'Directing photosynthates into fruiting branch nodes', 'Shortening internode distance'],
    recommendedPgrIds: ['pgr-mepiquat', 'pgr-chlormequat'],
  },
  {
    id: 'cotton-flowering',
    crop: 'Cotton',
    stageCode: 'COT-S3',
    stageName: 'Peak Squaring, Flowering & Boll Setting Stage',
    daysAfterSowing: '45 - 90 DAS',
    description: 'Crucial reproductive phase. White and pink flowers opening daily. Highly vulnerable to flower and tender square shedding caused by temperature spikes or cloudy weather.',
    identifyingSigns: [
      'Candle-shaped flower buds (squares) abundant',
      'Cream-white flowers turning purple-pink after pollination',
      'Tender young bolls setting at lower and middle nodes',
    ],
    physiologicalGoals: ['Arresting square and boll abscission (flower drop)', 'Increasing fertile boll retention per plant by 25-35%', 'Maximizing locule count'],
    recommendedPgrIds: ['pgr-naa-planofix', 'pgr-mepiquat'],
  },
  {
    id: 'cotton-boll-development',
    crop: 'Cotton',
    stageCode: 'COT-S4',
    stageName: 'Boll Bulking & Maturation Stage',
    daysAfterSowing: '90 - 130 DAS',
    description: 'Rapid cell enlargement of cotton fibers within developing bolls. Seed weight and lint micronaire density are established.',
    identifyingSigns: [
      'Large firm green bolls (size of lemon to tennis ball)',
      'Vegetative apex terminates growth',
      'Lower bolls hardening prior to suture cracking',
    ],
    physiologicalGoals: ['Maximizing boll weight & lint staple length', 'Accelerating synchronous boll opening for clean mechanical/manual picking'],
    recommendedPgrIds: ['pgr-ethephon'],
  },

  // --- RED CHILLI ---
  {
    id: 'chilli-transplant',
    crop: 'Red Chilli',
    stageCode: 'CHL-S1',
    stageName: 'Transplanting & Vegetative Canopy Stage',
    daysAfterSowing: '20 - 45 DAT (Days After Transplant)',
    description: 'Root rejuvenation following field planting, lateral bush branching, and canopy framework development.',
    identifyingSigns: [
      '4-6 primary branches emerging from main central stem',
      'Roots spreading 15-20 cm deep in raised bed',
      'Bush height 30 - 45 cm',
    ],
    physiologicalGoals: ['Stimulating multiple lateral tertiary fruiting branches', 'Developing sturdy drought-tolerant root system'],
    recommendedPgrIds: ['pgr-humic-seaweed', 'pgr-cytokinin-ba'],
  },
  {
    id: 'chilli-flowering',
    crop: 'Red Chilli',
    stageCode: 'CHL-S2',
    stageName: 'Star Flower Budding & Pod Formation Stage',
    daysAfterSowing: '45 - 80 DAT',
    description: 'Profuse star-shaped white flowers opening in flushes. High temperature (>35°C) or sudden moisture stress causes 50-70% flower drop if left untreated.',
    identifyingSigns: [
      'White solitary nodding star flowers at axils',
      'Tender green mini-pods emerging from calyx cups',
      'High rate of yellowing dropped buds observed on ground under bush',
    ],
    physiologicalGoals: ['Stopping flower drop via auxin replacement', 'Increasing fruit set per cluster', 'Enhancing capsaicin and pungency synthesis'],
    recommendedPgrIds: ['pgr-naa-planofix', 'pgr-triacontanol'],
  },
  {
    id: 'chilli-ripening',
    crop: 'Red Chilli',
    stageCode: 'CHL-S3',
    stageName: 'Fruit Ripening & Crimson Color Turning Stage',
    daysAfterSowing: '85 - 120 DAT',
    description: 'Green pods synthesizing red carotenoid pigments (capsanthin). Uniform color ripening is necessary for grade-A export and cold storage pricing.',
    identifyingSigns: [
      'Pods transitioning from dark green to brown-orange and bright crimson red',
      'Pod skin thickening with glossy shine',
    ],
    physiologicalGoals: ['Synchronizing 90%+ uniform crimson red ripening for single picking', 'Reducing post-harvest sun-drying days from 12 to 7 days'],
    recommendedPgrIds: ['pgr-ethephon'],
  },

  // --- RICE (PADDY) ---
  {
    id: 'paddy-tillering',
    crop: 'Rice (Paddy)',
    stageCode: 'PAD-S1',
    stageName: 'Active Tillering Stage',
    daysAfterSowing: '20 - 40 DAT',
    description: 'Crown buds generate 15-25 tillers per hill. More productive tillers directly translate to higher panicle yield.',
    identifyingSigns: [
      'Fan-shaped clusters of tillers shooting from base',
      'Rapid leaf area expansion over standing water sheet',
    ],
    physiologicalGoals: ['Maximizing effective productive panicle-bearing tillers', 'Strengthening lower stem base against early lodging'],
    recommendedPgrIds: ['pgr-paclobutrazol', 'pgr-humic-seaweed'],
  },
  {
    id: 'paddy-panicle',
    crop: 'Rice (Paddy)',
    stageCode: 'PAD-S2',
    stageName: 'Panicle Booting & Grain Filling Stage',
    daysAfterSowing: '60 - 90 DAT',
    description: 'Swelling of the boot leaf sheath containing the embryonic panicle, followed by anthesis (heading) and milky grain filling.',
    identifyingSigns: [
      'Flag leaf upright and distended',
      'Emerging green panicles with creamy white anthers',
      'Grains transitioning from milky to soft dough stage',
    ],
    physiologicalGoals: ['Preventing terminal grain sterility / chaffy grains', 'Maximizing 1000-grain test weight (test weight > 22g in BPT-5204)'],
    recommendedPgrIds: ['pgr-gibberellic-acid', 'pgr-triacontanol'],
  },

  // --- TOMATO ---
  {
    id: 'tomato-flowering',
    crop: 'Tomato',
    stageCode: 'TOM-S1',
    stageName: 'Truss Flowering & Fruit Setting Stage',
    daysAfterSowing: '35 - 65 DAT',
    description: 'Yellow blossom trusses opening sequentially. High day temperatures (>32°C) cause pollen desiccation leading to blossom drop and poor pollination.',
    identifyingSigns: [
      'Clusters of 5-8 yellow blossom flowers per truss',
      'Small marble-sized green berries setting at truss base',
    ],
    physiologicalGoals: ['Inducing parthenocarpy and uniform fruit setting', 'Stopping flower shedding caused by heat stress'],
    recommendedPgrIds: ['pgr-naa-planofix', 'pgr-cytokinin-ba'],
  },
  {
    id: 'tomato-ripening',
    crop: 'Tomato',
    stageCode: 'TOM-S2',
    stageName: 'Fruit Enlargement & Color Breaker Stage',
    daysAfterSowing: '65 - 95 DAT',
    description: 'Fruits reaching full commercial size and transitioning through breaker, turning, pink to firm deep red.',
    identifyingSigns: [
      'Fruit shoulder yellow-orange with star breaker color at blossom end',
      'Fruit firm with thick pericarp wall',
    ],
    physiologicalGoals: ['Uniform red color synthesis (lycopene)', 'Tight pericarp firmness to withstand long-distance mandi transport'],
    recommendedPgrIds: ['pgr-ethephon'],
  },
];

export const RESEARCH_GROWTH_REGULATORS: GrowthRegulator[] = [
  {
    id: 'pgr-naa-planofix',
    tradeName: 'Planofix (Alpha NAA 4.5% SL)',
    activeIngredient: '1-Naphthylacetic Acid (Alpha NAA) 4.5% SL',
    chemicalFormula: 'C12H10O2',
    hormoneCategory: 'Auxin (Fruit / Flower Set)',
    manufacturerExample: 'Bayer CropScience / PI Industries',
    suitableCrops: ['Cotton', 'Red Chilli', 'Tomato', 'Brinjal', 'Mango'],
    suitableStages: ['Peak Squaring, Flowering & Boll Setting Stage', 'Star Flower Budding & Pod Formation Stage', 'Truss Flowering & Fruit Setting Stage'],
    primaryBenefit: 'Inhibits formation of abscission zone cells in flower pedicels, arresting 80%+ flower, bud, and square drop.',
    detailedBenefits: [
      'Replaces natural auxin depleted during heat, drought, or heavy overcast cloud cover',
      'Significantly improves fruit set percentage from 40% up to 75-80%',
      'Stimulates cell division in ovule for plumper, heavier bolls and pods',
      'Provides quick systemic response within 18-24 hours after foliar absorption',
    ],
    dosage: {
      perLiter: '0.25 to 0.45 ml per Liter (1 ml in 4.5 L water)',
      perKnapsack16L: '4.0 ml to 4.5 ml in 16 Liter sprayer pump (DO NOT OVERDOSE)',
      perAcreTank200L: '45 ml to 50 ml in 200 Liter drum per acre',
      ppmConcentration: '10 to 20 PPM (Strict maximum: 20 PPM)',
    },
    applicationMethod: 'Fine foliar mist directed onto newly opened flower clusters and terminals.',
    idealConditions: {
      timeOfDay: 'Early Morning (6:30 AM - 9:30 AM) or Late Afternoon (4:30 PM - 6:30 PM)',
      weatherNote: 'Avoid spraying at midday when temperature exceeds 34°C. Ensure soil has adequate root moisture.',
      rainFastnessHours: 3,
    },
    precautions: [
      'CRITICAL: Strict dosage adherence! Exceeding 25 PPM causes reverse effect: thinning/burning of buds and leaf epinasty (downward curling).',
      'Use a 5ml graduated measuring syringe. Never pour by visual estimation or bottle cap.',
      'Do not apply during severe drought stress without prior light irrigation.',
      'Wear protective nitrile gloves, eye goggles, and mask during tank mixing.',
    ],
    incompatibilities: [
      'DO NOT mix with alkaline solutions like Bordeaux mixture or Lime Sulfur.',
      'Avoid mixing with Copper Oxychloride (COC) fungicides as it breaks emulsion.',
      'Safe to mix with neutral fungicides (e.g. Mancozeb) and soluble 13:00:45 potassium nitrate.',
    ],
    preHarvestIntervalDays: 7,
    regulatoryApproval: 'Central Insecticides Board & Registration Committee (CIB&RC) Approved under Sec 9(3) of Insecticides Act 1968',
  },
  {
    id: 'pgr-mepiquat',
    tradeName: 'Chamatkar / Pix (Mepiquat Chloride 5% AS)',
    activeIngredient: '1,1-Dimethylpiperidinium Chloride (Mepiquat Chloride 5% AS)',
    chemicalFormula: 'C7H16ClN',
    hormoneCategory: 'Growth Retardant (Canopy Control)',
    manufacturerExample: 'Gharda Chemicals / BASF',
    suitableCrops: ['Cotton', 'Soybean', 'Groundnut', 'Potato'],
    suitableStages: ['Early Vegetative & Branching Stage', 'Peak Squaring, Flowering & Boll Setting Stage'],
    primaryBenefit: 'Blocks biosynthesis of gibberellins, curbing wasteful vegetative growth and redirecting plant energy to bolls.',
    detailedBenefits: [
      'Shortens internodal length, creating a compact, upright bush structure with better aeration',
      'Prevents light starvation in lower canopy, allowing lower bolls to mature without rotting',
      'Reduces square shedding by up to 30% by eliminating vegetative sink competition',
      'Thickens leaf cuticle, improving natural defense against jassids and sucking pests',
    ],
    dosage: {
      perLiter: '1.0 to 1.5 ml per Liter of clean water',
      perKnapsack16L: '16 ml to 24 ml per 16 Liter knapsack sprayer',
      perAcreTank200L: '200 ml to 250 ml in 150-200 Liter water per acre',
      ppmConcentration: '50 to 75 PPM',
    },
    applicationMethod: 'Top canopy foliar wash targeting upper active terminal meristems.',
    idealConditions: {
      timeOfDay: 'Morning or calm evening. When soil moisture is adequate.',
      weatherNote: 'Ideal when crops show excessive leafy lush rank growth (>5 cm internode distance) following nitrogen fertilizers or heavy rains.',
      rainFastnessHours: 4,
    },
    precautions: [
      'DO NOT spray on stunted, moisture-stressed, or diseased crops where growth is already suppressed.',
      'Ensure cotton plant has at least 8-10 nodes and is actively growing before first application.',
      'Maximum 2 applications per crop season spaced 20 days apart.',
    ],
    incompatibilities: [
      'Do not tank mix with strong acidic herbicides.',
      'Compatible with most organophosphate and synthetic pyrethroid insecticides used in cotton.',
    ],
    preHarvestIntervalDays: 14,
    regulatoryApproval: 'CIB&RC Standard Registered PGR for Cotton Crop Canopy Management',
  },
  {
    id: 'pgr-chlormequat',
    tradeName: 'Lihocin (Chlormequat Chloride 50% SL)',
    activeIngredient: '2-Chloroethyltrimethylammonium Chloride (Chlormequat Chloride 50% SL)',
    chemicalFormula: 'C5H13Cl2N',
    hormoneCategory: 'Growth Retardant (Canopy Control)',
    manufacturerExample: 'BASF India Ltd.',
    suitableCrops: ['Cotton', 'Soybean', 'Groundnut', 'Potato', 'Wheat'],
    suitableStages: ['Early Vegetative & Branching Stage', 'Square Budding Stage'],
    primaryBenefit: 'Stops excessive stem elongation, strengthens lower stalk thickness, and reduces crop lodging by 60%.',
    detailedBenefits: [
      'Deepens green chlorophyll concentration in leaves, enhancing net photosynthetic rate',
      'Increases root-to-shoot ratio, enabling crops to draw moisture from deeper soil layers',
      'In cotton, induces early flowering by 7 to 10 days and accelerates boll development',
      'In potato, stimulates early stolon hook formation and tuber initiation',
    ],
    dosage: {
      perLiter: '0.4 to 0.75 ml per Liter of water',
      perKnapsack16L: '8.0 ml to 12.0 ml per 16 Liter sprayer pump',
      perAcreTank200L: '80 ml to 100 ml per 150-200 L water per acre',
      ppmConcentration: '200 to 350 PPM',
    },
    applicationMethod: 'Foliar spray with flat fan nozzle ensuring uniform canopy coverage.',
    idealConditions: {
      timeOfDay: 'Cool hours of the day (morning 7-10 AM or evening after 4 PM)',
      weatherNote: 'Ensure wind speed is under 8 km/h to prevent spray drift onto neighboring fields.',
      rainFastnessHours: 4,
    },
    precautions: [
      'High concentration formulation (50% SL)! Dilute carefully in a bucket before pouring into main spray tank.',
      'Do not apply during peak drought when leaves are wilting at noon.',
    ],
    incompatibilities: [
      'Incompatible with strongly alkaline sprays.',
      'Compatible with urea foliar spray (1-2%) and standard fungicides.',
    ],
    preHarvestIntervalDays: 15,
    regulatoryApproval: 'Approved by ICAR and Central Insecticide Board for Cotton, Wheat & Pulses',
  },
  {
    id: 'pgr-gibberellic-acid',
    tradeName: 'ProGibb / Gibb-Gro (Gibberellic Acid GA3 0.001% L / 90% TC)',
    activeIngredient: 'Gibberellic Acid (GA3) 0.001% Liquid or 40% Soluble Granules',
    chemicalFormula: 'C19H22O6',
    hormoneCategory: 'Gibberellin (Elongation & Sizing)',
    manufacturerExample: 'Sumitomo Chemical / Valent BioSciences',
    suitableCrops: ['Rice (Paddy)', 'Grapes', 'Tomato', 'Cotton', 'Sugarcane', 'Turmeric'],
    suitableStages: ['Panicle Booting & Grain Filling Stage', 'Fruit Ripening & Sizing Stage'],
    primaryBenefit: 'Stimulates rapid cell elongation, breaks seed dormancy, and increases fruit / panicle dimensions.',
    detailedBenefits: [
      'In Rice: Exserts incomplete or trapped panicles out of the boot leaf sheath, boosting filled grain count',
      'In Vegetables: Promotes cell expansion in fruit pericarp, resulting in 20-25% heavier market weight',
      'In Grapes: Loosens tight bunches, elongates cluster rachis, and prevents berry cracking and downy rot',
      'Overcomes seasonal cold shock and dormancy during winter vegetative stalls',
    ],
    dosage: {
      perLiter: '1.0 to 1.5 ml/L for 0.001% liquid (OR 0.5 to 1.0 gm / 100 L for technical powder)',
      perKnapsack16L: '15 ml to 20 ml per 16 L pump (0.001% liquid)',
      perAcreTank200L: '250 ml in 200 L water per acre',
      ppmConcentration: '10 to 40 PPM depending on crop specification',
    },
    applicationMethod: 'Targeted spray on emerging panicles or fruit clusters.',
    idealConditions: {
      timeOfDay: 'Early morning or cloudy overcast day with high relative humidity (>60%).',
      weatherNote: 'GA3 works best when plant has access to generous nitrogen and potassium nutrition.',
      rainFastnessHours: 3,
    },
    precautions: [
      'Always dissolve technical GA3 powder in a few drops of industrial alcohol or warm water before adding to tank.',
      'Do not apply excessively on cotton vegetative stage, as it will cause unmanageable tall spindly stems.',
    ],
    incompatibilities: [
      'Do not mix with chlorothalonil or copper fungicides.',
      'Safe with micronutrient foliar chelates (Zinc, Boron).',
    ],
    preHarvestIntervalDays: 5,
    regulatoryApproval: 'CIB&RC Registered Natural Plant Growth Promoter',
  },
  {
    id: 'pgr-paclobutrazol',
    tradeName: 'Cultar (Paclobutrazol 23% SC)',
    activeIngredient: 'Paclobutrazol 23% Suspension Concentrate',
    chemicalFormula: 'C15H20ClN3O',
    hormoneCategory: 'Growth Retardant (Canopy Control)',
    manufacturerExample: 'Syngenta India',
    suitableCrops: ['Mango', 'Rice (Paddy)', 'Tomato', 'Onion', 'Chilli'],
    suitableStages: ['Active Tillering Stage', 'Transplanting & Vegetative Canopy Stage'],
    primaryBenefit: 'Inhibits ent-kaurene oxidase in gibberellin pathway; redirects vegetative vigor to regular annual flowering.',
    detailedBenefits: [
      'Breaks alternate bearing habit in Mango trees, ensuring heavy flower panicles every single year',
      'In Paddy & Onion: Promotes strong basal tiller anchoring and thickens pseudostem',
      'Increases root hydraulic conductivity and enhances drought and salinity endurance',
      'Improves harvest index and leaf chlorophyll concentration',
    ],
    dosage: {
      perLiter: '0.3 to 0.5 ml per Liter of water (Foliar) or 3 ml per meter canopy diameter (Soil drench)',
      perKnapsack16L: '5.0 to 8.0 ml per 16 L knapsack pump',
      perAcreTank200L: '60 ml to 80 ml in 200 L water per acre',
      ppmConcentration: '75 to 120 PPM',
    },
    applicationMethod: 'Soil collar drench or low-volume uniform foliar canopy spray.',
    idealConditions: {
      timeOfDay: 'Morning hours into moist soil ring.',
      weatherNote: 'Do not apply to dry or flooded soil. Light soil moisture is mandatory for root uptake.',
      rainFastnessHours: 6,
    },
    precautions: [
      'Has significant soil residual activity! Do not overdose beyond prescribed canopy radius in orchards.',
      'Do not plant sensitive root vegetables in the same bed within 6 months of soil drench.',
    ],
    incompatibilities: [
      'Do not mix with strong acids or non-ionic super-spreaders in high concentration.',
    ],
    preHarvestIntervalDays: 30,
    regulatoryApproval: 'CIB&RC Registered under Insecticides Act for Horticulture & Field Crops',
  },
  {
    id: 'pgr-ethephon',
    tradeName: 'Ethrel (Ethephon 39% SL)',
    activeIngredient: '2-Chloroethylphosphonic Acid (Ethephon 39% SL)',
    chemicalFormula: 'C2H6ClO3P',
    hormoneCategory: 'Ethylene (Ripening & Defoliation)',
    manufacturerExample: 'Bayer CropScience',
    suitableCrops: ['Tomato', 'Red Chilli', 'Cotton', 'Banana', 'Mango', 'Pineapple'],
    suitableStages: ['Fruit Ripening & Crimson Color Turning Stage', 'Fruit Enlargement & Color Breaker Stage', 'Boll Bulking & Maturation Stage'],
    primaryBenefit: 'Releases natural plant ethylene inside plant tissues, synchronizing uniform ripening and color synthesis.',
    detailedBenefits: [
      'In Chilli & Tomato: Converts 90%+ green mature fruits to bright crimson red within 5 to 7 days',
      'Eliminates need for 3-4 staggered manual pickings, reducing farmer labor costs by up to ₹4,500/acre',
      'In Cotton: Acts as an effective boll opener and harvest aid, facilitating clean, early harvest',
      'Promotes uniform anthocyanin and capsanthin synthesis for superior APMC mandi grades',
    ],
    dosage: {
      perLiter: '1.5 to 2.5 ml per Liter of water',
      perKnapsack16L: '25 ml to 35 ml per 16 L pump',
      perAcreTank200L: '350 ml to 450 ml in 200 L water per acre',
      ppmConcentration: '600 to 1000 PPM',
    },
    applicationMethod: 'Foliar spray drenching mature fruit clusters thoroughly.',
    idealConditions: {
      timeOfDay: 'Sunny morning when temperature is between 25°C and 33°C. Ethylene conversion requires warmth.',
      weatherNote: 'Never spray if rain is expected within 4 hours or if temperature drops below 18°C.',
      rainFastnessHours: 4,
    },
    precautions: [
      'Apply ONLY when fruits have reached full mature size (green mature stage). Spraying on immature green fruits causes premature dropping of unviable produce.',
      'Wear rubber boots, chemical apron, and respirator mask when handling concentrated liquid.',
      'Ensure fruits are washed before direct fresh culinary consumption.',
    ],
    incompatibilities: [
      'DO NOT mix with alkaline water or copper fungicides (breaks down before entering plant tissue).',
      'If spray water pH is above 7.0, add 1 ml citric acid or agricultural acidifier per 10 L water.',
    ],
    preHarvestIntervalDays: 8,
    regulatoryApproval: 'CIB&RC Registered Ripening Agent & Harvest Aid',
  },
  {
    id: 'pgr-triacontanol',
    tradeName: 'Vipul / Miraculan (Triacontanol 0.05% EC / 0.1% EW)',
    activeIngredient: '1-Hydroxytriacontane (Triacontanol 0.05% EC)',
    chemicalFormula: 'C30H62O',
    hormoneCategory: 'Cytokinin (Cell Division & Branching)',
    manufacturerExample: 'Godrej Agrovet / Coromandel',
    suitableCrops: ['Red Chilli', 'Cotton', 'Rice (Paddy)', 'Turmeric', 'Tomato', 'Vegetables'],
    suitableStages: ['Peak Squaring, Flowering & Boll Setting Stage', 'Star Flower Budding & Pod Formation Stage', 'Panicle Booting & Grain Filling Stage'],
    primaryBenefit: 'Natural saturated fatty alcohol biostimulant that accelerates plant enzyme and ATP energy production by 40%.',
    detailedBenefits: [
      'Dramatically accelerates photosynthesis rate and carbon dioxide assimilation',
      'Promotes prolific flowering, prevents flower bud drop, and increases pod size by 15-20%',
      'Stimulates branching and root development with zero toxic residues (safe, eco-friendly)',
      'Improves post-stress recovery from pest attacks, hail, or heat waves',
    ],
    dosage: {
      perLiter: '1.0 to 1.5 ml per Liter of water',
      perKnapsack16L: '16 ml to 20 ml per 16 L pump',
      perAcreTank200L: '250 ml in 200 L water per acre',
      ppmConcentration: '0.5 to 1.0 PPM (Active Triacontanol)',
    },
    applicationMethod: 'Full foliar canopy wash.',
    idealConditions: {
      timeOfDay: 'Morning or late afternoon.',
      weatherNote: 'Suitable in all weather conditions. Non-phytotoxic even at slight overdose.',
      rainFastnessHours: 2,
    },
    precautions: [
      'Shake bottle well before pouring to disperse emulsion.',
      'Safe organic-derived product; still follow basic PPE.',
    ],
    incompatibilities: [
      'Compatible with almost all insecticides, fungicides, and water-soluble fertilizers.',
    ],
    preHarvestIntervalDays: 3,
    regulatoryApproval: 'Fertilizer Control Order (FCO) & CIB&RC Approved Plant Bio-stimulant',
  },
];
