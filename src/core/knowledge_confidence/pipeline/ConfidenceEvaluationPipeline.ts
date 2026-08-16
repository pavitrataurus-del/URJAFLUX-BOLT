// ============================================================================
// URJAFLUX AI OS - CONFIDENCE EVALUATION PIPELINE (KCE)
// Core Pipeline Evaluating Rule & Remedy Confidence Deterministically
// ============================================================================

import { 
  IConfidenceEvaluationPackage, 
  IEvaluatedRuleConfidence, 
  IEvaluatedRemedyConfidence, 
  ConfidenceBandLevel, 
  IConfidenceEvaluationConfig 
} from "../types/kce.types";
import { ConfidenceDimensionEvaluator, DEFAULT_CONFIDENCE_CONFIG } from "../evaluators/ConfidenceDimensionEvaluator";
import { IApplicableKnowledgePackage, IApplicableRuleMatch, IRemedyCandidateItem } from "../../knowledge_intelligence/types/kie.types";

export class ConfidenceEvaluationPipeline {
  private config: IConfidenceEvaluationConfig;
  private evaluator: ConfidenceDimensionEvaluator;

  private static KCE_VERSION = "1.0.0-CANONICAL";

  constructor(config: IConfidenceEvaluationConfig = DEFAULT_CONFIDENCE_CONFIG) {
    this.config = config;
    this.evaluator = new ConfidenceDimensionEvaluator(config);
  }

