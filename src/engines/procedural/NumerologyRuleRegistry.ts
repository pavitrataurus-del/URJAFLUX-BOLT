import { ProceduralRule, RuleEvaluationContext, EvaluationResultItem } from "./types";
import { extractZoneCode } from "./VastuRuleRegistry";
import { canonicalMatchesRuleElement } from "../../recognition/RoomTaxonomyService";

export class NumerologyRuleRegistry {
  private rules: ProceduralRule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    this.rules = [
      {
        id: "NUM-ZONE-001",
        domain: "NUMEROLOGY",
        category: "VIBRATIONAL_NUMBER",
        elementType: "main_entrance",
        zones: ["S", "SSW", "SW"],
        ruleType: "DEFECT",
        severity: "HIGH",
        title: "Numerology Number 8 (Saturn) vs South Facing Energy",
        description: "South entry combined with Number 8 house vibration creates heavy karmic delays and structural maintenance bottlenecks.",
        remedy: "Affix a brass house number plate with 24K gold foil trim and place 8 clear quartz crystals near entrance.",
        citationMetadata: { bookTitle: "Chaldean Numerology & Sacred Spaces", chapter: "House Number Harmonics", pageNumber: 42 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 5, status: "PLACEHOLDER_STATIC" }
      },
      {
        id: "NUM-ZONE-002",
        domain: "NUMEROLOGY",
        category: "VIBRATIONAL_NUMBER",
        elementType: "master_bedroom",
        zones: ["SE", "ESE"],
        ruleType: "DEFECT",
        severity: "MODERATE",
        title: "Number 9 Mars Vibration in Southeast Bedroom",
        description: "Double Fire/Mars frequency in Southeast master bedroom intensifies nervous energy and heated disputes.",
        remedy: "Use soothing green or white lamp shades to absorb excessive Mars vibration.",
        citationMetadata: { bookTitle: "Sacred Number Vibrations in Architecture", chapter: "Bedroom Harmonics", pageNumber: 89 },
        candidateAstMetadata: { astVersion: "1.0.0", nodeCount: 6, status: "PLACEHOLDER_STATIC" }
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

export const numerologyRuleRegistry = new NumerologyRuleRegistry();
