/**
 * Room Taxonomy Service — single source of truth for OCR label → canonicalType resolution.
 *
 * All Vastu analysis components must resolve canonical room categories through this service.
 * Do not scatter string matching for room types elsewhere in the codebase.
 *
 * displayName: verbatim OCR label (only leading/trailing whitespace trimmed for display).
 * canonicalType: internal category used by the Vastu Rule Engine.
 */

export type CanonicalRoomType =
  | "BEDROOM"
  | "KITCHEN"
  | "LIVING_ROOM"
  | "DINING"
  | "STORE"
  | "TOILET"
  | "STUDY"
  | "POOJA"
  | "STAIRCASE"
  | "MAIN_ENTRANCE"
  | "BALCONY"
  | "WINDOW"
  | "DOOR"
  | "UNKNOWN_ROOM"
  | "UNKNOWN";

export interface RoomTaxonomyMappingResult {
  displayName: string;
  canonicalType: CanonicalRoomType;
  confidence: number;
}

export type RoomBreakdownCategory =
  | "kitchens"
  | "bedrooms"
  | "toilets"
  | "staircases"
  | "septicTanks"
  | "waterTanks"
  | "parking"
  | "poojaRooms"
  | "livingRooms"
  | "unknownSpaces"
  | "otherElements";

interface TaxonomyRule {
  canonicalType: CanonicalRoomType;
  patterns: RegExp[];
  confidence: number;
}

/** Order matters: more specific patterns are listed first within each rule. */
const ROOM_TAXONOMY_RULES: TaxonomyRule[] = [
  {
    canonicalType: "POOJA",
    confidence: 0.96,
    patterns: [
      /\bpooja\b/,
      /\bpuja\b/,
      /\bprayer\s+room\b/,
      /\bmandir\b/,
      /\btemple\b/,
    ],
  },
  {
    canonicalType: "KITCHEN",
    confidence: 0.95,
    patterns: [
      /\bopen\s+kitchen\b/,
      /\bdry\s+kitchen\b/,
      /\bwet\s+kitchen\b/,
      /\bmodular\s+kitchen\b/,
      /\bkitchen\b/,
    ],
  },
  {
    canonicalType: "TOILET",
    confidence: 0.95,
    patterns: [
      /\bpowder\s+room\b/,
      /\bwashroom\b/,
      /\bbathroom\b/,
      /\btoilet\b/,
      /\bwc\b/,
      /\bbath\b/,
    ],
  },
  {
    canonicalType: "BEDROOM",
    confidence: 0.94,
    patterns: [
      /\bguest\s+bed(?:room)?\b/,
      /\bmaster\s+bed(?:room)?\b/,
      /\bparents?\s+bed(?:room)?\b/,
      /\bkids?\s+bed(?:room)?\b/,
      /\bchildren'?s?\s+bed(?:room)?\b/,
      /\bbed(?:room)?\s*\d+/,
      /\bbed(?:room)?\b/,
    ],
  },
  {
    canonicalType: "LIVING_ROOM",
    confidence: 0.93,
    patterns: [
      /\bdrawing\s+room\b/,
      /\bliving\s+room\b/,
      /\bfamily\s+lounge\b/,
      /\blounge\b/,
      /\bhall\b/,
      /\bdrawing\b/,
    ],
  },
  {
    canonicalType: "DINING",
    confidence: 0.93,
    patterns: [
      /\bdining\s+hall\b/,
      /\bdining\s+room\b/,
      /\bdining\b/,
    ],
  },
  {
    canonicalType: "STORE",
    confidence: 0.92,
    patterns: [
      /\butility\s+store\b/,
      /\bpantry\b/,
      /\bstorage\b/,
      /\bstore\b/,
    ],
  },
  {
    canonicalType: "STUDY",
    confidence: 0.92,
    patterns: [
      /\bhome\s+office\b/,
      /\boffice\b/,
      /\blibrary\b/,
      /\bstudy\b/,
    ],
  },
  {
    canonicalType: "STAIRCASE",
    confidence: 0.94,
    patterns: [
      /\bstaircase\b/,
      /\bstair(?:s|case)?\b/,
    ],
  },
  {
    canonicalType: "MAIN_ENTRANCE",
    confidence: 0.94,
    patterns: [
      /\bmain\s+door\b/,
      /\bmain\s+entrance\b/,
      /\bentrance\b/,
      /\bentry\b/,
    ],
  },
  {
    canonicalType: "BALCONY",
    confidence: 0.91,
    patterns: [
      /\bbalcony\b/,
      /\bverandah\b/,
      /\bterrace\b/,
    ],
  },
];

const MASTER_BEDROOM_PATTERN = /\bmaster\s+bed(?:room)?\b/;

/**
 * Normalize label text for taxonomy matching only.
 * Case-insensitive, collapses multiple spaces, trims leading/trailing whitespace.
 */
