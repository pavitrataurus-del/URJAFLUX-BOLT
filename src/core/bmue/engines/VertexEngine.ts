// ============================================================================
// URJAFLUX AI OS - BMUE STEP 2: VERTEX ENGINE
// Wall intersection computation, corner/junction classification & vertex graph
// ============================================================================

import { 
  IBmueVertexNode, 
  IVertexGraph, 
  BmueVertexType,
  IWallGraph 
} from "../types/bmue.types";

import { IPoint2D } from "../../spatial_recognition/types/sre.v3.types";

export class VertexEngine {
  private static instance: VertexEngine;

  private constructor() {}

  public static getInstance(): VertexEngine {
    if (!VertexEngine.instance) {
      VertexEngine.instance = new VertexEngine();
    }
    return VertexEngine.instance;
  }

  public buildVertexGraph(wallGraph: IWallGraph): IVertexGraph {
    const pointToVertexMap = new Map<string, { point: IPoint2D; wallIds: string[] }>();

    const getPointKey = (p: IPoint2D): string => `${Math.round(p.x * 100) / 100}_${Math.round(p.y * 100) / 100}`;

    // Map all wall endpoints to unique spatial vertices
    wallGraph.walls.forEach(wall => {
      const startKey = getPointKey(wall.start);
      const endKey = getPointKey(wall.end);

      if (!pointToVertexMap.has(startKey)) {
        pointToVertexMap.set(startKey, { point: wall.start, wallIds: [] });
      }
      pointToVertexMap.get(startKey)!.wallIds.push(wall.wallId);

      if (!pointToVertexMap.has(endKey)) {
        pointToVertexMap.set(endKey, { point: wall.end, wallIds: [] });
      }
      pointToVertexMap.get(endKey)!.wallIds.push(wall.wallId);
    });

    const vertices: IBmueVertexNode[] = [];
    let cornerCount = 0;
    let deadEndCount = 0;
    let crossJunctionCount = 0;
    let tJunctionCount = 0;
    let idx = 1;

    pointToVertexMap.forEach((data, key) => {
      const vertexId = `VERTEX_${idx.toString().padStart(3, '0')}`;
      idx++;

      const connectedWallIds = Array.from(new Set(data.wallIds));
      const degree = connectedWallIds.length;

      let type: BmueVertexType = 'INTERSECTION';

      if (degree === 1) {
        type = 'DEAD_END';
        deadEndCount++;
      } else if (degree === 2) {
        type = 'CORNER';
        cornerCount++;
      } else if (degree === 3) {
        type = 'T_JUNCTION';
        tJunctionCount++;
      } else if (degree >= 4) {
        type = 'CROSS_JUNCTION';
        crossJunctionCount++;
      }

      // Link vertex IDs back into walls
      connectedWallIds.forEach(wId => {
        const wall = wallGraph.walls.find(w => w.wallId === wId);
        if (wall && !wall.connectedVertexIds.includes(vertexId)) {
          wall.connectedVertexIds.push(vertexId);
        }
      });

      vertices.push({
        vertexId,
        point: data.point,
        type,
        connectedWallIds,
        degree
      });
    });

    return {
      vertices,
      junctionCount: tJunctionCount + crossJunctionCount,
      cornerCount,
      deadEndCount,
      crossJunctionCount,
      tJunctionCount
    };
  }
}

export const vertexEngine = VertexEngine.getInstance();
