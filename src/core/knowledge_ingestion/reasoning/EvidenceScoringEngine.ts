import { EvidenceScoreBreakdown } from './ecre.types';
import { SourceCitation } from '../../../types/semanticKnowledge';

export class EvidenceScoringEngine {
  /**
   * Computes multi-dimensional evidence score for any knowledge node or object.
   */
  public static computeEvidenceScore(input: {
    ocrOrObjectConfidence?: number;
    authorityLevel?: 'CLASSICAL_CANONICAL' | 'HISTORICAL_COMMENTARY' | 'MODERN_SECONDARY' | 'UNVERIFIED';
    publicationYear?: number;
    semanticRelevance?: number;
    citation?: SourceCitation;
    graphHops?: number;
  }): EvidenceScoreBreakdown {
    // 1. Confidence (default 0.95)
    const confidenceScore = input.ocrOrObjectConfidence ?? 0.95;

    // 2. Authority Weight
    let authorityWeight = 0.70;
    if (input.authorityLevel === 'CLASSICAL_CANONICAL') authorityWeight = 1.00;
    else if (input.authorityLevel === 'HISTORICAL_COMMENTARY') authorityWeight = 0.88;
    else if (input.authorityLevel === 'MODERN_SECONDARY') authorityWeight = 0.75;

    // 3. Freshness Score
    const currentYear = new Date().getFullYear();
    const pubYear = input.publicationYear ?? 2020;
    const yearDiff = Math.max(0, currentYear - pubYear);
    const freshnessScore = Math.max(0.5, Math.round((1.0 - (yearDiff / 200)) * 100) / 100);

    // 4. Semantic Relevance (default 0.92)
    const semanticRelevance = input.semanticRelevance ?? 0.92;

    // 5. Citation Quality
    let citationQuality = 0.50;
    if (input.citation) {
      let fields = 0;
      if (input.citation.documentId) fields++;
      if (input.citation.sourceDocument) fields++;
      if (input.citation.chapterId) fields++;
      if (input.citation.sectionId) fields++;
      if (input.citation.paragraphId) fields++;
      if (input.citation.pageNumber) fields++;
      citationQuality = Math.min(1.0, fields / 6);
    }

    // 6. Graph Distance Penalty
    const hops = input.graphHops ?? 1;
    const graphDistancePenalty = Math.min(0.3, hops * 0.05);

    // Composite Calculation
    const weightedSum =
      (confidenceScore * 0.20) +
      (authorityWeight * 0.25) +
      (freshnessScore * 0.10) +
      (semanticRelevance * 0.25) +
      (citationQuality * 0.15) -
      graphDistancePenalty;

    const compositeScore = Math.max(0, Math.min(1.0, Math.round(weightedSum * 100) / 100));

    return {
      confidenceScore,
      authorityWeight,
      freshnessScore,
      semanticRelevance,
      citationQuality,
      graphDistancePenalty,
      compositeScore
    };
  }
}
