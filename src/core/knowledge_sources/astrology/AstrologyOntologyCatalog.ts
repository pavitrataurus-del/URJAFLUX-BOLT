import {
  IAstrologyOntologyEntity,
  IAstrologyRelationship,
  IAstrologyConflict,
  IAstrologyDuplicateMatch
} from './AstrologyKnowledgeTypes';

export const INITIAL_ASTROLOGY_ENTITIES: IAstrologyOntologyEntity[] = [
  // ---------------------------------------------------
  // GRAHAS (CELESTIAL BODIES / PLANETS)
  // ---------------------------------------------------
  {
    id: 'grh-001',
    canonicalName: 'Surya (Sun) — Soul, Vitality & Cosmic Authority',
    alternateNames: ['Sun', 'Ravi', 'Aditya', 'Bhaskara', 'Atmakaraka'],
    sanskritName: 'सूर्य (Surya)',
    hindiName: 'सूर्य (Surya)',
    englishName: 'Sun',
    entityType: 'Graha',
    description: 'Surya represents the Atman (soul), sovereign authority, father, vital energy, self-realization, and willpower. Governs Simha (Leo), exalted in Mesha (Aries at 10°), debilitated in Tula (Libra at 10°). Primary Karaka for health and status.',
    category: 'Graha (Celestial Body)',
    tags: ['Surya', 'Sun', 'Atman', 'Kshatriya', 'Simha', 'MeshaExalted', 'Ruby'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedRashi: 'Simha (Leo)',
    associatedElement: 'Fire (Agni)',
    associatedColor: 'Crimson Red / Copper',
    associatedMetal: 'Copper / Gold',
    associatedGemstone: 'Ruby (Manikya)',
    associatedDirection: 'East (Purva)',
    associatedBodyPart: 'Heart, Eyes, Bones, Spine',
    metadata: {
      exaltationRashi: 'Mesha (Aries)',
      exaltationDegree: 10,
      debilitationRashi: 'Tula (Libra)',
      debilitationDegree: 10,
      mooltrikonaRashi: 'Simha (Leo 0°-20°)',
      gender: 'Masculine',
      guna: 'Sattva',
      caste: 'Kshatriya',
      drishti: '7th House'
    },
    sourceTraceability: {
      sourceBook: 'Brihat Parashara Hora Shastra',
      edition: 'Master Critical Edition',
      author: 'Maharishi Parashara',
      publicationYear: 1978,
      publisher: 'Ranjan Publications',
      language: 'Sanskrit',
      chapter: 'Chapter 3: Graha Guna Swaroopa Adhyaya',
      verseOrShloka: 'Shloka 12-14',
      pageNumber: 28,
      paragraph: 'Para 1-3',
      ocrConfidence: 0.99,
      importBatch: 'ASTRO-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 99,
      evidenceStrength: 98,
      knowledgeWeight: 0.99,
      confidenceScore: 99,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['Initial canonical import from BPHS classical text.'],
    lastUpdatedBy: 'Admin Vedic Astrologer',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },
  {
    id: 'grh-002',
    canonicalName: 'Chandra (Moon) — Mind, Emotions & Nurturing Receptivity',
    alternateNames: ['Moon', 'Soma', 'Indu', 'Manas'],
    sanskritName: 'चन्द्र (Chandra)',
    hindiName: 'चन्द्र (Chandra)',
    englishName: 'Moon',
    entityType: 'Graha',
    description: 'Chandra governs the Manas (mind), emotional stability, mother, public perception, liquid wealth, and intuitive perception. Governs Karka (Cancer), exalted in Vrishabha (Taurus at 3°), debilitated in Vrishchika (Scorpio at 3°).',
    category: 'Graha (Celestial Body)',
    tags: ['Chandra', 'Moon', 'Manas', 'Karka', 'VrishabhaExalted', 'Pearl'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedRashi: 'Karka (Cancer)',
    associatedElement: 'Water (Jala)',
    associatedColor: 'Pearl White / Silver',
    associatedMetal: 'Silver',
    associatedGemstone: 'Pearl (Moti) / Moonstone',
    associatedDirection: 'North-West (North-Western Quadrant)',
    associatedBodyPart: 'Mind, Fluids, Lungs, Breast',
    metadata: {
      exaltationRashi: 'Vrishabha (Taurus)',
      exaltationDegree: 3,
      debilitationRashi: 'Vrishchika (Scorpio)',
      debilitationDegree: 3,
      mooltrikonaRashi: 'Vrishabha (Taurus 4°-30°)',
      gender: 'Feminine',
      guna: 'Sattva',
      caste: 'Vaishya',
      drishti: '7th House'
    },
    sourceTraceability: {
      sourceBook: 'Brihat Parashara Hora Shastra',
      edition: 'Master Critical Edition',
      author: 'Maharishi Parashara',
      publicationYear: 1978,
      publisher: 'Ranjan Publications',
      language: 'Sanskrit',
      chapter: 'Chapter 3: Graha Guna Swaroopa Adhyaya',
      verseOrShloka: 'Shloka 15-17',
      pageNumber: 32,
      paragraph: 'Para 1-2',
      ocrConfidence: 0.99,
      importBatch: 'ASTRO-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 99,
      evidenceStrength: 98,
      knowledgeWeight: 0.99,
      confidenceScore: 99,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['Canonical entry confirmed.'],
    lastUpdatedBy: 'Admin Vedic Astrologer',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },

  // ---------------------------------------------------
  // RASHIS (ZODIAC SIGNS)
  // ---------------------------------------------------
  {
    id: 'rsh-001',
    canonicalName: 'Mesha Rashi (Aries) — Primal Fire & Initiating Impulse',
    alternateNames: ['Aries', 'Mesha', 'Ram'],
    sanskritName: 'मेष (Mesha)',
    hindiName: 'मेष (Mesha)',
    englishName: 'Aries',
    entityType: 'Rashi',
    description: '1st Zodiac sign. Governed by Mangal (Mars). Chara (Movable) Agni (Fire) sign. Represents pioneering action, physical vitality, enterprise, and leadership. Exaltation sign of Surya (Sun).',
    category: 'Rashi (Zodiac Sign)',
    tags: ['Mesha', 'Aries', 'Agni', 'Chara', 'MangalOwned', 'SuryaExalted'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedPlanet: 'Mangal (Mars)',
    associatedElement: 'Agni (Fire)',
    associatedDirection: 'East',
    associatedColor: 'Blood Red',
    metadata: {
      signNumber: 1,
      modality: 'Chara (Movable)',
      element: 'Agni (Fire)',
      ruler: 'Mangal (Mars)',
      exaltedGraha: 'Surya (Sun)',
      debilitatedGraha: 'Shani (Saturn)',
      bodyPart: 'Head & Brain'
    },
    sourceTraceability: {
      sourceBook: 'Brihat Parashara Hora Shastra',
      edition: 'Master Critical Edition',
      author: 'Maharishi Parashara',
      publicationYear: 1978,
      publisher: 'Ranjan Publications',
      language: 'Sanskrit',
      chapter: 'Chapter 4: Rashi Bheda Adhyaya',
      verseOrShloka: 'Shloka 4-6',
      pageNumber: 45,
      paragraph: 'Para 1',
      ocrConfidence: 0.98,
      importBatch: 'ASTRO-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 98,
      evidenceStrength: 97,
      knowledgeWeight: 0.98,
      confidenceScore: 98,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['Mesha Rashi canonical entry created.'],
    lastUpdatedBy: 'Admin Vedic Astrologer',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },

  // ---------------------------------------------------
  // NAKSHATRAS (LUNAR MANSIONS)
  // ---------------------------------------------------
  {
    id: 'nak-001',
    canonicalName: 'Ashwini Nakshatra — Celestial Physicians & Swift Healing',
    alternateNames: ['Ashvini', 'Ashwini Kumaras'],
    sanskritName: 'अश्विनी (Ashwini)',
    hindiName: 'अश्विनी (Ashwini)',
    englishName: 'Ashwini',
    entityType: 'Nakshatra',
    description: '1st Nakshatra spanning 00°00\' to 13°20\' Mesha (Aries). Governed by Ketu (Dasha Lord) and ruled by the Ashwini Kumaras (divine physicians). Symbolized by a Horse\'s Head representing speed, healing, and rapid initiation.',
    category: 'Nakshatra (Lunar Mansion)',
    tags: ['Ashwini', 'KetuLord', 'MeshaRashi', 'AshwiniKumaras', 'Healing', 'Speed'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedRashi: 'Mesha (Aries)',
    associatedPlanet: 'Ketu',
    associatedColor: 'Blood Red / Mahogany',
    associatedDirection: 'East',
    metadata: {
      nakshatraNumber: 1,
      span: '00°00\' - 13°20\' Mesha',
      dashaLord: 'Ketu',
      deity: 'Ashwini Kumaras',
      symbol: 'Horse Head',
      gana: 'Deva',
      animal: 'Male Horse'
    },
    sourceTraceability: {
      sourceBook: 'Brihat Samhita',
      edition: 'Varanasi Critical Edition',
      author: 'Varahamihira',
      publicationYear: 1981,
      publisher: 'Chowkhamba Orientalia',
      language: 'Sanskrit',
      chapter: 'Chapter 15: Nakshatra Vyuha',
      verseOrShloka: 'Shloka 1-3',
      pageNumber: 180,
      paragraph: 'Para 1-2',
      ocrConfidence: 0.97,
      importBatch: 'ASTRO-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 97,
      evidenceStrength: 96,
      knowledgeWeight: 0.97,
      confidenceScore: 97,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['Ashwini Nakshatra verified.'],
    lastUpdatedBy: 'Admin Vedic Astrologer',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },

  // ---------------------------------------------------
  // BHAVAS (HOUSES)
  // ---------------------------------------------------
  {
    id: 'bhv-001',
    canonicalName: '1st Bhava (Lagna / Tanu Bhava) — Self, Body & Life Direction',
    alternateNames: ['First House', 'Lagna', 'Tanu Bhava', 'Ascendant'],
    sanskritName: 'प्रथम भाव (Tanu Bhava)',
    hindiName: 'पहला भाव (Lagna)',
    englishName: '1st House / Ascendant',
    entityType: 'Bhava',
    description: '1st Bhava governs physical appearance, constitution, temperament, self-consciousness, vitality, and overall destiny. Primary Kendra and Trikona house. Karaka is Surya (Sun).',
    category: 'Bhava (House)',
    tags: ['Lagna', 'TanuBhava', 'Kendra', 'Trikona', 'Self', 'SuryaKaraka'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedBhava: 1,
    associatedPlanet: 'Surya (Sun)',
    associatedBodyPart: 'Head, Skull, Brain',
    metadata: {
      houseNumber: 1,
      classification: 'Kendra & Trikona (Dharma)',
      karaka: 'Surya (Sun)',
      bodySignification: 'Head & Temperament'
    },
    sourceTraceability: {
      sourceBook: 'Brihat Parashara Hora Shastra',
      edition: 'Master Critical Edition',
      author: 'Maharishi Parashara',
      publicationYear: 1978,
      publisher: 'Ranjan Publications',
      language: 'Sanskrit',
      chapter: 'Chapter 7: Bhava Viveka Adhyaya',
      verseOrShloka: 'Shloka 1-4',
      pageNumber: 88,
      paragraph: 'Para 1',
      ocrConfidence: 0.99,
      importBatch: 'ASTRO-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 99,
      evidenceStrength: 98,
      knowledgeWeight: 0.99,
      confidenceScore: 99,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['1st Bhava verified.'],
    lastUpdatedBy: 'Admin Vedic Astrologer',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },
  {
    id: 'bhv-010',
    canonicalName: '10th Bhava (Karma Bhava) — Profession, Status & Public Action',
    alternateNames: ['Tenth House', 'Karma Bhava', 'Midheaven'],
    sanskritName: 'दशम भाव (Karma Bhava)',
    hindiName: 'दशम भाव (Karma)',
    englishName: '10th House',
    entityType: 'Bhava',
    description: '10th Bhava governs career, public status, authority, leadership, actions in the world, and social achievements. Strongest Kendra house. Karakas are Surya, Budh, Guru, and Shani.',
    category: 'Bhava (House)',
    tags: ['KarmaBhava', '10thHouse', 'Kendra', 'Career', 'Status', 'ShaniKaraka'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedBhava: 10,
    associatedPlanet: 'Shani / Surya / Budh / Guru',
    associatedBodyPart: 'Knees & Joints',
    metadata: {
      houseNumber: 10,
      classification: 'Kendra (Artha)',
      karakas: ['Surya', 'Budh', 'Guru', 'Shani'],
      bodySignification: 'Knees & Profession'
    },
    sourceTraceability: {
      sourceBook: 'Brihat Parashara Hora Shastra',
      edition: 'Master Critical Edition',
      author: 'Maharishi Parashara',
      publicationYear: 1978,
      publisher: 'Ranjan Publications',
      language: 'Sanskrit',
      chapter: 'Chapter 7: Bhava Viveka Adhyaya',
      verseOrShloka: 'Shloka 28-30',
      pageNumber: 102,
      paragraph: 'Para 2',
      ocrConfidence: 0.98,
      importBatch: 'ASTRO-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 98,
      evidenceStrength: 97,
      knowledgeWeight: 0.98,
      confidenceScore: 98,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['10th Bhava verified.'],
    lastUpdatedBy: 'Admin Vedic Astrologer',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },

  // ---------------------------------------------------
  // YOGAS (ASTROLOGICAL COMBINATIONS)
  // ---------------------------------------------------
  {
    id: 'yog-001',
    canonicalName: 'Gaja Kesari Yoga — Wisdom, Fame & Unshakable Nobility',
    alternateNames: ['Elephant-Lion Yoga', 'Gajakesari'],
    sanskritName: 'गजकेसरी योग (Gaja Kesari)',
    hindiName: 'गजकेसरी योग (Gaja Kesari)',
    englishName: 'Gaja Kesari Yoga',
    entityType: 'Yoga',
    description: 'Formed when Guru (Jupiter) occupies a Kendra (1st, 4th, 7th, 10th house) from Chandra (Moon), unafflicted by malefics. Bestows high wisdom, lasting reputation, intellectual prowess, and noble prosperity.',
    category: 'Yoga (Astrological Combination)',
    tags: ['GajaKesari', 'GuruChandra', 'KendraYoga', 'RajaYoga', 'Wisdom', 'Prosperity'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedPlanet: 'Guru & Chandra',
    metadata: {
      yogaType: 'Raja Yoga / Subha Yoga',
      condition: 'Guru in Kendra (1, 4, 7, 10) from Chandra',
      beneficEffects: 'Fame, Wisdom, Philanthropy, Royal Honors'
    },
    sourceTraceability: {
      sourceBook: 'Phaladeepika',
      edition: 'Subrahmanya Sastri Edition',
      author: 'Mantreswara',
      publicationYear: 1950,
      publisher: 'Sri Ramanuja Press',
      language: 'Sanskrit',
      chapter: 'Chapter 6: Yoga Adhyaya',
      verseOrShloka: 'Shloka 14-16',
      pageNumber: 110,
      paragraph: 'Para 1-3',
      ocrConfidence: 0.98,
      importBatch: 'ASTRO-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 98,
      evidenceStrength: 97,
      knowledgeWeight: 0.98,
      confidenceScore: 98,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['Gaja Kesari Yoga canonical entry verified.'],
    lastUpdatedBy: 'Admin Vedic Astrologer',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },

  // ---------------------------------------------------
  // DIVISIONAL CHARTS (VARGAS)
  // ---------------------------------------------------
  {
    id: 'div-009',
    canonicalName: 'D9 Navamsha Chart — Soul Destiny, Dharma & Partnership',
    alternateNames: ['Navamsha', 'D9 Varga', 'Ninth Divisional Chart'],
    sanskritName: 'नवांश चक्र (Navamsha D9)',
    hindiName: 'नवांश (Navamsha D9)',
    englishName: 'D9 Navamsha Chart',
    entityType: 'DivisionalChart',
    description: '1/9th division of Rashi. Crucial chart for assessing true planetary strength, spiritual dharma, soul potential, marriage, and second half of life. Essential companion to D1 Rashi.',
    category: 'DivisionalChart (Varga)',
    tags: ['D9', 'Navamsha', 'Varga', 'Dharma', 'SoulStrength', 'Marriage'],
    version: '1.0.0',
    status: 'CANONICAL',
    metadata: {
      divisionNumber: 9,
      vargaName: 'Navamsha',
      significations: 'Dharma, Spousal Harmony, True Strength'
    },
    sourceTraceability: {
      sourceBook: 'Brihat Parashara Hora Shastra',
      edition: 'Master Critical Edition',
      author: 'Maharishi Parashara',
      publicationYear: 1978,
      publisher: 'Ranjan Publications',
      language: 'Sanskrit',
      chapter: 'Chapter 6: Varga Bheda Adhyaya',
      verseOrShloka: 'Shloka 18-20',
      pageNumber: 72,
      paragraph: 'Para 2',
      ocrConfidence: 0.99,
      importBatch: 'ASTRO-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 99,
      evidenceStrength: 98,
      knowledgeWeight: 0.99,
      confidenceScore: 99,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['D9 Navamsha chart entry verified.'],
    lastUpdatedBy: 'Admin Vedic Astrologer',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },

  // ---------------------------------------------------
  // DASHA CONCEPTS (CONCEPTUAL ONLY - NO CALCULATIONS)
  // ---------------------------------------------------
  {
    id: 'dsh-001',
    canonicalName: 'Vimshottari Dasha Framework — 120-Year Planetary Cycle Concept',
    alternateNames: ['Vimshottari System', '120-Year Cycle'],
    sanskritName: 'विंशोत्तरी दशा (Vimshottari Dasha)',
    hindiName: 'विंशोत्तरी दशा (Vimshottari)',
    englishName: 'Vimshottari Dasha System',
    entityType: 'DashaConcept',
    description: 'Classical 120-year planetary period system where planetary periods operate in sequence: Ketu (7y), Shukra (20y), Surya (6y), Chandra (10y), Mangal (7y), Rahu (18y), Guru (16y), Shani (19y), Budh (17y). Purely conceptual knowledge record.',
    category: 'DashaConcept (Cycle Theory)',
    tags: ['Vimshottari', 'Dasha', '120Years', 'KetuToBudh', 'TimeCycle'],
    version: '1.0.0',
    status: 'CANONICAL',
    metadata: {
      totalYears: 120,
      sequence: ['Ketu', 'Shukra', 'Surya', 'Chandra', 'Mangal', 'Rahu', 'Guru', 'Shani', 'Budh'],
      isComputational: false
    },
    sourceTraceability: {
      sourceBook: 'Brihat Parashara Hora Shastra',
      edition: 'Master Critical Edition',
      author: 'Maharishi Parashara',
      publicationYear: 1978,
      publisher: 'Ranjan Publications',
      language: 'Sanskrit',
      chapter: 'Chapter 46: Dasha Adhyaya',
      verseOrShloka: 'Shloka 1-5',
      pageNumber: 340,
      paragraph: 'Para 1',
      ocrConfidence: 0.99,
      importBatch: 'ASTRO-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 99,
      evidenceStrength: 98,
      knowledgeWeight: 0.99,
      confidenceScore: 99,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['Vimshottari Dasha conceptual entry recorded.'],
    lastUpdatedBy: 'Admin Vedic Astrologer',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  }
];

export const INITIAL_ASTROLOGY_RELATIONSHIPS: IAstrologyRelationship[] = [
  {
    id: 'rel-surya-simha',
    sourceEntityId: 'grh-001', // Surya
    targetEntityId: 'rsh-005', // Simha
    relationshipType: 'RULES',
    weight: 0.99,
    isConditional: false,
    description: 'Surya directly rules Simha (Leo) Rashi.',
    sourceBook: 'Brihat Parashara Hora Shastra'
  },
  {
    id: 'rel-surya-mesha',
    sourceEntityId: 'grh-001', // Surya
    targetEntityId: 'rsh-001', // Mesha
    relationshipType: 'EXALTED_IN',
    weight: 0.98,
    isConditional: true,
    conditionText: 'Exalted up to 10 degrees Mesha.',
    description: 'Surya reaches highest exaltation at 10° Mesha.',
    sourceBook: 'Brihat Parashara Hora Shastra'
  },
  {
    id: 'rel-gaja-kesari-guru-chandra',
    sourceEntityId: 'yog-001', // Gaja Kesari
    targetEntityId: 'grh-002', // Chandra
    relationshipType: 'DEPENDS_ON',
    weight: 0.97,
    isConditional: false,
    description: 'Gaja Kesari Yoga requires Guru to sit in Kendra from Chandra.',
    sourceBook: 'Phaladeepika'
  },
  {
    id: 'rel-surya-vastu-east',
    sourceEntityId: 'grh-001', // Surya
    targetEntityId: 'vst-dir-001', // Vastu East
    relationshipType: 'ASSOCIATED_WITH',
    weight: 0.99,
    isConditional: false,
    description: 'Surya governs the Eastern direction across Astrology and Vastu domains.',
    sourceBook: 'Brihat Samhita'
  }
];

export const INITIAL_ASTROLOGY_CONFLICTS: IAstrologyConflict[] = [
  {
    conflictId: 'conf-astro-001',
    entityId: 'grh-001',
    conflictType: 'EXALTATION_DEGREE_MISMATCH',
    sourceA: 'Brihat Parashara Hora Shastra',
    claimA: 'Surya is exalted specifically at 10° Mesha.',
    sourceB: 'Saravali (Kalyana Varma)',
    claimB: 'Surya maintains general exaltation throughout the entire first decan (0°-10°) of Mesha.',
    description: 'Classical discrepancy regarding whether exaltation is a point coordinate (10°) or a 10-degree arc.',
    status: 'CONTEXTUAL_SPLIT',
    resolutionNotes: 'Contextual split maintained: BPHS specifies exact peak at 10°; Saravali considers the entire 0°-10° arc exalted.',
    resolvedBy: 'Admin Vedic Astrologer',
    resolvedTimestamp: '2026-07-26T00:00:00Z'
  },
  {
    conflictId: 'conf-astro-002',
    entityId: 'bhv-001',
    conflictType: 'HOUSE_SYSTEM_SPLIT',
    sourceA: 'Equal House System (Sri Pati)',
    claimA: 'Houses are divided in equal 30-degree arcs starting from exact Ascendant degree.',
    sourceB: 'Bhava Chalita System',
    claimB: 'House midpoints (Bhava Madhya) determine dynamic house boundaries across unequal arcs.',
    description: 'Traditional debate between Sri Pati Equal House and Bhava Chalita house calculation systems.',
    status: 'UNRESOLVED'
  }
];

export const INITIAL_ASTROLOGY_DUPLICATES: IAstrologyDuplicateMatch[] = [
  {
    matchId: 'dup-astro-001',
    primaryEntityId: 'grh-001',
    candidateEntityId: 'grh-001-draft-copy',
    similarityScore: 92,
    matchingAttributes: ['canonicalName', 'sanskritName', 'associatedRashi'],
    status: 'PENDING_REVIEW'
  }
];
