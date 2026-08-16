import { describe, it, expect } from 'vitest';
import { SpatialReferenceMatrix } from '../SpatialReferenceMatrix';
import { Point2D } from '../math';

describe('SpatialReferenceMatrix', () => {
  it('initializes with default values', () => {
    const matrix = new SpatialReferenceMatrix();
    expect(matrix.getOrigin()).toEqual({ x: 0, y: 0 });
    expect(matrix.getRotationOffset()).toBe(0);
  });

  it('translates local to global point without rotation', () => {
    const matrix = new SpatialReferenceMatrix({ x: 10, y: 10 }, 0);
    const localPoint = { x: 5, y: 5 };
    const globalPoint = matrix.localToGlobalPoint(localPoint);
    
    expect(globalPoint.x).toBeCloseTo(15);
    expect(globalPoint.y).toBeCloseTo(15);
  });

  it('translates local to global point with 90 degree rotation', () => {
    const matrix = new SpatialReferenceMatrix({ x: 0, y: 0 }, 90);
    const localPoint = { x: 10, y: 0 };
    const globalPoint = matrix.localToGlobalPoint(localPoint);
    
    // Rotating (10,0) by 90 degrees CCW gives (0, 10)
    expect(globalPoint.x).toBeCloseTo(0);
    expect(globalPoint.y).toBeCloseTo(10);
  });

  it('translates global to local point with rotation and translation', () => {
    const matrix = new SpatialReferenceMatrix({ x: 5, y: 5 }, 90);
    const globalPoint = { x: 5, y: 15 }; // Origin + (0, 10)
    const localPoint = matrix.globalToLocalPoint(globalPoint);
    
    // Reverse rotation of (0, 10) by 90 degrees gives (10, 0)
    expect(localPoint.x).toBeCloseTo(10);
    expect(localPoint.y).toBeCloseTo(0);
  });

  it('converts global to local angle', () => {
    const matrix = new SpatialReferenceMatrix({ x: 0, y: 0 }, 45);
    expect(matrix.globalToLocalAngle(90)).toBe(45);
    expect(matrix.globalToLocalAngle(0)).toBe(315);
  });

  it('converts local to global angle', () => {
    const matrix = new SpatialReferenceMatrix({ x: 0, y: 0 }, 45);
    expect(matrix.localToGlobalAngle(45)).toBe(90);
    expect(matrix.localToGlobalAngle(315)).toBe(0);
  });
});
