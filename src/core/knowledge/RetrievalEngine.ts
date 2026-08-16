// Module 5: Multi-Stage RAG Retrieval Engine
import { SearchResultChunk, VectorSearchParams, GraphTriplet } from "../../types/knowledgeIntelligence";
import { HybridRerankerService } from "./HybridRerankerService";
import { KnowledgeGraphEngine } from "./KnowledgeGraphEngine";
import { KnowledgeLibraryService } from "./KnowledgeLibraryService";
import { DocumentIngestionPipeline } from "./DocumentIngestionPipeline";
import { VectorEmbeddingEngine } from "./VectorEmbeddingEngine";

class RetrievalEngineStore {
  private initializedTenants = new Set<string>();

  public ensureTenantDocumentsIndexed(tenantId: string): void {
    if (this.initializedTenants.has(tenantId)) return;

    const docs = KnowledgeLibraryService.getDocuments(tenantId);
    docs.forEach(doc => {
      const { chunks } = DocumentIngestionPipeline.processIngestion(
        doc.id,
        doc.title,
        doc.content,
        doc.tenantId,
        "MARKDOWN"
      );
      VectorEmbeddingEngine.indexAllChunks(chunks);
    });

    this.initializedTenants.add(tenantId);
  }

  public retrieveContext(params: VectorSearchParams): {
    chunks: SearchResultChunk[];
    graphTriplets: GraphTriplet[];
    queryKeywords: string[];
  } {
    this.ensureTenantDocumentsIndexed(params.tenantId);

    const queryKeywords = params.query
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2);

    // Stage 1: Hybrid RAG Search (BM25 + Dense Vector RRF)
    const chunks = HybridRerankerService.performHybridSearch(params);

    // Stage 2: Knowledge Graph Expansion
    const graphTriplets = KnowledgeGraphEngine.expandQueryContext(
      queryKeywords,
      params.tenantId,
      2
    );

    return {
      chunks,
      graphTriplets,
      queryKeywords
    };
  }
}

export const RetrievalEngine = new RetrievalEngineStore();
