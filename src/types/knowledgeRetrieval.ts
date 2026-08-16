// ============================================================================
// KNOWLEDGE RETRIEVAL INFRASTRUCTURE TYPES & INTERFACES (PHASE 2D)
// Locks 34 (Never Generate), 35 (Traceable Sources), 36 (Ranking Priority)
// ============================================================================

import { KnowledgeProvenance, SourceCitation } from "./semanticKnowledge";

export type RetrievalSourceType = "DYNAMIC_KNOWLEDGE_BRAIN" | "FALLBACK_BOOTSTRAP" | "BOOTSTRAP_FALLBACK";

export interface RetrievalResultItem {
  id: string;
  documentId: string;
  documentTitle: string;
  concept?: string;
  relationship?: string;
  chapterId: string;
  chapterTitle: string;
  sectionId: string;
  sectionTitle: string;
  paragraphId: string;
  pageNumber: number;
  citation: SourceCitation;
  provenance: KnowledgeProvenance;
  rawText: string;
  confidenceScore: number;
  consensusScore: number;
  sourceType: RetrievalSourceType;
  knowledgeDomain: string;
  matchStage: string;
  matchedCategory: "CONCEPT" | "RULE" | "EXCEPTION" | "FORMULA" | "TABLE" | "RELATIONSHIP";
  isConflicted: boolean;
  conflictDetails?: string;
  retrievedAt: string;
}

export interface RetrievalQueryOptions {
  query: string;
  domain?: string;
  minConfidence?: number;
  limit?: number;
  includeConflicts?: boolean;
}

export interface RetrievalQueryResponse {
  query: string;
  results: RetrievalResultItem[];
  totalMatches: number;
  executionTimeMs: number;
  stagesExecuted: string[];
  analyticsSnapshot: {
    dynamicBrainMatches: number;
    fallbackMatches: number;
    conflictedItemsCount: number;
  };
}

// ============================================================================
// INDEX MANAGEMENT INTERFACES
// ============================================================================

export interface IndexStats {
  totalDocumentsIndexed: number;
  totalConceptsIndexed: number;
  totalRulesIndexed: number;
  totalExceptionsIndexed: number;
  totalFormulaeIndexed: number;
  totalTablesIndexed: number;
  totalRelationshipsIndexed: number;
  totalCitationsIndexed: number;
  lastUpdated: string;
}

// ============================================================================
// HYBRID SEARCH PROVIDER INTERFACES (Future-Ready Contracts)
// ============================================================================

export interface IKeywordSearchProvider {
  searchKeywords(query: string, limit?: number): Promise<RetrievalResultItem[]>;
}

export interface ISemanticSearchProvider {
  searchSemanticConcepts(query: string, limit?: number): Promise<RetrievalResultItem[]>;
}

export interface IVectorSearchProvider {
  /**
   * Future Extension Point: Vector Search Integration (Phase 3+)
   */
  searchVectorEmbeddings?(queryEmbedding: number[], limit?: number): Promise<RetrievalResultItem[]>;
}

export interface IGraphSearchProvider {
  /**
   * Future Extension Point: Knowledge Graph Traversal (Phase 3+)
   */
  traverseKnowledgeGraph?(startNodeId: string, depth?: number): Promise<RetrievalResultItem[]>;
}

// ============================================================================
// ADMIN RETRIEVAL ANALYTICS INTERFACE
// ============================================================================

export interface AdminRetrievalAnalytics {
  totalSearchCount: number;
  topConceptsSearched: { concept: string; count: number }[];
  mostRetrievedBooks: { documentTitle: string; count: number }[];
  frequentlyReferencedRules: { ruleId: string; count: number }[];
  searchPerformanceMs: number;
  indexSizes: IndexStats;
  averageRetrievalTimeMs: number;
  timestamp: string;
}
