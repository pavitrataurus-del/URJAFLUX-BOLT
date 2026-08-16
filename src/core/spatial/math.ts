export interface Point2D {
  x: number;
  y: number;
}

export interface Polygon2D {
  vertices: Point2D[];
}

export interface Sector2D {
  center: Point2D;
  startAngle: number; // In degrees, 0 is North usually in this app but let's keep it purely mathematical (0 = +X axis standard, or domain specific)
  endAngle: number;
  radius: number;
  polygon?: Polygon2D; // The geometric intersection of this sector with a bounding polygon
}

export class SpatialMath {
  public static readonly DEG2RAD = Math.PI / 180;
  public static readonly RAD2DEG = 180 / Math.PI;

  public static distance(p1: Point2D, p2: Point2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public static angle(center: Point2D, point: Point2D): number {
    // Returns angle in degrees from center to point, 0 is +X axis, counter-clockwise
    let theta = Math.atan2(point.y - center.y, point.x - center.x) * this.RAD2DEG;
    if (theta < 0) theta += 360;
    return theta;
  }

  public static calculateCentroid(polygon: Polygon2D): Point2D {
    if (polygon.vertices.length === 0) {
      throw new Error("Polygon has no vertices");
    }
    
    let signedArea = 0;
    let cx = 0;
    let cy = 0;

    for (let i = 0; i < polygon.vertices.length; i++) {
      const p1 = polygon.vertices[i];
      const p2 = polygon.vertices[(i + 1) % polygon.vertices.length];
      const a = p1.x * p2.y - p2.x * p1.y;
      signedArea += a;
      cx += (p1.x + p2.x) * a;
      cy += (p1.y + p2.y) * a;
    }

    signedArea *= 0.5;

    // If area is 0, just return average of points
    if (Math.abs(signedArea) < 1e-10) {
      cx = 0;
      cy = 0;
      for (const p of polygon.vertices) {
        cx += p.x;
        cy += p.y;
      }
      return { x: cx / polygon.vertices.length, y: cy / polygon.vertices.length };
    }

    cx /= (6 * signedArea);
    cy /= (6 * signedArea);

    return { x: cx, y: cy };
  }

  // Purely geometric sector division (divides 360 degrees into N equal parts)
  public static generateEqualSectors(center: Point2D, numberOfSectors: number, startingAngle: number = 0, radius: number = 1000): Sector2D[] {
    if (numberOfSectors <= 0) {
      throw new Error("Number of sectors must be greater than 0");
    }

    const sectors: Sector2D[] = [];
    const sectorAngle = 360 / numberOfSectors;

    for (let i = 0; i < numberOfSectors; i++) {
      const start = (startingAngle + i * sectorAngle) % 360;
      let end = (start + sectorAngle) % 360;
      if (end === 0 && start !== 0) end = 360;

      sectors.push({
        center,
        startAngle: start,
        endAngle: end,
        radius
      });
    }

    return sectors;
  }

  public static isPointInPolygon(point: Point2D, polygon: Polygon2D): boolean {
    let isInside = false;
    const vertices = polygon.vertices;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x, yi = vertices[i].y;
      const xj = vertices[j].x, yj = vertices[j].y;
      
      const intersect = ((yi > point.y) !== (yj > point.y))
          && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) isInside = !isInside;
    }
    return isInside;
  }

  public static polarToCartesian(center: Point2D, radius: number, angleDegrees: number): Point2D {
    const angleRadians = angleDegrees * this.DEG2RAD;
    return {
      x: center.x + radius * Math.cos(angleRadians),
      y: center.y + radius * Math.sin(angleRadians)
    };
  }
}
