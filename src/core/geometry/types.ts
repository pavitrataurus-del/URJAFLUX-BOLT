/**
 * Immutable Primitive Types for GeometryEngine
 * Pure TypeScript - No UI/DOM/React/Canvas dependencies.
 */

export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface Vector2D {
  readonly x: number;
  readonly y: number;
}

export interface LineSegment {
  readonly p1: Point2D;
  readonly p2: Point2D;
}

export interface InfiniteLine {
  readonly p1: Point2D;
  readonly p2: Point2D;
}

export interface Ray {
  readonly origin: Point2D;
  readonly direction: Vector2D; // Normalized vector
}

export interface Circle {
  readonly center: Point2D;
  readonly radius: number;
}

export interface Rectangle {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Triangle {
  readonly a: Point2D;
  readonly b: Point2D;
  readonly c: Point2D;
}

export interface Polygon {
  readonly vertices: readonly Point2D[];
}

export interface BoundingBox {
  readonly min: Point2D;
  readonly max: Point2D;
}
