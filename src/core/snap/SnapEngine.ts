import { BaseEngine } from '../types/BaseEngine';
import { GeometryEngine } from '../geometry/GeometryEngine';
import { ObjectEngine } from '../engines/ObjectEngine';
import { Point2D, LineSegment, Circle } from '../geometry/types';
import { USOMBaseObject } from '../usom/types';
import { Logger } from '../utils/logger';
import {
  SnapMode,
  SnapConfig,
  SnapOptions,
  SnapCandidate,
  SnapResult
} from './types';

/**
 * SnapEngine - Centralized snapping system providing precise construction assistance.
 * Completely independent of React, Canvas, SVG, and Vastu domain logic.
 * Consumes ObjectEngine and GeometryEngine only.
 */
export class SnapEngine implements BaseEngine {
  public readonly name = 'SnapEngine';
  private initialized = false;

  private config: SnapConfig;

  constructor(
    private readonly geometryEngine: GeometryEngine,
    private readonly objectEngine: ObjectEngine,
    initialConfig?: Partial<SnapConfig>
  ) {
    this.config = {
      tolerance: initialConfig?.tolerance ?? 10,
      gridSpacing: initialConfig?.gridSpacing ?? 20,
      enabledModes: {
        [SnapMode.ENDPOINT]: initialConfig?.enabledModes?.[SnapMode.ENDPOINT] ?? true,
        [SnapMode.MIDPOINT]: initialConfig?.enabledModes?.[SnapMode.MIDPOINT] ?? true,
        [SnapMode.CENTER]: initialConfig?.enabledModes?.[SnapMode.CENTER] ?? true,
        [SnapMode.INTERSECTION]: initialConfig?.enabledModes?.[SnapMode.INTERSECTION] ?? true,
        [SnapMode.GRID]: initialConfig?.enabledModes?.[SnapMode.GRID] ?? true
      },
      modePriorities: {
        [SnapMode.ENDPOINT]: initialConfig?.modePriorities?.[SnapMode.ENDPOINT] ?? 1,
        [SnapMode.INTERSECTION]: initialConfig?.modePriorities?.[SnapMode.INTERSECTION] ?? 2,
        [SnapMode.CENTER]: initialConfig?.modePriorities?.[SnapMode.CENTER] ?? 3,
        [SnapMode.MIDPOINT]: initialConfig?.modePriorities?.[SnapMode.MIDPOINT] ?? 4,
        [SnapMode.GRID]: initialConfig?.modePriorities?.[SnapMode.GRID] ?? 5
      }
    };
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    Logger.info(`[${this.name}] Initialized.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    this.initialized = false;
    Logger.info(`[${this.name}] Shutdown.`);
  }

  // --- CONFIGURATION METHODS ---

  public setSnapTolerance(tolerance: number): void {
    this.config.tolerance = Math.max(0, tolerance);
  }

  public getSnapTolerance(): number {
    return this.config.tolerance;
  }

  public setGridSpacing(spacing: number): void {
    this.config.gridSpacing = Math.max(0.001, spacing);
  }

  public getGridSpacing(): number {
    return this.config.gridSpacing;
  }

  public setSnapModeEnabled(mode: SnapMode, enabled: boolean): void {
    this.config.enabledModes[mode] = enabled;
  }

  public isSnapModeEnabled(mode: SnapMode): boolean {
    return !!this.config.enabledModes[mode];
  }

  public setSnapModes(modes: Partial<Record<SnapMode, boolean>>): void {
    Object.assign(this.config.enabledModes, modes);
  }

  public getSnapModes(): Readonly<Record<SnapMode, boolean>> {
    return { ...this.config.enabledModes };
  }

  public setModePriority(mode: SnapMode, priority: number): void {
    this.config.modePriorities[mode] = priority;
  }

  public getModePriority(mode: SnapMode): number {
    return this.config.modePriorities[mode];
  }

  public getConfig(): Readonly<SnapConfig> {
    return JSON.parse(JSON.stringify(this.config));
  }

  public updateConfig(config: Partial<SnapConfig>): void {
    if (config.tolerance !== undefined) this.setSnapTolerance(config.tolerance);
    if (config.gridSpacing !== undefined) this.setGridSpacing(config.gridSpacing);
    if (config.enabledModes) this.setSnapModes(config.enabledModes);
    if (config.modePriorities) Object.assign(this.config.modePriorities, config.modePriorities);
  }

  // --- CORE SNAP RESOLUTION ---

  public resolveSnap(cursor: Point2D, options?: SnapOptions): SnapResult {
    if (!this.initialized) {
      return { snapped: false, point: cursor, mode: null, distance: 0 };
    }

    const tolerance = options?.customTolerance ?? this.config.tolerance;
    const gridSpacing = options?.customGridSpacing ?? this.config.gridSpacing;

    if (tolerance <= 0) {
      return { snapped: false, point: cursor, mode: null, distance: 0 };
    }

    const enabledModes: Record<SnapMode, boolean> = {
      ...this.config.enabledModes,
      ...(options?.enabledModes ?? {})
    };

    const excludedIds = new Set(options?.excludedObjectIds ?? []);

    // Fetch visible objects from ObjectEngine
    const visibleObjects = this.objectEngine
      .getAllObjects()
      .filter((obj) => obj.isVisible && !excludedIds.has(obj.id));

    const candidates: SnapCandidate[] = [];

    // 1. ENDPOINT, MIDPOINT, CENTER candidates from visible objects
    for (const obj of visibleObjects) {
      const extracted = this.extractGeometryFromObject(obj);

      // Endpoint snap
      if (enabledModes[SnapMode.ENDPOINT]) {
        for (const pt of extracted.endpoints) {
          const dist = this.geometryEngine.distancePointToPoint(cursor, pt);
          if (dist <= tolerance) {
            candidates.push({
              point: pt,
              mode: SnapMode.ENDPOINT,
              distance: dist,
              priority: this.config.modePriorities[SnapMode.ENDPOINT],
              targetObjectId: obj.id,
              description: `Endpoint of ${obj.name}`
            });
          }
        }
      }

      // Midpoint snap
      if (enabledModes[SnapMode.MIDPOINT]) {
        for (const pt of extracted.midpoints) {
          const dist = this.geometryEngine.distancePointToPoint(cursor, pt);
          if (dist <= tolerance) {
            candidates.push({
              point: pt,
              mode: SnapMode.MIDPOINT,
              distance: dist,
              priority: this.config.modePriorities[SnapMode.MIDPOINT],
              targetObjectId: obj.id,
              description: `Midpoint of ${obj.name}`
            });
          }
        }
      }

      // Center snap
      if (enabledModes[SnapMode.CENTER]) {
        for (const pt of extracted.centers) {
          const dist = this.geometryEngine.distancePointToPoint(cursor, pt);
          if (dist <= tolerance) {
            candidates.push({
              point: pt,
              mode: SnapMode.CENTER,
              distance: dist,
              priority: this.config.modePriorities[SnapMode.CENTER],
              targetObjectId: obj.id,
              description: `Center of ${obj.name}`
            });
          }
        }
      }
    }

    // 2. INTERSECTION candidates across pairs of objects
    if (enabledModes[SnapMode.INTERSECTION]) {
      const extractedGeometries = visibleObjects.map((obj) => ({
        id: obj.id,
        name: obj.name,
        extracted: this.extractGeometryFromObject(obj)
      }));

      for (let i = 0; i < extractedGeometries.length; i++) {
        for (let j = i + 1; j < extractedGeometries.length; j++) {
          const g1 = extractedGeometries[i];
          const g2 = extractedGeometries[j];

          const intersectionPoints = this.findIntersectionsBetweenGeometries(g1.extracted, g2.extracted);

          for (const pt of intersectionPoints) {
            const dist = this.geometryEngine.distancePointToPoint(cursor, pt);
            if (dist <= tolerance) {
              candidates.push({
                point: pt,
                mode: SnapMode.INTERSECTION,
                distance: dist,
                priority: this.config.modePriorities[SnapMode.INTERSECTION],
                targetObjectId: g1.id,
                targetObject2Id: g2.id,
                description: `Intersection between ${g1.name} and ${g2.name}`
              });
            }
          }
        }
      }
    }

    // 3. GRID candidates
    if (enabledModes[SnapMode.GRID] && gridSpacing > 0) {
      const gridX = Math.round(cursor.x / gridSpacing) * gridSpacing;
      const gridY = Math.round(cursor.y / gridSpacing) * gridSpacing;
      const gridPt = this.geometryEngine.createPoint(gridX, gridY);
      const dist = this.geometryEngine.distancePointToPoint(cursor, gridPt);

      if (dist <= tolerance) {
        candidates.push({
          point: gridPt,
          mode: SnapMode.GRID,
          distance: dist,
          priority: this.config.modePriorities[SnapMode.GRID],
          description: `Grid (${gridX}, ${gridY})`
        });
      }
    }

    if (candidates.length === 0) {
      return { snapped: false, point: cursor, mode: null, distance: 0 };
    }

    // Sort candidates: first by priority (ascending), then by distance (ascending)
    candidates.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.distance - b.distance;
    });

    const best = candidates[0];

    return {
      snapped: true,
      point: best.point,
      mode: best.mode,
      distance: best.distance,
      candidate: best
    };
  }

  // --- GEOMETRY EXTRACTION HELPER ---

  private extractGeometryFromObject(obj: USOMBaseObject) {
    const endpoints: Point2D[] = [];
    const midpoints: Point2D[] = [];
    const centers: Point2D[] = [];
    const segments: LineSegment[] = [];
    const circles: Circle[] = [];

    const pos = obj.transform.position;
    const rot = obj.transform.rotation;

    const data = obj.metadata?.data || {};

    const hasExplicitShape = !!(data.point || data.segment || data.rectangle || data.circle || data.polygon);

    // Point
    if (data.point) {
      const pt = this.transformPoint(data.point, pos, rot);
      endpoints.push(pt);
    }

    // Line segment / Diagonal
    if (data.segment) {
      const p1 = this.transformPoint(data.segment.p1, pos, rot);
      const p2 = this.transformPoint(data.segment.p2, pos, rot);
      const seg = this.geometryEngine.createSegment(p1, p2);

      endpoints.push(p1, p2);
      midpoints.push(this.geometryEngine.midpointOfLineSegment(seg));
      segments.push(seg);
    }

    // Rectangle (explicit rectangle data or fallback boundingBox for generic objects without explicit primitives)
    if (data.rectangle || (!hasExplicitShape && obj.metadata?.boundingBox)) {
      const rectData = data.rectangle || {
        x: obj.metadata.boundingBox.x,
        y: obj.metadata.boundingBox.y,
        width: obj.metadata.boundingBox.width,
        height: obj.metadata.boundingBox.height
      };

      const rect = this.geometryEngine.createRectangle(
        rectData.x,
        rectData.y,
        rectData.width,
        rectData.height
      );

      const center = this.transformPoint(this.geometryEngine.rectangleCenter(rect), pos, rot);
      centers.push(center);

      const rawCorners = [
        this.geometryEngine.createPoint(rectData.x, rectData.y),
        this.geometryEngine.createPoint(rectData.x + rectData.width, rectData.y),
        this.geometryEngine.createPoint(rectData.x + rectData.width, rectData.y + rectData.height),
        this.geometryEngine.createPoint(rectData.x, rectData.y + rectData.height)
      ];

      const corners = rawCorners.map((c) => this.transformPoint(c, pos, rot));
      endpoints.push(...corners);

      for (let i = 0; i < 4; i++) {
        const seg = this.geometryEngine.createSegment(corners[i], corners[(i + 1) % 4]);
        segments.push(seg);
        midpoints.push(this.geometryEngine.midpointOfLineSegment(seg));
      }
    }

    // Circle
    if (data.circle) {
      const center = this.transformPoint(data.circle.center, pos, rot);
      const circle = this.geometryEngine.createCircle(center, data.circle.radius);
      centers.push(center);
      circles.push(circle);
    }

    // Polygon
    if (data.polygon) {
      const vertices = (data.polygon.vertices || []).map((v: Point2D) =>
        this.transformPoint(v, pos, rot)
      );

      if (vertices.length > 0) {
        endpoints.push(...vertices);

        const polygon = this.geometryEngine.createPolygon(vertices);
        centers.push(this.geometryEngine.polygonCentroid(polygon));

        for (let i = 0; i < vertices.length; i++) {
          const seg = this.geometryEngine.createSegment(
            vertices[i],
            vertices[(i + 1) % vertices.length]
          );
          segments.push(seg);
          midpoints.push(this.geometryEngine.midpointOfLineSegment(seg));
        }
      }
    }

    // Fallback if no shape metadata exists
    if (endpoints.length === 0 && centers.length === 0) {
      endpoints.push(pos);
    }

    return { endpoints, midpoints, centers, segments, circles };
  }

  private transformPoint(pt: Point2D, center: Point2D, rotationAngle: number): Point2D {
    if (rotationAngle !== 0) {
      return this.geometryEngine.rotatePointAround(pt, center, rotationAngle, true);
    }
    return pt;
  }

  private findIntersectionsBetweenGeometries(
    g1: ReturnType<SnapEngine['extractGeometryFromObject']>,
    g2: ReturnType<SnapEngine['extractGeometryFromObject']>
  ): Point2D[] {
    const intersections: Point2D[] = [];

    // Segment vs Segment
    for (const s1 of g1.segments) {
      for (const s2 of g2.segments) {
        const pt = this.geometryEngine.intersectSegmentSegment(s1, s2);
        if (pt) intersections.push(pt);
      }
    }

    // Segment vs Circle
    for (const s of g1.segments) {
      for (const c of g2.circles) {
        const pts = this.geometryEngine.intersectSegmentCircle(s, c);
        intersections.push(...pts);
      }
    }
    for (const s of g2.segments) {
      for (const c of g1.circles) {
        const pts = this.geometryEngine.intersectSegmentCircle(s, c);
        intersections.push(...pts);
      }
    }

    // Circle vs Circle
    for (const c1 of g1.circles) {
      for (const c2 of g2.circles) {
        const circlePts = this.intersectCircleCircle(c1, c2);
        intersections.push(...circlePts);
      }
    }

    return intersections;
  }

  private intersectCircleCircle(c1: Circle, c2: Circle): Point2D[] {
    const d = this.geometryEngine.distancePointToPoint(c1.center, c2.center);
    if (d > c1.radius + c2.radius || d < Math.abs(c1.radius - c2.radius) || d < 1e-9) {
      return [];
    }

    const a = (c1.radius * c1.radius - c2.radius * c2.radius + d * d) / (2 * d);
    const hSq = c1.radius * c1.radius - a * a;
    const h = Math.sqrt(Math.max(0, hSq));

    const p2X = c1.center.x + (a * (c2.center.x - c1.center.x)) / d;
    const p2Y = c1.center.y + (a * (c2.center.y - c1.center.y)) / d;

    if (h < 1e-9) {
      return [this.geometryEngine.createPoint(p2X, p2Y)];
    }

    return [
      this.geometryEngine.createPoint(
        p2X + (h * (c2.center.y - c1.center.y)) / d,
        p2Y - (h * (c2.center.x - c1.center.x)) / d
      ),
      this.geometryEngine.createPoint(
        p2X - (h * (c2.center.y - c1.center.y)) / d,
        p2Y + (h * (c2.center.x - c1.center.x)) / d
      )
    ];
  }
}
