// ============================================================================
// RETRIEVAL ANALYTICS SERVICE (PHASE 2D)
// Administrator analytics for Search Count, Top Concepts, Most Retrieved Books, Rules, Performance & Index Sizes
// ============================================================================

import { AdminRetrievalAnalytics } from "../../../types/knowledgeRetrieval";
import { KnowledgeIndexManager } from "./KnowledgeIndexManager";

export interface SearchRecord {
  query: string;
  resultsCount: number;
  executionTimeMs: number;
  retrievedConcepts: string[];
  retrievedDocuments: string[];
}

export class RetrievalAnalyticsService {
  private static searchCount = 0;
  private static totalExecutionTimeMs = 0;
  private static conceptSearchFrequencyMap: Map<string, number> = new Map();
  private static bookRetrievalFrequencyMap: Map<string, number> = new Map();
  private static ruleReferenceMap: Map<string, number> = new Map();

  /**
   * Records search metrics in real-time.
   */
  public static recordSearch(record: SearchRecord): void {
    this.searchCount++;
    this.totalExecutionTimeMs += record.executionTimeMs;

    // Track concept search counts
    for (const concept of record.retrievedConcepts) {
      if (!concept) continue;
      const count = this.conceptSearchFrequencyMap.get(concept) || 0;
      this.conceptSearchFrequencyMap.set(concept, count + 1);
    }

    // Track book retrieval counts
    for (const docTitle of record.retrievedDocuments) {
      if (!docTitle) continue;
      const count = this.bookRetrievalFrequencyMap.get(docTitle) || 0;
      this.bookRetrievalFrequencyMap.set(docTitle, count + 1);
    }
  }

  /**
   * Retrieves complete Administrator Retrieval Analytics snapshot.
   */
  public static getAnalytics(): AdminRetrievalAnalytics {
    const avgTime = this.searchCount > 0 
      ? Math.round((this.totalExecutionTimeMs / this.searchCount) * 100) / 100 
      : 0;

    const topConcepts = Array.from(this.conceptSearchFrequencyMap.entries())
      .map(([concept, count]) => ({ concept, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const mostRetrievedBooks = Array.from(this.bookRetrievalFrequencyMap.entries())
      .map(([documentTitle, count]) => ({ documentTitle, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const frequentlyReferencedRules = Array.from(this.ruleReferenceMap.entries())
      .map(([ruleId, count]) => ({ ruleId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalSearchCount: this.searchCount,
      topConceptsSearched: topConcepts,
      mostRetrievedBooks,
      frequentlyReferencedRules,
      searchPerformanceMs: avgTime,
      indexSizes: KnowledgeIndexManager.getIndexStats(),
      averageRetrievalTimeMs: avgTime,
      timestamp: new Date().toISOString()
    };
  }
}
