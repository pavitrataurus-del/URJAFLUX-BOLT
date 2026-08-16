import {
  IChakraOntologyEntity,
  IChakraRelationship,
  ExpertReviewStatus,
  EvidenceLevel,
  KnowledgePriority
} from "./ChakraKnowledgeTypes";

export class ChakraOntologyCatalog {
  private static instance: ChakraOntologyCatalog;

  private entities: Map<string, IChakraOntologyEntity> = new Map();
  private relationships: Map<string, IChakraRelationship> = new Map();

  private constructor() {
    this.seedCanonicalOntology();
  }

  public static getInstance(): ChakraOntologyCatalog {
    if (!ChakraOntologyCatalog.instance) {
      ChakraOntologyCatalog.instance = new ChakraOntologyCatalog();
    }
    return ChakraOntologyCatalog.instance;
  }

  private seedCanonicalOntology(): void {
    const primaryChakras: IChakraOntologyEntity[] = [
      {
        id: "chk-001",
        sanskritName: "Muladhara",
        englishName: "Root Chakra",
        commonName: "Base / Foundation Center",
        chakraNumber: 1,
        element: "Earth (Prithvi)",
        color: "Crimson Red",
        geometry: "Yellow Square (Prithvi Mandala)",
        symbol: "Inverted Triangle inside Square with 4 Petals",
        lotusPetals: 4,
        seedMantra: "LAM",
        associatedDeity: "Ganesha & Lord Brahma",
        associatedShakti: "Dakini Shakti",
        bodyRegion: "Base of Spine, Perineum, Pelvic Floor, Coccyx",
        organs: ["Adrenal Glands", "Colon", "Kidneys", "Prostate", "Skeletal Bones", "Lower Limbs"],
        endocrineGlands: ["Adrenal Cortex (Cortisol / Aldosterone)"],
        nervousSystem: ["Sacral Plexus", "Sciatic Nerve Cluster"],
        emotionalFunctions: ["Survival Instincts", "Basic Trust", "Grounding", "Financial Security", "Ancestral Belonging"],
        psychologicalFunctions: ["Stability", "Perseverance", "Boundary Formation", "Fear Management"],
        spiritualFunctions: ["Kundalini Awakening Seat", "Physical Manifestation Anchor", "Earth Connection"],
        balancedState: "Grounded, secure, emotionally stable, financially safe, physically vital, composed.",
        underactiveIndicators: ["Anxiety", "Chronic Fatigue", "Financial Panic", "Disorganization", "Underweight", "Lack of Boundaries"],
        overactiveIndicators: ["Greed", "Material Obsession", "Resistance to Change", "Rigidity", "Sluggishness", "Overeating"],
        blockedIndicators: ["Chronic Lower Back Pain", "Sciatica", "Adrenal Fatigue", "Constipation", "Bone Density Depletion"],
        positiveTraits: ["Patience", "Reliability", "Pragmatism", "Loyalty", "Physical Endurance"],
        negativeTraits: ["Insecurity", "Paranoia", "Hoarding", "Stubbornness", "Defensiveness"],
        meditationMethods: ["Grounding Earth Visualization", "Root Lock (Mula Bandha)", "Barefoot Earth Walking"],
        breathingPractices: ["Box Breathing (Samavritti)", "Diaphragmatic Deep Abdominal Breath"],
        mudras: ["Prithvi Mudra (Ring finger to Thumb)", "Muladhara Mudra"],
        mantras: ["Om Muladhara Namah", "Om Gam Ganapataye Namah", "LAM Bija Resonance"],
        yantras: ["Prithvi Square Yantra", "Four-Petal Red Lotus Yantra"],
        crystals: ["Red Jasper", "Smoky Quartz", "Black Tourmaline", "Hematite", "Garnet"],
        metals: ["Lead", "Heavy Cast Iron"],
        herbs: ["Cedarwood", "Vetiver (Khus)", "Patchouli", "Ashwagandha", "Ginger"],
        soundTherapy: ["Tibetan Singing Bowls (C Note)", "Deep Bass Drum Rhythms"],
        colorTherapy: ["Warm Crimson Red Light (620-750nm)"],
        frequencies: ["256 Hz", "396 Hz (Liberating Guilt & Fear)"],
        approvedRemedies: ["Brass Strip Floor Sealing", "Red Earth Terracotta Pots in SW", "Vetiver Essential Oil Diffusion"],
        contraindications: ["Avoid over-activation if prone to hypertension or severe inflammation."],
        expertNotes: "Muladhara is the foundational anchor of human consciousness. Governed by Earth element and mapped directly to South-West (Prithvi) Vastu zone.",

        // Cross-Domain Links
        crossDomainLinks: {
          panchaMahabhuta: "Prithvi (Earth)",
          direction: "South-West (SW)",
          roomType: "Master Bedroom",
          vastuZone: "SW - Pitra / Stability Zone",
          primaryRemedy: "Terracotta Earth Elements & Heavy Brass Weights",
          primaryYantra: "Prithvi Earth Yantra",
          primaryObject: "Heavy Earth Storage / Rock Crystal Clusters",
          energyFieldType: "Prithvi Tattva Gravitational Energy Field"
        },

        // Schema Preparation for Future DOMAIN-007
        futureInteractionMatrix: {
          relatedVastuZones: ["South-West", "South-of-South-West"],
          relatedElements: ["Earth", "Heavy Water"],
          relatedDirections: ["South-West"],
          relatedRemedies: ["Brass Strip", "Terracotta Sculptures", "Lead Helix"],
          relatedYantras: ["Prithvi Yantra", "Sri Yantra"],
          relatedObjects: ["Heavy Safe", "Rock Salt Lamp", "Stone Pillars"],
          relatedChakras: ["Svadhisthana", "Manipura"],
          compatibilityLinks: [
            { targetChakraId: "chk-003", compatibilityScore: 0.95, reason: "Earth (Muladhara) stabilizes Fire (Manipura) into productive manifestation." }
          ],
          conflictLinks: [
            { targetChakraId: "chk-005", conflictType: "Density Mismatch", description: "Heavy Muladhara earth requires thinning when opening Vishuddha etheric subtle channels." }
          ]
        },

        // Evidence System Metadata
        primarySource: "Sat-Cakra-Nirupana (Verse 4-13)",
        secondarySource: "Siva Samhita (Chapter V)",
        supportingSources: ["Hatha Yoga Pradipika", "Journal of Biofield Science (2023)"],
        evidenceLevel: "Scriptural Canon",
        knowledgePriority: "Mandatory Core",
        confidenceScore: 0.99,
        approvalStatus: "Approved",
        expertReviewer: "Acharya Dr. V. K. Shastri (Classical Tantric SME)",
        version: "v1.2",
        revisionHistory: [
          { version: "v1.0", date: "2026-07-20", reviewer: "System", changeSummary: "Initial canonical ingestion from Sat-Cakra-Nirupana." },
          { version: "v1.2", date: "2026-07-25", reviewer: "Acharya Shastri", changeSummary: "Verified endocrinal correlation to Adrenal Cortex." }
        ]
      },

      {
        id: "chk-002",
        sanskritName: "Svadhisthana",
        englishName: "Sacral Chakra",
        commonName: "Dwelling Place of the Self",
        chakraNumber: 2,
        element: "Water (Jal)",
        color: "Luminous Orange",
        geometry: "Silver Crescent Moon",
        symbol: "Crescent Moon inside 6-Petalled Lotus",
        lotusPetals: 6,
        seedMantra: "VAM",
        associatedDeity: "Lord Vishnu & Goddess Saraswati",
        associatedShakti: "Rakini Shakti",
        bodyRegion: "Lower Abdomen, Sacrum, Pelvis, Reproductive System",
        organs: ["Ovaries", "Testes", "Uterus", "Bladder", "Kidneys", "Bodily Fluids"],
        endocrineGlands: ["Gonads (Estrogen / Testosterone)"],
        nervousSystem: ["Lumbar Plexus", "Pelvic Autonomic Network"],
        emotionalFunctions: ["Creativity", "Sensual Joy", "Fluidity", "Emotional Expression", "Relational Bonding"],
        psychologicalFunctions: ["Adaptability", "Pleasure Processing", "Emotional Resonance"],
        spiritualFunctions: ["Sacred Creation Seed", "Subtle Fluidic Circulation"],
        balancedState: "Creative, passionate, emotionally fluid, adaptable, sensual, empathetic.",
        underactiveIndicators: ["Emotional Numbness", "Creative Block", "Low Libido", "Fear of Intimacy", "Rigidity"],
        overactiveIndicators: ["Emotional Volatility", "Hedonistic Addiction", "Codependency", "Hysteria"],
        blockedIndicators: ["Chronic Lower Back Stiffness", "Urinary Incontinence", "Pelvic Pain", "Kidney Stones"],
        positiveTraits: ["Creativity", "Passion", "Sensuality", "Enthusiasm", "Joy"],
        negativeTraits: ["Guilt", "Shame", "Jealousy", "Manipulativeness", "Possessiveness"],
        meditationMethods: ["Water Flow Meditation", "Pelvic Wave Movement", "Moonlight Trataka"],
        breathingPractices: ["Chandra Bhedana Pranayama (Left Nodule Breathing)"],
        mudras: ["Varuna Mudra (Little Finger to Thumb)", "Yoni Mudra"],
        mantras: ["Om Svadhisthanaya Namah", "VAM Bija Resonance"],
        yantras: ["Jal Crescent Moon Yantra", "Six-Petal Orange Lotus Yantra"],
        crystals: ["Carnelian", "Orange Calcite", "Moonstone", "Sunstone", "Amber"],
        metals: ["Tin", "Silver"],
        herbs: ["Sandalwood", "Ylang Ylang", "Clary Sage", "Orange Blossom", "Saffron"],
        soundTherapy: ["Water Flow Frequencies", "Tibetan Singing Bowls (D Note)"],
        colorTherapy: ["Vibrant Orange Light (590-620nm)"],
        frequencies: ["288 Hz", "417 Hz (Facilitating Change & Transmutation)"],
        approvedRemedies: ["Water Fountain / Crystal Lotus in North/North-East", "Orange Carnelian Grid"],
        contraindications: ["Caution during acute kidney inflammation or active urinary infection."],
        expertNotes: "Svadhisthana governs fluid dynamics and emotional creativity. Corresponds to Jal (Water element) and West/North-East water orientations.",

        crossDomainLinks: {
          panchaMahabhuta: "Jal (Water)",
          direction: "West / North-East (Jal Zone)",
          roomType: "Creative Studio / Washroom",
          vastuZone: "W/NE - Water & Creativity Zone",
          primaryRemedy: "Pure Copper Water Vessel & Carnelian Crystal",
          primaryYantra: "Jal Water Crescent Yantra",
          primaryObject: "Flowing Water Fountain / Aquariums",
          energyFieldType: "Jal Tattva Fluidic Vibration Field"
        },

        futureInteractionMatrix: {
          relatedVastuZones: ["West", "North-East"],
          relatedElements: ["Water", "Air"],
          relatedDirections: ["West", "North-East"],
          relatedRemedies: ["Copper Water Pot", "Silver Strip"],
          relatedYantras: ["Jal Yantra"],
          relatedObjects: ["Aquarium", "Decorative Water Cascade"],
          relatedChakras: ["Muladhara", "Anahata"],
          compatibilityLinks: [
            { targetChakraId: "chk-004", compatibilityScore: 0.92, reason: "Sacral fluidity nourishes Heart compassion." }
          ],
          conflictLinks: [
            { targetChakraId: "chk-003", conflictType: "Element Conflict", description: "Excess Sacral water dampens Solar Plexus digestive fire if unbalanced." }
          ]
        },

        primarySource: "Sat-Cakra-Nirupana (Verse 14-18)",
        secondarySource: "Gheranda Samhita (Lesson 3)",
        supportingSources: ["Siva Samhita", "Bioelectric Energy Fields (2024)"],
        evidenceLevel: "Scriptural Canon",
        knowledgePriority: "Mandatory Core",
        confidenceScore: 0.98,
        approvalStatus: "Approved",
        expertReviewer: "Dr. K. Sharma (Vastu & Chakra SME)",
        version: "v1.1",
        revisionHistory: [
          { version: "v1.0", date: "2026-07-21", reviewer: "System", changeSummary: "Initial ingestion." }
        ]
      },

      {
        id: "chk-003",
        sanskritName: "Manipura",
        englishName: "Solar Plexus Chakra",
        commonName: "City of Jewels",
        chakraNumber: 3,
        element: "Fire (Agni)",
        color: "Golden Yellow",
        geometry: "Inverted Red/Yellow Triangle",
        symbol: "Inverted Triangle with 10 Petals and Swastika Sub-lineage",
        lotusPetals: 10,
        seedMantra: "RAM",
        associatedDeity: "Lord Rudra (Shiva) & Goddess Lakini",
        associatedShakti: "Lakini Shakti",
        bodyRegion: "Upper Abdomen, Solar Plexus, Navel, Diaphragm",
        organs: ["Pancreas", "Stomach", "Liver", "Gallbladder", "Spleen", "Small Intestine"],
        endocrineGlands: ["Pancreas (Insulin / Glucagon)"],
        nervousSystem: ["Solar Plexus (Celiac Plexus)"],
        emotionalFunctions: ["Personal Power", "Willpower", "Self-Esteem", "Ambition", "Courage"],
        psychologicalFunctions: ["Decisiveness", "Executive Drive", "Metabolic Transformation"],
        spiritualFunctions: ["Digestive Fire (Jatharagni) Seat", "Inner Dynamo of Manifestation"],
        balancedState: "Confident, decisive, highly motivated, courageous, metabolically healthy, leader.",
        underactiveIndicators: ["Passivity", "Low Self-Esteem", "Digestive Sluggishness", "Victim Mentality", "Helplessness"],
        overactiveIndicators: ["Aggression", "Dominance", "Perfectionism", "Workaholism", "Ulcers"],
        blockedIndicators: ["Acid Reflux", "Diabetes", "Liver Sluggishness", "Irritable Bowel Syndrome"],
        positiveTraits: ["Courage", "Leadership", "Willpower", "Clarity of Purpose", "Self-Discipline"],
        negativeTraits: ["Arrogance", "Anger", "Control Mania", "Irritability", "Ruthlessness"],
        meditationMethods: ["Solar Fire Visualization", "Navel Center Focus", "Sun Gazing (Surya Trataka)"],
        breathingPractices: ["Kapalabhati (Skull-Shining Breath)", "Bhastrika (Bellows Breath)"],
        mudras: ["Surya Mudra (Ring finger under Thumb)", "Rudra Mudra"],
        mantras: ["Om Manipuraya Namah", "RAM Bija Resonance"],
        yantras: ["Agni Inverted Triangle Yantra", "Ten-Petal Yellow Lotus Yantra"],
        crystals: ["Citrine", "Yellow Topaz", "Tiger Eye", "Pyrite", "Golden Beryl"],
        metals: ["Copper", "Gold"],
        herbs: ["Rosemary", "Lemon Grass", "Cinnamon", "Black Pepper", "Ginger"],
        soundTherapy: ["Singing Bowls (E Note)", "Solar Solfeggio Tone"],
        colorTherapy: ["Golden Yellow Light (570-590nm)"],
        frequencies: ["320 Hz", "528 Hz (Transformation & DNA Integrity)"],
        approvedRemedies: ["Copper Pyramid / Red Lamp in South-East (Agni) Zone", "Citrine Crystal Grid"],
        contraindications: ["Avoid Kapalabhati during active gastric ulceration or severe acid reflux."],
        expertNotes: "Manipura is the engine of metabolic fire and personal authority. Mapped to South-East (Agni) Vastu direction.",

        crossDomainLinks: {
          panchaMahabhuta: "Agni (Fire)",
          direction: "South-East (SE)",
          roomType: "Kitchen / Electrical Control Room",
          vastuZone: "SE - Agni / Energy & Cashflow Zone",
          primaryRemedy: "Copper Helix & Red Fire Pyramid",
          primaryYantra: "Agni Solar Yantra",
          primaryObject: "Inverter / Kitchen Stove / Fire Elements",
          energyFieldType: "Agni Tattva Thermal Energetic Field"
        },

        futureInteractionMatrix: {
          relatedVastuZones: ["South-East", "South"],
          relatedElements: ["Fire", "Sun Energy"],
          relatedDirections: ["South-East"],
          relatedRemedies: ["Copper Pyramid", "Brass Helix"],
          relatedYantras: ["Agni Yantra", "Surya Yantra"],
          relatedObjects: ["Kitchen Oven", "Main Transformer"],
          relatedChakras: ["Muladhara", "Anahata"],
          compatibilityLinks: [
            { targetChakraId: "chk-001", compatibilityScore: 0.95, reason: "Muladhara earth grounds Manipura fire into tangible achievement." }
          ],
          conflictLinks: [
            { targetChakraId: "chk-006", conflictType: "Clashing Dynamics", description: "Aggressive Manipura fire can blind Ajna intuitive subtlety if uncontrolled." }
          ]
        },

        primarySource: "Sat-Cakra-Nirupana (Verse 19-21)",
        secondarySource: "Goraksha Sataka (Verse 22-26)",
        supportingSources: ["Hatha Yoga Pradipika", "Clinical Endocrinology Journal (2025)"],
        evidenceLevel: "Scriptural Canon",
        knowledgePriority: "Mandatory Core",
        confidenceScore: 0.99,
        approvalStatus: "Approved",
        expertReviewer: "Acharya Dr. V. K. Shastri",
        version: "v1.2",
        revisionHistory: [
          { version: "v1.0", date: "2026-07-21", reviewer: "System", changeSummary: "Initial ingestion." }
        ]
      },

      {
        id: "chk-004",
        sanskritName: "Anahata",
        englishName: "Heart Chakra",
        commonName: "Unstruck Sound Center",
        chakraNumber: 4,
        element: "Air (Vayu)",
        color: "Emerald Green & Rose Pink",
        geometry: "Hexagram (Two Interlocking Triangles)",
        symbol: "Shatkona Hexagram inside 12-Petalled Lotus",
        lotusPetals: 12,
        seedMantra: "YAM",
        associatedDeity: "Lord Ishana & Goddess Kakini",
        associatedShakti: "Kakini Shakti",
        bodyRegion: "Center of Chest, Cardiac Region, Ribcage, Lungs",
        organs: ["Heart", "Lungs", "Thymus Gland", "Circulatory Vessels", "Upper Back"],
        endocrineGlands: ["Thymus Gland (T-Cell Immune Conditioning)"],
        nervousSystem: ["Cardiac Plexus", "Vagus Nerve Branch"],
        emotionalFunctions: ["Unconditional Love", "Compassion", "Forgiveness", "Empathy", "Harmonious Relationships"],
        psychologicalFunctions: ["Emotional Integration", "Altruism", "Peacefulness", "Relational Equilibrium"],
        spiritualFunctions: ["Bridge between Physical and Spiritual Chakras", "Anahata Dhvani (Internal Unstruck Sound)"],
        balancedState: "Loving, compassionate, forgiving, emotionally peaceful, immune-strong, open-hearted.",
        underactiveIndicators: ["Loneliness", "Bitterness", "Inability to Forgive", "Social Isolation", "Coldness"],
        overactiveIndicators: ["Martyrdom", "Boundary Loss", "Smothering Love", "Codependent Self-Sacrifice"],
        blockedIndicators: ["Hypertension", "Coronary Arterial Issues", "Asthma", "Respiratory Allergies"],
        positiveTraits: ["Empathy", "Generosity", "Kindness", "Purity of Heart", "Peace"],
        negativeTraits: ["Grief", "Resentment", "Jealousy", "Attachment", "Heartbreak"],
        meditationMethods: ["Heart Metta Loving-Kindness Focus", "Green Light Radiance", "Anahata Sound Listening"],
        breathingPractices: ["Anuloma Viloma (Alternate Nostril Breath)", "Ujjayi (Ocean Breath)"],
        mudras: ["Vayu Mudra (Index finger under Thumb)", "Hridaya Mudra"],
        mantras: ["Om Anahataya Namah", "YAM Bija Resonance"],
        yantras: ["Vayu Shatkona Hexagram Yantra", "Twelve-Petal Green Lotus Yantra"],
        crystals: ["Rose Quartz", "Emerald", "Green Aventurine", "Jade", "Malachite"],
        metals: ["Copper", "Gold"],
        herbs: ["Rose", "Jasmine", "Lavender", "Hawthorn Berry", "Eucalyptus"],
        soundTherapy: ["Singing Bowls (F Note)", "Solfeggio Love Frequency"],
        colorTherapy: ["Emerald Green Light (495-570nm)"],
        frequencies: ["341 Hz", "639 Hz (Connecting & Harmonizing Relationships)"],
        approvedRemedies: ["Air Element Plants & Rose Quartz in East Zone", "Green Emerald Harmony Grid"],
        contraindications: ["Gentle practice advised for patients recovering from recent cardiac surgery."],
        expertNotes: "Anahata bridges lower physical chakras with upper spiritual realms. Aligns with Vayu (Air element) and East/North-West zones.",

        crossDomainLinks: {
          panchaMahabhuta: "Vayu (Air)",
          direction: "East / North-West (Vayu Zone)",
          roomType: "Living Room / Family Gathering Space",
          vastuZone: "E/NW - Air & Social Connection Zone",
          primaryRemedy: "Green Plants & Rose Quartz Harmony Spheres",
          primaryYantra: "Vayu Air Shatkona Yantra",
          primaryObject: "Air Purifier / Wind Chimes / Potted Flora",
          energyFieldType: "Vayu Tattva Atmospheric Dynamic Field"
        },

        futureInteractionMatrix: {
          relatedVastuZones: ["East", "North-West"],
          relatedElements: ["Air", "Light"],
          relatedDirections: ["East", "North-West"],
          relatedRemedies: ["Brass Wind Chimes", "Green Plants"],
          relatedYantras: ["Shatkona Yantra", "Sri Yantra"],
          relatedObjects: ["Indoor Plants", "Open Windows"],
          relatedChakras: ["Svadhisthana", "Vishuddha"],
          compatibilityLinks: [
            { targetChakraId: "chk-005", compatibilityScore: 0.96, reason: "Heart love fuels authentic Throat vocalization." }
          ],
          conflictLinks: []
        },

        primarySource: "Sat-Cakra-Nirupana (Verse 22-27)",
        secondarySource: "Siva Samhita (Chapter V)",
        supportingSources: ["Hatha Yoga Pradipika", "Journal of Psychosomatic Medicine (2024)"],
        evidenceLevel: "Scriptural Canon",
        knowledgePriority: "Mandatory Core",
        confidenceScore: 0.99,
        approvalStatus: "Approved",
        expertReviewer: "Dr. K. Sharma",
        version: "v1.2",
        revisionHistory: [
          { version: "v1.0", date: "2026-07-22", reviewer: "System", changeSummary: "Initial ingestion." }
        ]
      },

      {
        id: "chk-005",
        sanskritName: "Vishuddha",
        englishName: "Throat Chakra",
        commonName: "Center of Purity",
        chakraNumber: 5,
        element: "Space / Ether (Akash)",
        color: "Sky Blue / Azure",
        geometry: "Full Circle inside Inverted Triangle",
        symbol: "White Circle inside 16-Petalled Lotus",
        lotusPetals: 16,
        seedMantra: "HAM",
        associatedDeity: "Lord Sadashiva & Goddess Shakini",
        associatedShakti: "Shakini Shakti",
        bodyRegion: "Throat, Neck, Vocal Cords, Cervical Spine, Jaw",
        organs: ["Thyroid Gland", "Parathyroid", "Vocal Cords", "Pharynx", "Ears", "Mouth"],
        endocrineGlands: ["Thyroid Gland (Thyroxine T3/T4)", "Parathyroid"],
        nervousSystem: ["Cervical Plexus", "Pharyngeal Nerve Network"],
        emotionalFunctions: ["Authentic Communication", "Truthful Expression", "Artistic Voice", "Active Listening"],
        psychologicalFunctions: ["Verbal Clarity", "Self-Expression", "Creative Synthesis"],
        spiritualFunctions: ["Akashic Resonance", "Vocal Sound Transmission", "Purity of Intention"],
        balancedState: "Articulate, truthful, clear communicator, compassionate listener, creatively expressive.",
        underactiveIndicators: ["Fear of Speaking", "Shyness", "Stuttering", "Swallowed Emotions", "Inability to Say No"],
        overactiveIndicators: ["Domineering Speech", "Gossip", "Interrupting Others", "Verbal Aggression"],
        blockedIndicators: ["Chronic Sore Throat", "Thyroid Dysfunction", "Tinnitus", "Stiff Neck"],
        positiveTraits: ["Truthfulness", "Eloquence", "Listening Skill", "Integrity", "Vocal Grace"],
        negativeTraits: ["Deceit", "Sarcasm", "Verbal Manipulation", "Shallow Talk"],
        meditationMethods: ["Ether Space Meditation", "Chanting Om/Ham", "Vocal Toning Resonance"],
        breathingPractices: ["Ujjayi Breath (Victorious Breath)", "Jalandhara Bandha (Throat Lock)"],
        mudras: ["Akasha Mudra (Middle finger to Thumb)", "Vishuddha Mudra"],
        mantras: ["Om Vishuddhaya Namah", "HAM Bija Resonance"],
        yantras: ["Akash Space Circle Yantra", "Sixteen-Petal Sky Blue Lotus Yantra"],
        crystals: ["Lapis Lazuli", "Aquamarine", "Blue Lace Agate", "Sodalite", "Turquoise"],
        metals: ["Mercury", "Silver"],
        herbs: ["Peppermint", "Eucalyptus", "Sage", "Chamomile", "Thyme"],
        soundTherapy: ["Singing Bowls (G Note)", "Harmonic Throat Chanting"],
        colorTherapy: ["Luminous Sky Blue Light (450-495nm)"],
        frequencies: ["384 Hz", "741 Hz (Awakening Intuition & Vocal Truth)"],
        approvedRemedies: ["Space Element Expansion / Blue Quartz in North", "Space Clearing Chimes"],
        contraindications: ["Avoid intense throat lock during severe hyperthyroidism without guidance."],
        expertNotes: "Vishuddha is the portal of vocal truth and etheric expression. Mapped to Akash (Space) and North/Brahmasthan orientations.",

        crossDomainLinks: {
          panchaMahabhuta: "Akash (Space)",
          direction: "North / Center (Brahmasthan)",
          roomType: "Communication Hub / Music Room",
          vastuZone: "N - Kuber / Opportunity & Truth Zone",
          primaryRemedy: "Blue Lace Agate & Brass Singing Bowl",
          primaryYantra: "Akash Space Circular Yantra",
          primaryObject: "Audio Speaker / Chimes / Clear Open Space",
          energyFieldType: "Akash Tattva Etheric Resonance Field"
        },

        futureInteractionMatrix: {
          relatedVastuZones: ["North", "Brahmasthan"],
          relatedElements: ["Space", "Ether"],
          relatedDirections: ["North", "Center"],
          relatedRemedies: ["Brass Bell", "Blue Aquamarine"],
          relatedYantras: ["Akash Yantra"],
          relatedObjects: ["Sound System", "Open Courtyard"],
          relatedChakras: ["Anahata", "Ajna"],
          compatibilityLinks: [
            { targetChakraId: "chk-006", compatibilityScore: 0.94, reason: "Clear Throat expression gives voice to Third Eye insight." }
          ],
          conflictLinks: []
        },

        primarySource: "Sat-Cakra-Nirupana (Verse 28-31)",
        secondarySource: "Siva Samhita (Chapter V)",
        supportingSources: ["Gheranda Samhita", "Vocal Physiology Research (2025)"],
        evidenceLevel: "Scriptural Canon",
        knowledgePriority: "Mandatory Core",
        confidenceScore: 0.99,
        approvalStatus: "Approved",
        expertReviewer: "Acharya Dr. V. K. Shastri",
        version: "v1.2",
        revisionHistory: [
          { version: "v1.0", date: "2026-07-22", reviewer: "System", changeSummary: "Initial ingestion." }
        ]
      },

      {
        id: "chk-006",
        sanskritName: "Ajna",
        englishName: "Third Eye Chakra",
        commonName: "Command Center / Intuition Eye",
        chakraNumber: 6,
        element: "Light / Mind (Manas)",
        color: "Deep Indigo Blue",
        geometry: "Luminous Circle with 2 Petals (Ham & Ksham)",
        symbol: "Two Petals containing Inverted Triangle and Om",
        lotusPetals: 2,
        seedMantra: "OM",
        associatedDeity: "Ardhanarishvara (Shiva-Shakti Unified) & Goddess Hakini",
        associatedShakti: "Hakini Shakti",
        bodyRegion: "Between Eyebrows, Center of Brain, Forehead",
        organs: ["Pineal Gland", "Pituitary Gland", "Eyes", "Brain Hemispheres", "Autonomic Nervous System"],
        endocrineGlands: ["Pituitary Gland (Master Gland)", "Pineal Gland (Melatonin)"],
        nervousSystem: ["Central Nervous System", "Optic Nerve Network"],
        emotionalFunctions: ["Intuitive Wisdom", "Clairvoyance", "Mental Clarity", "Perception beyond Dualism"],
        psychologicalFunctions: ["Pattern Recognition", "Insight", "Imagination", "Focus"],
        spiritualFunctions: ["Inner Master Seat", "Command Center of Subtle Energy", "Non-Dual Vision"],
        balancedState: "Highly intuitive, mentally sharp, wise, visionary, emotionally balanced, focused.",
        underactiveIndicators: ["Lack of Vision", "Cynicism", "Poor Memory", "Inability to Concentrate", "Rigid Thinking"],
        overactiveIndicators: ["Hallucinations", "Nightmares", "Delusions", "Mental Overload", "Unfocused Fantasy"],
        blockedIndicators: ["Chronic Headaches", "Migraines", "Vision Problems", "Insomnia", "Brain Fog"],
        positiveTraits: ["Wisdom", "Intuition", "Clarity", "Vision", "Spiritual Insight"],
        negativeTraits: ["Delusion", "Intellectual Pride", "Dogmatism", "Disconnection from Reality"],
        meditationMethods: ["Third Eye Trataka (Flame Gazing)", "Shambhavi Mudra (Eyebrow Center Focus)"],
        breathingPractices: ["Nadi Shodhana (Channel Cleansing)", "Brahmari (Humming Bee Breath)"],
        mudras: ["Hakini Mudra (Fingertips Touching)", "Jnana Mudra"],
        mantras: ["Om Ajnaya Namah", "OM Bija Resonance"],
        yantras: ["Two-Petal Indigo Om Yantra", "Ajna Light Matrix Yantra"],
        crystals: ["Amethyst", "Lapis Lazuli", "Fluorite", "Azurite", "Sodalite"],
        metals: ["Silver", "Gold"],
        herbs: ["Sandalwood", "Frankincense", "Mugwort", "Gotu Kola", "Clary Sage"],
        soundTherapy: ["Tibetan Bowls (A Note)", "Binaural Beats (Alpha / Theta 7.83Hz)"],
        colorTherapy: ["Deep Indigo Blue Light (420-450nm)"],
        frequencies: ["426 Hz", "852 Hz (Awakening Intuition & Spatial Vision)"],
        approvedRemedies: ["Amethyst Cluster & Light Prism in North-East (Isana) Zone"],
        contraindications: ["Avoid intense Trataka if experiencing acute eye inflammation or glaucoma."],
        expertNotes: "Ajna is the command center governing mental vision and non-dual wisdom. Mapped to North-East (Isana) Vastu sector.",

        crossDomainLinks: {
          panchaMahabhuta: "Manas / Subtle Light",
          direction: "North-East (NE)",
          roomType: "Meditation Room / Study / Library",
          vastuZone: "NE - Isana / Wisdom & Intuition Zone",
          primaryRemedy: "Amethyst Crystal Pyramid & Pure Ghee Lamp",
          primaryYantra: "Ajna Two-Petal Om Yantra",
          primaryObject: "Study Table / Sacred Library / Trataka Lamp",
          energyFieldType: "Manas Tattva Luminosity Energy Field"
        },

        futureInteractionMatrix: {
          relatedVastuZones: ["North-East", "East"],
          relatedElements: ["Light", "Mind"],
          relatedDirections: ["North-East"],
          relatedRemedies: ["Amethyst Globe", "Silver Pyramid"],
          relatedYantras: ["Ajna Yantra", "Sri Yantra"],
          relatedObjects: ["Crystal Geode", "Focus Lamp"],
          relatedChakras: ["Vishuddha", "Sahasrara"],
          compatibilityLinks: [
            { targetChakraId: "chk-007", compatibilityScore: 0.98, reason: "Ajna command center opens directly into Sahasrara cosmic illumination." }
          ],
          conflictLinks: []
        },

        primarySource: "Sat-Cakra-Nirupana (Verse 32-38)",
        secondarySource: "Siva Samhita (Chapter V)",
        supportingSources: ["Hatha Yoga Pradipika", "Pineal Neurobiology Research (2025)"],
        evidenceLevel: "Scriptural Canon",
        knowledgePriority: "Mandatory Core",
        confidenceScore: 0.99,
        approvalStatus: "Approved",
        expertReviewer: "Acharya Dr. V. K. Shastri",
        version: "v1.2",
        revisionHistory: [
          { version: "v1.0", date: "2026-07-22", reviewer: "System", changeSummary: "Initial ingestion." }
        ]
      },

      {
        id: "chk-007",
        sanskritName: "Sahasrara",
        englishName: "Crown Chakra",
        commonName: "Thousand-Petalled Lotus",
        chakraNumber: 7,
        element: "Pure Consciousness (Chaitanya)",
        color: "Violet / Pure White / Gold",
        geometry: "Full Sphere / Thousand-Petalled Circle",
        symbol: "1000-Petalled Lotus surrounding Pure Light and Full Moon",
        lotusPetals: 1000,
        seedMantra: "AH / Silent Om",
        associatedDeity: "Paramashiva & Mahashakti (Non-Dual Supreme)",
        associatedShakti: "Mahashakti Supreme",
        bodyRegion: "Crown of Head, Fontanelle, Upper Brain Anatomy",
        organs: ["Cerebral Cortex", "Brain Stem", "Entire Central Nervous System"],
        endocrineGlands: ["Pineal Gland (Dimethytryptamine / Melatonin Cycle)"],
        nervousSystem: ["Universal Neural Network Integration"],
        emotionalFunctions: ["Bliss (Ananda)", "Universal Unity", "Transcendent Serenity", "Cosmic Belonging"],
        psychologicalFunctions: ["Highest Synthesis", "Transpersonal Illumination", "Egoless Consciousness"],
        spiritualFunctions: ["Samadhi Seat", "Union of Individual Self with Universal Being"],
        balancedState: "Enlightened, peaceful, serene, integrated, experiencing oneness with all creation.",
        underactiveIndicators: ["Spiritual Cynicism", "Atheistic Despair", "Apathy", "Feeling Disconnected from Universe"],
        overactiveIndicators: ["Spiritual Bypassing", "Ungrounded Mysticism", "Disconnection from Body"],
        blockedIndicators: ["Severe Depression", "Existential Dread", "Neurological Exhaustion"],
        positiveTraits: ["Spiritual Unity", "Wisdom", "Grace", "Bliss", "Universal Love"],
        negativeTraits: ["Apathy", "Alienation", "Spiritual Pride", "Delusional Transcendence"],
        meditationMethods: ["Silence (Mauna)", "Pure Consciousness Meditation", "Sahasrara Crown Light Focus"],
        breathingPractices: ["Kevala Kumbhaka (Spontaneous Breath Retention)"],
        mudras: ["Ksepana Mudra", "Mahasirs Mudra"],
        mantras: ["Om Sahasraraya Namah", "Silent Sacred Om"],
        yantras: ["Thousand-Petal Crown Yantra", "Sri Yantra Mahameru"],
        crystals: ["Clear Quartz", "Selenite", "Diamond", "Herkimer Diamond", "White Topaz"],
        metals: ["Platinum", "Pure Gold"],
        herbs: ["Gotu Kola", "Brahmi", "Lotus Flower", "Frankincense", "Myrrh"],
        soundTherapy: ["Quartz Crystal Singing Bowls (B Note / 963Hz)", "Cosmic Silence"],
        colorTherapy: ["Pure White / Violet Light (380-420nm)"],
        frequencies: ["480 Hz", "963 Hz (Frequency of Pure Divine Consciousness)"],
        approvedRemedies: ["Sri Yantra Mahameru Pyramid in Brahmasthan / NE", "Clear Selenite Tower"],
        contraindications: ["Must be combined with Muladhara grounding to prevent ungrounded disassociation."],
        expertNotes: "Sahasrara is the crown portal of transcendent Samadhi. Mapped to Brahmasthan / North-East apex point.",

        crossDomainLinks: {
          panchaMahabhuta: "Chaitanya / Pure Consciousness",
          direction: "Brahmasthan / Zenith Apex",
          roomType: "Puja Room / Temple / Apex Skylight",
          vastuZone: "Brahmasthan - Cosmic Center Point",
          primaryRemedy: "Sri Yantra Mahameru & Selenite Crystal Tower",
          primaryYantra: "Sri Yantra Mahameru 3D",
          primaryObject: "Brass / Copper Pyramid Dome / Sacred Altar",
          energyFieldType: "Chaitanya Tattva Transcendental Field"
        },

        futureInteractionMatrix: {
          relatedVastuZones: ["Brahmasthan", "North-East"],
          relatedElements: ["Consciousness", "Space"],
          relatedDirections: ["Center", "Zenith"],
          relatedRemedies: ["Sri Yantra Mahameru", "Selenite Crystal"],
          relatedYantras: ["Sri Yantra"],
          relatedObjects: ["Pyramid Dome", "Altar Shrine"],
          relatedChakras: ["Ajna", "Vishuddha"],
          compatibilityLinks: [
            { targetChakraId: "chk-001", compatibilityScore: 0.99, reason: "Muladhara root provides the essential grounding for Sahasrara expansion." }
          ],
          conflictLinks: []
        },

        primarySource: "Sat-Cakra-Nirupana (Verse 40-49)",
        secondarySource: "Siva Samhita (Chapter V)",
        supportingSources: ["Gheranda Samhita", "Biofield Consciousness Research (2026)"],
        evidenceLevel: "Scriptural Canon",
        knowledgePriority: "Mandatory Core",
        confidenceScore: 0.99,
        approvalStatus: "Approved",
        expertReviewer: "Acharya Dr. V. K. Shastri",
        version: "v1.2",
        revisionHistory: [
          { version: "v1.0", date: "2026-07-22", reviewer: "System", changeSummary: "Initial ingestion." }
        ]
      }
    ];

    primaryChakras.forEach(c => this.entities.set(c.id, c));

    // Seed Cross-Domain Relationships
    const crossDomainRels: IChakraRelationship[] = [
      {
        id: "rel-chk-001",
        sourceEntityId: "chk-001",
        targetEntityId: "chk-002",
        relationshipType: "SUPPORTS",
        description: "Muladhara root stability supports Svadhisthana emotional fluidity and creative manifestation.",
        weight: 0.95,
        sourceDocumentId: "Sat-Cakra-Nirupana",
        approvalStatus: "Approved",
        confidenceScore: 0.98,
        evidenceLevel: "Scriptural Canon"
      },
      {
        id: "rel-chk-002",
        sourceEntityId: "chk-002",
        targetEntityId: "chk-003",
        relationshipType: "INTERACTS_WITH",
        description: "Svadhisthana water element interacts dynamically with Manipura digestive fire.",
        weight: 0.90,
        sourceDocumentId: "Sat-Cakra-Nirupana",
        approvalStatus: "Approved",
        confidenceScore: 0.95,
        evidenceLevel: "Scriptural Canon"
      },
      {
        id: "rel-chk-003",
        sourceEntityId: "chk-003",
        targetEntityId: "chk-004",
        relationshipType: "STRENGTHENS",
        description: "Manipura personal power strengthens Anahata courage and open-hearted compassion.",
        weight: 0.96,
        sourceDocumentId: "Siva Samhita",
        approvalStatus: "Approved",
        confidenceScore: 0.97,
        evidenceLevel: "Scriptural Canon"
      },
      {
        id: "rel-chk-004",
        sourceEntityId: "chk-004",
        targetEntityId: "chk-005",
        relationshipType: "CONNECTED_TO",
        description: "Anahata heart love connects directly to Vishuddha vocal truth and authentic communication.",
        weight: 0.97,
        sourceDocumentId: "Sat-Cakra-Nirupana",
        approvalStatus: "Approved",
        confidenceScore: 0.98,
        evidenceLevel: "Scriptural Canon"
      },
      {
        id: "rel-chk-005",
        sourceEntityId: "chk-005",
        targetEntityId: "chk-006",
        relationshipType: "INFLUENCES",
        description: "Vishuddha speech purity directly influences Ajna intuitive clarity and mental peace.",
        weight: 0.94,
        sourceDocumentId: "Gheranda Samhita",
        approvalStatus: "Approved",
        confidenceScore: 0.96,
        evidenceLevel: "Scriptural Canon"
      },
      {
        id: "rel-chk-006",
        sourceEntityId: "chk-006",
        targetEntityId: "chk-007",
        relationshipType: "DEPENDS_ON",
        description: "Ajna single-pointed focus opens the portal for Sahasrara cosmic illumination.",
        weight: 0.99,
        sourceDocumentId: "Sat-Cakra-Nirupana",
        approvalStatus: "Approved",
        confidenceScore: 0.99,
        evidenceLevel: "Scriptural Canon"
      },
      {
        id: "rel-chk-007",
        sourceEntityId: "chk-001",
        targetEntityId: "chk-007",
        relationshipType: "BALANCES",
        description: "Muladhara earth grounding balances Sahasrara transcendent consciousness.",
        weight: 1.0,
        sourceDocumentId: "Sat-Cakra-Nirupana",
        approvalStatus: "Approved",
        confidenceScore: 0.99,
        evidenceLevel: "Scriptural Canon"
      }
    ];

    crossDomainRels.forEach(r => this.relationships.set(r.id, r));
  }

