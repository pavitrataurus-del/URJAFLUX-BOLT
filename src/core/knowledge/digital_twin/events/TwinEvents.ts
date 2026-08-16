import { IEvent, EventPriority } from "../../../../infrastructure/events/EventTypes";

export enum TwinEventType {
  TWIN_CREATED = "TWIN_CREATED",
  TWIN_UPDATED = "TWIN_UPDATED",
  TWIN_VALIDATED = "TWIN_VALIDATED",
  TWIN_VERSION_CREATED = "TWIN_VERSION_CREATED",
  TWIN_LOADED = "TWIN_LOADED",
  TWIN_SAVED = "TWIN_SAVED",
  TWIN_SERIALIZATION_COMPLETED = "TWIN_SERIALIZATION_COMPLETED",
  TWIN_VALIDATION_FAILED = "TWIN_VALIDATION_FAILED"
}

export const createTwinEvent = <T>(type: TwinEventType, payload: T, tenantId?: string): IEvent<T> => ({
  id: Math.random().toString(36).substring(2, 9),
  type,
  payload,
  timestamp: Date.now(),
  tenantId,
  priority: EventPriority.NORMAL
});
