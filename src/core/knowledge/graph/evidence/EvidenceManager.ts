import { IEvidenceLink } from "../models/GraphModels";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { GraphEventType, createGraphEvent } from "../events/GraphEvents";

export class EvidenceManager {
  private static instance: EvidenceManager;
  private evidenceStore: Map<string, IEvidenceLink> = new Map();

  private constructor() {}

  public static getInstance(): EvidenceManager {
    if (!EvidenceManager.instance) {
      EvidenceManager.instance = new EvidenceManager();
    }
    return EvidenceManager.instance;
  }

  public storeEvidenceLink(evidence: IEvidenceLink): void {
    this.evidenceStore.set(evidence.id, evidence);
    EventBus.getInstance().publish(createGraphEvent(GraphEventType.EVIDENCE_LINKED, { evidenceId: evidence.id, edgeId: evidence.edgeId }));
  }

  public getEvidence(id: string): IEvidenceLink | undefined {
    return this.evidenceStore.get(id);
  }

  public getEvidenceForEdge(edgeId: string): IEvidenceLink[] {
    return Array.from(this.evidenceStore.values()).filter(e => e.edgeId === edgeId);
  }

  public clear(): void {
    this.evidenceStore.clear();
  }
}
