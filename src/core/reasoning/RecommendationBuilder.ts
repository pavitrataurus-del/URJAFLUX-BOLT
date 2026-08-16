import {
  IRecommendation,
  IEvidenceBundle,
  IReasoningConflict,
  RecommendationCategory,
  RecommendationPriority,
  RecommendationStatus,
  KnowledgeDomain
} from './ReasoningTypes';

import { ConfidenceCalculator } from './ConfidenceCalculator';

export class RecommendationBuilder {
  public static buildRecommendation(
    category: RecommendationCategory,
    title: string,
    description: string,
    evidence: IEvidenceBundle,
    conflicts: IReasoningConflict[],
    preconditions: string[],
    priority: RecommendationPriority,
    expectedOutcome: string,
    dependencies: string[] = []
  ): IRecommendation {
    const id = `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { score, grade } = ConfidenceCalculator.calculateConfidence(evidence);

    const status: RecommendationStatus = score >= 85 ? 'APPROVED' : 'DRAFT';

    return {
      id,
      category,
      title,
      description,
      supportingEvidence: evidence,
      supportingDomains: evidence.supportingDomains,
      preconditions,
      priority,
      confidenceScore: score,
      confidenceGrade: grade,
      expectedOutcome,
      dependencies,
      conflicts,
      status,
      version: 'v1.0'
    };
  }
}
