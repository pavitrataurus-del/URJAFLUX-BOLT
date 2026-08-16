/**
 * URJAFLUX AI OS — SPRINT 4A.6 (SSOT Consolidation)
 * Canonical Spatial Calculation Engine
 * 
 * THE SINGLE AUTHORITATIVE ENGINE FOR:
 * 1. Polygon Centroid (Shoelace formula)
 * 2. Bearing & Vector Angle
 * 3. North Adjustment Offset
 * 4. Canonical 16-Zone Assignment & Brahmasthan Evaluation
 * 5. Complete CanonicalSpatialContext DTO Construction
 */

import { Point2D, BoundingBox2D, CanonicalSpatialContext, PropertySpatialContext } from "./CanonicalSpatialContext";
import { CanonicalZoneCode, CanonicalZoneRegistry, ZoneMetadata } from "./CanonicalZoneRegistry";

export class CanonicalSpatialCalculationEngine {
  public static readonly VERSION = "4A.6-SSOT-1.0";

  /**
   * CANONICAL CENTROID ALGORITHM (Shoelace Sub-components)
   * Computes the center of mass for any 2D closed polygon or point set.
   */
  public static calculateCentroid(polygon: Point2D[]): Point2D {
    if (!polygon || polygon.length === 0) {
      return { x: 0, y: 0 };
    }
    if (polygon.length === 1) {
      return { x: polygon[0].x, y: polygon[0].y };
    }
    if (polygon.length === 2) {
      return {
        x: (polygon[0].x + polygon[1].x) / 2,
        y: (polygon[0].y + polygon[1].y) / 2
      };
    }

    let areaTimes2 = 0;
    let cx = 0;
    let cy = 0;

    const n = polygon.length;
    for (let i = 0; i < n; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % n];
      const cross = (p1.x * p2.y - p2.x * p1.y);
      areaTimes2 += cross;
      cx += (p1.x + p2.x) * cross;
      cy += (p1.y + p2.y) * cross;
    }

    const area = areaTimes2 / 2;

    if (Math.abs(area) < 1e-7) {
      // Degenerate collinear points - fall back to geometric average
      const sumX = polygon.reduce((s, p) => s + p.x, 0);
      const sumY = polygon.reduce((s, p) => s + p.y, 0);
      return { x: sumX / n, y: sumY / n };
    }

