import { IEvent, EventPriority } from "../../../infrastructure/events/EventTypes";

export enum IngestionEventType {
  DOCUMENT_REGISTERED = "DOCUMENT_REGISTERED",
  DOCUMENT_VALIDATED = "DOCUMENT_VALIDATED",
  IMPORT_STARTED = "IMPORT_STARTED",
  IMPORT_PROGRESS = "IMPORT_PROGRESS",
  IMPORT_PAUSED = "IMPORT_PAUSED",
  IMPORT_RESUMED = "IMPORT_RESUMED",
  IMPORT_COMPLETED = "IMPORT_COMPLETED",
  IMPORT_FAILED = "IMPORT_FAILED",
  CHUNK_CREATED = "CHUNK_CREATED",
  METADATA_EXTRACTED = "METADATA_EXTRACTED"
}

export const createIngestionEvent = <T>(type: IngestionEventType, payload: T, tenantId?: string): IEvent<T> => ({
  id: Math.random().toString(36).substring(2, 9),
  type,
  payload,
  timestamp: Date.now(),
  tenantId,
  priority: EventPriority.NORMAL
});
