import {
  INumerologyOntologyEntity,
  INumerologyRelationship,
  INumerologyConflict,
  INumerologyDuplicateMatch
} from './NumerologyKnowledgeTypes';

export const INITIAL_NUMEROLOGY_ENTITIES: INumerologyOntologyEntity[] = [
  // NUMBERS 1 - 9
  {
    id: 'num-001',
    canonicalName: 'Number 1 — The Sun / Individual Consciousness',
    alternateNames: ['Single One', 'Surya Vibration', 'Primal Spark'],
    numberValue: 1,
    system: 'Chaldean',
    entityType: 'Number',
    description: 'Represents leadership, original creation, independence, vitality, and authority. Governed by the Sun (Surya). Associated with East, Ruby, Crimson Red, and Sunday.',
    category: 'Core Single Digits',
    tags: ['Sun', 'Leadership', 'Surya', 'East', 'Ruby', 'Creation'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedPlanet: 'Surya (Sun)',
    associatedElement: 'Fire',
    associatedColor: 'Crimson Red / Gold',
    associatedDirection: 'East',
    associatedDay: 'Sunday',
    associatedGemstone: 'Ruby',
    metadata: {
      chaldeanVibration: 1,
      pythagoreanVibration: 1,
      archetype: 'The Pioneer / The Sovereign'
    },
    sourceTraceability: {
      sourceBook: 'Chaldean Numerology & Sacred Science',
      edition: '1st Master Edition',
      author: 'Cheiro (William John Warner)',
      publicationYear: 1927,
      publisher: 'London Occult Publishing',
      language: 'English',
      chapter: 'Chapter 1: The Number 1 & Solar Dynamics',
      pageNumber: 14,
      paragraph: 'Para 2-4',
      ocrConfidence: 0.99,
      importBatch: 'NUM-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 98,
      evidenceStrength: 96,
      knowledgeWeight: 0.98,
      confidenceScore: 97,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['Initial canonical import from Cheiro classical treatise.'],
    lastUpdatedBy: 'Admin Numerologist',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },
  {
    id: 'num-002',
    canonicalName: 'Number 2 — The Moon / Lunar Dualism & Receptivity',
    alternateNames: ['Single Two', 'Chandra Vibration', 'The Diplomat'],
    numberValue: 2,
    system: 'Chaldean',
    entityType: 'Number',
    description: 'Represents dualism, emotional intelligence, diplomacy, cooperation, intuition, and adaptability. Governed by the Moon (Chandra). Associated with North-West, Pearl, Pearl White, and Monday.',
    category: 'Core Single Digits',
    tags: ['Moon', 'Chandra', 'Diplomacy', 'North-West', 'Pearl', 'Intuition'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedPlanet: 'Chandra (Moon)',
    associatedElement: 'Water',
    associatedColor: 'Pearl White / Silver',
    associatedDirection: 'North-West',
    associatedDay: 'Monday',
    associatedGemstone: 'Pearl / Moonstone',
    metadata: {
      chaldeanVibration: 2,
      pythagoreanVibration: 2,
      archetype: 'The Mediator / The Nurturer'
    },
    sourceTraceability: {
      sourceBook: 'Chaldean Numerology & Sacred Science',
      edition: '1st Master Edition',
      author: 'Cheiro',
      publicationYear: 1927,
      publisher: 'London Occult Publishing',
      language: 'English',
      chapter: 'Chapter 2: The Moon & Dual Vibrations',
      pageNumber: 22,
      paragraph: 'Para 1-3',
      ocrConfidence: 0.98,
      importBatch: 'NUM-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 97,
      evidenceStrength: 95,
      knowledgeWeight: 0.96,
      confidenceScore: 96,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['Initial canonical entry verified.'],
    lastUpdatedBy: 'Admin Numerologist',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },
  {
    id: 'num-003',
    canonicalName: 'Number 3 — Jupiter / Expansive Wisdom & Creation',
    alternateNames: ['Single Three', 'Guru Vibration', 'The Counselor'],
    numberValue: 3,
    system: 'Chaldean',
    entityType: 'Number',
    description: 'Represents expansiveness, higher wisdom, spiritual counseling, optimism, creative expression, and growth. Governed by Jupiter (Guru/Brihaspati). Associated with North-East, Yellow Sapphire, Gold, and Thursday.',
    category: 'Core Single Digits',
    tags: ['Jupiter', 'Guru', 'Wisdom', 'North-East', 'Yellow Sapphire', 'Expansion'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedPlanet: 'Guru (Jupiter)',
    associatedElement: 'Ether / Fire',
    associatedColor: 'Golden Yellow',
    associatedDirection: 'North-East',
    associatedDay: 'Thursday',
    associatedGemstone: 'Yellow Sapphire',
    metadata: {
      chaldeanVibration: 3,
      pythagoreanVibration: 3,
      archetype: 'The Philosopher / The Creator'
    },
    sourceTraceability: {
      sourceBook: 'Chaldean Numerology & Sacred Science',
      edition: '1st Master Edition',
      author: 'Cheiro',
      publicationYear: 1927,
      publisher: 'London Occult Publishing',
      language: 'English',
      chapter: 'Chapter 3: Jupiter & The Sacred Trinity',
      pageNumber: 30,
      paragraph: 'Para 1-5',
      ocrConfidence: 0.99,
      importBatch: 'NUM-BATCH-2026-001',
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
    revisionNotes: ['Initial canonical entry verified.'],
    lastUpdatedBy: 'Admin Numerologist',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },
  {
    id: 'num-004',
    canonicalName: 'Number 4 — Rahu / Structural Discipline & Practicality',
    alternateNames: ['Single Four', 'Rahu Vibration', 'The Builder'],
    numberValue: 4,
    system: 'Chaldean',
    entityType: 'Number',
    description: 'Represents structural foundation, rigorous work, practical execution, unconventional breakthroughs, and material stability. Governed by Rahu / Uranus in Western traditions. Associated with South-West, Solid Silver/Hessonite, Smoky Grey, and Sunday/Saturday.',
    category: 'Core Single Digits',
    tags: ['Rahu', 'Structure', 'South-West', 'Hessonite', 'Discipline'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedPlanet: 'Rahu (North Node)',
    associatedElement: 'Earth',
    associatedColor: 'Smoky Grey / Electric Blue',
    associatedDirection: 'South-West',
    associatedDay: 'Sunday / Saturday',
    associatedGemstone: 'Hessonite (Gomed)',
    metadata: {
      chaldeanVibration: 4,
      pythagoreanVibration: 4,
      archetype: 'The Architect / The Pragmatist'
    },
    sourceTraceability: {
      sourceBook: 'Chaldean Numerology & Sacred Science',
      edition: '1st Master Edition',
      author: 'Cheiro',
      publicationYear: 1927,
      publisher: 'London Occult Publishing',
      language: 'English',
      chapter: 'Chapter 4: Number 4 and Rahu Force',
      pageNumber: 38,
      paragraph: 'Para 2-4',
      ocrConfidence: 0.97,
      importBatch: 'NUM-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 96,
      evidenceStrength: 95,
      knowledgeWeight: 0.95,
      confidenceScore: 95,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['Verified against Vedic and Chaldean sources.'],
    lastUpdatedBy: 'Admin Numerologist',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },
  {
    id: 'num-005',
    canonicalName: 'Number 5 — Mercury / Commercial Intelligence & Adaptability',
    alternateNames: ['Single Five', 'Budh Vibration', 'The Communicator'],
    numberValue: 5,
    system: 'Chaldean',
    entityType: 'Number',
    description: 'Represents commerce, versatility, swift movement, analytical intellect, freedom, and communication. Governed by Mercury (Budh). Associated with North, Emerald, Emerald Green, and Wednesday.',
    category: 'Core Single Digits',
    tags: ['Mercury', 'Budh', 'Commerce', 'North', 'Emerald', 'Communication'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedPlanet: 'Budh (Mercury)',
    associatedElement: 'Earth / Air',
    associatedColor: 'Emerald Green',
    associatedDirection: 'North',
    associatedDay: 'Wednesday',
    associatedGemstone: 'Emerald',
    metadata: {
      chaldeanVibration: 5,
      pythagoreanVibration: 5,
      archetype: 'The Merchant / The Strategist'
    },
    sourceTraceability: {
      sourceBook: 'Chaldean Numerology & Sacred Science',
      edition: '1st Master Edition',
      author: 'Cheiro',
      publicationYear: 1927,
      publisher: 'London Occult Publishing',
      language: 'English',
      chapter: 'Chapter 5: Mercury & Mercurial Vibrations',
      pageNumber: 46,
      paragraph: 'Para 1-4',
      ocrConfidence: 0.99,
      importBatch: 'NUM-BATCH-2026-001',
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
    lastUpdatedBy: 'Admin Numerologist',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },

  // MASTER NUMBERS (11, 22, 33)
  {
    id: 'master-011',
    canonicalName: 'Master Number 11 — The Master Intuitive & Illuminator',
    alternateNames: ['Master Eleven', 'Illuminated Channel'],
    numberValue: 11,
    system: 'Pythagorean',
    entityType: 'MasterNumber',
    description: 'Represents high spiritual illumination, psychic intuition, visionary idealism, and divine inspiration. Reduces to 2 (1+1) but carries dual solar 1 energy doubled with lunar sensitivity.',
    category: 'Master Numbers',
    tags: ['MasterNumber', 'Intuition', 'Illumination', 'Visionary', 'Pythagorean'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedPlanet: 'Chandra / Neptune',
    associatedElement: 'Ether',
    associatedColor: 'Silver / Iridescent White',
    associatedDirection: 'North-East / North-West',
    metadata: {
      isMaster: true,
      unreducedValue: 11,
      reducedValue: 2,
      archetype: 'The Illuminator'
    },
    sourceTraceability: {
      sourceBook: 'Pythagorean Numerology Fundamentals',
      edition: 'Standard Critical Edition',
      author: 'Dr. Juno Jordan',
      publicationYear: 1965,
      publisher: 'DeVorss & Company',
      language: 'English',
      chapter: 'Chapter 8: Master Vibration 11',
      pageNumber: 112,
      paragraph: 'Para 1-3',
      ocrConfidence: 0.98,
      importBatch: 'NUM-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 96,
      evidenceStrength: 95,
      knowledgeWeight: 0.96,
      confidenceScore: 96,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['Master Number 11 entry added.'],
    lastUpdatedBy: 'Admin Numerologist',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },
  {
    id: 'master-022',
    canonicalName: 'Master Number 22 — The Master Architect / Master Builder',
    alternateNames: ['Master Twenty-Two', 'Cosmic Builder'],
    numberValue: 22,
    system: 'Pythagorean',
    entityType: 'MasterNumber',
    description: 'Represents the ability to turn grand visionary ideals into concrete physical realities on a global scale. Combines the spiritual vision of 11 with the practical execution of 4.',
    category: 'Master Numbers',
    tags: ['MasterNumber', 'Builder', 'Architect', 'Realization', 'Structure'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedPlanet: 'Rahu / Earth',
    associatedElement: 'Earth / Ether',
    associatedColor: 'Coral / Dark Green',
    associatedDirection: 'South-West',
    metadata: {
      isMaster: true,
      unreducedValue: 22,
      reducedValue: 4,
      archetype: 'The Master Builder'
    },
    sourceTraceability: {
      sourceBook: 'Pythagorean Numerology Fundamentals',
      edition: 'Standard Critical Edition',
      author: 'Dr. Juno Jordan',
      publicationYear: 1965,
      publisher: 'DeVorss & Company',
      language: 'English',
      chapter: 'Chapter 9: Master Vibration 22',
      pageNumber: 128,
      paragraph: 'Para 2-4',
      ocrConfidence: 0.98,
      importBatch: 'NUM-BATCH-2026-001',
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
    revisionNotes: ['Master Number 22 entry added.'],
    lastUpdatedBy: 'Admin Numerologist',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },

  // COMPOUND NUMBERS
  {
    id: 'comp-010',
    canonicalName: 'Compound Number 10 — The Wheel of Fortune',
    alternateNames: ['Compound Ten', 'Rising Sun'],
    numberValue: 10,
    system: 'Chaldean',
    entityType: 'CompoundNumber',
    description: 'Symbolized as the Wheel of Fortune. Indicates honor, faith, self-confidence, rise and fall depending on intention, but ultimate success in undertakings.',
    category: 'Compound Numbers',
    tags: ['CompoundNumber', 'WheelOfFortune', 'Chaldean', 'Honor', 'Success'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedPlanet: 'Surya (Sun)',
    associatedColor: 'Gold',
    metadata: {
      compoundValue: 10,
      reducedValue: 1,
      symbolicMeaning: 'Honor & Triumph'
    },
    sourceTraceability: {
      sourceBook: 'Chaldean Numerology & Sacred Science',
      edition: '1st Master Edition',
      author: 'Cheiro',
      publicationYear: 1927,
      publisher: 'London Occult Publishing',
      language: 'English',
      chapter: 'Chapter 14: Compound Numbers',
      pageNumber: 154,
      paragraph: 'Para 1',
      ocrConfidence: 0.99,
      importBatch: 'NUM-BATCH-2026-001',
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
    revisionNotes: ['Compound 10 verified.'],
    lastUpdatedBy: 'Admin Numerologist',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },
  {
    id: 'comp-016',
    canonicalName: 'Compound Number 16 — The Shattered Citadel / The Tower',
    alternateNames: ['Compound Sixteen', 'Fallen Tower'],
    numberValue: 16,
    system: 'Chaldean',
    entityType: 'CompoundNumber',
    description: 'Symbolized by a Tower struck by Lightning. Warns against pride, sudden reversals, unforeseen downfall if driven by ego, and the need for spiritual humility.',
    category: 'Compound Numbers',
    tags: ['CompoundNumber', 'Tower', 'KarmicWarning', 'Chaldean', 'Caution'],
    version: '1.0.0',
    status: 'CANONICAL',
    associatedPlanet: 'Ketu / Neptune',
    associatedColor: 'Smoky Grey',
    metadata: {
      compoundValue: 16,
      reducedValue: 7,
      symbolicMeaning: 'Warning of Ego downfall'
    },
    sourceTraceability: {
      sourceBook: 'Chaldean Numerology & Sacred Science',
      edition: '1st Master Edition',
      author: 'Cheiro',
      publicationYear: 1927,
      publisher: 'London Occult Publishing',
      language: 'English',
      chapter: 'Chapter 14: Compound Numbers',
      pageNumber: 162,
      paragraph: 'Para 3-5',
      ocrConfidence: 0.98,
      importBatch: 'NUM-BATCH-2026-001',
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
    revisionNotes: ['Compound 16 verified.'],
    lastUpdatedBy: 'Admin Numerologist',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },

  // LETTER VALUES (CHALDEAN & PYTHAGOREAN)
  {
    id: 'let-chaldean-a',
    canonicalName: 'Letter A — Chaldean Vibration Value 1',
    alternateNames: ['Chaldean A'],
    numberValue: 1,
    system: 'Chaldean',
    entityType: 'LetterValue',
    description: 'In Chaldean numerology, the letter A carries a value of 1, connected with solar energy, initiating impulse, and leadership.',
    category: 'Alphabet Letter Values',
    tags: ['Chaldean', 'LetterA', 'Value1', 'Solar'],
    version: '1.0.0',
    status: 'CANONICAL',
    metadata: {
      letter: 'A',
      chaldeanValue: 1,
      pythagoreanValue: 1
    },
    sourceTraceability: {
      sourceBook: 'Chaldean Alphabet Coordinates Matrix',
      edition: '1st Edition',
      author: 'Cheiro',
      publicationYear: 1927,
      publisher: 'London Occult Publishing',
      language: 'English',
      chapter: 'Appendix A: Alphabet Table',
      pageNumber: 204,
      paragraph: 'Row A',
      ocrConfidence: 1.0,
      importBatch: 'NUM-BATCH-2026-001',
      importTimestamp: '2026-07-26T00:00:00Z',
      verificationStatus: 'CANONICAL'
    },
    truthEngineMetrics: {
      sourceReliability: 100,
      evidenceStrength: 100,
      knowledgeWeight: 1.0,
      confidenceScore: 100,
      confidenceGrade: 'A+',
      expertConsensusStatus: 'Approved',
      hasActiveConflict: false,
      isCanonical: true
    },
    revisionNotes: ['Verified Chaldean letter value A.'],
    lastUpdatedBy: 'Admin Numerologist',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  },
  {
    id: 'let-chaldean-f',
    canonicalName: 'Letter F — Chaldean Vibration Value 8',
    alternateNames: ['Chaldean F'],
    numberValue: 8,
    system: 'Chaldean',
    entityType: 'LetterValue',
    description: 'In Chaldean numerology, the letter F carries a value of 8 (Saturnian discipline), whereas in Pythagorean it carries a value of 6 (Venusian harmony).',
    category: 'Alphabet Letter Values',
    tags: ['Chaldean', 'LetterF', 'Value8', 'Saturn'],
    version: '1.0.0',
    status: 'CANONICAL',
    metadata: {
      letter: 'F',
      chaldeanValue: 8,
      pythagoreanValue: 6
    },
    sourceTraceability: {
      sourceBook: 'Chaldean Alphabet Coordinates Matrix',
      edition: '1st Edition',
      author: 'Cheiro',
      publicationYear: 1927,
      publisher: 'London Occult Publishing',
      language: 'English',
      chapter: 'Appendix A: Alphabet Table',
      pageNumber: 205,
      paragraph: 'Row F',
      ocrConfidence: 0.99,
      importBatch: 'NUM-BATCH-2026-001',
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
      hasActiveConflict: true,
      isCanonical: true
    },
    revisionNotes: ['System discrepancy noted between Chaldean (8) and Pythagorean (6).'],
    lastUpdatedBy: 'Admin Numerologist',
    lastUpdatedTimestamp: '2026-07-26T00:00:00Z'
  }
];

export const INITIAL_NUMEROLOGY_RELATIONSHIPS: INumerologyRelationship[] = [
  {
    id: 'rel-num-001-planet',
    sourceEntityId: 'num-001',
    targetEntityId: 'lk-grh-001', // Link to Surya in LalKitab
    relationshipType: 'REPRESENTS',
    weight: 0.98,
    isConditional: false,
    description: 'Number 1 directly represents the cosmic solar force of Surya (Sun).',
    sourceBook: 'Chaldean Numerology & Sacred Science'
  },
  {
    id: 'rel-num-002-planet',
    sourceEntityId: 'num-002',
    targetEntityId: 'lk-grh-002', // Link to Chandra
    relationshipType: 'REPRESENTS',
    weight: 0.97,
    isConditional: false,
    description: 'Number 2 directly represents lunar dualism and Chandra energy.',
    sourceBook: 'Chaldean Numerology & Sacred Science'
  },
  {
    id: 'rel-num-003-planet',
    sourceEntityId: 'num-003',
    targetEntityId: 'lk-grh-005', // Link to Guru
    relationshipType: 'REPRESENTS',
    weight: 0.99,
    isConditional: false,
    description: 'Number 3 directly represents Jupiterian wisdom (Guru / Brihaspati).',
    sourceBook: 'Chaldean Numerology & Sacred Science'
  },
  {
    id: 'rel-comp-016-conflict',
    sourceEntityId: 'comp-016',
    targetEntityId: 'num-001',
    relationshipType: 'CONFLICTS_WITH',
    weight: 0.85,
    isConditional: true,
    conditionText: 'When driven by arrogant ego or unverified commercial vanity.',
    description: 'Compound 16 indicates potential sudden reversals if unaligned solar ego overrides humility.',
    sourceBook: 'Chaldean Numerology & Sacred Science'
  }
];

export const INITIAL_NUMEROLOGY_CONFLICTS: INumerologyConflict[] = [
  {
    conflictId: 'conf-num-001',
    entityId: 'let-chaldean-f',
    conflictType: 'SYSTEM_DISCREPANCY',
    sourceA: 'Chaldean System (Cheiro 1927)',
    claimA: 'Letter F carries a value of 8 governed by Saturn / Zuhal.',
    sourceB: 'Pythagorean System (Jordan 1965)',
    claimB: 'Letter F is the 6th letter of the alphabet and carries a value of 6 governed by Venus.',
    description: 'Alphabet letter F assignment differs fundamentally between ancient Chaldean sound vibration coordinates and linear Pythagorean alphabetical position.',
    status: 'CONTEXTUAL_SPLIT',
    resolutionNotes: 'Contextual split maintained: Chaldean System uses phonetic sound vibration (8); Pythagorean uses sequential position (6).',
    resolvedBy: 'Admin Numerologist',
    resolvedTimestamp: '2026-07-26T00:00:00Z'
  },
  {
    conflictId: 'conf-num-002',
    entityId: 'comp-016',
    conflictType: 'MEANING_CONTRADICTION',
    sourceA: 'Chaldean Classic Text',
    claimA: 'Compound 16 warns of catastrophic downfall and fallen towers.',
    sourceB: 'Modern Neo-Pythagorean Text',
    claimB: 'Compound 16 represents deep introspective spiritual wisdom (1+6=7) without fatalistic ruin.',
    description: 'Historical severity of Compound 16 differs between strict Chaldean warnings and modern psychological numerology.',
    status: 'UNRESOLVED'
  }
];

export const INITIAL_NUMEROLOGY_DUPLICATES: INumerologyDuplicateMatch[] = [
  {
    matchId: 'dup-num-001-alt',
    primaryEntityId: 'num-001',
    candidateEntityId: 'num-001-draft-copy',
    similarityScore: 88,
    matchingAttributes: ['canonicalName', 'numberValue', 'associatedPlanet'],
    status: 'PENDING_REVIEW'
  }
];
