import { IEvent, EventPriority } from "../../../infrastructure/events/EventTypes";

export enum KnowledgeEventType {
  ONTOLOGY_CREATED = "ONTOLOGY_CREATED",
  ONTOLOGY_UPDATED = "ONTOLOGY_UPDATED",
  NAMESPACE_REGISTERED = "NAMESPACE_REGISTERED",
  NAMESPACE_ACTIVATED = "NAMESPACE_ACTIVATED",
  NAMESPACE_DEACTIVATED = "NAMESPACE_DEACTIVATED",
  KNOWLEDGE_SOURCE_REGISTERED = "KNOWLEDGE_SOURCE_REGISTERED",
  KNOWLEDGE_SOURCE_UPDATED = "KNOWLEDGE_SOURCE_UPDATED"
}

export const createKnowledgeEvent = <T>(type: KnowledgeEventType, payload: T, tenantId?: string): IEvent<T> => ({
  id: Math.random().toString(36).substring(2, 9),
  type,
  payload,
  timestamp: Date.now(),
  tenantId,
  priority: EventPriority.NORMAL
});
