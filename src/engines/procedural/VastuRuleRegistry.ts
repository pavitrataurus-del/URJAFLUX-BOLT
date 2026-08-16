import { ProceduralRule, RuleEvaluationContext, EvaluationResultItem } from "./types";
import { canonicalMatchesRuleElement } from "../../recognition/RoomTaxonomyService";

/**
 * Normalizes zone string to standard 2-3 letter code or BRAHMASTHAN
 */
export function extractZoneCode(zoneStr: string): string {
  if (!zoneStr) return "";
  const upper = zoneStr.toUpperCase();
  if (upper.includes("BRAHMASTHAN") || upper.includes("CENTER")) return "BRAHMASTHAN";
  if (upper.includes("NNE") || upper.includes("NORTH-NORTH-EAST")) return "NNE";
  if (upper.includes("ENE") || upper.includes("EAST-NORTH-EAST")) return "ENE";
  if (upper.includes("ESE") || upper.includes("EAST-SOUTH-EAST")) return "ESE";
  if (upper.includes("SSE") || upper.includes("SOUTH-SOUTH-EAST")) return "SSE";
  if (upper.includes("SSW") || upper.includes("SOUTH-SOUTH-WEST")) return "SSW";
  if (upper.includes("WSW") || upper.includes("WEST-SOUTH-WEST")) return "WSW";
  if (upper.includes("WNW") || upper.includes("WEST-NORTH-WEST")) return "WNW";
  if (upper.includes("NNW") || upper.includes("NORTH-NORTH-WEST")) return "NNW";
  if (upper.includes("NE") || upper.includes("ISHANYA") || upper.includes("NORTHEAST") || upper.includes("NORTH-EAST")) return "NE";
  if (upper.includes("SE") || upper.includes("AGNEYA") || upper.includes("SOUTHEAST") || upper.includes("SOUTH-EAST")) return "SE";
  if (upper.includes("SW") || upper.includes("NIRRITI") || upper.includes("SOUTHWEST") || upper.includes("SOUTH-WEST")) return "SW";
  if (upper.includes("NW") || upper.includes("VAYAVYA") || upper.includes("NORTHWEST") || upper.includes("NORTH-WEST")) return "NW";
  if (upper.includes("NORTH") || upper.includes("(N)")) return "N";
  if (upper.includes("EAST") || upper.includes("(E)")) return "E";
  if (upper.includes("SOUTH") || upper.includes("(S)")) return "S";
  if (upper.includes("WEST") || upper.includes("(W)")) return "W";
  return upper;
}