export function normalizeLabelForMatch(label: string): string {
  return label.trim().replace(/\s+/g, " ").toLowerCase();
}

export class RoomTaxonomyService {
  private static instance: RoomTaxonomyService;

  private constructor() {}

  public static getInstance(): RoomTaxonomyService {
    if (!RoomTaxonomyService.instance) {
      RoomTaxonomyService.instance = new RoomTaxonomyService();
    }
    return RoomTaxonomyService.instance;
  }

  /**
   * Resolve canonicalType from a verbatim OCR / display label.
   * Never invents labels — only maps text that was already detected.
   */
  public resolveFromDisplayName(displayLabel: string): RoomTaxonomyMappingResult {
    const displayName = displayLabel.trim();
    if (!displayName) {
      return this.buildResult(displayName, "UNKNOWN_ROOM", 0.5);
    }

    const normalized = normalizeLabelForMatch(displayName);

    for (const rule of ROOM_TAXONOMY_RULES) {
      for (const pattern of rule.patterns) {
        if (pattern.test(normalized)) {
          return this.buildResult(displayName, rule.canonicalType, rule.confidence);
        }
      }
    }

    return this.buildResult(displayName, "UNKNOWN_ROOM", 0.5);
  }

  public resolveCanonicalType(displayLabel: string): CanonicalRoomType {
    return this.resolveFromDisplayName(displayLabel).canonicalType;
  }

  public canonicalToRuleElementType(canonicalType: CanonicalRoomType): string {
    switch (canonicalType) {
      case "BEDROOM":
        return "bedroom";
      case "KITCHEN":
        return "kitchen";
      case "LIVING_ROOM":
        return "living";
      case "DINING":
        return "dining";
      case "STORE":
        return "store";
      case "TOILET":
        return "toilet";
      case "STUDY":
        return "study";
      case "POOJA":
        return "pooja_room";
      case "STAIRCASE":
        return "staircase";
      case "MAIN_ENTRANCE":
        return "main_entrance";
      case "BALCONY":
        return "balcony";
      case "WINDOW":
        return "window";
      case "DOOR":
        return "door";
      case "UNKNOWN_ROOM":
        return "unknown";
      default:
        return "unknown";
    }
  }

  public canonicalMatchesRuleElement(canonicalType: CanonicalRoomType, ruleElementType: string): boolean {
    const ruleElem = ruleElementType.toLowerCase().replace(/[\s\-]+/g, "_");
    const ruleKey = this.canonicalToRuleElementType(canonicalType);

    if (ruleKey === "unknown") return false;

    if (ruleElem === ruleKey || ruleElem.includes(ruleKey) || ruleKey.includes(ruleElem)) {
      return true;
    }

    if (canonicalType === "BEDROOM" && (ruleElem.includes("bedroom") || ruleElem.includes("bed"))) {
      return true;
    }

    if (canonicalType === "TOILET" && (ruleElem.includes("toilet") || ruleElem.includes("bath") || ruleElem === "wc")) {
      return true;
    }

    if (canonicalType === "POOJA" && (ruleElem.includes("pooja") || ruleElem.includes("puja") || ruleElem.includes("temple"))) {
      return true;
    }

    if (canonicalType === "MAIN_ENTRANCE" && (ruleElem.includes("entrance") || ruleElem.includes("door") || ruleElem.includes("gate"))) {
      return true;
    }

    if (canonicalType === "LIVING_ROOM" && (ruleElem.includes("living") || ruleElem.includes("hall") || ruleElem.includes("drawing"))) {
      return true;
    }

    return false;
  }

  public isMasterBedroomDisplayLabel(displayLabel: string): boolean {
    return MASTER_BEDROOM_PATTERN.test(normalizeLabelForMatch(displayLabel));
  }

  public resolveCanonicalTypeFromEntity(
    canonicalType?: string,
    displayName?: string
  ): CanonicalRoomType {
    if (canonicalType && canonicalType !== "UNKNOWN" && canonicalType !== "UNKNOWN_ROOM") {
      return canonicalType as CanonicalRoomType;
    }
    if (displayName?.trim()) {
      return this.resolveCanonicalType(displayName);
    }
    return "UNKNOWN_ROOM";
  }

  /** Maps canonical room category to PDF knowledge vault topic keys. */
  public canonicalTypeToPdfTopic(canonicalType: CanonicalRoomType): string {
    switch (canonicalType) {
      case "KITCHEN":
        return "kitchen";
      case "TOILET":
        return "toilet";
      case "BEDROOM":
        return "bedroom";
      case "MAIN_ENTRANCE":
        return "entrance";
      case "POOJA":
        return "pooja";
      case "STAIRCASE":
        return "staircase";
      case "LIVING_ROOM":
        return "living";
      case "DINING":
        return "dining";
      case "BALCONY":
        return "balcony";
      case "WINDOW":
        return "window";
      case "DOOR":
        return "door";
      default:
        return "";
    }
  }

