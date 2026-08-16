import { IEvidenceReference } from "../models/DecisionModels";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { DecisionEventType, createDecisionEvent } from "../events/DecisionEvents";

export class EvidenceChainManager {
  private static instance: EvidenceChainManager;

  private constructor() {}

  public static getInstance(): EvidenceChainManager {
    if (!EvidenceChainManager.instance) {
      EvidenceChainManager.instance = new EvidenceChainManager();
    }
    return EvidenceChainManager.instance;
  }

  public validateEvidenceChain(evidenceList: IEvidenceReference[]): boolean {
    return evidenceList.every(ev => {
      // Must have basic provenance fields
      return ev.id && ev.knowledgeSource && ev.checksum;
    });
  }

  public attachEvidence(decisionId: string, evidence: IEvidenceReference[]): IEvidenceReference[] {
    EventBus.getInstance().publish(createDecisionEvent(DecisionEventType.EVIDENCE_ATTACHED, { decisionId, evidenceCount: evidence.length }));
    return evidence;
  }
}
