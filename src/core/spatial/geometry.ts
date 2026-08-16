import { Point } from './types';

export const normalizeAngle = (angle: number): number => {
  return ((angle % 360) + 360) % 360;
};

export const pointToAngle = (point: Point, origin: Point): number => {
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return normalizeAngle(angle + 90); // Adjust so 0 is up (North)
};

export const rotatePoint = (point: Point, origin: Point, angleDeg: number): Point => {
  const angleRad = angleDeg * (Math.PI / 180);
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;

  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos
  };
};

export const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const calculateRelativeAngle = (point: Point, origin: Point, compassRotation: number): number => {
  const absoluteAngle = pointToAngle(point, origin);
  return normalizeAngle(absoluteAngle - compassRotation);
};

export const cartesianToPolar = (point: Point, origin: Point): { r: number; theta: number } => {
  return {
    r: distance(point, origin),
    theta: pointToAngle(point, origin)
  };
};

export const polarToCartesian = (r: number, theta: number, origin: Point): Point => {
  const rad = (theta - 90) * (Math.PI / 180); // Adjust back from "0 is up"
  return {
    x: origin.x + r * Math.cos(rad),
    y: origin.y + r * Math.sin(rad)
  };
};

export const isPointInsideSector = (point: Point, origin: Point, startAngle: number, endAngle: number, radius: number): boolean => {
  const d = distance(point, origin);
  if (d > radius) return false;
  
  const angle = pointToAngle(point, origin);
  
  // Handle case where sector crosses 0 degrees
  if (startAngle > endAngle) {
    return angle >= startAngle || angle <= endAngle;
  }
  return angle >= startAngle && angle <= endAngle;
};
