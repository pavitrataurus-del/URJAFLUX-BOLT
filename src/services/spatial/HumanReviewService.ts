import { 
  BuildingElement, 
  HumanCorrectionRecord, 
  CorrectionActionType 
} from "../../types/spatialIntelligence";

/**
 * ============================================================================
 *               URJAFLUX AI OS — HUMAN REVIEW & AUDIT SYSTEM
 * ============================================================================
 * 
 * Manages human-in-the-loop review, corrections audit trail, and spatial overrides.
 * Every human modification (accept, reject, rename, merge, split, adjust geometry)
 * creates an immutable record tied to project history.
 */

export class HumanReviewService {
  private history: HumanCorrectionRecord[] = [];

  public logCorrection(
    action: CorrectionActionType,
    performedBy: string,
    targetElementId: string,
    previousState: any,
    newState: any,
    note?: string
  ): HumanCorrectionRecord {
    const record: HumanCorrectionRecord = {
      id: `corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      performedBy,
      timestamp: new Date().toISOString(),
      targetElementId,
      previousState,
      newState,
      note
    };

    this.history.push(record);
    return record;
  }

  public getHistory(): HumanCorrectionRecord[] {
    return [...this.history];
  }

  public getHistoryForElement(elementId: string): HumanCorrectionRecord[] {
    return this.history.filter(h => h.targetElementId === elementId);
  }

  /**
   * Human Action: Rename Room
   */
  public renameRoom(element: BuildingElement, newName: string, userName: string): BuildingElement {
    const prev = { name: element.name, origin: element.origin };
    element.name = newName;
    element.origin = "User Confirmed";

    this.logCorrection("RENAME_ROOM", userName, element.id, prev, { name: newName, origin: "User Confirmed" });
    return element;
  }

  /**
   * Human Action: Accept Detection
   */
  public acceptDetection(element: BuildingElement, userName: string): BuildingElement {
    const prev = { origin: element.origin };
    element.origin = "User Confirmed";
    element.confidence = 1.0;

    this.logCorrection("ACCEPT_DETECTION", userName, element.id, prev, { origin: "User Confirmed", confidence: 1.0 });
    return element;
  }

  /**
   * Human Action: Reject Detection
   */
  public rejectDetection(element: BuildingElement, userName: string): void {
    this.logCorrection("REJECT_DETECTION", userName, element.id, element, null, "Detection marked invalid by architect.");
  }
}
