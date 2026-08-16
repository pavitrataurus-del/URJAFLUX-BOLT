import { IEvidenceBundle, KnowledgeDomain } from './ReasoningTypes';

export class ConfidenceCalculator {
  /**
   * Calculates multi-factor confidence score for a recommendation
   */
  public static calculateConfidence(evidence: IEvidenceBundle): {
    score: number;
    grade: 'A+' | 'A' | 'B' | 'C' | 'F';
    breakdown: {
      baseTruthEngineScore: number;
      evidenceStrengthBonus: number;
      crossDomainConsensusBonus: number;
      sourceReliabilityScore: number;
      canonicalPriorityScore: number;
    };
  } {
    // 1. Base Truth Engine Score
    const baseTruthEngineScore = evidence.overallConfidence || 90;

    // 2. Evidence Strength (Number of entities supporting)
    const entityCount = evidence.supportingEntities.length;
    const evidenceStrengthBonus = Math.min(5, entityCount * 1.5);

    // 3. Cross-Domain Consensus Bonus (+3 for each distinct domain beyond 1)
    const domainCount = evidence.supportingDomains.length;
    const crossDomainConsensusBonus = Math.min(8, Math.max(0, (domainCount - 1) * 2.5));

    // 4. Source Reliability Score (Average citation reliability)
    const citations = evidence.sourceCitations;
    const sourceReliabilityScore = citations.length > 0
      ? citations.reduce((sum, c) => sum + c.sourceReliability, 0) / citations.length
      : 88;

    // 5. Canonical Priority Score (Bonus for classical texts like Mayamatam, BPHS, Sat Chakra Nirupana)
    let canonicalPriorityScore = 90;
    const isClassicalBook = citations.some(c =>
      c.book.includes('Mayamatam') ||
      c.book.includes('Brihat Parashara') ||
      c.book.includes('Sat Chakra') ||
      c.book.includes('Lal Kitab 1952') ||
      c.book.includes('Chaldean')
    );
    if (isClassicalBook) {
      canonicalPriorityScore = 98;
    }

    // Weighted Formula
    const rawScore =
      baseTruthEngineScore * 0.45 +
      sourceReliabilityScore * 0.25 +
      canonicalPriorityScore * 0.15 +
      evidenceStrengthBonus +
      crossDomainConsensusBonus;

    const finalScore = Math.min(99, Math.max(50, Math.round(rawScore)));

    let grade: 'A+' | 'A' | 'B' | 'C' | 'F' = 'B';
    if (finalScore >= 95) grade = 'A+';
    else if (finalScore >= 88) grade = 'A';
    else if (finalScore >= 78) grade = 'B';
    else if (finalScore >= 65) grade = 'C';
    else grade = 'F';

    return {
      score: finalScore,
      grade,
      breakdown: {
        baseTruthEngineScore,
        evidenceStrengthBonus,
        crossDomainConsensusBonus,
        sourceReliabilityScore,
        canonicalPriorityScore
      }
    };
  }
}
