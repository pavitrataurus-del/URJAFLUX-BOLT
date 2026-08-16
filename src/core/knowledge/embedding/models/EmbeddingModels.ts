export interface ISemanticChunk {
  id: string;
  documentId: string;
  chunkId: string;
  namespaceId: string;
  ontologyReferences?: string[];
  language?: string;
  originalText: string;
  normalizedText: string;
  
  // Provenance
  sourceBook?: string;
  edition?: string;
  pageNumber?: number;
  section?: string;
  heading?: string;
  
  checksum: string;
  embeddingVersion: string;
  providerMetadata: Record<string, any>;
  creationTimestamp: number;
}

export interface IEmbeddingVector {
  id: string; // usually chunkId or semanticChunkId
  vector: number[];
  dimensions: number;
}

export interface IEmbeddingRecord {
  semanticChunk: ISemanticChunk;
  embedding: IEmbeddingVector;
}

export interface IEmbeddingConfig {
  providerId: string;
  version?: string;
  dimensions?: number;
}
