import { Point2D, Vector2D } from '../types';

export class VectorUtils {
  public static create(x: number, y: number): Vector2D {
    return Object.freeze({ x, y });
  }

  public static fromPoints(from: Point2D, to: Point2D): Vector2D {
    return Object.freeze({
      x: to.x - from.x,
      y: to.y - from.y
    });
  }

  public static magnitude(v: Vector2D): number {
    return Math.hypot(v.x, v.y);
  }

  public static normalize(v: Vector2D): Vector2D {
    const mag = VectorUtils.magnitude(v);
    if (mag === 0) return Object.freeze({ x: 0, y: 0 });
    return Object.freeze({ x: v.x / mag, y: v.y / mag });
  }

  public static add(v1: Vector2D, v2: Vector2D): Vector2D {
    return Object.freeze({ x: v1.x + v2.x, y: v1.y + v2.y });
  }

  public static subtract(v1: Vector2D, v2: Vector2D): Vector2D {
    return Object.freeze({ x: v1.x - v2.x, y: v1.y - v2.y });
  }

  public static scale(v: Vector2D, scalar: number): Vector2D {
    return Object.freeze({ x: v.x * scalar, y: v.y * scalar });
  }

  public static dot(v1: Vector2D, v2: Vector2D): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  public static cross(v1: Vector2D, v2: Vector2D): number {
    return v1.x * v2.y - v1.y * v2.x;
  }

  public static equals(v1: Vector2D, v2: Vector2D, tolerance: number = 1e-9): boolean {
    return Math.abs(v1.x - v2.x) <= tolerance && Math.abs(v1.y - v2.y) <= tolerance;
  }
}
