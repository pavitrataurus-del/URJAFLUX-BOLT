import { Point2D, Polygon2D } from '../spatial/math';
import { BoundingBox } from '../usom/types';

/**
 * Common style interface for rendering operations.
 */
export interface RenderStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  textBaseline?: 'top' | 'middle' | 'bottom';
  dash?: number[];
}

/**
 * RenderingBackend
 * 
 * Abstract interface for low-level drawing operations.
 * The RenderingEngine communicates exclusively through this interface,
 * remaining completely unaware of the underlying rendering technology 
 * (e.g., SVG, HTML5 Canvas 2D, WebGL, Konva).
 */
export interface RenderingBackend {
  /** Initialize the backend (e.g., set up canvas context or SVG DOM) */
  initialize(container?: any): Promise<void>;
  
  /** Clear the entire rendering surface */
  clear(): void;
  
  /** Draw a line between two points */
  drawLine(p1: Point2D, p2: Point2D, style: RenderStyle): void;
  
  /** Draw a circle */
  drawCircle(center: Point2D, radius: number, style: RenderStyle): void;

  /** Draw a rectangle */
  drawRect(bounds: BoundingBox, style: RenderStyle): void;
  
  /** Draw a polygon */
  drawPolygon(polygon: Polygon2D, style: RenderStyle): void;
  
  /** Draw text */
  drawText(text: string, position: Point2D, style: RenderStyle): void;
  
  /** Draw an image */
  drawImage(imageSource: any, bounds: BoundingBox, style?: RenderStyle): void;
  
  /** Save current transformation state */
  save(): void;
  
  /** Restore previously saved transformation state */
  restore(): void;
  
  /** Apply translation transform */
  translate(x: number, y: number): void;
  
  /** Apply rotation transform (in degrees) */
  rotate(angleDegrees: number): void;
  
  /** Apply scaling transform */
  scale(x: number, y: number): void;
  
  /** Clean up resources */
  dispose(): void;
}
