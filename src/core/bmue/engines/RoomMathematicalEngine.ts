// ============================================================================
// URJAFLUX AI OS - BMUE STEP 4: ROOM MATHEMATICAL ENGINE
// FOUNDER LOCK: Geometry defines rooms FIRST. OCR confirms SECOND.
// Geometric candidate scoring and OCR confirmation status.
// ============================================================================

import { 
  IRoomMathematicalNode, 
  IRoomGraph, 
  IBmueRoomCandidate,
  IPolygonGraph 
} from "../types/bmue.types";

import { ISpatialContextModelV3 } from "../../spatial_recognition/types/sre.v3.types";

export class RoomMathematicalEngine {
  private static instance: RoomMathematicalEngine;

  private constructor() {}

  public static getInstance(): RoomMathematicalEngine {
    if (!RoomMathematicalEngine.instance) {
      RoomMathematicalEngine.instance = new RoomMathematicalEngine();
    }
    return RoomMathematicalEngine.instance;
  }

  public computeRoomMathematics(
    sreModel: ISpatialContextModelV3,
    polygonGraph: IPolygonGraph
  ): IRoomGraph {
    const roomNodes: IRoomMathematicalNode[] = [];
    let unknownRoomCount = 0;
    let confidenceSum = 0;

    const roomPolygons = polygonGraph.polygons.filter(p => p.polygonId !== 'POLY_OUTER_BOUNDARY');

    roomPolygons.forEach((poly, idx) => {
      const matchingSreRoom = sreModel.rooms.find(r => `POLY_${r.roomId}` === poly.polygonId);
      const ocrLabel = matchingSreRoom ? matchingSreRoom.roomType : undefined;
      const ocrConfirmed = matchingSreRoom?.customName || ocrLabel;

      let primaryType = 'UNKNOWN';
      let roomConfidence = 0.50;
      let ocrConfirmationStatus: IRoomMathematicalNode['ocrConfirmationStatus'] = 'GEOMETRY_ONLY_NO_OCR';
      const candidateTypes: IBmueRoomCandidate[] = [];

      if (ocrConfirmed && ocrConfirmed.trim() && ocrConfirmed !== 'UNKNOWN_ROOM') {
        primaryType = ocrConfirmed.trim();
        roomConfidence = matchingSreRoom?.confidence ?? 0.95;
        ocrConfirmationStatus = 'GEOMETRY_CONFIRMED_BY_OCR';
        candidateTypes.push({
          candidate: 'UNKNOWN',
          confidence: roomConfidence,
          geometricReasoning: `OCR label preserved verbatim: ${primaryType}`
        });
      } else {
        unknownRoomCount++;
        candidateTypes.push({
          candidate: 'UNKNOWN',
          confidence: 0.50,
          geometricReasoning: 'No OCR label; geometry-only polygon not assigned a predefined room name'
        });
      }

      confidenceSum += roomConfidence;

      roomNodes.push({
        roomId: matchingSreRoom ? matchingSreRoom.roomId : `ROOM_GEO_${idx + 1}`,
        polygonId: poly.polygonId,
        polygonAreaSqMeters: poly.areaSqMeters,
        geometricCentroid: poly.centroid,
        primaryType,
        roomConfidence: Math.round(roomConfidence * 100) / 100,
        candidateTypes,
        ocrConfirmedType: ocrConfirmed,
        ocrConfirmationStatus
      });
    });

    const geometryConfidenceAvg = roomNodes.length > 0 
      ? Math.round((confidenceSum / roomNodes.length) * 100) / 100 
      : 1.0;

    return {
      rooms: roomNodes,
      unknownRoomCount,
      geometryConfidenceAvg
    };
  }
}

export const roomMathematicalEngine = RoomMathematicalEngine.getInstance();
