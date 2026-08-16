import { IEvent, EventPriority } from "../../../../infrastructure/events/EventTypes";

export enum ReasoningEventType {
  REASONING_STARTED = "REASONING_STARTED",
  EXPERT_EXECUTED = "EXPERT_EXECUTED",
  RECOMMENDATION_CREATED = "RECOMMENDATION_CREATED",
  CONFLICT_DETECTED = "CONFLICT_DETECTED",
  RECOMMENDATION_APPROVED = "RECOMMENDATION_APPROVED",
  RECOMMENDATION_REJECTED = "RECOMMENDATION_REJECTED",
  RECOMMENDATION_ARCHIVED = "RECOMMENDATION_ARCHIVED"
}

export const createReasoningEvent = <T>(type: ReasoningEventType, payload: T, tenantId?: string): IEvent<T> => ({
  id: Math.random().toString(36).substring(2, 9),
  type,
  payload,
  timestamp: Date.now(),
  tenantId,
  priority: EventPriority.NORMAL
});