  /**
   * Non-room utility markers (water tank, septic, fixed fire appliances) resolved centrally.
   * Used when workspace objects are not standard OCR room labels.
   */
  public inferStructuralUtilityCategory(
    displayLabel: string
  ): "FIRE_APPLIANCE" | "WATER_UTILITY" | "SEPTIC_UTILITY" | null {
    const n = normalizeLabelForMatch(displayLabel);
    if (/\bstove\b|\bburner\b|\belectrical\b|\bgenerator\b|\bboiler\b|\bfire\b/.test(n)) {
      return "FIRE_APPLIANCE";
    }
    if (/\bwater\b|\btank\b|\bborewell\b|\bpool\b|\bfountain\b|\baquarium\b|\bsink\b/.test(n)) {
      return "WATER_UTILITY";
    }
    if (/\bseptic\b|\bdrain\b|\bgarbage\b|\btrash\b/.test(n)) {
      return "SEPTIC_UTILITY";
    }
    return null;
  }

  public getBreakdownCategory(canonicalType: string | undefined): RoomBreakdownCategory {
    switch (canonicalType) {
      case "KITCHEN":
        return "kitchens";
      case "BEDROOM":
        return "bedrooms";
      case "TOILET":
        return "toilets";
      case "STAIRCASE":
        return "staircases";
      case "POOJA":
        return "poojaRooms";
      case "LIVING_ROOM":
        return "livingRooms";
      case "UNKNOWN_ROOM":
      case "UNKNOWN":
        return "unknownSpaces";
      default:
        return "otherElements";
    }
  }

  public getPositiveExplanationTemplate(
    displayName: string,
    zone: string
  ): string {
    const canonicalType = this.resolveCanonicalType(displayName);
    const name = displayName.trim() || displayName;

    if (canonicalType === "BEDROOM" && this.isMasterBedroomDisplayLabel(displayName)) {
      return `${name} is located in the ${zone} zone, which is generally considered suitable for stability, authority, and family leadership.`;
    }

    switch (canonicalType) {
      case "BEDROOM":
        return `${name} is positioned in the ${zone} sector, providing a restful environment for peaceful sleep and relaxation.`;
      case "KITCHEN":
        return `${name} is located in the ${zone} zone, aligning well with cooking energy and daily household activity.`;
      case "LIVING_ROOM":
        return `${name} is placed in the ${zone} sector, encouraging positive social gatherings and welcoming natural light.`;
      case "DINING":
        return `${name} is situated in a harmonious dining zone, supporting family nourishment and togetherness.`;
      case "MAIN_ENTRANCE":
        return `${name} is situated in an auspicious direction in ${zone}, facilitating smooth entry and fresh energy flow.`;
      case "TOILET":
        return `${name} is positioned in ${zone}, an appropriate private zone for water usage and drainage.`;
      case "POOJA":
        return `${name} is situated in the sacred ${zone} zone, ideal for prayer, quiet reflection, and spiritual clarity.`;
      case "STAIRCASE":
        return `${name} is located in ${zone}, providing strong structural support and solid grounding.`;
      default:
        return `${name} is harmoniously positioned in the ${zone} zone according to classic architectural spatial principles.`;
    }
  }

  private buildResult(
    displayName: string,
    canonicalType: CanonicalRoomType,
    confidence: number
  ): RoomTaxonomyMappingResult {
    const result: RoomTaxonomyMappingResult = { displayName, canonicalType, confidence };
    this.logMapping(result);
    return result;
  }

  private logMapping(result: RoomTaxonomyMappingResult): void {
    console.log(
      `[RoomTaxonomy] OCR Label: ${result.displayName}\n` +
        `             Canonical Type: ${result.canonicalType}\n` +
        `             Confidence: ${result.confidence.toFixed(2)}`
    );
  }

  public logMappingResult(result: RoomTaxonomyMappingResult): void {
    this.logMapping(result);
  }
}

/** Singleton accessor for the centralized taxonomy service. */
export const roomTaxonomyService = RoomTaxonomyService.getInstance();

export function canonicalToRuleElementType(canonicalType: CanonicalRoomType): string {
  return roomTaxonomyService.canonicalToRuleElementType(canonicalType);
}

export function canonicalMatchesRuleElement(canonicalType: CanonicalRoomType, ruleElementType: string): boolean {
  return roomTaxonomyService.canonicalMatchesRuleElement(canonicalType, ruleElementType);
}

export function mapDisplayLabelToCanonical(displayLabel: string): RoomTaxonomyMappingResult {
  return roomTaxonomyService.resolveFromDisplayName(displayLabel);
}
