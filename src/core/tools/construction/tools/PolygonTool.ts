import { BaseConstructionTool } from '../BaseConstructionTool';
import { ConstructionToolContext, ConstructionType } from '../types';
import { Point2D } from '../../../geometry/types';
import { USOMBaseObject } from '../../../usom/types';

export class PolygonTool extends BaseConstructionTool {
  public readonly id = 'construction-polygon';
  public readonly name = 'Construction Polygon Tool';
  public readonly constructionType: ConstructionType = 'polygon';

  private vertices: Point2D[] = [];
  private snapTolerance = 2; // Pixel distance threshold to snap-close to initial vertex

  constructor(context: ConstructionToolContext) {
    super(context);
  }

  public resetState(): void {
    this.vertices = [];
  }

  public getVertices(): readonly Point2D[] {
    return this.vertices;
  }

  public onPointerDown(event: any): void {
    if (!this.isActive) return;
    const x = event.x ?? event.clientX ?? 0;
    const y = event.y ?? event.clientY ?? 0;
    this.addVertexAt(x, y);
  }

  public onPointerMove(_event: any): void {}

  public onPointerUp(_event: any): void {}

  public async addVertexAt(x: number, y: number): Promise<USOMBaseObject | null> {
    const pt = this.context.geometry.createPoint(x, y);

    if (this.vertices.length >= 3) {
      const first = this.vertices[0];
      const dist = this.context.geometry.distancePointToPoint(first, pt);
      if (dist <= this.snapTolerance) {
        return this.finishPolygon();
      }
    }

    this.vertices.push(pt);
    return null;
  }

  public async finishPolygon(): Promise<USOMBaseObject | null> {
    if (this.vertices.length < 3) {
      return null; // A polygon requires at least 3 vertices
    }

    const polyVertices = [...this.vertices];
    this.vertices = []; // Reset state

    const polygon = this.context.geometry.createPolygon(polyVertices);
    const centroid = this.context.geometry.polygonCentroid(polygon);
    const area = this.context.geometry.polygonArea(polygon);
    const bbox = this.context.geometry.boundingBoxForPolygon(polygon);

    return this.createAndDispatchObject(
      'Construction Polygon',
      { polygon, area },
      bbox,
      centroid
    );
  }
}
