import { Coordinate, Boundary, Room, Wall, Dimension } from './SpatialTypes';

export class MeasurementEngine {
  private static instance: MeasurementEngine;

  private constructor() {}

  public static getInstance(): MeasurementEngine {
    if (!MeasurementEngine.instance) {
      MeasurementEngine.instance = new MeasurementEngine();
    }
    return MeasurementEngine.instance;
  }

  /**
   * Euclidean distance between two 2D/3D points
   */
  public calculateDistance(p1: Coordinate, p2: Coordinate): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = (p2.z || 0) - (p1.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate angle in degrees between three points (vertex at p2)
   */
  public calculateAngleDegrees(p1: Coordinate, vertex: Coordinate, p3: Coordinate): number {
    const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
    const v2 = { x: p3.x - vertex.x, y: p3.y - vertex.y };

    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (mag1 === 0 || mag2 === 0) return 0;

    let cos = dot / (mag1 * mag2);
    cos = Math.max(-1, Math.min(1, cos));
    return (Math.acos(cos) * 180) / Math.PI;
  }

  /**
   * Calculate exact perimeter of a closed boundary
   */
  public calculatePerimeter(boundary: Boundary): number {
    const points = boundary.points;
    if (points.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < points.length; i++) {
      const nextIdx = (i + 1) % points.length;
      total += this.calculateDistance(points[i], points[nextIdx]);
    }
    return total;
  }

  /**
   * Calculate area of a room polygon in square meters
   */
  public calculatePolygonArea(boundary: Boundary): number {
    const points = boundary.points;
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
   * Get length and width of room bounding box
   */
  public getRoomDimensions(boundary: Boundary): Dimension {
    const bbox = boundary.boundingBox;
    const width = Math.abs(bbox.maxX - bbox.minX);
    const length = Math.abs(bbox.maxY - bbox.minY);
    return {
      width,
      length,
      unit: 'm'
    };
  }

  /**
   * Calculate centroid of points
   */
  public calculateCentroid(points: Coordinate[]): Coordinate {
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
