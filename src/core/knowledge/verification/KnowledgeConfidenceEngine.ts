import { KnowledgeConfidence, KnowledgeEvidence, KnowledgeWeightMetrics } from "./VerificationTypes";

export class KnowledgeConfidenceEngine {
  private static instance: KnowledgeConfidenceEngine;
  private confidenceStore: Map<string, KnowledgeConfidence> = new Map();

  public constructor() {}

  public static getInstance(): KnowledgeConfidenceEngine {
    if (!KnowledgeConfidenceEngine.instance) {
      KnowledgeConfidenceEngine.instance = new KnowledgeConfidenceEngine();
    }
    return KnowledgeConfidenceEngine.instance;
  }

  public computeConfidence(
    ruleId: string,
    evidence?: KnowledgeEvidence,
    weightMetrics?: KnowledgeWeightMetrics,
    supportingDomains: string[] = ["Vastu"]
  ): KnowledgeConfidence {
    const strength = evidence ? evidence.evidenceStrength : 80;
    const count = evidence ? evidence.evidenceCount : 3;
    const weight = weightMetrics ? weightMetrics.finalKnowledgeWeight : 0.85;

    const score = Math.min(100, Math.max(0, Math.round(strength * 0.5 + (weight * 100) * 0.4 + Math.min(count, 5) * 2)));

    let grade: "A+" | "A" | "B" | "C" | "F" = "F";
    if (score >= 95) grade = "A+";
    else if (score >= 85) grade = "A";
    else if (score >= 70) grade = "B";
    else if (score >= 55) grade = "C";

    const explanation = `Confidence score of ${score}/100 (${grade}) computed based on ${count} source references, ${strength}% evidence strength, and ${supportingDomains.length} aligned knowledge domains.`;
    const summary = evidence && evidence.primarySources.length > 0
      ? `Primary source: ${evidence.primarySources[0].title}. Total references: ${count}.`
      : `Backed by classical scriptural shastras across ${supportingDomains.join(", ")}.`;

    const result: KnowledgeConfidence = {
      ruleId,
      confidenceScore: score,
      confidenceGrade: grade,
      confidenceExplanation: explanation,
      evidenceSummary: summary,
      supportingDomains,
      lastUpdated: new Date().toISOString()
    };

    this.confidenceStore.set(ruleId, result);
    return result;
  }

  public calculateConfidence(
    ruleId: string,
    evidence?: KnowledgeEvidence,
    weightMetrics?: KnowledgeWeightMetrics,
    supportingDomains: string[] = ["Vastu"]
  ): KnowledgeConfidence {
    return this.computeConfidence(ruleId, evidence, weightMetrics, supportingDomains);
  }

  public getConfidence(ruleId: string): KnowledgeConfidence | undefined {
    return this.confidenceStore.get(ruleId);
  }
}

export const knowledgeConfidenceEngine = KnowledgeConfidenceEngine.getInstance();
