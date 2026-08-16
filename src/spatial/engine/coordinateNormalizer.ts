import { Point2D } from "../../types/aiVision";

/**
 * Calculates a 2x2 rotation matrix for a given angle in degrees.
 * Used to rotate coordinate systems such that North points straight up (0 degrees).
 */
export function getRotationMatrix(angleDegrees: number): [
  [number, number],
  [number, number]
] {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(angleRadians);
  const sin = Math.sin(angleRadians);
  
  // Matrix is [[cos, -sin], [sin, cos]]
  return [
    [cos, -sin],
    [sin, cos]
  ];
}

/**
 * Rotates a 2D point using a 2x2 rotation matrix
 */
export function rotatePoint(
  p: Point2D, 
  matrix: [[number, number], [number, number]],
  center: Point2D = { x: 0, y: 0 }
): Point2D {
  // Translate point to rotation origin
  const tx = p.x - center.x;
  const ty = p.y - center.y;
  
  // Apply rotation
  const rx = matrix[0][0] * tx + matrix[0][1] * ty;
  const ry = matrix[1][0] * tx + matrix[1][1] * ty;
  
  // Translate back
  return {
    x: rx + center.x,
    y: ry + center.y
  };
}

/**
 * Normalizes pixel coordinates to meters based on the scale ratio
 */
export function pixelToMeter(px: number, pixelToMeterRatio: number): number {
  return px * pixelToMeterRatio;
}

/**
 * Normalizes a list of polygon vertices
 */
export function normalizePolygon(
  polygon: Point2D[], 
  scaleRatio: number
): Point2D[] {
  return polygon.map((pt) => ({
    x: pt.x * scaleRatio,
    y: pt.y * scaleRatio
  }));
}

/**
 * Converts a compass angle (degrees clockwise from vertical up) into a normalized 2D direction vector
 */
export function getNorthVector(angleDegrees: number): Point2D {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  return {
    x: Math.sin(angleRadians),
    y: -Math.cos(angleRadians) // -y is up in standard 2D canvas coordinates
  };
}
