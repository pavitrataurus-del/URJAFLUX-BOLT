// ============================================================================
// URJAFLUX AI OS - BMUE STEP 7: OBJECT CONTAINMENT ENGINE
// Every detected object must belong to exactly ONE polygon.
// If outside or uncontained -> mark OUTSIDE_ROOM / UNKNOWN_CONTAINER. Never guess.
// ============================================================================

import { 
  IBmueObjectContainment, 
  IContainmentGraph, 
  BmueContainmentStatus,
  IPolygonGraph,
  IRoomGraph 
} from "../types/bmue.types";

import { ISpatialContextModelV3, IPoint2D } from "../../spatial_recognition/types/sre.v3.types";
import { PolygonEngine } from "../../spatial_recognition/geometry/PolygonEngine";

export class ObjectContainmentEngine {
  private static instance: ObjectContainmentEngine;

  private constructor() {}

  public static getInstance(): ObjectContainmentEngine {
    if (!ObjectContainmentEngine.instance) {
      ObjectContainmentEngine.instance = new ObjectContainmentEngine();
    }
    return ObjectContainmentEngine.instance;
  }

  public solveObjectContainment(
    sreModel: ISpatialContextModelV3,
    polygonGraph: IPolygonGraph,
    roomGraph: IRoomGraph
  ): IContainmentGraph {
    const containments: IBmueObjectContainment[] = [];
    let uncontainedObjectCount = 0;

    const roomPolygons = polygonGraph.polygons.filter(p => p.polygonId !== 'POLY_OUTER_BOUNDARY');

    sreModel.objects.forEach(obj => {
      const center: IPoint2D = obj.centerPoint;
      let assignedPolyId: string | undefined;
      let assignedRoomId: string | undefined;
      let containmentStatus: BmueContainmentStatus = 'UNKNOWN_CONTAINER';
      let confidence = 0.50;

      // Check strictly if object center is inside any room polygon
      for (const poly of roomPolygons) {
        if (PolygonEngine.isPointInPolygon(center, poly.vertices)) {
          assignedPolyId = poly.polygonId;
          const matchingRoom = roomGraph.rooms.find(r => r.polygonId === poly.polygonId);
          if (matchingRoom) {
            assignedRoomId = matchingRoom.roomId;
            containmentStatus = 'CONTAINED_IN_SINGLE_POLYGON';
            confidence = 0.98;
            break;
          }
        }
      }

      // If not inside room polygon, check if inside outer property boundary
      if (!assignedPolyId) {
        const outerPoly = polygonGraph.polygons.find(p => p.polygonId === 'POLY_OUTER_BOUNDARY');
        if (outerPoly && PolygonEngine.isPointInPolygon(center, outerPoly.vertices)) {
          assignedPolyId = outerPoly.polygonId;
          assignedRoomId = 'OUTSIDE_ROOM';
          containmentStatus = 'OUTSIDE_ROOM';
          confidence = 0.90;
        } else {
          // Outside property boundary completely -> UNKNOWN_CONTAINER
          assignedPolyId = 'NONE';
          assignedRoomId = 'UNKNOWN_CONTAINER';
          containmentStatus = 'UNKNOWN_CONTAINER';
          confidence = 0.50;
          uncontainedObjectCount++;
        }
      }

      containments.push({
        objectId: obj.objectId,
        objectType: obj.objectType,
        centerPoint: center,
        assignedPolygonId: assignedPolyId || 'NONE',
        assignedRoomId: assignedRoomId || 'UNKNOWN_CONTAINER',
        containmentStatus,
        containmentConfidence: confidence
      });
    });

    return {
      containments,
      uncontainedObjectCount
    };
  }
}

export const objectContainmentEngine = ObjectContainmentEngine.getInstance();