export class VastuRuleRegistry {
  private rules: ProceduralRule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    this.rules = [
      // ================= KITCHEN RULES =================
      {
        id: "VASTU-KIT-NE-001",
        domain: "VASTU",
        category: "FIRE_ELEMENT",
        elementType: "kitchen",
        zones: ["NE", "NNE", "ENE"],
        ruleType: "DEFECT",
        severity: "CRITICAL",
        title: "Kitchen Located in North-East Area",
        description: "Problem: Kitchen is located in the North-East area.\nPossible Effect: According to traditional Vastu, the North-East is a water element zone. Placing a heat source here may create unwanted stress, financial friction, or reduced mental clarity.\nSuggested Remedy: Place a natural yellow marble slab beneath the cooktop and apply approved elemental balancing remedies.",
        remedy: "Place a natural yellow marble slab beneath the cooktop, install a Vastu Brass Energy Pyramid, and avoid blue/black kitchen accents.",
        citationMetadata: { bookTitle: "Brihat Samhita Vastu Vidya", chapter: "Agni Pratishta", pageNumber: 142 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 12, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "VASTU-KIT-SW-002",
        domain: "VASTU",
        category: "FIRE_ELEMENT",
        elementType: "kitchen",
        zones: ["SW", "SSW", "WSW"],
        ruleType: "DEFECT",
        severity: "CRITICAL",
        title: "Kitchen Located in South-West Area",
        description: "Problem: Kitchen is located in the South-West area.\nPossible Effect: The South-West represents stability and savings. Cooking here can cause energy imbalance, leading to unexpected expenses or relationship disagreements.\nSuggested Remedy: Embed a 3mm copper strip under the kitchen entrance threshold and place a warm yellow slab under the stove.",
        remedy: "Embed a 3mm copper strip under the kitchen entrance threshold, apply a warm yellow base slab under the stove, and install an Earth element crystal.",
        citationMetadata: { bookTitle: "Mayamatam Architectural Treatise", chapter: "Griha Vinasa", pageNumber: 88 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 10, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "VASTU-KIT-N-003",
        domain: "VASTU",
        category: "FIRE_ELEMENT",
        elementType: "kitchen",
        zones: ["N", "NNW"],
        ruleType: "DEFECT",
        severity: "HIGH",
        title: "Kitchen Located in North Zone",
        description: "Problem: Kitchen is located in the North zone.\nPossible Effect: The North governs business and career growth. Heat in this area may slow down new career or financial opportunities.\nSuggested Remedy: Place a green marble slab under the cooktop and keep a glass bowl with water and lemon in the North corner.",
        remedy: "Place a green marble slab under the stove and keep a brass bowl with water and lemon in the North corner.",
        citationMetadata: { bookTitle: "Vishvakarma Prakash", chapter: "Bhumi Pariksha", pageNumber: 210 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 8, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "VASTU-KIT-SE-004",
        domain: "VASTU",
        category: "FIRE_ELEMENT",
        elementType: "kitchen",
        zones: ["SE", "SSE"],
        ruleType: "BENEFICIAL",
        severity: "LOW",
        title: "Kitchen Located in South-East Area (Ideal Alignment)",
        description: "Problem: None (Ideal Alignment).\nPossible Effect: Aligning the kitchen with the South-East fire zone supports health, digestion, and financial prosperity.\nSuggested Remedy: Maintain a clean cooking environment and face East while cooking.",
        remedy: "Maintain clean cooking environment and face East while cooking.",
        citationMetadata: { bookTitle: "Samarangana Sutradhara", chapter: "Agni Kona", pageNumber: 54 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 5, status: "PLACEHOLDER_STATIC" }
      },

      // ================= MASTER BEDROOM RULES =================
      {
        id: "VASTU-BED-NE-001",
        domain: "VASTU",
        category: "EARTH_STABILITY",
        elementType: "master_bedroom",
        zones: ["NE", "NNE", "ENE"],
        ruleType: "DEFECT",
        severity: "CRITICAL",
        title: "Master Bedroom Located in North-East Area",
        description: "Problem: Master bedroom is located in the North-East area.\nPossible Effect: The North-East is best kept light and peaceful. Sleeping here can lead to restless sleep or feeling overwhelmed with responsibility.\nSuggested Remedy: Sleep facing South or East, use light off-white bedding, or consider shifting the master suite to the South-West.",
        remedy: "Relocate sleeping direction so head points South/East, use light off-white bedding, or shift master suite to Southwest.",
        citationMetadata: { bookTitle: "Manasara Vastu Shastra", chapter: "Sayana Griha", pageNumber: 312 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 14, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "VASTU-BED-SE-002",
        domain: "VASTU",
        category: "EARTH_STABILITY",
        elementType: "master_bedroom",
        zones: ["SE", "SSE", "ESE"],
        ruleType: "DEFECT",
        severity: "HIGH",
        title: "Master Bedroom Located in South-East Area",
        description: "Problem: Bedroom is located in the South-East fire zone.\nPossible Effect: Excess fire energy in a bedroom can lead to irritability, restlessness, or occasional arguments.\nSuggested Remedy: Use soft pastel colors like pink or cream, avoid red decor, and keep the bed slightly away from the South-East corner.",
        remedy: "Use pastel pink or cream shades, avoid red decor, and keep bed away from Southeast corner wall.",
        citationMetadata: { bookTitle: "Vishvakarma Prakash", chapter: "Sayana Kendra", pageNumber: 178 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 9, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "VASTU-BED-SW-003",
        domain: "VASTU",
        category: "EARTH_STABILITY",
        elementType: "master_bedroom",
        zones: ["SW", "SSW"],
        ruleType: "BENEFICIAL",
        severity: "LOW",
        title: "Master Bedroom Located in South-West (Ideal Alignment)",
        description: "Problem: None (Ideal Alignment).\nPossible Effect: Placing the primary bedroom in the South-West promotes stability, strong decision-making, and deep restful sleep.\nSuggested Remedy: Position bed with head towards South or West; use solid furniture.",
        remedy: "Position bed with head towards South or West; use solid heavy teakwood furniture.",
        citationMetadata: { bookTitle: "Brihat Samhita", chapter: "Griha Lakshana", pageNumber: 99 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 6, status: "PLACEHOLDER_STATIC" }
      },

      // ================= TOILET / BATHROOM RULES =================
      {
        id: "VASTU-TOI-NE-001",
        domain: "VASTU",
        category: "DISPOSAL_ELEMENT",
        elementType: "toilet",
        zones: ["NE", "NNE", "ENE"],
        ruleType: "DEFECT",
        severity: "CRITICAL",
        title: "Toilet Located in North-East Area",
        description: "Problem: Toilet or bathroom is located in the North-East area.\nPossible Effect: The North-East is traditionally kept clean and serene. A toilet here can weaken positive energy flow and lower mental clarity.\nSuggested Remedy: Keep a glass bowl with raw sea salt inside, keep the door closed, and place a brass/copper boundary wire around the toilet base.",
        remedy: "Insert a 3mm brass/copper strip wire flush along the toilet base perimeter, place raw sea salt in a clear glass bowl, and keep door strictly closed.",
        citationMetadata: { bookTitle: "Asho Vastu Grantha", chapter: "Shaucha Sthana", pageNumber: 201 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 16, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "VASTU-TOI-SW-002",
        domain: "VASTU",
        category: "DISPOSAL_ELEMENT",
        elementType: "toilet",
        zones: ["SW", "SSW"],
        ruleType: "DEFECT",
        severity: "CRITICAL",
        title: "Toilet Located in South-West Area",
        description: "Problem: Toilet is located in the South-West stability area.\nPossible Effect: Waste disposal in the South-West can disrupt household stability, leading to financial leakage or feeling ungrounded.\nSuggested Remedy: Border the toilet base with yellow brass wire strip and keep a yellow sea salt bowl in the corner.",
        remedy: "Border toilet base with 3mm yellow brass wire strip, hang a Vastu Lead Helix on the outer door, and use yellow sea salt dish.",
        citationMetadata: { bookTitle: "Mayamatam", chapter: "Shaucha Griha", pageNumber: 114 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 15, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "VASTU-TOI-SE-003",
        domain: "VASTU",
        category: "DISPOSAL_ELEMENT",
        elementType: "toilet",
        zones: ["SE", "SSE"],
        ruleType: "DEFECT",
        severity: "HIGH",
        title: "Toilet Located in South-East Area",
        description: "Problem: Toilet is located in the South-East fire zone.\nPossible Effect: Water drainage in the fire zone can create financial delays or energy fatigue.\nSuggested Remedy: Apply a red boundary tape or copper strip around the base and keep a copper pyramid nearby.",
        remedy: "Install a red tape or copper strip around toilet seat base and keep a copper Vastu wire in the corner.",
        citationMetadata: { bookTitle: "Vishvakarma Prakash", chapter: "Jala Dosh", pageNumber: 222 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 11, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "VASTU-TOI-N-004",
        domain: "VASTU",
        category: "DISPOSAL_ELEMENT",
        elementType: "toilet",
        zones: ["N"],
        ruleType: "DEFECT",
        severity: "MEDIUM",
        title: "Toilet Located in North Zone",
        description: "Problem: Toilet is located in the North career quadrant.\nPossible Effect: Drainage in the North zone can slow down business progress or financial opportunities.\nSuggested Remedy: Place a blue boundary tape or stainless steel wire strip around the toilet base.",
        remedy: "Place a blue tape or stainless steel strip wire around toilet base and place camphor bowl inside.",
        citationMetadata: { bookTitle: "Samarangana Sutradhara", chapter: "Nidhi Dosh", pageNumber: 87 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 10, status: "PLACEHOLDER_STATIC" }
      },

      // ================= MAIN ENTRANCE RULES =================
      {
        id: "VASTU-ENT-SW-001",
        domain: "VASTU",
        category: "ENTRANCE_PADA",
        elementType: "main_entrance",
        zones: ["SW", "SSW"],
        ruleType: "DEFECT",
        severity: "CRITICAL",
        title: "Main Entrance Located in South-West Zone",
        description: "Problem: Main entrance is located in the South-West area.\nPossible Effect: An entrance in the South-West allows energy to leak from the stability sector, potentially affecting financial steady flow or authority.\nSuggested Remedy: Embed lead helix metal strips under the threshold, paint the door frame cream/beige, and display a protective emblem.",
        remedy: "Embed lead helix metal strips under door threshold, paint door frame light yellow/beige, and hang Gayatri/Om brass plaque.",
        citationMetadata: { bookTitle: "Brihat Samhita", chapter: "Dwara Nirnaya", pageNumber: 165 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 18, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "VASTU-ENT-SE-002",
        domain: "VASTU",
        category: "ENTRANCE_PADA",
        elementType: "main_entrance",
        zones: ["SE", "ESE"],
        ruleType: "DEFECT",
        severity: "HIGH",
        title: "Main Entrance Located in South-East Zone",
        description: "Problem: Main entrance is located in the South-East area.\nPossible Effect: Entrance in the fire zone can create restless energy or frequent misunderstandings among family members.\nSuggested Remedy: Install a 3mm copper strip on the threshold and use warm lighting at the entryway.",
        remedy: "Install 3mm copper strip wire on threshold and hang a red coral Vastu energy protector outside door.",
        citationMetadata: { bookTitle: "Mayamatam", chapter: "Dwara Vinasa", pageNumber: 120 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 11, status: "PLACEHOLDER_STATIC" }
      },

      // ================= POOJA ROOM RULES =================
      {
        id: "VASTU-POO-SW-001",
        domain: "VASTU",
        category: "SACRED_ENERGY",
        elementType: "pooja_room",
        zones: ["SW", "SSW"],
        ruleType: "DEFECT",
        severity: "CRITICAL",
        title: "Pooja Room Located in South-West Zone",
        description: "Problem: Altar or Pooja space is placed in the South-West area.\nPossible Effect: The South-West is heavy and grounded, whereas prayer areas require light, rising energy. This mismatch can create spiritual disconnect.\nSuggested Remedy: Relocate the altar to the North-East or East when feasible, and keep a clean white marble slab under idols.",
        remedy: "Relocate Pooja altar to Northeast or East immediately; keep brass pyramid and white marble platform.",
        citationMetadata: { bookTitle: "Vishvakarma Prakash", chapter: "Deva Sthana", pageNumber: 45 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 12, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "VASTU-POO-NE-002",
        domain: "VASTU",
        category: "SACRED_ENERGY",
        elementType: "pooja_room",
        zones: ["NE", "NNE", "ENE", "N"],
        ruleType: "BENEFICIAL",
        severity: "LOW",
        title: "Pooja Room Located in North-East (Ideal Alignment)",
        description: "Problem: None (Ideal Alignment).\nPossible Effect: Placing the prayer altar in the North-East invites serene cosmic energy, wisdom, and peace of mind.\nSuggested Remedy: Keep the area clean, light a ghee lamp, and maintain clutter-free surroundings.",
        remedy: "Keep area spotless, light ghee lamp daily, avoid clutter.",
        citationMetadata: { bookTitle: "Brihat Samhita", chapter: "Deva Pratishta", pageNumber: 80 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 5, status: "PLACEHOLDER_STATIC" }
      },

      // ================= STAIRCASE RULES =================
      {
        id: "VASTU-STR-NE-001",
        domain: "VASTU",
        category: "HEAVY_STRUCTURE",
        elementType: "staircase",
        zones: ["NE", "NNE", "ENE"],
        ruleType: "DEFECT",
        severity: "CRITICAL",
        title: "Heavy Staircase Located in North-East Area",
        description: "Problem: Heavy staircase is located in the North-East area.\nPossible Effect: According to traditional Vastu, this area is ideally kept light and open. A heavy staircase here may reduce positive energy and mental clarity.\nSuggested Remedy: Move the staircase if possible. If structural changes are not possible, keep the area well lit, painted in light cream tones, and place approved copper pyramids near the first step.",
        remedy: "Paint staircase structure off-white/cream, place 4 Vastu Copper Pyramids under first step, and keep light burning under stairs 24/7.",
        citationMetadata: { bookTitle: "Samarangana Sutradhara", chapter: "Sopana Vidhi", pageNumber: 133 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 15, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "VASTU-STR-BRAH-002",
        domain: "VASTU",
        category: "HEAVY_STRUCTURE",
        elementType: "staircase",
        zones: ["BRAHMASTHAN"],
        ruleType: "DEFECT",
        severity: "CRITICAL",
        title: "Staircase Located in Center (Brahmasthan)",
        description: "Problem: Staircase is positioned in the central area of the property.\nPossible Effect: The center core is meant to be open for natural light and air circulation. Heavy structures here can cause instability in family or business routines.\nSuggested Remedy: Install central balancing brass pyramids around the central column and keep the core space clutter-free.",
        remedy: "Install Brahmasthan Brass Pyramid grid around central column and place yellow floor carpet.",
        citationMetadata: { bookTitle: "Mayamatam", chapter: "Madhya Desha", pageNumber: 76 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 14, status: "PLACEHOLDER_STATIC" }
      },

      // ================= WATER TANKS & BOREWELL =================
      {
        id: "VASTU-WT-UNDER-SW-001",
        domain: "VASTU",
        category: "WATER_ELEMENT",
        elementType: "underground_water_tank",
        zones: ["SW", "SSW"],
        ruleType: "DEFECT",
        severity: "CRITICAL",
        title: "Underground Water Pit Located in South-West",
        description: "Problem: Underground water pit or tank is located in the South-West area.\nPossible Effect: The South-West provides earth stability. Digging a pit here can weaken structural stability and financial consistency.\nSuggested Remedy: Seal or relocate the pit to the North-East or East if possible, or place an approved heavy RCC cover and copper grid.",
        remedy: "Fill the pit immediately or seal top completely with heavy RCC slab and place copper pyramid grid above.",
        citationMetadata: { bookTitle: "Vishvakarma Prakash", chapter: "Jala Sthana", pageNumber: 198 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 16, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "VASTU-WT-OVER-NE-002",
        domain: "VASTU",
        category: "HEAVY_STRUCTURE",
        elementType: "overhead_water_tank",
        zones: ["NE", "NNE", "ENE"],
        ruleType: "DEFECT",
        severity: "CRITICAL",
        title: "Overhead Water Tank Located in North-East Area",
        description: "Problem: Heavy overhead water tank is positioned in the North-East area.\nPossible Effect: Heavy top load in the North-East creates unwanted weight in a zone that should be kept light and elevated.\nSuggested Remedy: Shift heavy water loads to the South or South-West, or paint the tank exterior in bright balancing tones.",
        remedy: "Paint tank exterior bright yellow/red to balance weight energy and relocate water tank load to South/Southwest.",
        citationMetadata: { bookTitle: "Brihat Samhita", chapter: "Urdhva Jala", pageNumber: 215 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 13, status: "PLACEHOLDER_STATIC" }
      },

      // ================= SEPTIC TANK RULES =================
      {
        id: "VASTU-SEP-NE-001",
        domain: "VASTU",
        category: "DISPOSAL_ELEMENT",
        elementType: "septic_tank",
        zones: ["NE", "NNE", "ENE", "N"],
        ruleType: "DEFECT",
        severity: "CRITICAL",
        title: "Septic Tank Located in North-East Area",
        description: "Problem: Septic tank is located in the North-East area.\nPossible Effect: Waste disposal in the North-East zone can disturb natural energy purity and peaceful atmosphere in the house.\nSuggested Remedy: Relocate septic tank to an approved disposal zone like South-South-West or West-North-West, or install certified lead helix boundary anchors.",
        remedy: "Relocate septic tank to SSW or WNW immediately; embed 4 lead helix bars around pit perimeter.",
        citationMetadata: { bookTitle: "Manasara", chapter: "Kupadi Sthana", pageNumber: 289 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 17, status: "PLACEHOLDER_STATIC" }
      },

      // ================= STORE / UTILITY / BALCONY / PARKING =================
      {
        id: "VASTU-STO-NE-001",
        domain: "VASTU",
        category: "CLUTTER_WEIGHT",
        elementType: "store",
        zones: ["NE", "NNE"],
        ruleType: "DEFECT",
        severity: "HIGH",
        title: "Store Room Clutter Located in North-East Area",
        description: "Problem: Heavy storage or junk accumulated in the North-East area.\nPossible Effect: Clutter in the North-East restricts light and energy, leading to feeling stuck or mentally exhausted.\nSuggested Remedy: Clear out old unused items, keep the room well illuminated, and keep sea salt in a clear glass dish.",
        remedy: "Clean out heavy scrap goods, install bright white illumination, and place sea salt dish.",
        citationMetadata: { bookTitle: "Vishvakarma Prakash", chapter: "Koshtha Griha", pageNumber: 150 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 8, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "VASTU-BAL-SW-001",
        domain: "VASTU",
        category: "OPEN_SPACE",
        elementType: "balcony",
        zones: ["SW", "SSW"],
        ruleType: "DEFECT",
        severity: "HIGH",
        title: "Open Balcony Located in South-West Area",
        description: "Problem: Large open balcony situated in the South-West corner.\nPossible Effect: An open projection in the South-West can drain stable energy, making financial management challenging.\nSuggested Remedy: Enclose balcony with sliding glass panels or place heavy ceramic planters along the edge.",
        remedy: "Enclose balcony with heavy glass sliding windows and place heavy ceramic planter pots.",
        citationMetadata: { bookTitle: "Mayamatam", chapter: "Alinda Nirnaya", pageNumber: 92 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 9, status: "PLACEHOLDER_STATIC" }
      }
    ];
  }

  public getAllRules(): ProceduralRule[] {
    return this.rules;
  }

  public evaluateElement(context: RuleEvaluationContext): EvaluationResultItem[] {
    const results: EvaluationResultItem[] = [];
    const zoneCode = extractZoneCode(context.assignedZone);
    const canonicalType = (context.canonicalType || "UNKNOWN_ROOM") as import("../../recognition/RoomTaxonomyService").CanonicalRoomType;

    for (const rule of this.rules) {
      const typeMatches = canonicalMatchesRuleElement(canonicalType, rule.elementType);

      if (!typeMatches) continue;

      // Check zone matching
      const zoneMatches = rule.zones.some(z => z === zoneCode || z === "ALL");
      if (!zoneMatches) continue;

      results.push({
        id: `EVAL-${rule.id}-${context.elementId}`,
        ruleId: rule.id,
        domain: rule.domain,
        title: rule.title,
        severity: rule.severity,
        zone: context.assignedZone,
        description: rule.description,
        remedy: rule.remedy,
        elementName: context.elementName,
        ruleType: rule.ruleType,
        citationMetadata: rule.citationMetadata,
        candidateAstMetadata: rule.candidateAstMetadata
      });
    }

    return results;
  }
}

export const vastuRuleRegistry = new VastuRuleRegistry();
