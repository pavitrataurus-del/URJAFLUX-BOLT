import { ISpatialPoint, ISpatialGeometry } from "../models/SpatialModels";
import { IOcrBoundingBox } from "../../ocr";

export class GeometryEngine {
  private static instance: GeometryEngine;

  private constructor() {}

  public static getInstance(): GeometryEngine {
    if (!GeometryEngine.instance) {
      GeometryEngine.instance = new GeometryEngine();
    }
    return GeometryEngine.instance;
  }

  public associateGeometry(ocrBox: IOcrBoundingBox): ISpatialGeometry {
    const vertices = ocrBox.vertices;
    if (!vertices || vertices.length < 3) {
       // Return empty geometry if not enough vertices
       return { vertices: [] };
    }

    const minX = Math.min(...vertices.map(v => v.x));
    const maxX = Math.max(...vertices.map(v => v.x));
    const minY = Math.min(...vertices.map(v => v.y));
    const maxY = Math.max(...vertices.map(v => v.y));

    const width = maxX - minX;
    const height = maxY - minY;
    const centroid = { x: minX + width / 2, y: minY + height / 2 };
    const area = width * height;

    return {
      vertices,
      centroid,
      area,
      dimensions: { width, height },
      rotation: 0 // Simplification for MVP
    };
  }

  public calculateDistance(p1: ISpatialPoint, p2: ISpatialPoint): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  public doIntersect(g1: ISpatialGeometry, g2: ISpatialGeometry): boolean {
    if (!g1.dimensions || !g2.dimensions || !g1.vertices || !g2.vertices || g1.vertices.length < 4 || g2.vertices.length < 4) return false;
    
    // Simplistic intersection assuming axis-aligned bounding boxes from vertices[0] to vertices[2]
    const g1MinX = Math.min(...g1.vertices.map(v => v.x));
    const g1MaxX = Math.max(...g1.vertices.map(v => v.x));
    const g1MinY = Math.min(...g1.vertices.map(v => v.y));
    const g1MaxY = Math.max(...g1.vertices.map(v => v.y));

    const g2MinX = Math.min(...g2.vertices.map(v => v.x));
    const g2MaxX = Math.max(...g2.vertices.map(v => v.x));
    const g2MinY = Math.min(...g2.vertices.map(v => v.y));
    const g2MaxY = Math.max(...g2.vertices.map(v => v.y));

    return !(g2MinX > g1MaxX || 
             g2MaxX < g1MinX || 
             g2MinY > g1MaxY ||
             g2MaxY < g1MinY);
  }
}
