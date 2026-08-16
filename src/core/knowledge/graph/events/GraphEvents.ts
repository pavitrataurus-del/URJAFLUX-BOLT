import { IEvent, EventPriority } from "../../../../infrastructure/events/EventTypes";

export enum GraphEventType {
  GRAPH_CREATED = "GRAPH_CREATED",
  GRAPH_UPDATED = "GRAPH_UPDATED",
  GRAPH_VALIDATED = "GRAPH_VALIDATED",
  EXPERT_REGISTERED = "EXPERT_REGISTERED",
  EXPERT_ACTIVATED = "EXPERT_ACTIVATED",
  EVIDENCE_LINKED = "EVIDENCE_LINKED"
}

export const createGraphEvent = <T>(type: GraphEventType, payload: T, tenantId?: string): IEvent<T> => ({
  id: Math.random().toString(36).substring(2, 9),
  type,
  payload,
  timestamp: Date.now(),
  tenantId,
  priority: EventPriority.NORMAL
});
