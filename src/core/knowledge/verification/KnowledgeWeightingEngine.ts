import { KnowledgeWeightMetrics, KnowledgeEvidence, SourceReliabilityMetrics } from "./VerificationTypes";

export class KnowledgeWeightingEngine {
  private static instance: KnowledgeWeightingEngine;
  private weightsMap: Map<string, KnowledgeWeightMetrics> = new Map();

  public constructor() {}

  public static getInstance(): KnowledgeWeightingEngine {
    if (!KnowledgeWeightingEngine.instance) {
      KnowledgeWeightingEngine.instance = new KnowledgeWeightingEngine();
    }
    return KnowledgeWeightingEngine.instance;
  }

  public calculateWeight(
    ruleId: string,
    evidence?: KnowledgeEvidence,
    sources?: SourceReliabilityMetrics[],
    expertApprovalCount: number = 0,
    conflictSeverityScore: number = 0, // 0 (none) to 100 (critical)
    crossDomainSupportCount: number = 1
  ): KnowledgeWeightMetrics {
    const avgSourceReliability = sources && sources.length > 0
      ? sources.reduce((acc, s) => acc + s.overallReliability, 0) / sources.length
      : 70;

    const sourceReliabilityWeight = (avgSourceReliability / 100) * 0.25;
    const evidenceCountWeight = Math.min(1.0, (evidence ? evidence.evidenceCount : 1) / 5) * 0.20;
    const expertApprovalWeight = Math.min(1.0, expertApprovalCount / 3) * 0.15;
    const conflictSeverityPenalty = (conflictSeverityScore / 100) * 0.15;
    const historicalAcceptanceWeight = 0.10;
    const relationshipCompletenessWeight = 0.10;
    const ontologyCompletenessWeight = 0.10;
    const crossDomainSupportWeight = Math.min(1.0, crossDomainSupportCount / 4) * 0.10;

    const sumPositive = 
      sourceReliabilityWeight +
      evidenceCountWeight +
      expertApprovalWeight +
      historicalAcceptanceWeight +
      relationshipCompletenessWeight +
      ontologyCompletenessWeight +
      crossDomainSupportWeight;

    const finalWeight = Math.min(1.0, Math.max(0.0, Number((sumPositive - conflictSeverityPenalty).toFixed(3))));

    const metrics: KnowledgeWeightMetrics = {
      ruleId,
      sourceReliabilityWeight: Number(sourceReliabilityWeight.toFixed(3)),
      evidenceCountWeight: Number(evidenceCountWeight.toFixed(3)),
      expertApprovalWeight: Number(expertApprovalWeight.toFixed(3)),
      conflictSeverityPenalty: Number(conflictSeverityPenalty.toFixed(3)),
      historicalAcceptanceWeight: Number(historicalAcceptanceWeight.toFixed(3)),
      relationshipCompletenessWeight: Number(relationshipCompletenessWeight.toFixed(3)),
      ontologyCompletenessWeight: Number(ontologyCompletenessWeight.toFixed(3)),
      crossDomainSupportWeight: Number(crossDomainSupportWeight.toFixed(3)),
      finalKnowledgeWeight: finalWeight
    };

    this.weightsMap.set(ruleId, metrics);
    return metrics;
  }

  public getRuleWeight(ruleId: string): KnowledgeWeightMetrics | undefined {
    return this.weightsMap.get(ruleId);
  }

  public getWeight(ruleId: string): KnowledgeWeightMetrics | undefined {
    return this.getRuleWeight(ruleId);
  }
}

export const knowledgeWeightingEngine = KnowledgeWeightingEngine.getInstance();
