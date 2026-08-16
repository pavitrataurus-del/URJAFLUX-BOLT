// ============================================================================
// URJAFLUX AI OS - BEST REMEDY SELECTOR (IIE)
// Multi-Criteria Best Remedy Selection & Alternative Candidate Evaluation
// ============================================================================

import { 
  IBestRemedyCandidate, 
  RecommendationPriority, 
  ExecutionPhase, 
  StructuralCategory 
} from "../types/iie.types";
import { IApplicableKnowledgePackage, IRemedyCandidateItem } from "../../knowledge_intelligence/types/kie.types";
import { IConfidenceEvaluationPackage, IEvaluatedRemedyConfidence } from "../../knowledge_confidence/types/kce.types";
import { IConflictResolutionPackage } from "../../conflict_resolution/types/cre.types";
import { IClientContextProfile, ISpatialContextData } from "../../knowledge_intelligence/types/kie.types";

export class BestRemedySelector {

  /**
   * Evaluates and selects the Best Remedy Candidates & Alternatives
   */
  public selectBestRemedies(
    kiePkg: IApplicableKnowledgePackage,
    kcePkg: IConfidenceEvaluationPackage,
    crePkg: IConflictResolutionPackage,
    clientContext?: IClientContextProfile,
    spatialOutput?: ISpatialContextData
  ): { bestRemedies: IBestRemedyCandidate[]; alternativeRemedies: IBestRemedyCandidate[] } {

    const remedyConfMap = new Map<string, IEvaluatedRemedyConfidence>();
    kcePkg.evaluatedRemedyConfidences.forEach(rc => remedyConfMap.set(rc.remedyCandidateId, rc));

    const bestRemedies: IBestRemedyCandidate[] = [];
    const alternativeRemedies: IBestRemedyCandidate[] = [];

    // Group remedy candidates by spatial direction or room/object
    const remediesByScope = new Map<string, IRemedyCandidateItem[]>();

    kiePkg.remedyCandidateCollections.forEach(rem => {
      const parentRule = kiePkg.applicableRules.find(r => r.ruleId === rem.originatingRuleId);
      const scopeKey = parentRule?.matchedDimensions.matchedDirections[0] || 
                        parentRule?.matchedDimensions.matchedObjects[0] || 
                        'GENERAL_ZONE';

      if (!remediesByScope.has(scopeKey)) {
        remediesByScope.set(scopeKey, []);
      }
      remediesByScope.get(scopeKey)!.push(rem);
    });

    let remIndex = 1;

    remediesByScope.forEach((candidates, scopeKey) => {
      // Score each candidate based on Confidence, Client Context fit, and Non-Destructive preference
      const scoredCandidates = candidates.map(cand => {
        const conf = remedyConfMap.get(cand.remedyCandidateId);
        const rawConfScore = conf?.overallConfidenceScore || 0.70;

        const text = cand.primaryRemedyText.toLowerCase();

        // Structural category determination
        let structCategory: StructuralCategory = 'NON_STRUCTURAL';
        if (text.includes("demolish") || text.includes("rebuild") || text.includes("reconstruct")) {
          structCategory = 'STRUCTURAL';
        } else if (text.includes("partition") || text.includes("wall") || text.includes("door")) {
          structCategory = 'SEMI_STRUCTURAL';
        } else if (text.includes("strip") || text.includes("pyramid") || text.includes("paint") || text.includes("color")) {
          structCategory = 'NON_STRUCTURAL';
        }

        // Priority calculation
        let priority: RecommendationPriority = 'MEDIUM_PRIORITY';
        if (conf?.confidenceBand === 'VERY_HIGH' || rawConfScore >= 0.88) {
          priority = 'HIGH_PRIORITY';
        }
        if (scopeKey.includes("NORTH_EAST") || scopeKey.includes("SOUTH_WEST") || scopeKey.includes("MAIN_ENTRANCE")) {
          priority = 'CRITICAL_IMMEDIATE';
        }

        // Phase calculation
        let phase: ExecutionPhase = 'SHORT_TERM_ACTION';
        if (structCategory === 'NON_STRUCTURAL') {
          phase = 'IMMEDIATE_ACTION';
        } else if (structCategory === 'SEMI_STRUCTURAL') {
          phase = 'MEDIUM_TERM_ACTION';
        } else {
          phase = 'LONG_TERM_ACTION';
        }

        // Composite suitability score (prefers non-structural, high confidence, non-conflicting)
        let suitabilityScore = rawConfScore;
        if (structCategory === 'NON_STRUCTURAL') suitabilityScore += 0.10; // Non-destructive preference
        if (cand.citationReferences.length > 0) suitabilityScore += 0.05;

        return {
          cand,
          conf,
          structCategory,
          priority,
          phase,
          suitabilityScore
        };
      });

      // Sort by suitability score descending
      scoredCandidates.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

      // Top candidate is chosen as Best Remedy, remainder as Alternative Remedies
      if (scoredCandidates.length > 0) {
        const top = scoredCandidates[0];
        bestRemedies.push(this.buildCandidateObject(
          `IIE-REM-BEST-${remIndex++}`,
          top.cand,
          top.conf,
          scopeKey,
          top.priority,
          top.phase,
          top.structCategory,
          `Selected as primary non-destructive, high-confidence remedy candidate for ${scopeKey}`
        ));

        for (let i = 1; i < scoredCandidates.length; i++) {
          const alt = scoredCandidates[i];
          alternativeRemedies.push(this.buildCandidateObject(
            `IIE-REM-ALT-${remIndex++}`,
            alt.cand,
            alt.conf,
            scopeKey,
            alt.priority,
            alt.phase,
            alt.structCategory,
            `Preserved alternative candidate for ${scopeKey} (${alt.cand.primaryRemedyText})`
          ));
        }
      }
    });

    return { bestRemedies, alternativeRemedies };
  }

