import { BaseConstructionTool } from '../BaseConstructionTool';
import { ConstructionToolContext, ConstructionType } from '../types';
import { USOMBaseObject } from '../../../usom/types';

export class PointTool extends BaseConstructionTool {
  public readonly id = 'construction-point';
  public readonly name = 'Construction Point Tool';
  public readonly constructionType: ConstructionType = 'point';

  constructor(context: ConstructionToolContext) {
    super(context);
  }

  public resetState(): void {
    // Single-click tool, no multi-step state required
  }

  public onPointerDown(event: any): void {
    if (!this.isActive) return;
    const x = event.x ?? event.clientX ?? 0;
    const y = event.y ?? event.clientY ?? 0;
    this.createPointAt(x, y);
  }

  public onPointerMove(_event: any): void {
    // No-op for point tool
  }

  public onPointerUp(_event: any): void {
    // Point created on pointer down
  }

  public async createPointAt(x: number, y: number): Promise<USOMBaseObject> {
    const point = this.context.geometry.createPoint(x, y);
    const bbox = this.context.geometry.boundingBoxForPoints([point]);
    return this.createAndDispatchObject('Construction Point', { point }, bbox, point);
  }
}
