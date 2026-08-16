import { BaseEngine } from '../types/BaseEngine';
import {
  Point2D,
  Vector2D,
  LineSegment,
  InfiniteLine,
  Ray,
  Circle,
  Rectangle,
  Triangle,
  Polygon,
  BoundingBox
} from './types';
import { PointUtils, VectorUtils, LineUtils, CircleUtils, ShapeUtils } from './primitives';
import * as DistanceOps from './operations/distance';
import * as MidpointOps from './operations/midpoint';
import * as IntersectionOps from './operations/intersections';
import * as ProjectionOps from './operations/projections';
import * as TransformOps from './operations/transformations';
import * as MeasureOps from './operations/measurements';
import { Logger } from '../utils/logger';

/**
 * GeometryEngine - The authoritative mathematical single source of truth for URJAFLUX AI OS.
 * Completely independent of React, rendering, Vastu domain logic, and UI.
 * Pure TypeScript & Immutable.
 */
export class GeometryEngine implements BaseEngine {
  public readonly name = 'GeometryEngine';
  private initialized = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    Logger.info(`[${this.name}] Initialized as mathematical authority.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    this.initialized = false;
    Logger.info(`[${this.name}] Shutdown.`);
  }

  // --- PRIMITIVE CREATORS ---

  public createPoint(x: number, y: number): Point2D {
    return PointUtils.create(x, y);
  }

  public createVector(x: number, y: number): Vector2D {
    return VectorUtils.create(x, y);
  }

  public createSegment(p1: Point2D, p2: Point2D): LineSegment {
    return LineUtils.createSegment(p1, p2);
  }

  public createInfiniteLine(p1: Point2D, p2: Point2D): InfiniteLine {
    return LineUtils.createInfiniteLine(p1, p2);
  }

  public createRay(origin: Point2D, direction: Vector2D): Ray {
    return LineUtils.createRay(origin, direction);
  }

  public createCircle(center: Point2D, radius: number): Circle {
    return CircleUtils.create(center, radius);
  }

  public createRectangle(x: number, y: number, width: number, height: number): Rectangle {
    return ShapeUtils.createRectangle(x, y, width, height);
  }

  public createTriangle(a: Point2D, b: Point2D, c: Point2D): Triangle {
    return ShapeUtils.createTriangle(a, b, c);
  }

  public createPolygon(vertices: Point2D[]): Polygon {
    return ShapeUtils.createPolygon(vertices);
  }

  public createBoundingBox(min: Point2D, max: Point2D): BoundingBox {
    return ShapeUtils.createBoundingBox(min, max);
  }

  // --- DISTANCE OPERATIONS ---

  public distancePointToPoint(p1: Point2D, p2: Point2D): number {
    return DistanceOps.distancePointToPoint(p1, p2);
  }

  public distancePointToInfiniteLine(point: Point2D, line: InfiniteLine): number {
    return DistanceOps.distancePointToInfiniteLine(point, line);
  }

  public distancePointToLineSegment(point: Point2D, segment: LineSegment): number {
    return DistanceOps.distancePointToLineSegment(point, segment);
  }

  public distancePointToRay(point: Point2D, ray: Ray): number {
    return DistanceOps.distancePointToRay(point, ray);
  }

  // --- MIDPOINT OPERATIONS ---

  public midpointBetweenPoints(p1: Point2D, p2: Point2D): Point2D {
    return MidpointOps.midpointBetweenPoints(p1, p2);
  }

  public midpointOfLineSegment(segment: LineSegment): Point2D {
    return MidpointOps.midpointOfLineSegment(segment);
  }

  public midpointOfPoints(points: readonly Point2D[]): Point2D {
    return MidpointOps.midpointOfPoints(points);
  }

  // --- INTERSECTION OPERATIONS ---

  public intersectLineLine(line1: InfiniteLine, line2: InfiniteLine): Point2D | null {
    return IntersectionOps.intersectLineLine(line1, line2);
  }

  public intersectSegmentSegment(seg1: LineSegment, seg2: LineSegment): Point2D | null {
    return IntersectionOps.intersectSegmentSegment(seg1, seg2);
  }

  public intersectRayRay(ray1: Ray, ray2: Ray): Point2D | null {
    return IntersectionOps.intersectRayRay(ray1, ray2);
  }

  public intersectRaySegment(ray: Ray, segment: LineSegment): Point2D | null {
    return IntersectionOps.intersectRaySegment(ray, segment);
  }

  public intersectLineCircle(line: InfiniteLine, circle: Circle): Point2D[] {
    return IntersectionOps.intersectLineCircle(line, circle);
  }

  public intersectSegmentCircle(segment: LineSegment, circle: Circle): Point2D[] {
    return IntersectionOps.intersectSegmentCircle(segment, circle);
  }

  public intersectRayCircle(ray: Ray, circle: Circle): Point2D[] {
    return IntersectionOps.intersectRayCircle(ray, circle);
  }

  // --- PROJECTION OPERATIONS ---

  public projectPointOntoInfiniteLine(point: Point2D, line: InfiniteLine): Point2D {
    return ProjectionOps.projectPointOntoInfiniteLine(point, line);
  }

  public projectPointOntoLineSegment(point: Point2D, segment: LineSegment): Point2D {
    return ProjectionOps.projectPointOntoLineSegment(point, segment);
  }

  public projectPointOntoRay(point: Point2D, ray: Ray): Point2D {
    return ProjectionOps.projectPointOntoRay(point, ray);
  }

  public projectVectorOntoVector(v: Vector2D, onto: Vector2D): Vector2D {
    return ProjectionOps.projectVectorOntoVector(v, onto);
  }

  // --- TRANSFORMATION OPERATIONS ---

  public rotatePointAround(point: Point2D, center: Point2D, angle: number, isDegrees = true): Point2D {
    return TransformOps.rotatePointAround(point, center, angle, isDegrees);
  }

  public rotateVector(v: Vector2D, angle: number, isDegrees = true): Vector2D {
    return TransformOps.rotateVector(v, angle, isDegrees);
  }

  public translatePoint(point: Point2D, translation: Vector2D): Point2D {
    return TransformOps.translatePoint(point, translation);
  }

  public scalePointAround(point: Point2D, center: Point2D, scaleX: number, scaleY = scaleX): Point2D {
    return TransformOps.scalePointAround(point, center, scaleX, scaleY);
  }

  public rotatePolygonAround(polygon: Polygon, center: Point2D, angle: number, isDegrees = true): Polygon {
    return TransformOps.rotatePolygonAround(polygon, center, angle, isDegrees);
  }

  // --- MEASUREMENT & CENTROID OPERATIONS ---

  public angleBetweenVectors(v1: Vector2D, v2: Vector2D, inDegrees = true): number {
    return MeasureOps.angleBetweenVectors(v1, v2, inDegrees);
  }

  public signedAngleBetweenVectors(v1: Vector2D, v2: Vector2D, inDegrees = true): number {
    return MeasureOps.signedAngleBetweenVectors(v1, v2, inDegrees);
  }

  public polygonArea(polygon: Polygon): number {
    return MeasureOps.polygonArea(polygon);
  }

  public polygonCentroid(polygon: Polygon): Point2D {
    return MeasureOps.polygonCentroid(polygon);
  }

  public rectangleCenter(rect: Rectangle): Point2D {
    return MeasureOps.rectangleCenter(rect);
  }

  public triangleCentroid(triangle: Triangle): Point2D {
    return MeasureOps.triangleCentroid(triangle);
  }

  public circleCenter(circle: Circle): Point2D {
    return MeasureOps.circleCenter(circle);
  }

  public boundingBoxForPoints(points: readonly Point2D[]): BoundingBox {
    return MeasureOps.boundingBoxForPoints(points);
  }

  public boundingBoxForPolygon(polygon: Polygon): BoundingBox {
    return MeasureOps.boundingBoxForPolygon(polygon);
  }

  public boundingBoxForTriangle(triangle: Triangle): BoundingBox {
    return MeasureOps.boundingBoxForTriangle(triangle);
  }

  public boundingBoxForCircle(circle: Circle): BoundingBox {
    return MeasureOps.boundingBoxForCircle(circle);
  }

  public boundingBoxForSegment(segment: LineSegment): BoundingBox {
    return MeasureOps.boundingBoxForSegment(segment);
  }
}
