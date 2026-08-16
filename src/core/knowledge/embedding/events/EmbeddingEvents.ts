import { IEvent, EventPriority } from "../../../../infrastructure/events/EventTypes";

export enum EmbeddingEventType {
  EMBEDDING_STARTED = "EMBEDDING_STARTED",
  EMBEDDING_GENERATED = "EMBEDDING_GENERATED",
  EMBEDDING_VALIDATED = "EMBEDDING_VALIDATED",
  EMBEDDING_STORED = "EMBEDDING_STORED",
  EMBEDDING_DELETED = "EMBEDDING_DELETED",
  SEMANTIC_INDEX_UPDATED = "SEMANTIC_INDEX_UPDATED",
  EMBEDDING_FAILED = "EMBEDDING_FAILED"
}

export const createEmbeddingEvent = <T>(type: EmbeddingEventType, payload: T, tenantId?: string): IEvent<T> => ({
  id: Math.random().toString(36).substring(2, 9),
  type,
  payload,
  timestamp: Date.now(),
  tenantId,
  priority: EventPriority.NORMAL
});
