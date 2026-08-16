import { describe, it, expect } from 'vitest';
import { PointUtils, VectorUtils, LineUtils, CircleUtils, ShapeUtils } from '../primitives';

describe('Geometry Primitives', () => {
  it('creates immutable points and checks equality', () => {
    const p1 = PointUtils.create(10, 20);
    const p2 = PointUtils.create(10, 20);
    const p3 = PointUtils.create(10.00001, 20);

    expect(p1.x).toBe(10);
    expect(p1.y).toBe(20);
    expect(PointUtils.equals(p1, p2)).toBe(true);
    expect(PointUtils.equals(p1, p3)).toBe(false);
    expect(PointUtils.equals(p1, p3, 1e-4)).toBe(true);

    // Object freezing check
    expect(() => {
      (p1 as any).x = 30;
    }).toThrow();
  });

  it('handles vector mathematics', () => {
    const v1 = VectorUtils.create(3, 4);
    expect(VectorUtils.magnitude(v1)).toBe(5);

    const norm = VectorUtils.normalize(v1);
    expect(norm.x).toBeCloseTo(0.6);
    expect(norm.y).toBeCloseTo(0.8);

    const v2 = VectorUtils.create(1, 2);
    const sum = VectorUtils.add(v1, v2);
    expect(sum.x).toBe(4);
    expect(sum.y).toBe(6);

    const dot = VectorUtils.dot(v1, v2); // 3*1 + 4*2 = 11
    expect(dot).toBe(11);

    const cross = VectorUtils.cross(v1, v2); // 3*2 - 4*1 = 2
    expect(cross).toBe(2);
  });

  it('creates lines, segments, and rays', () => {
    const p1 = PointUtils.create(0, 0);
    const p2 = PointUtils.create(10, 0);

    const seg = LineUtils.createSegment(p1, p2);
    expect(LineUtils.segmentLength(seg)).toBe(10);

    const ray = LineUtils.rayFromTwoPoints(p1, p2);
    expect(ray.origin).toEqual(p1);
    expect(ray.direction.x).toBe(1);
    expect(ray.direction.y).toBe(0);
  });

  it('creates circles and validates radius', () => {
    const center = PointUtils.create(5, 5);
    const circle = CircleUtils.create(center, 10);

    expect(CircleUtils.area(circle)).toBeCloseTo(Math.PI * 100);
    expect(CircleUtils.circumference(circle)).toBeCloseTo(2 * Math.PI * 10);

    expect(() => CircleUtils.create(center, -5)).toThrow('Circle radius cannot be negative');
  });

  it('creates polygons and shapes', () => {
    const rect = ShapeUtils.createRectangle(0, 0, 100, 50);
    expect(rect.width).toBe(100);

    const triangle = ShapeUtils.createTriangle(
      PointUtils.create(0, 0),
      PointUtils.create(10, 0),
      PointUtils.create(5, 10)
    );
    expect(triangle.a.x).toBe(0);

    const poly = ShapeUtils.createPolygon([
      PointUtils.create(0, 0),
      PointUtils.create(10, 0),
      PointUtils.create(5, 10)
    ]);
    expect(poly.vertices.length).toBe(3);

    expect(() => ShapeUtils.createPolygon([PointUtils.create(0, 0), PointUtils.create(1, 1)])).toThrow(
      'A polygon must have at least 3 vertices'
    );
  });
});
