import { describe, it, expect, beforeEach } from "vitest";
import { EmbeddingProviderFactory, IEmbeddingProvider, VectorStoreFactory, IVectorStore, EmbeddingPipeline, EmbeddingJobStatus, ISemanticChunk, IEmbeddingRecord } from "../index";
import { KnowledgeNamespaceEngine } from "../../namespace/KnowledgeNamespaceEngine";
import { ApprovalStatus, INamespace } from "../../namespace/NamespaceTypes";

describe("Embedding Engine", () => {
  const validNamespace: INamespace = {
    id: "VASTU_TEST",
    name: "Test NS",
    version: "1.0",
    isActive: true,
    approvalStatus: ApprovalStatus.APPROVED,
    metadata: {},
    compatibilityRules: {}
  };

  const validChunk: ISemanticChunk = {
    id: "chunk_001",
    documentId: "doc_001",
    chunkId: "chunk_001",
    namespaceId: "VASTU_TEST",
    originalText: "Hello world",
    normalizedText: "hello world",
    checksum: "chk_123",
    embeddingVersion: "1.0",
    providerMetadata: {},
    creationTimestamp: Date.now()
  };

  const mockProvider: IEmbeddingProvider = {
    getProviderId: () => "mock",
    isAvailable: async () => true,
    getDimensions: () => 3,
    generateEmbedding: async (text) => ({ id: "", vector: [0.1, 0.2, 0.3], dimensions: 3 }),
    generateEmbeddings: async (texts) => texts.map(t => ({ id: "", vector: [0.1, 0.2, 0.3], dimensions: 3 }))
  };

  class MockStore implements IVectorStore {
    records: IEmbeddingRecord[] = [];
    getStoreId() { return "mock_store"; }
    async isAvailable() { return true; }
    async store(record: IEmbeddingRecord) { this.records.push(record); }
    async storeBatch(records: IEmbeddingRecord[]) { this.records.push(...records); }
    async deleteByDocumentId(id: string) { this.records = this.records.filter(r => r.semanticChunk.documentId !== id); }
    async deleteByChunkId(id: string) { this.records = this.records.filter(r => r.semanticChunk.id !== id); }
    async deleteByNamespace(id: string) { this.records = this.records.filter(r => r.semanticChunk.namespaceId !== id); }
    async getRecord(id: string) { return this.records.find(r => r.semanticChunk.id === id) || null; }
    async getRecordsByDocument(id: string) { return this.records.filter(r => r.semanticChunk.documentId === id); }
  }

  const mockStore = new MockStore();

  beforeEach(() => {
    EmbeddingProviderFactory.getInstance().clear();
    VectorStoreFactory.getInstance().clear();
    EmbeddingPipeline.getInstance().clear();
    KnowledgeNamespaceEngine.getInstance().clear();
    mockStore.records = [];

    KnowledgeNamespaceEngine.getInstance().registerNamespace(validNamespace);
    EmbeddingProviderFactory.getInstance().registerProvider(mockProvider, true);
    VectorStoreFactory.getInstance().registerStore(mockStore, true);
  });

  it("should generate embeddings successfully", async () => {
    const pipeline = EmbeddingPipeline.getInstance();
    const jobId = await pipeline.startEmbeddingJob("doc_001", [validChunk]);

    await new Promise(resolve => setTimeout(resolve, 50));

    const job = pipeline.getJob(jobId);
    expect(job?.status).toBe(EmbeddingJobStatus.COMPLETED);
    
    const records = await mockStore.getRecordsByDocument("doc_001");
    expect(records.length).toBe(1);
    expect(records[0].embedding.vector).toEqual([0.1, 0.2, 0.3]);
    // Validate provenance preservation
    expect(records[0].semanticChunk.checksum).toBe("chk_123");
  });

  it("should fail validation if namespace is invalid", async () => {
    const pipeline = EmbeddingPipeline.getInstance();
    const invalidChunk = { ...validChunk, namespaceId: "INVALID" };
    const jobId = await pipeline.startEmbeddingJob("doc_001", [invalidChunk]);

    await new Promise(resolve => setTimeout(resolve, 50));

    const job = pipeline.getJob(jobId);
    expect(job?.status).toBe(EmbeddingJobStatus.FAILED);
    expect(job?.error).toContain("Invalid namespace");
  });

  it("should fail validation if vector dimension mismatch", async () => {
    const badProvider: IEmbeddingProvider = {
      ...mockProvider,
      getProviderId: () => "bad",
      getDimensions: () => 5, // Expected 5, returning 3
    };
    EmbeddingProviderFactory.getInstance().registerProvider(badProvider, true);

    const pipeline = EmbeddingPipeline.getInstance();
    const jobId = await pipeline.startEmbeddingJob("doc_001", [validChunk]);

    await new Promise(resolve => setTimeout(resolve, 50));

    const job = pipeline.getJob(jobId);
    expect(job?.status).toBe(EmbeddingJobStatus.FAILED);
    expect(job?.error).toContain("Dimension mismatch");
  });
});