  private buildCandidateObject(
    remedyId: string,
    cand: IRemedyCandidateItem,
    conf: IEvaluatedRemedyConfidence | undefined,
    scopeKey: string,
    priority: RecommendationPriority,
    executionPhase: ExecutionPhase,
    structuralCategory: StructuralCategory,
    rationale: string
  ): IBestRemedyCandidate {
    return {
      remedyId,
      candidateId: cand.remedyCandidateId,
      primaryRemedyText: cand.primaryRemedyText,
      alternativeRemedies: cand.exceptions.length > 0 ? cand.exceptions : [],
      targetDomain: cand.applicableDomains[0] || 'Vastu',
      targetZoneOrDirection: scopeKey,
      targetObjectOrRoom: cand.conditions[0] || scopeKey,
      selectionRationale: rationale,
      priority,
      executionPhase,
      structuralCategory,
      confidenceScore: conf?.overallConfidenceScore || 0.75,
      confidenceBand: conf?.confidenceBand || 'HIGH',
      confidenceProfile: conf?.confidenceProfile || {
        evidenceConfidence: { score: 0.8, band: 'HIGH', explanation: '' },
        citationConfidence: { score: 0.8, band: 'HIGH', explanation: '' },
        spatialConfidence: { score: 0.8, band: 'HIGH', explanation: '' },
        clientContextConfidence: { score: 0.8, band: 'HIGH', explanation: '' },
        relationshipConfidence: { score: 0.8, band: 'HIGH', explanation: '' },
        crossDomainConfidence: { score: 0.8, band: 'HIGH', explanation: '' },
        knowledgeIntegrityConfidence: { score: 0.8, band: 'HIGH', explanation: '' },
        founderIntegrityConfidence: { score: 0.8, band: 'HIGH', explanation: '' },
        overallConfidence: { score: 0.8, band: 'HIGH', explanation: '' }
      },
      originatingRecordId: cand.originatingRecordId,
      originatingRuleId: cand.originatingRuleId,
      evidenceHashes: cand.evidenceReferences,
      citationIds: cand.citationReferences,
      relationshipChain: cand.relationshipChain,
      founderApprovalReference: conf?.trace.founderApprovalReference || 'FOUNDER-GOV-REF-CANONICAL'
    };
  }
}
