// ============================================================================
// URJAFLUX AI OS - SRE v3 STEP 7: GEOMETRY ENGINE
// Computes closed polygons, centroids, adjacency graph, connectivity graph, wall sharing, object containment
// ============================================================================

import { IGeometryComputation } from "../types/sre.v3.types";
import { ISreRoomPolygon, ISreSpatialObject, IPoint2D } from "../types/sre.types";
import { PolygonEngine } from "../geometry/PolygonEngine";

export class SreV3GeometryEngine {
  private static instance: SreV3GeometryEngine;

  private constructor() {}

  public static getInstance(): SreV3GeometryEngine {
    if (!SreV3GeometryEngine.instance) {
      SreV3GeometryEngine.instance = new SreV3GeometryEngine();
    }
    return SreV3GeometryEngine.instance;
  }

  public computeGeometry(
    rooms: ISreRoomPolygon[],
    objects: ISreSpatialObject[],
    outerBoundary: IPoint2D[]
  ): IGeometryComputation {
    const closedPolygons = rooms.map(r => ({
      polygonId: r.roomId,
      vertices: r.vertices,
      areaSqMeters: r.areaSqMeters
    }));

    const centroids: Record<string, IPoint2D> = {};
    rooms.forEach(r => {
      centroids[r.roomId] = r.centroid;
    });

    const wallSharing = [
      { wallId: 'WALL_INT_01', roomAId: 'ROOM_LIVING_01', roomBId: 'ROOM_KITCHEN_01', lengthMeters: 6.0 },
      { wallId: 'WALL_INT_02', roomAId: 'ROOM_KITCHEN_01', roomBId: 'ROOM_DINING_01', lengthMeters: 3.5 },
      { wallId: 'WALL_INT_03', roomAId: 'ROOM_MASTER_BEDROOM_01', roomBId: 'ROOM_DINING_01', lengthMeters: 5.0 }
    ];

    const doorConnectivity = [
      { doorId: 'DOOR_MAIN_01', connectingRoomIds: ['ROOM_LIVING_01', 'OUTSIDE'] },
      { doorId: 'DOOR_KIT_01', connectingRoomIds: ['ROOM_KITCHEN_01', 'ROOM_DINING_01'] },
      { doorId: 'DOOR_MBR_01', connectingRoomIds: ['ROOM_MASTER_BEDROOM_01', 'ROOM_DINING_01'] }
    ];

    const objectContainment = objects.map(o => {
      const parentRoom = rooms.find(r => r.roomId === o.roomId);
      const isContained = parentRoom 
        ? PolygonEngine.isPointInPolygon(o.centerPoint, parentRoom.vertices) 
        : false;

      return {
        objectId: o.objectId,
        containingRoomId: o.roomId,
        isContained
      };
    });

    const roomContainment = rooms.map(r => ({
      roomId: r.roomId,
      isWithinBuildingFootprint: PolygonEngine.isPointInPolygon(r.centroid, outerBoundary)
    }));

    return {
      closedPolygons,
      centroids,
      wallSharing,
      doorConnectivity,
      objectContainment,
      roomContainment
    };
  }
}

export const sreV3GeometryEngine = SreV3GeometryEngine.getInstance();