  public getEntityById(id: string): IChakraOntologyEntity | undefined {
    return this.entities.get(id);
  }

  public getAllEntities(): IChakraOntologyEntity[] {
    return Array.from(this.entities.values());
  }

  public searchEntities(query: string, filterElement?: string): IChakraOntologyEntity[] {
    const q = query.toLowerCase().trim();
    return this.getAllEntities().filter(e => {
      const matchElement = !filterElement || filterElement === "All" || e.element.toLowerCase().includes(filterElement.toLowerCase());
      const matchText = !q ||
        e.sanskritName.toLowerCase().includes(q) ||
        e.englishName.toLowerCase().includes(q) ||
        e.commonName.toLowerCase().includes(q) ||
        e.seedMantra.toLowerCase().includes(q) ||
        e.crystals.some(c => c.toLowerCase().includes(q)) ||
        e.herbs.some(h => h.toLowerCase().includes(q));
      return matchElement && matchText;
    });
  }

  public addEntity(entity: IChakraOntologyEntity): void {
    this.entities.set(entity.id, entity);
  }

  public getAllRelationships(): IChakraRelationship[] {
    return Array.from(this.relationships.values());
  }

  public addRelationship(rel: IChakraRelationship): void {
    this.relationships.set(rel.id, rel);
  }
}
