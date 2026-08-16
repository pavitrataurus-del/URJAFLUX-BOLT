import { IEvent, EventPriority } from "../../../../infrastructure/events/EventTypes";

export enum DecisionEventType {
  DECISION_CREATED = "DECISION_CREATED",
  EVIDENCE_ATTACHED = "EVIDENCE_ATTACHED",
  CONFIDENCE_CALCULATED = "CONFIDENCE_CALCULATED",
  DECISION_VALIDATED = "DECISION_VALIDATED",
  AUDIT_RECORDED = "AUDIT_RECORDED",
  DECISION_ARCHIVED = "DECISION_ARCHIVED"
}

export const createDecisionEvent = <T>(type: DecisionEventType, payload: T, tenantId?: string): IEvent<T> => ({
  id: Math.random().toString(36).substring(2, 9),
  type,
  payload,
  timestamp: Date.now(),
  tenantId,
  priority: EventPriority.NORMAL
});
