import {
  IChakraOntologyEntity,
  IChakraQualityScoreBreakdown,
  IChakraRelationship,
  IChakraKnowledgeConflict,
  IChakraDuplicateMatch
} from "./ChakraKnowledgeTypes";

export class ChakraQualityEngine {
  private static instance: ChakraQualityEngine;

  private constructor() {}

  public static getInstance(): ChakraQualityEngine {
    if (!ChakraQualityEngine.instance) {
      ChakraQualityEngine.instance = new ChakraQualityEngine();
    }
    return ChakraQualityEngine.instance;
  }

  public calculateEntityQualityScore(
    entity: IChakraOntologyEntity,
    allRelationships: IChakraRelationship[],
    allConflicts: IChakraKnowledgeConflict[],
    allDuplicates: IChakraDuplicateMatch[]
  ): IChakraQualityScoreBreakdown {
    // 1. Source Quality (0-20 pts)
    let sourceQualityScore = 10;
    if (entity.evidenceLevel === 'Scriptural Canon') sourceQualityScore = 20;
    else if (entity.evidenceLevel === 'Peer Reviewed') sourceQualityScore = 18;
    else if (entity.evidenceLevel === 'Clinical Observational') sourceQualityScore = 15;
    else if (entity.evidenceLevel === 'Expert Consensus') sourceQualityScore = 12;

    // 2. Evidence Count (0-15 pts)
    const sourcesCount = 1 + (entity.secondarySource ? 1 : 0) + (entity.supportingSources?.length || 0);
    const evidenceCountScore = Math.min(15, sourcesCount * 5);

    // 3. Expert Approval (0-20 pts)
    let expertApprovalScore = 5;
    if (entity.approvalStatus === 'Approved') expertApprovalScore = 20;
    else if (entity.approvalStatus === 'Reviewed') expertApprovalScore = 14;
    else if (entity.approvalStatus === 'Needs Revision') expertApprovalScore = 8;

    // 4. Ontology Completeness (0-25 pts)
    let fieldsFilled = 0;
    const totalFields = 25;
    if (entity.sanskritName) fieldsFilled++;
    if (entity.englishName) fieldsFilled++;
    if (entity.element) fieldsFilled++;
    if (entity.color) fieldsFilled++;
    if (entity.geometry) fieldsFilled++;
    if (entity.symbol) fieldsFilled++;
    if (entity.seedMantra) fieldsFilled++;
    if (entity.associatedDeity) fieldsFilled++;
    if (entity.associatedShakti) fieldsFilled++;
    if (entity.bodyRegion) fieldsFilled++;
    if (entity.organs?.length) fieldsFilled++;
    if (entity.endocrineGlands?.length) fieldsFilled++;
    if (entity.nervousSystem?.length) fieldsFilled++;
    if (entity.emotionalFunctions?.length) fieldsFilled++;
    if (entity.psychologicalFunctions?.length) fieldsFilled++;
    if (entity.spiritualFunctions?.length) fieldsFilled++;
    if (entity.balancedState) fieldsFilled++;
    if (entity.underactiveIndicators?.length) fieldsFilled++;
    if (entity.overactiveIndicators?.length) fieldsFilled++;
    if (entity.blockedIndicators?.length) fieldsFilled++;
    if (entity.mudras?.length) fieldsFilled++;
    if (entity.crystals?.length) fieldsFilled++;
    if (entity.herbs?.length) fieldsFilled++;
    if (entity.frequencies?.length) fieldsFilled++;
    if (entity.approvedRemedies?.length) fieldsFilled++;
    
    const ontologyCompletenessScore = Math.round((fieldsFilled / totalFields) * 25);

    // 5. Relationship Completeness (0-20 pts)
    const relCount = allRelationships.filter(
      r => r.sourceEntityId === entity.id || r.targetEntityId === entity.id
    ).length;
    const relationshipCompletenessScore = Math.min(20, relCount * 4);

    // Deductions
    const activeConflicts = allConflicts.filter(
      c => c.chakraIdOrTopic === entity.id && c.reviewStatus === 'Pending'
    );
    const conflictDeductionScore = activeConflicts.length * 5;

    const activeDuplicates = allDuplicates.filter(
      d => d.sourceId === entity.id || d.matchedId === entity.id
    );
    const duplicateDeductionScore = activeDuplicates.length * 4;

    const rawScore =
      sourceQualityScore +
      evidenceCountScore +
      expertApprovalScore +
      ontologyCompletenessScore +
      relationshipCompletenessScore -
      conflictDeductionScore -
      duplicateDeductionScore;

    const overallScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    let qualityGrade: 'A+' | 'A' | 'B' | 'C' | 'F' = 'F';
    if (overallScore >= 95) qualityGrade = 'A+';
    else if (overallScore >= 85) qualityGrade = 'A';
    else if (overallScore >= 70) qualityGrade = 'B';
    else if (overallScore >= 55) qualityGrade = 'C';

    const recommendations: string[] = [];
    if (ontologyCompletenessScore < 20) {
      recommendations.push("Expand ontology attributes (endocrine glands, frequencies, herbs).");
    }
    if (relationshipCompletenessScore < 15) {
      recommendations.push("Add cross-domain links to Pancha Mahabhutas, Vastu Zones, and Remedies.");
    }
    if (activeConflicts.length > 0) {
      recommendations.push("Resolve pending source conflicts in expert review queue.");
    }
    if (entity.approvalStatus !== 'Approved') {
      recommendations.push("Submit to Acharya / SME for formal expert review.");
    }

    return {
      overallScore,
      sourceQualityScore,
      evidenceCountScore,
      expertApprovalScore,
      relationshipCompletenessScore,
      ontologyCompletenessScore,
      duplicateDeductionScore,
      conflictDeductionScore,
      qualityGrade,
      recommendations
    };
  }
}