  /**
   * Evaluates confidence for all rule candidates & remedy candidates in a KIE Package
   */
  public executeConfidencePipeline(
    kiePackage: IApplicableKnowledgePackage
  ): IConfidenceEvaluationPackage {
    const startTimeMs = Date.now();
    const evaluationTimestamp = new Date().toISOString();
    const packageId = `KCE-PKG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const evaluatedRuleConfidences: IEvaluatedRuleConfidence[] = [];
    const evaluatedRemedyConfidences: IEvaluatedRemedyConfidence[] = [];

    let veryHighCount = 0;
    let highCount = 0;
    let moderateCount = 0;
    let limitedCount = 0;
    let insufficientCount = 0;

    let totalScoreSum = 0;

    // 1. Evaluate Rule Candidates
    kiePackage.applicableRules.forEach(ruleMatch => {
      const dimensionScores = this.evaluator.evaluateRuleDimensions(ruleMatch, kiePackage);
      
      // Calculate overall score (sum of weightedScores divided by sum of weights)
      const totalWeighted = dimensionScores.reduce((sum, d) => sum + d.weightedScore, 0);
      const totalWeights = dimensionScores.reduce((sum, d) => sum + d.weight, 0);
      const rawOverall = totalWeights > 0 ? totalWeighted / totalWeights : 0.5;
      const overallScore = Math.min(1.0, Math.max(0.0, Number(rawOverall.toFixed(4))));

      const confidenceBand = this.determineBand(overallScore);

      if (confidenceBand === 'VERY_HIGH') veryHighCount++;
      else if (confidenceBand === 'HIGH') highCount++;
      else if (confidenceBand === 'MODERATE') moderateCount++;
      else if (confidenceBand === 'LIMITED') limitedCount++;
      else insufficientCount++;

      totalScoreSum += overallScore;

      // Founder Correction 1: Complete Multi-Perspective Profile
      const confidenceProfile = this.evaluator.buildConfidenceProfile(
        dimensionScores,
        overallScore,
        (s) => this.determineBand(s)
      );

      // Founder Correction 3: Warning Layer
      const confidenceWarnings = this.evaluator.buildConfidenceWarnings(
        ruleMatch.ruleId,
        dimensionScores,
        confidenceProfile,
        kiePackage
      );

      // Founder Correction 4: Structured Explanation Tree
      const explanationTree = this.evaluator.buildExplanationTree(
        ruleMatch.ruleId,
        `Rule ${ruleMatch.ruleId} (${ruleMatch.domain})`,
        confidenceProfile,
        dimensionScores,
        confidenceWarnings
      );

      const explainabilityReasons = dimensionScores
        .filter(d => d.rawScore >= 0.8)
        .map(d => `[${d.dimension}]: ${d.explanation}`);

      // Original Evidence & Citations for Consultant Transparency
      const originalEvidence = kiePackage.applicableEvidence;
      const originalCitations = kiePackage.applicableCitations.filter(c => c.citationId === ruleMatch.trace.citationId || c.traceabilityHash === ruleMatch.trace.evidenceHash);

      evaluatedRuleConfidences.push({
        ruleId: ruleMatch.ruleId,
        knowledgeRecordId: ruleMatch.knowledgeRecordId,
        domain: ruleMatch.domain,
        category: ruleMatch.category,
        overallConfidenceScore: overallScore,
        confidenceBand,
        confidenceProfile,
        confidenceWarnings,
        explanationTree,
        dimensionScores,
        explainabilityReasons,
        supportingEvidenceHashes: [ruleMatch.trace.evidenceHash],
        citationReferences: [ruleMatch.trace.citationId],
        originalEvidence,
        originalCitations,
        trace: {
          knowledgeRecordId: ruleMatch.knowledgeRecordId,
          ruleId: ruleMatch.ruleId,
          evidenceHash: ruleMatch.trace.evidenceHash,
          citationId: ruleMatch.trace.citationId,
          relationshipChain: ruleMatch.trace.relationshipChain,
          founderApprovalReference: ruleMatch.trace.founderApprovalReference,
          engineVersion: kiePackage.executionMetadata.engineVersion,
          evaluationVersion: ConfidenceEvaluationPipeline.KCE_VERSION,
          evaluationTimestamp,
          confidenceConfigurationVersion: this.config.configVersion || '1.0.0-DEFAULT'
        }
      });
    });

    // 2. Founder Correction 2: Independent Remedy Candidate Evaluation
    const ruleMatchMap = new Map<string, IApplicableRuleMatch>();
    kiePackage.applicableRules.forEach(r => ruleMatchMap.set(r.ruleId, r));

    kiePackage.remedyCandidateCollections.forEach(remedyCand => {
      const parentRuleMatch = ruleMatchMap.get(remedyCand.originatingRuleId);
      
      const dimensionScores = this.evaluator.evaluateRemedyDimensions(remedyCand, parentRuleMatch, kiePackage);

      const totalWeighted = dimensionScores.reduce((sum, d) => sum + d.weightedScore, 0);
      const totalWeights = dimensionScores.reduce((sum, d) => sum + d.weight, 0);
      const rawOverall = totalWeights > 0 ? totalWeighted / totalWeights : 0.5;
      const overallScore = Math.min(1.0, Math.max(0.0, Number(rawOverall.toFixed(4))));

      const confidenceBand = this.determineBand(overallScore);

      const confidenceProfile = this.evaluator.buildConfidenceProfile(
        dimensionScores,
        overallScore,
        (s) => this.determineBand(s)
      );

      const confidenceWarnings = this.evaluator.buildConfidenceWarnings(
        remedyCand.remedyCandidateId,
        dimensionScores,
        confidenceProfile,
        kiePackage
      );

      const explanationTree = this.evaluator.buildExplanationTree(
        remedyCand.remedyCandidateId,
        `Remedy: ${remedyCand.primaryRemedyText}`,
        confidenceProfile,
        dimensionScores,
        confidenceWarnings
      );

      const explainabilityReasons = dimensionScores
        .filter(d => d.rawScore >= 0.8)
        .map(d => `[${d.dimension}]: ${d.explanation}`);

      const originalEvidence = kiePackage.applicableEvidence;
      const originalCitations = kiePackage.applicableCitations.filter(c => remedyCand.citationReferences.includes(c.citationId));

      evaluatedRemedyConfidences.push({
        remedyCandidateId: remedyCand.remedyCandidateId,
        primaryRemedyText: remedyCand.primaryRemedyText,
        originatingRecordId: remedyCand.originatingRecordId,
        originatingRuleId: remedyCand.originatingRuleId,
        overallConfidenceScore: overallScore,
        confidenceBand,
        confidenceProfile,
        confidenceWarnings,
        explanationTree,
        dimensionScores,
        explainabilityReasons,
        supportingEvidenceHashes: remedyCand.evidenceReferences,
        citationReferences: remedyCand.citationReferences,
        originalEvidence,
        originalCitations,
        trace: {
          remedyCandidateId: remedyCand.remedyCandidateId,
          originatingRecordId: remedyCand.originatingRecordId,
          originatingRuleId: remedyCand.originatingRuleId,
          evidenceHash: remedyCand.evidenceReferences[0] || '',
          citationId: remedyCand.citationReferences[0] || '',
          relationshipChain: remedyCand.relationshipChain,
          founderApprovalReference: parentRuleMatch ? parentRuleMatch.trace.founderApprovalReference : 'FOUNDER-GOV-REF-CANONICAL',
          engineVersion: kiePackage.executionMetadata.engineVersion,
          evaluationVersion: ConfidenceEvaluationPipeline.KCE_VERSION,
          evaluationTimestamp,
          confidenceConfigurationVersion: this.config.configVersion || '1.0.0-DEFAULT'
        }
      });
    });

    const totalEvaluatedRules = evaluatedRuleConfidences.length;
    const avgScore = totalEvaluatedRules > 0 ? Number((totalScoreSum / totalEvaluatedRules).toFixed(4)) : 0.0;

    const pipelineDurationMs = Math.max(0, Date.now() - startTimeMs);

    return {
      packageId,
      kiePackageId: kiePackage.packageId,
      evaluationTimestamp,
      evaluatedRuleConfidences,
      evaluatedRemedyConfidences,
      summaryStats: {
        totalEvaluatedRules,
        totalEvaluatedRemedies: evaluatedRemedyConfidences.length,
        veryHighCount,
        highCount,
        moderateCount,
        limitedCount,
        insufficientEvidenceCount: insufficientCount,
        averageConfidenceScore: avgScore
      },
      evaluationMetadata: {
        evaluationConfigUsed: this.config,
        engineVersion: kiePackage.executionMetadata.engineVersion,
        evaluationVersion: ConfidenceEvaluationPipeline.KCE_VERSION,
        pipelineDurationMs
      }
    };
  }

  /**
   * Deterministically maps numerical score to Confidence Band based on thresholds
   */
  private determineBand(score: number): ConfidenceBandLevel {
    const t = this.config.bandThresholds;
    if (score >= t.veryHigh) return 'VERY_HIGH';
    if (score >= t.high) return 'HIGH';
    if (score >= t.moderate) return 'MODERATE';
    if (score >= t.limited) return 'LIMITED';
    return 'INSUFFICIENT_EVIDENCE';
  }
}

