import { describe, it, expect } from 'vitest';
import {
  rotatePointAround,
  rotateVector,
  translatePoint,
  scalePointAround,
  rotatePolygonAround
} from '../operations/transformations';
import { PointUtils, VectorUtils, ShapeUtils } from '../primitives';

describe('Transformation Operations', () => {
  it('rotates point around center', () => {
    const point = PointUtils.create(10, 0);
    const center = PointUtils.create(0, 0);

    const rotated = rotatePointAround(point, center, 90, true);
    expect(rotated.x).toBeCloseTo(0);
    expect(rotated.y).toBeCloseTo(10);
  });

  it('rotates vector', () => {
    const v = VectorUtils.create(1, 0);
    const rotated = rotateVector(v, 90, true);
    expect(rotated.x).toBeCloseTo(0);
    expect(rotated.y).toBeCloseTo(1);
  });

  it('translates point', () => {
    const p = PointUtils.create(10, 20);
    const v = VectorUtils.create(5, -5);
    const translated = translatePoint(p, v);

    expect(translated.x).toBe(15);
    expect(translated.y).toBe(15);
  });

  it('scales point around center', () => {
    const p = PointUtils.create(10, 10);
    const center = PointUtils.create(0, 0);

    const scaled = scalePointAround(p, center, 2, 0.5);
    expect(scaled.x).toBe(20);
    expect(scaled.y).toBe(5);
  });

  it('rotates polygon around center', () => {
    const poly = ShapeUtils.createPolygon([
      PointUtils.create(10, 0),
      PointUtils.create(10, 10),
      PointUtils.create(0, 10)
    ]);
    const center = PointUtils.create(0, 0);

    const rotated = rotatePolygonAround(poly, center, 90, true);
    expect(rotated.vertices[0].x).toBeCloseTo(0);
    expect(rotated.vertices[0].y).toBeCloseTo(10);
  });
});