    const factor = 1 / (6 * area);
    return {
      x: cx * factor,
      y: cy * factor
    };
  }

  /**
   * CANONICAL POLYGON AREA (Shoelace formula)
   */
  public static calculateArea(polygon: Point2D[]): number {
    if (!polygon || polygon.length < 3) return 0;
    let areaTimes2 = 0;
    const n = polygon.length;
    for (let i = 0; i < n; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % n];
      areaTimes2 += (p1.x * p2.y - p2.x * p1.y);
    }
    return Math.abs(areaTimes2 / 2);
  }

  /**
   * CANONICAL PERIMETER
   */
  public static calculatePerimeter(polygon: Point2D[]): number {
    if (!polygon || polygon.length < 2) return 0;
    let len = 0;
    const n = polygon.length;
    for (let i = 0; i < n; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % n];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  }

  /**
   * CANONICAL BOUNDING BOX
   */
  public static calculateBoundingBox(polygon: Point2D[]): BoundingBox2D {
    if (!polygon || polygon.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    for (const p of polygon) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(0, maxX - minX),
      height: Math.max(0, maxY - minY)
    };
  }

  /**
   * CANONICAL BEARING CALCULATION
   * Computes compass bearing from origin (property centroid) to target (entity centroid).
   * North is 0°, East is 90°, South is 180°, West is 270°.
   */
  public static calculateBearing(origin: Point2D, target: Point2D): number {
    const dx = target.x - origin.x;
    const dy = target.y - origin.y; // CAD world coordinates (+Y is North)
    let rad = Math.atan2(dx, dy);
    let deg = (rad * 180) / Math.PI;
    return (deg + 360) % 360;
  }

  /**
   * CANONICAL NORTH ROTATION ADJUSTMENT
   */
  public static adjustBearingForNorth(rawBearing: number, northRotationDeg: number): number {
    return (rawBearing - northRotationDeg + 360) % 360;
  }

  /**
   * CANONICAL BRAHMASTHAN CHECK
   * Evaluates if entity centroid is within the central 33% core zone.
   */
  public static isBrahmasthan(entityCentroid: Point2D, propCenter: Point2D, propBounds: BoundingBox2D): boolean {
    if (propBounds.width <= 0 || propBounds.height <= 0) return false;
    const dx = Math.abs(entityCentroid.x - propCenter.x);
    const dy = Math.abs(entityCentroid.y - propCenter.y);
    const thresholdX = propBounds.width / 6;  // Center 1/3 (±1/6th)
    const thresholdY = propBounds.height / 6;
    return dx <= thresholdX && dy <= thresholdY;
  }

  /**
   * CANONICAL 16-ZONE ASSIGNMENT
   */
  public static getZone(
    entityCentroid: Point2D,
    propCenter: Point2D,
    propBounds: BoundingBox2D,
    northRotationDeg: number = 0
  ): { zoneCode: CanonicalZoneCode; bearing: number; adjustedBearing: number; zoneMetadata: ZoneMetadata } {
    const isCenter = this.isBrahmasthan(entityCentroid, propCenter, propBounds);
    const rawBearing = this.calculateBearing(propCenter, entityCentroid);
    const adjustedBearing = this.adjustBearingForNorth(rawBearing, northRotationDeg);
    const zoneCode = CanonicalZoneRegistry.fromBearing(adjustedBearing, isCenter);
    const zoneMetadata = CanonicalZoneRegistry.getMetadata(zoneCode);
    return {
      zoneCode,
      bearing: rawBearing,
      adjustedBearing,
      zoneMetadata
    };
  }

  /**
   * CONSTRUCT CANONICAL SPATIAL CONTEXT DTO (IMMUTABLE SINGLE SOURCE OF TRUTH)
   */
  public static createCanonicalSpatialContext(params: {
    entityId: string;
    propertyId: string;
    floorId: string;
    entityType: string;
    polygon: Point2D[];
    propertyCentroid: Point2D;
    propertyBounds: BoundingBox2D;
    northRotation?: number;
    recognitionConfidence?: number;
    detectionSource?: string;
  }): CanonicalSpatialContext {
    const northRotation = params.northRotation || 0;
    const polygon = params.polygon || [];
    const centroid = this.calculateCentroid(polygon);
    const boundingBox = this.calculateBoundingBox(polygon);
    const area = this.calculateArea(polygon);
    const perimeter = this.calculatePerimeter(polygon);

    const zoneRes = this.getZone(centroid, params.propertyCentroid, params.propertyBounds, northRotation);

    return Object.freeze({
      entityId: params.entityId,
      propertyId: params.propertyId,
      floorId: params.floorId,
      entityType: params.entityType,
      polygon: Object.freeze([...polygon]),
      centroid: Object.freeze({ ...centroid }),
      boundingBox: Object.freeze({ ...boundingBox }),
      area,
      perimeter,
      bearing: zoneRes.bearing,
      northRotation,
      adjustedBearing: zoneRes.adjustedBearing,
      zoneCode: zoneRes.zoneCode,
      zoneMetadata: Object.freeze({ ...zoneRes.zoneMetadata }),
      recognitionConfidence: params.recognitionConfidence ?? 1.0,
      detectionSource: params.detectionSource || "CANONICAL_ENGINE",
      geometryVersion: "1.0",
      calculationVersion: this.VERSION,
      timestamp: Date.now()
    });
  }

  /**
   * CONSTRUCT COMPLETE PROPERTY SPATIAL CONTEXT DTO
   */
  public static createPropertySpatialContext(params: {
    propertyId: string;
    rawEntities: Array<{
      entityId: string;
      floorId?: string;
      entityType: string;
      polygon: Point2D[];
      confidence?: number;
      source?: string;
    }>;
    northRotation?: number;
  }): PropertySpatialContext {
    const northRotation = params.northRotation || 0;

    // Collect all points across entities to derive global property center
    const allPoints: Point2D[] = [];
    params.rawEntities.forEach(e => {
      if (e.polygon) allPoints.push(...e.polygon);
    });

    const globalBoundingBox = this.calculateBoundingBox(allPoints);
    const propertyCentroid = this.calculateCentroid(allPoints);
    const totalArea = params.rawEntities.reduce((sum, e) => sum + this.calculateArea(e.polygon), 0);

    const entities: Record<string, CanonicalSpatialContext> = {};

    params.rawEntities.forEach(e => {
      const canonicalCtx = this.createCanonicalSpatialContext({
        entityId: e.entityId,
        propertyId: params.propertyId,
        floorId: e.floorId || "FLOOR-1",
        entityType: e.entityType,
        polygon: e.polygon,
        propertyCentroid,
        propertyBounds: globalBoundingBox,
        northRotation,
        recognitionConfidence: e.confidence,
        detectionSource: e.source
      });
      entities[e.entityId] = canonicalCtx;
    });

    return Object.freeze({
      propertyId: params.propertyId,
      propertyCentroid: Object.freeze({ ...propertyCentroid }),
      globalBoundingBox: Object.freeze({ ...globalBoundingBox }),
      totalArea,
      northRotation,
      entities: Object.freeze({ ...entities }),
      geometryVersion: "1.0",
      calculationVersion: this.VERSION,
      timestamp: Date.now()
    });
  }
}
