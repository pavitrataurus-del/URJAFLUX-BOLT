// ============================================================================
// SYNONYM ENGINE (PHASE 2B)
// Multi-lingual terminology resolution: English, Hindi, Sanskrit, Abbreviations
// ============================================================================

export class SynonymEngine {
  private static canonicalMap: Map<string, { canonical: string; synonyms: string[] }> = new Map([
    ["AGNEYA", {
      canonical: "AGNEYA_SOUTH_EAST",
      synonyms: ["Agneya", "South-East", "South East", "SE", "Fire Zone", "Agni", "Agni Kona", "Agni Stana", "South-Eastern Corner", "अग्नेय", "अग्नि", "दक्षिण-पूर्व", "Dakshin Purva"]
    }],
    ["ISHANYA", {
      canonical: "ISHANYA_NORTH_EAST",
      synonyms: ["Ishanya", "Eeshanya", "North-East", "North East", "NE", "Water Zone", "Ishan", "God Corner", "Eeshan", "Deva Kona", "ईशान", "ईशान्य", "उत्तर-पूर्व", "Uttar Purva"]
    }],
    ["BRAHMASTHAN", {
      canonical: "BRAHMASTHAN_CENTER",
      synonyms: ["Brahmasthan", "Center", "Central Zone", "Nabhi", "Brahma Kona", "Brahma Zone", "Core Center", "Cosmic Center", "ब्रह्मस्थान", "मध्य", "Centre"]
    }],
    ["NAIRUTYA", {
      canonical: "NAIRUTYA_SOUTH_WEST",
      synonyms: ["Nairutya", "South-West", "South West", "SW", "Earth Zone", "Nirriti", "Pitru Kona", "Heavy Zone", "नैऋत्य", "दक्षिण-पश्चिम", "Dakshin Pashchim"]
    }],
    ["VAYAVYA", {
      canonical: "VAYAVYA_NORTH_WEST",
      synonyms: ["Vayavya", "North-West", "North West", "NW", "Air Zone", "Vayu", "Vayu Kona", "Wind Corner", "वायव्य", "उत्तर-पश्चिम", "Uttar Pashchim"]
    }],
    ["NORTH", {
      canonical: "NORTH_KUBER",
      synonyms: ["North", "N", "Kuber", "Kubera", "उत्तर", "Uttar", "Uttara"]
    }],
    ["SOUTH", {
      canonical: "SOUTH_YAMA",
      synonyms: ["South", "S", "Yama", "Dakshin", "Dakshina", "दक्षिण"]
    }],
    ["EAST", {
      canonical: "EAST_INDRA",
      synonyms: ["East", "E", "Indra", "Purva", "Purab", "पूर्व"]
    }],
    ["WEST", {
      canonical: "WEST_VARUN",
      synonyms: ["West", "W", "Varun", "Varuna", "Paschim", "Pashchim", "पश्चिम"]
    }],
    ["KITCHEN", {
      canonical: "KITCHEN_COOKING_AREA",
      synonyms: ["Kitchen", "Pakashala", "Cooking Area", "Rasoi", "Rasoi Ghar", "Culinary Station", "Fire Hearth", "रसोई", "Pakshala", "Agni"]
    }],
    ["ENTRANCE", {
      canonical: "MAIN_ENTRANCE_DWARA",
      synonyms: ["Entrance", "Main Entrance", "Maha Dwara", "Simhadwara", "Entry Gate", "Front Door", "Main Door", "द्वार", "प्रवेश", "Dwara"]
    }],
    ["BEDROOM", {
      canonical: "MASTER_BEDROOM_SAYANAGRIHA",
      synonyms: ["Master Bedroom", "Bedroom", "Sayanagriha", "Sayana", "Rest Area", "Sleeping Chamber", "Owner Suite", "शयन", "शयनकक्ष", "निद्रा", "Master Bed"]
    }],
    ["TOILET", {
      canonical: "TOILET_SANITATION_ZONE",
      synonyms: ["Toilet", "Washroom", "Latrine", "WC", "Sanitation Area", "Shouchalaya", "Disposal Zone", "शौचालय", "Bathroom", "Snan"]
    }],
    ["STAIRCASE", {
      canonical: "STAIRCASE_SOPAN",
      synonyms: ["Staircase", "Stairs", "Stair", "Sopan", "Sopana", "Steps", "Lift", "सोपान", "STI", "STR"]
    }],
    ["LIVING_ROOM", {
      canonical: "LIVING_DRAWING_HALL",
      synonyms: ["Living Room", "Drawing Room", "Hall", "Lounge", "Sitting Room", "बैठक", "Drawing Hall"]
    }],
    ["WINDOW", {
      canonical: "WINDOW_JALOKHA",
      synonyms: ["Window", "Windows", "Khidki", "Jalokha", "Opening", "Ventilation", "खिड़की", "Win"]
    }],
    ["DOOR", {
      canonical: "DOOR_DWARA",
      synonyms: ["Door", "Gate", "Dwara", "Dwar", "द्वार", "Entry"]
    }],
    ["POOJA", {
      canonical: "POOJA_MANDIR",
      synonyms: ["Pooja", "Puja", "Mandir", "Temple", "Prayer Room", "मंदिर", "Devasthan"]
    }],
    ["WATER_TANK", {
      canonical: "WATER_STORAGE_JALASTHANA",
      synonyms: ["Water Tank", "Overhead Tank", "Underground Water Tank", "Borewell", "Jalasthana", "Water Reservoir"]
    }],
    ["AYADI", {
      canonical: "AYADI_MATHEMATICAL_FORMULAS",
      synonyms: ["Ayadi", "Ayadi Formulas", "Ayadi Six Formulas", "Aaya", "Vyaya", "Yoni", "Rashi", "Vara", "Tithi", "Ayadi Mathematical Harmony"]
    }]
  ]);

  /**
   * Resolves any input term/synonym to its canonical identifier.
   */
  public static resolveCanonicalName(term: string): string {
    const norm = term.trim().toUpperCase().replace(/[-_ ]+/g, " ");

    for (const [key, entry] of this.canonicalMap.entries()) {
      if (entry.canonical.replace(/_/g, " ") === norm || key === norm) {
        return entry.canonical;
      }
      for (const syn of entry.synonyms) {
        if (syn.toUpperCase().replace(/[-_ ]+/g, " ") === norm) {
          return entry.canonical;
        }
      }
    }

    // Default canonical fallback formatting
    return norm.replace(/\s+/g, "_");
  }

  /**
   * Retrieves all synonyms for a given canonical term or synonym.
   */
  public static getSynonyms(term: string): string[] {
    const canonical = this.resolveCanonicalName(term);
    for (const entry of this.canonicalMap.values()) {
      if (entry.canonical === canonical) {
        return [...entry.synonyms];
      }
    }
    return [term];
  }

  /**
   * Returns the entire Synonym Map dictionary.
   */
  public static getSynonymDictionary(): Record<string, string[]> {
    const dict: Record<string, string[]> = {};
    for (const entry of this.canonicalMap.values()) {
      dict[entry.canonical] = [...entry.synonyms];
    }
    return dict;
  }
}
