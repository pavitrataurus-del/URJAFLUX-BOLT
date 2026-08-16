import { BaseConstructionTool } from '../BaseConstructionTool';
import { ConstructionToolContext, ConstructionType } from '../types';
import { Point2D } from '../../../geometry/types';
import { USOMBaseObject } from '../../../usom/types';

export class LineTool extends BaseConstructionTool {
  public readonly id = 'construction-line';
  public readonly name = 'Construction Line Tool';
  public readonly constructionType: ConstructionType = 'line';

  private startPoint: Point2D | null = null;

  constructor(context: ConstructionToolContext) {
    super(context);
  }

  public resetState(): void {
    this.startPoint = null;
  }

  public getStartPoint(): Point2D | null {
    return this.startPoint;
  }

  public onPointerDown(event: any): void {
    if (!this.isActive) return;
    const x = event.x ?? event.clientX ?? 0;
    const y = event.y ?? event.clientY ?? 0;
    this.handlePointInput(x, y);
  }

  public onPointerMove(_event: any): void {
    // Preview trajectory can be handled by renderer/listeners if needed
  }

  public onPointerUp(_event: any): void {
    // Selection step handled on pointer down or explicit calls
  }

  public async handlePointInput(x: number, y: number): Promise<USOMBaseObject | null> {
    const pt = this.context.geometry.createPoint(x, y);

    if (!this.startPoint) {
      this.startPoint = pt;
      return null;
    }

    const p1 = this.startPoint;
    const p2 = pt;
    this.startPoint = null; // Reset for next line

    return this.createLineBetween(p1, p2);
  }

  public async createLineBetween(p1: Point2D, p2: Point2D): Promise<USOMBaseObject> {
    const segment = this.context.geometry.createSegment(p1, p2);
    const midpoint = this.context.geometry.midpointOfLineSegment(segment);
    const bbox = this.context.geometry.boundingBoxForSegment(segment);
    const length = this.context.geometry.distancePointToPoint(p1, p2);

    return this.createAndDispatchObject(
      'Construction Line',
      { segment, length },
      bbox,
      midpoint
    );
  }
}
