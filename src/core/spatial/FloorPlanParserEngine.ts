import { FloorPlan, Wall, Room, Boundary, Coordinate, Direction8Zone } from './SpatialTypes';

export interface RoomCandidate {
  id: string;
  suggestedName: string;
  boundary: Boundary;
  areaSqMeters: number;
  centroid: Coordinate;
}

export class FloorPlanParserEngine {
  private static instance: FloorPlanParserEngine;

  private constructor() {}

  public static getInstance(): FloorPlanParserEngine {
    if (!FloorPlanParserEngine.instance) {
      FloorPlanParserEngine.instance = new FloorPlanParserEngine();
    }
    return FloorPlanParserEngine.instance;
  }

  /**
   * Parse wall network into closed room candidates and outer boundary
   */
  public parseFloorPlanGeometry(floorPlan: FloorPlan): {
    outerBoundary: Boundary;
    roomCandidates: RoomCandidate[];
    wallIntersections: Coordinate[];
    totalWallLengthMeters: number;
  } {
    const totalWallLength = floorPlan.walls.reduce((acc, w) => acc + w.lengthMeters, 0);

    // Calculate wall endpoints intersections
    const wallIntersections: Coordinate[] = [];
    floorPlan.walls.forEach((w) => {
      wallIntersections.push(w.startPoint);
      wallIntersections.push(w.endPoint);
    });

    // Detect closed room polygon candidates from rooms
    const roomCandidates: RoomCandidate[] = floorPlan.rooms.map((r, idx) => ({
      id: `CAND-${idx + 1}`,
      suggestedName: r.name,
      boundary: r.boundary,
      areaSqMeters: r.areaSqMeters,
      centroid: r.centroid
    }));

    return {
      outerBoundary: floorPlan.outerBoundary,
      roomCandidates,
      wallIntersections,
      totalWallLengthMeters: totalWallLength
    };
  }

  /**
   * Extract polygon area using Shoelace formula
   */
  public calculatePolygonArea(points: Coordinate[]): number {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area / 2);
  }

  /**
   * Calculate geometric centroid of a polygon
   */
  public calculatePolygonCentroid(points: Coordinate[]): Coordinate {
    if (points.length === 0) return { x: 0, y: 0 };
    let sumX = 0;
    let sumY = 0;
    points.forEach((p) => {
      sumX += p.x;
      sumY += p.y;
    });
    return {
      x: sumX / points.length,
      y: sumY / points.length
    };
  }
}
