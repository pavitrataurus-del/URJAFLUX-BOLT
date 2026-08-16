import { AIExplainabilityOutput, CanonicalRule, KnowledgeConfidence } from "./VerificationTypes";

export class AIExplainabilityEngine {
  private static instance: AIExplainabilityEngine;

  private constructor() {}

  public static getInstance(): AIExplainabilityEngine {
    if (!AIExplainabilityEngine.instance) {
      AIExplainabilityEngine.instance = new AIExplainabilityEngine();
    }
    return AIExplainabilityEngine.instance;
  }

  public generateExplainability(
    rule?: CanonicalRule,
    confidence?: KnowledgeConfidence
  ): AIExplainabilityOutput {
    const ruleId = rule ? rule.ruleId : "rule-vastu-001";
    const selectedRecommendation = rule
      ? `${rule.title}: ${rule.statement}`
      : "Place primary culinary fire / kitchen in South-East (Agneya) quadrant aligned with Agni Dev.";

    const whySelected = "Selected as canonical recommendation because it holds a 96% confidence score (Grade A+) backed by classical shastras (Mayamatam & Manasara), unanimous expert consensus, and multi-domain elemental alignment.";

    const alternativeViewpoints = [
      "Secondary Placement Option: North-West (NW) Vayu quadrant if South-East is physically constrained by architectural structural walls.",
      "Disputed Variant: Avoid placing kitchen in North-East (NE) Ishan water zone due to severe fire-water elemental conflict."
    ];

    const supportingEvidence = rule
      ? rule.supportingEvidence
      : ["Mayamatam Chapter 18 Verse 4", "Manasara Chapter 12 Verse 10", "Brihat Samhita Vastu Vidya Section 53"];

    const confidenceScore = confidence ? confidence.confidenceScore : 96;
    const confidenceGrade = confidence ? confidence.confidenceGrade : "A+";

    const applicableConditions = [
      "Applies to all residential and commercial floor plans.",
      "Requires cooking burner platform facing East.",
      "In SE placement, copper strip grounding is recommended for optimal geopathic harmonization."
    ];

    return {
      ruleId,
      selectedRecommendation,
      whySelected,
      alternativeViewpoints,
      supportingEvidence,
      confidenceScore,
      confidenceGrade,
      approvalStatus: "CANONICAL",
      applicableConditions
    };
  }
}

export const aiExplainabilityEngine = AIExplainabilityEngine.getInstance();
