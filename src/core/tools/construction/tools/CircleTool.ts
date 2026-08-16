import { BaseConstructionTool } from '../BaseConstructionTool';
import { ConstructionToolContext, ConstructionType } from '../types';
import { Point2D } from '../../../geometry/types';
import { USOMBaseObject } from '../../../usom/types';

export class CircleTool extends BaseConstructionTool {
  public readonly id = 'construction-circle';
  public readonly name = 'Construction Circle Tool';
  public readonly constructionType: ConstructionType = 'circle';

  private centerPoint: Point2D | null = null;

  constructor(context: ConstructionToolContext) {
    super(context);
  }

  public resetState(): void {
    this.centerPoint = null;
  }

  public getCenterPoint(): Point2D | null {
    return this.centerPoint;
  }

  public onPointerDown(event: any): void {
    if (!this.isActive) return;
    const x = event.x ?? event.clientX ?? 0;
    const y = event.y ?? event.clientY ?? 0;
    this.handleInput(x, y);
  }

  public onPointerMove(_event: any): void {}

  public onPointerUp(_event: any): void {}

  public async handleInput(x: number, y: number): Promise<USOMBaseObject | null> {
    const pt = this.context.geometry.createPoint(x, y);

    if (!this.centerPoint) {
      this.centerPoint = pt;
      return null;
    }

    const center = this.centerPoint;
    const edge = pt;
    this.centerPoint = null;

    return this.createCircleWithCenterAndEdge(center, edge);
  }

  public async createCircleWithCenterAndEdge(center: Point2D, edgePoint: Point2D): Promise<USOMBaseObject> {
    const radius = this.context.geometry.distancePointToPoint(center, edgePoint);
    const circle = this.context.geometry.createCircle(center, radius);
    const cCenter = this.context.geometry.circleCenter(circle);
    const bbox = this.context.geometry.boundingBoxForCircle(circle);

    return this.createAndDispatchObject(
      'Construction Circle',
      { circle },
      bbox,
      cCenter
    );
  }
}
