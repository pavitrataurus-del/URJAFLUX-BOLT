import { describe, it, expect } from 'vitest';
import {
  angleBetweenVectors,
  signedAngleBetweenVectors,
  polygonArea,
  polygonCentroid,
  rectangleCenter,
  triangleCentroid,
  circleCenter,
  boundingBoxForPoints,
  boundingBoxForPolygon,
  boundingBoxForCircle,
  boundingBoxForSegment
} from '../operations/measurements';
import { VectorUtils, ShapeUtils, CircleUtils, PointUtils, LineUtils } from '../primitives';

describe('Measurement & Centroid Operations', () => {
  it('calculates vector angles', () => {
    const v1 = VectorUtils.create(1, 0);
    const v2 = VectorUtils.create(0, 1);

    expect(angleBetweenVectors(v1, v2, true)).toBeCloseTo(90);
    expect(signedAngleBetweenVectors(v1, v2, true)).toBeCloseTo(90);

    // Negative rotation
    expect(signedAngleBetweenVectors(v2, v1, true)).toBeCloseTo(-90);
  });

  it('calculates polygon area (Shoelace formula)', () => {
    // 10x10 square
    const poly = ShapeUtils.createPolygon([
      PointUtils.create(0, 0),
      PointUtils.create(10, 0),
      PointUtils.create(10, 10),
      PointUtils.create(0, 10)
    ]);

    expect(polygonArea(poly)).toBe(100);
  });

  it('calculates polygon centroid', () => {
    // 10x10 square -> centroid at (5, 5)
    const poly = ShapeUtils.createPolygon([
      PointUtils.create(0, 0),
      PointUtils.create(10, 0),
      PointUtils.create(10, 10),
      PointUtils.create(0, 10)
    ]);

    const centroid = polygonCentroid(poly);
    expect(centroid.x).toBeCloseTo(5);
    expect(centroid.y).toBeCloseTo(5);
  });

  it('calculates rectangle center, triangle centroid, and circle center', () => {
    const rect = ShapeUtils.createRectangle(0, 0, 100, 50);
    expect(rectangleCenter(rect)).toEqual({ x: 50, y: 25 });

    const triangle = ShapeUtils.createTriangle(
      PointUtils.create(0, 0),
      PointUtils.create(6, 0),
      PointUtils.create(0, 6)
    );
    expect(triangleCentroid(triangle)).toEqual({ x: 2, y: 2 });

    const circle = CircleUtils.create(PointUtils.create(15, 25), 10);
    expect(circleCenter(circle)).toEqual({ x: 15, y: 25 });
  });

  it('calculates bounding boxes', () => {
    const pts = [PointUtils.create(0, 5), PointUtils.create(10, -2), PointUtils.create(3, 8)];
    const bboxPts = boundingBoxForPoints(pts);
    expect(bboxPts.min).toEqual({ x: 0, y: -2 });
    expect(bboxPts.max).toEqual({ x: 10, y: 8 });

    const circle = CircleUtils.create(PointUtils.create(10, 10), 5);
    const bboxCircle = boundingBoxForCircle(circle);
    expect(bboxCircle.min).toEqual({ x: 5, y: 5 });
    expect(bboxCircle.max).toEqual({ x: 15, y: 15 });

    const seg = LineUtils.createSegment(PointUtils.create(-5, 10), PointUtils.create(15, -2));
    const bboxSeg = boundingBoxForSegment(seg);
    expect(bboxSeg.min).toEqual({ x: -5, y: -2 });
    expect(bboxSeg.max).toEqual({ x: 15, y: 10 });
  });
});
