import { ISemanticChunk, IEmbeddingRecord } from "../models/EmbeddingModels";
import { VectorStoreFactory } from "../storage/VectorStoreFactory";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { EmbeddingEventType, createEmbeddingEvent } from "../events/EmbeddingEvents";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class SemanticIndexManager {
  private static instance: SemanticIndexManager;

  private constructor() {}

  public static getInstance(): SemanticIndexManager {
    if (!SemanticIndexManager.instance) {
      SemanticIndexManager.instance = new SemanticIndexManager();
    }
    return SemanticIndexManager.instance;
  }

  public async getRecord(chunkId: string, storeId?: string): Promise<IEmbeddingRecord | null> {
    const store = VectorStoreFactory.getInstance().getStore(storeId);
    return store.getRecord(chunkId);
  }

  public async getRecordsByDocument(documentId: string, storeId?: string): Promise<IEmbeddingRecord[]> {
    const store = VectorStoreFactory.getInstance().getStore(storeId);
    return store.getRecordsByDocument(documentId);
  }

  public async deleteDocument(documentId: string, storeId?: string): Promise<void> {
    const store = VectorStoreFactory.getInstance().getStore(storeId);
    await store.deleteByDocumentId(documentId);
    
    EventBus.getInstance().publish(createEmbeddingEvent(EmbeddingEventType.EMBEDDING_DELETED, { 
      documentId,
      scope: "DOCUMENT"
    }));
    
    EventBus.getInstance().publish(createEmbeddingEvent(EmbeddingEventType.SEMANTIC_INDEX_UPDATED, { 
      action: "DELETE_DOCUMENT",
      documentId
    }));
  }

  public async deleteNamespace(namespaceId: string, storeId?: string): Promise<void> {
    const store = VectorStoreFactory.getInstance().getStore(storeId);
    await store.deleteByNamespace(namespaceId);
    
    EventBus.getInstance().publish(createEmbeddingEvent(EmbeddingEventType.EMBEDDING_DELETED, { 
      namespaceId,
      scope: "NAMESPACE"
    }));
    
    EventBus.getInstance().publish(createEmbeddingEvent(EmbeddingEventType.SEMANTIC_INDEX_UPDATED, { 
      action: "DELETE_NAMESPACE",
      namespaceId
    }));
  }
}
