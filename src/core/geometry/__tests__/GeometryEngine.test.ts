import { describe, it, expect, beforeEach } from 'vitest';
import { GeometryEngine } from '../GeometryEngine';

describe('GeometryEngine Integration', () => {
  let engine: GeometryEngine;

  beforeEach(async () => {
    engine = new GeometryEngine();
    await engine.initialize();
  });

  it('initializes and shuts down cleanly', async () => {
    expect(engine.name).toBe('GeometryEngine');
    await engine.shutdown();
  });

  it('creates primitives via engine facade', () => {
    const p1 = engine.createPoint(0, 0);
    const p2 = engine.createPoint(10, 10);
    const seg = engine.createSegment(p1, p2);
    const circle = engine.createCircle(p1, 5);

    expect(seg.p1).toEqual(p1);
    expect(circle.radius).toBe(5);
  });

  it('performs distance calculations via engine facade', () => {
    const p1 = engine.createPoint(0, 0);
    const p2 = engine.createPoint(3, 4);
    expect(engine.distancePointToPoint(p1, p2)).toBe(5);
  });

  it('performs intersection calculations via engine facade', () => {
    const s1 = engine.createSegment(engine.createPoint(0, 0), engine.createPoint(10, 10));
    const s2 = engine.createSegment(engine.createPoint(0, 10), engine.createPoint(10, 0));

    const inter = engine.intersectSegmentSegment(s1, s2);
    expect(inter).not.toBeNull();
    expect(inter!.x).toBeCloseTo(5);
    expect(inter!.y).toBeCloseTo(5);
  });

  it('performs rotation and polygon measurements via engine facade', () => {
    const poly = engine.createPolygon([
      engine.createPoint(0, 0),
      engine.createPoint(10, 0),
      engine.createPoint(10, 10),
      engine.createPoint(0, 10)
    ]);

    expect(engine.polygonArea(poly)).toBe(100);
    expect(engine.polygonCentroid(poly)).toEqual({ x: 5, y: 5 });

    const rotated = engine.rotatePolygonAround(poly, engine.createPoint(0, 0), 90);
    expect(rotated.vertices.length).toBe(4);
    expect(rotated.vertices[0].x).toBeCloseTo(0);
  });
});
