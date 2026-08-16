import { ISemanticChunk, IEmbeddingVector, IEmbeddingRecord } from "../models/EmbeddingModels";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { EmbeddingEventType, createEmbeddingEvent } from "../events/EmbeddingEvents";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";
import { KnowledgeNamespaceEngine } from "../../namespace/KnowledgeNamespaceEngine";

export class EmbeddingValidationEngine {
  private static instance: EmbeddingValidationEngine;

  private constructor() {}

  public static getInstance(): EmbeddingValidationEngine {
    if (!EmbeddingValidationEngine.instance) {
      EmbeddingValidationEngine.instance = new EmbeddingValidationEngine();
    }
    return EmbeddingValidationEngine.instance;
  }

  public validateChunk(chunk: ISemanticChunk): boolean {
    if (!chunk.id || !chunk.documentId || !chunk.chunkId || !chunk.namespaceId) {
      throw new EnterpriseError("Missing required semantic chunk metadata", { category: ErrorCategory.VALIDATION });
    }

    if (!chunk.originalText || !chunk.normalizedText) {
      throw new EnterpriseError("Semantic chunk must contain text content", { category: ErrorCategory.VALIDATION });
    }
    
    if (!chunk.checksum || !chunk.embeddingVersion) {
      throw new EnterpriseError("Missing provenance (checksum/version)", { category: ErrorCategory.VALIDATION });
    }

    // Validate namespace isolation
    const nsEngine = KnowledgeNamespaceEngine.getInstance();
    const ns = nsEngine.getNamespace(chunk.namespaceId);
    if (!ns) {
      throw new EnterpriseError(`Invalid namespace ${chunk.namespaceId}`, { category: ErrorCategory.VALIDATION });
    }

    return true;
  }

  public validateVector(vector: IEmbeddingVector, expectedDimensions?: number): boolean {
    if (!vector.id || !vector.vector) {
      throw new EnterpriseError("Invalid vector format", { category: ErrorCategory.VALIDATION });
    }

    if (vector.vector.length === 0) {
      throw new EnterpriseError("Empty vector generated", { category: ErrorCategory.VALIDATION });
    }

    if (expectedDimensions && vector.vector.length !== expectedDimensions) {
      throw new EnterpriseError(`Dimension mismatch. Expected ${expectedDimensions}, got ${vector.vector.length}`, { category: ErrorCategory.VALIDATION });
    }
    
    if (vector.dimensions !== vector.vector.length) {
       throw new EnterpriseError(`Dimension mismatch in metadata. Metadata says ${vector.dimensions}, vector length is ${vector.vector.length}`, { category: ErrorCategory.VALIDATION });
    }

    return true;
  }

  public validateRecord(record: IEmbeddingRecord, expectedDimensions?: number): boolean {
    this.validateChunk(record.semanticChunk);
    this.validateVector(record.embedding, expectedDimensions);

    if (record.semanticChunk.chunkId !== record.embedding.id && record.semanticChunk.id !== record.embedding.id) {
       throw new EnterpriseError("Mismatch between chunk ID and embedding ID", { category: ErrorCategory.VALIDATION });
    }

    EventBus.getInstance().publish(createEmbeddingEvent(EmbeddingEventType.EMBEDDING_VALIDATED, { 
      chunkId: record.semanticChunk.id, 
      documentId: record.semanticChunk.documentId 
    }));

    return true;
  }
}
