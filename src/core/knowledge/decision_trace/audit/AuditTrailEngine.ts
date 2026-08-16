import { IDecisionAuditRecord } from "../models/DecisionModels";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { DecisionEventType, createDecisionEvent } from "../events/DecisionEvents";

export class AuditTrailEngine {
  private static instance: AuditTrailEngine;

  private constructor() {}

  public static getInstance(): AuditTrailEngine {
    if (!AuditTrailEngine.instance) {
      AuditTrailEngine.instance = new AuditTrailEngine();
    }
    return AuditTrailEngine.instance;
  }

  public createAuditRecord(
    decisionId: string, 
    action: IDecisionAuditRecord["action"], 
    author: string, 
    reason?: string
  ): IDecisionAuditRecord {
    const record: IDecisionAuditRecord = {
      id: `audit_${decisionId}_${Date.now()}`,
      decisionId,
      action,
      timestamp: Date.now(),
      author,
      reason
    };

    EventBus.getInstance().publish(createDecisionEvent(DecisionEventType.AUDIT_RECORDED, { auditId: record.id, decisionId, action }));
    
    return record;
  }
}
