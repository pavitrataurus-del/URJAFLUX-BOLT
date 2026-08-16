import { Point2D, LineSegment2D, BoundingBox2D, Polygon2D } from "../../types/spatialIntelligence";
import { CanonicalSpatialCalculationEngine } from "../../core/spatial/CanonicalSpatialCalculationEngine";

/**
 * ============================================================================
 *               URJAFLUX AI OS — SPATIAL GEOMETRY ENGINE
 * ============================================================================
 * 
 * Provides vector geometry, polygon analysis, intersection detection,
 * point-in-polygon containment, shared edge adjacency, and bounding box math.
 */

export class SpatialGeometryEngine {

  /**
   * Calculate polygon area using Gauss's Shoelace formula (returns sq meters or canvas sq units)
   */
  public static calculatePolygonArea(vertices: Point2D[]): number {
    if (!vertices || vertices.length < 3) return 0;
    
    let area = 0;
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += vertices[i].x * vertices[j].y;
      area -= vertices[j].x * vertices[i].y;
    }
    return Math.abs(area) / 2.0;
  }

  /**
   * Calculate perimeter of a polygon by summing Euclidean distance between adjacent vertices
   */
  public static calculatePolygonPerimeter(vertices: Point2D[]): number {
    if (!vertices || vertices.length < 2) return 0;

    let perimeter = 0;
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const dx = vertices[j].x - vertices[i].x;
      const dy = vertices[j].y - vertices[i].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
  }

  /**
   * Calculate polygon centroid (center of mass)
   * Delegates directly to CanonicalSpatialCalculationEngine (SSOT)
   */
  public static calculateCentroid(vertices: Point2D[]): Point2D {
    return CanonicalSpatialCalculationEngine.calculateCentroid(vertices);
  }

  /**
   * Point in Polygon test using Ray-Casting algorithm
   */
  public static isPointInPolygon(point: Point2D, vertices: Point2D[]): boolean {
    if (!vertices || vertices.length < 3) return false;

    let inside = false;
    const n = vertices.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = vertices[i].x, yi = vertices[i].y;
      const xj = vertices[j].x, yj = vertices[j].y;

      const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi + 1e-12) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Check line segment intersection
   */
  public static getLineIntersection(l1: LineSegment2D, l2: LineSegment2D): Point2D | null {
    const x1 = l1.start.x, y1 = l1.start.y;
    const x2 = l1.end.x, y2 = l1.end.y;
    const x3 = l2.start.x, y3 = l2.start.y;
    const x4 = l2.end.x, y4 = l2.end.y;

    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (Math.abs(denom) < 1e-6) return null; // Parallel

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1)
      };
    }

    return null;
  }

  /**
   * Axis-aligned bounding box calculation
   */
  public static getBoundingBox(vertices: Point2D[]): BoundingBox2D {
    if (!vertices || vertices.length === 0) {
      return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    }

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const p of vertices) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }

    return {
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY }
    };
  }

  /**
   * Check if polygon is closed within distance tolerance
   */
  public static isPolygonClosed(vertices: Point2D[], tolerance = 0.5): boolean {
    if (!vertices || vertices.length < 3) return false;
    const first = vertices[0];
    const last = vertices[vertices.length - 1];
    const dx = first.x - last.x;
    const dy = first.y - last.y;
    return Math.sqrt(dx * dx + dy * dy) <= tolerance;
  }

  /**
   * Shared boundary segment length between two polygons
   */
  public static calculateSharedBoundaryLength(polyA: Point2D[], polyB: Point2D[], bufferThreshold = 1.0): number {
    if (!polyA || !polyB || polyA.length < 3 || polyB.length < 3) return 0;

    let sharedLength = 0;
    const nA = polyA.length;

    for (let i = 0; i < nA; i++) {
      const p1 = polyA[i];
      const p2 = polyA[(i + 1) % nA];
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      // Check if edge midpoint is close to polyB perimeter
      if (this.isPointNearPolygonEdge(mid, polyB, bufferThreshold)) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        sharedLength += Math.sqrt(dx * dx + dy * dy);
      }
    }

    return sharedLength;
  }

  private static isPointNearPolygonEdge(point: Point2D, polygon: Point2D[], threshold: number): boolean {
    const n = polygon.length;
    for (let i = 0; i < n; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % n];
      const dist = this.pointToSegmentDistance(point, p1, p2);
      if (dist <= threshold) return true;
    }
    return false;
  }

  private static pointToSegmentDistance(p: Point2D, a: Point2D, b: Point2D): number {
    const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    if (l2 === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
    
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    
    const projX = a.x + t * (b.x - a.x);
    const projY = a.y + t * (b.y - a.y);
    return Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2);
  }

  /**
   * Helper to construct a full Polygon2D object from vertices
   */
  public static createPolygon2D(vertices: Point2D[]): Polygon2D {
    const area = this.calculatePolygonArea(vertices);
    const perimeter = this.calculatePolygonPerimeter(vertices);
    const centroid = this.calculateCentroid(vertices);
    const isClosed = this.isPolygonClosed(vertices);

    return {
      vertices,
      isClosed,
      area,
      perimeter,
      centroid
    };
  }
}
