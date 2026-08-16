import { ProceduralRule, RuleEvaluationContext, EvaluationResultItem } from "./types";
import { extractZoneCode } from "./VastuRuleRegistry";
import { canonicalMatchesRuleElement } from "../../recognition/RoomTaxonomyService";

export class LalKitabRuleRegistry {
  private rules: ProceduralRule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    this.rules = [
      {
        id: "LK-HOUSE-001",
        domain: "LAL_KITAB",
        category: "PLANETARY_REMEDY",
        elementType: "kitchen",
        zones: ["NE", "N"],
        ruleType: "DEFECT",
        severity: "HIGH",
        title: "Lal Kitab Planet Jupiter (Guru) vs Fire Conflict",
        description: "Kitchen in Jupiter's directional quadrant damages financial wisdom and triggers uncalled family disputes according to Lal Kitab principles.",
        remedy: "Distribute yellow sweets on Thursdays and place a small vessel filled with gangajal and turmeric in the North-East corner.",
        citationMetadata: { bookTitle: "Lal Kitab Gutka 1952", chapter: "Ghar Ke Graha", pageNumber: 74 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 6, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "LK-MAIN-002",
        domain: "LAL_KITAB",
        category: "PLANETARY_REMEDY",
        elementType: "main_entrance",
        zones: ["SW", "SSW"],
        ruleType: "DEFECT",
        severity: "CRITICAL",
        title: "Lal Kitab Rahu Shadow Entrance Defect",
        description: "South-West entrance exposes the household to illusive losses, Rahu planetary affliction, and sudden deceptive litigation.",
        remedy: "Bury silver square plate at the door threshold and offer 400g almonds in flowing river water.",
        citationMetadata: { bookTitle: "Lal Kitab Farman 1939", chapter: "Rahu Upaya", pageNumber: 112 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 8, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "LK-TOI-003",
        domain: "LAL_KITAB",
        category: "PLANETARY_REMEDY",
        elementType: "toilet",
        zones: ["NE"],
        ruleType: "DEFECT",
        severity: "CATASTROPHIC",
        title: "Lal Kitab Rahu Pollution in Sun/Jupiter House",
        description: "Toilet in North-East corrupts noble planetary rays, impairing descendants and educational prospects.",
        remedy: "Keep solid silver ball in bowl of rain water inside bathroom and avoid blue wall paints.",
        citationMetadata: { bookTitle: "Lal Kitab 1942 Edition", chapter: "Pavitra Sthan", pageNumber: 188 },
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

export const lalKitabRuleRegistry = new LalKitabRuleRegistry();
