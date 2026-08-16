import { Point2D, Rectangle, Triangle, Polygon, BoundingBox } from '../types';

export class ShapeUtils {
  public static createRectangle(x: number, y: number, width: number, height: number): Rectangle {
    return Object.freeze({ x, y, width, height });
  }

  public static createTriangle(a: Point2D, b: Point2D, c: Point2D): Triangle {
    return Object.freeze({ a, b, c });
  }

  public static createPolygon(vertices: Point2D[]): Polygon {
    if (vertices.length < 3) {
      throw new Error('A polygon must have at least 3 vertices');
    }
    return Object.freeze({ vertices: Object.freeze([...vertices]) });
  }

  public static createBoundingBox(min: Point2D, max: Point2D): BoundingBox {
    return Object.freeze({ min, max });
  }
}
