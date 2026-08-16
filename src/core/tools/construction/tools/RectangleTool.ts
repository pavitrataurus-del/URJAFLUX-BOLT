import { BaseConstructionTool } from '../BaseConstructionTool';
import { ConstructionToolContext, ConstructionType } from '../types';
import { Point2D } from '../../../geometry/types';
import { USOMBaseObject } from '../../../usom/types';

export class RectangleTool extends BaseConstructionTool {
  public readonly id = 'construction-rectangle';
  public readonly name = 'Construction Rectangle Tool';
  public readonly constructionType: ConstructionType = 'rectangle';

  private corner1: Point2D | null = null;

  constructor(context: ConstructionToolContext) {
    super(context);
  }

  public resetState(): void {
    this.corner1 = null;
  }

  public getFirstCorner(): Point2D | null {
    return this.corner1;
  }

  public onPointerDown(event: any): void {
    if (!this.isActive) return;
    const x = event.x ?? event.clientX ?? 0;
    const y = event.y ?? event.clientY ?? 0;
    this.handleCornerInput(x, y);
  }

  public onPointerMove(_event: any): void {}

  public onPointerUp(_event: any): void {}

  public async handleCornerInput(x: number, y: number): Promise<USOMBaseObject | null> {
    const pt = this.context.geometry.createPoint(x, y);

    if (!this.corner1) {
      this.corner1 = pt;
      return null;
    }

    const c1 = this.corner1;
    const c2 = pt;
    this.corner1 = null;

    return this.createRectangleFromCorners(c1, c2);
  }

  public async createRectangleFromCorners(c1: Point2D, c2: Point2D): Promise<USOMBaseObject> {
    const bbox = this.context.geometry.boundingBoxForPoints([c1, c2]);
    const width = bbox.max.x - bbox.min.x;
    const height = bbox.max.y - bbox.min.y;

    const rect = this.context.geometry.createRectangle(bbox.min.x, bbox.min.y, width, height);
    const center = this.context.geometry.rectangleCenter(rect);

    return this.createAndDispatchObject(
      'Construction Rectangle',
      { rectangle: rect },
      bbox,
      center
    );
  }
}
