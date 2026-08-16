import { IRecommendation } from './ReasoningTypes';

export class RecommendationRankingEngine {
  /**
   * Sorts recommendations by composite confidence score, priority level, and cross-domain evidence strength.
   */
  public static rankRecommendations(recommendations: IRecommendation[]): IRecommendation[] {
    // 1. Deduplicate by title/category
    const seenTitles = new Set<string>();
    const deduplicated: IRecommendation[] = [];

    recommendations.forEach(rec => {
      const key = `${rec.category}-${rec.title.toLowerCase().trim()}`;
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        deduplicated.push(rec);
      }
    });

    // 2. Map priority score multiplier
    const priorityWeightMap: Record<string, number> = {
      CRITICAL: 1.25,
      HIGH: 1.15,
      MEDIUM: 1.05,
      LOW: 1.0
    };

    // 3. Sort by composite weighted score
    return deduplicated.sort((a, b) => {
      const scoreA = a.confidenceScore * (priorityWeightMap[a.priority] || 1.0) + (a.supportingDomains.length * 2);
      const scoreB = b.confidenceScore * (priorityWeightMap[b.priority] || 1.0) + (b.supportingDomains.length * 2);
      return scoreB - scoreA;
    });
  }
}
