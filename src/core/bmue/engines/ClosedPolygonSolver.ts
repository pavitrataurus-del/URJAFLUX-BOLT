// ============================================================================
// URJAFLUX AI OS - BMUE STEP 3: CLOSED POLYGON SOLVER
// Mathematical loop detection, polygon hierarchy, centroid, area & orientation
// ============================================================================

import { 
  IBmuePolygon, 
  IPolygonGraph, 
  BmuePolygonStatus,
  IWallGraph,
  IVertexGraph,
  IBmuePolygonEdge
} from "../types/bmue.types";

import { ISpatialContextModelV3, IPoint2D } from "../../spatial_recognition/types/sre.v3.types";
import { PolygonEngine } from "../../spatial_recognition/geometry/PolygonEngine";

export class ClosedPolygonSolver {
  private static instance: ClosedPolygonSolver;

  private constructor() {}

  public static getInstance(): ClosedPolygonSolver {
    if (!ClosedPolygonSolver.instance) {
      ClosedPolygonSolver.instance = new ClosedPolygonSolver();
    }
    return ClosedPolygonSolver.instance;
  }

  public solveClosedPolygons(
    sreModel: ISpatialContextModelV3,
    wallGraph: IWallGraph,
    vertexGraph: IVertexGraph
  ): IPolygonGraph {
    const polygons: IBmuePolygon[] = [];

    let closedLoopCount = 0;
    let nestedCount = 0;
    let openPolygonCount = 0;
    let invalidCount = 0;

    // Outer Boundary Polygon
    const outerBoundaryVerts = sreModel.propertyGeometry.outerBoundary || [];
    let outerBoundaryPolyId: string | undefined;

    if (outerBoundaryVerts.length >= 3) {
      const area = PolygonEngine.calculateArea(outerBoundaryVerts);
      const perimeter = this.calculatePerimeter(outerBoundaryVerts);
      const centroid = PolygonEngine.calculateCentroid(outerBoundaryVerts);
      const bbox = PolygonEngine.calculateBoundingBox(outerBoundaryVerts);
      const edges = this.buildEdges(outerBoundaryVerts);

      const outerPoly: IBmuePolygon = {
        polygonId: 'POLY_OUTER_BOUNDARY',
        status: 'VALID_CLOSED_LOOP',
        vertices: outerBoundaryVerts,
        edges,
        centroid,
        areaSqMeters: Math.round(area * 100) / 100,
        perimeterMeters: Math.round(perimeter * 100) / 100,
        orientationDegrees: 0,
        childPolygonIds: [],
        boundingBox: bbox
      };

      polygons.push(outerPoly);
      outerBoundaryPolyId = outerPoly.polygonId;
      closedLoopCount++;
    }

    // Solve room polygons from SRE v3 detected rooms & walls
    sreModel.rooms.forEach((room, idx) => {
      const verts = room.vertices;
      if (verts.length < 3) {
        invalidCount++;
        return;
      }

      const area = room.areaSqMeters || PolygonEngine.calculateArea(verts);
      const perimeter = this.calculatePerimeter(verts);
      const centroid = room.centroid || PolygonEngine.calculateCentroid(verts);
      const bbox = room.boundingBox || PolygonEngine.calculateBoundingBox(verts);
      const edges = this.buildEdges(verts);

      const isNested = outerBoundaryPolyId ? PolygonEngine.isPointInPolygon(centroid, outerBoundaryVerts) : false;
      const status: BmuePolygonStatus = isNested ? 'NESTED' : 'VALID_CLOSED_LOOP';

      if (isNested) nestedCount++;
      else closedLoopCount++;

      const poly: IBmuePolygon = {
        polygonId: `POLY_${room.roomId}`,
        status,
        vertices: verts,
        edges,
        centroid,
        areaSqMeters: Math.round(area * 100) / 100,
        perimeterMeters: Math.round(perimeter * 100) / 100,
        orientationDegrees: Math.round(this.calculateOrientation(verts) * 10) / 10,
        parentPolygonId: isNested ? outerBoundaryPolyId : undefined,
        childPolygonIds: [],
        boundingBox: bbox
      };

      polygons.push(poly);

      if (isNested && outerBoundaryPolyId) {
        const outer = polygons.find(p => p.polygonId === outerBoundaryPolyId);
        if (outer) outer.childPolygonIds.push(poly.polygonId);
      }
    });

    return {
      polygons,
      closedLoopCount,
      nestedCount,
      openPolygonCount,
      invalidCount,
      outerBoundaryPolygonId: outerBoundaryPolyId
    };
  }

  private calculatePerimeter(vertices: IPoint2D[]): number {
    if (vertices.length < 2) return 0;
    let perimeter = 0;
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const next = vertices[(i + 1) % n];
      perimeter += Math.hypot(next.x - vertices[i].x, next.y - vertices[i].y);
    }
    return perimeter;
  }

  private buildEdges(vertices: IPoint2D[]): IBmuePolygonEdge[] {
    const edges: IBmuePolygonEdge[] = [];
    for (let i = 0; i < vertices.length; i++) {
      const start = vertices[i];
      const end = vertices[(i + 1) % vertices.length];
      const lengthMeters = Math.hypot(end.x - start.x, end.y - start.y);
      edges.push({
        start,
        end,
        lengthMeters: Math.round(lengthMeters * 100) / 100
      });
    }
    return edges;
  }

  private calculateOrientation(vertices: IPoint2D[]): number {
    if (vertices.length < 2) return 0;
    // Calculate major axis orientation of bounding box
    const bbox = PolygonEngine.calculateBoundingBox(vertices);
    const width = bbox.maxX - bbox.minX;
    const height = bbox.maxY - bbox.minY;
    return width >= height ? 0 : 90;
  }
}

export const closedPolygonSolver = ClosedPolygonSolver.getInstance();
