// ============================================================================
// URJAFLUX AI OS - SRE v3 STEP 4: ROOM DETECTION ENGINE
// Identifies rooms from OCR labels only. Never forces predefined architectural types.
// ============================================================================

import { SreRoomTypeV3, IRoomCandidate } from "../types/sre.v3.types";
import { ISreRoomPolygon } from "../types/sre.types";
import { preserveOcrLabel } from "../../../recognition/ocrLabelPolicy";

export class RoomDetectionEngine {
  private static instance: RoomDetectionEngine;

  private constructor() {}

  public static getInstance(): RoomDetectionEngine {
    if (!RoomDetectionEngine.instance) {
      RoomDetectionEngine.instance = new RoomDetectionEngine();
    }
    return RoomDetectionEngine.instance;
  }

  public classifyRoomType(
    ocrLabel?: string,
    _containedObjectTypes: string[] = [],
    _aspectRatio: number = 1.0,
    _areaSqMeters: number = 15
  ): { primaryType: SreRoomTypeV3; confidence: number; candidates: IRoomCandidate[] } {
    const exactLabel = ocrLabel ? preserveOcrLabel(ocrLabel) : "";
    if (exactLabel && exactLabel.toUpperCase() !== "UNKNOWN_ROOM") {
      const preserved = exactLabel as SreRoomTypeV3;
      return {
        primaryType: preserved,
        confidence: 0.98,
        candidates: [{
          candidateRoomType: preserved,
          confidence: 0.98,
          reasoning: `OCR label preserved verbatim: ${exactLabel}`
        }]
      };
    }

    return {
      primaryType: "UNKNOWN_ROOM",
      confidence: 0.50,
      candidates: [{
        candidateRoomType: "UNKNOWN_ROOM",
        confidence: 0.50,
        reasoning: "No OCR label present; room type not inferred from geometry or objects"
      }]
    };
  }

  public processRoomPolygons(rooms: ISreRoomPolygon[]): ISreRoomPolygon[] {
    return rooms.map((r) => {
      const classification = this.classifyRoomType(r.roomType, r.associatedObjectIds);

      return {
        ...r,
        roomType: classification.primaryType,
        customName: classification.primaryType !== "UNKNOWN_ROOM" ? String(classification.primaryType) : r.customName,
        confidence: Math.max(r.confidence, classification.confidence)
      };
    });
  }
}

export const roomDetectionEngine = RoomDetectionEngine.getInstance();
