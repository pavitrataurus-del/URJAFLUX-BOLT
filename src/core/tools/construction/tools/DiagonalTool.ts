import { BaseConstructionTool } from '../BaseConstructionTool';
import { ConstructionToolContext, ConstructionType } from '../types';
import { Point2D } from '../../../geometry/types';
import { USOMBaseObject } from '../../../usom/types';

export class DiagonalTool extends BaseConstructionTool {
  public readonly id = 'construction-diagonal';
  public readonly name = 'Construction Diagonal Tool';
  public readonly constructionType: ConstructionType = 'diagonal';

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
    this.handleCornerSelection(x, y);
  }

  public onPointerMove(_event: any): void {}

  public onPointerUp(_event: any): void {}

  public async handleCornerSelection(x: number, y: number): Promise<USOMBaseObject | null> {
    const pt = this.context.geometry.createPoint(x, y);

    if (!this.corner1) {
      this.corner1 = pt;
      return null;
    }

    const c1 = this.corner1;
    const c2 = pt;
    this.corner1 = null;

    return this.createDiagonalBetweenCorners(c1, c2);
  }

  public async createDiagonalBetweenCorners(c1: Point2D, c2: Point2D): Promise<USOMBaseObject> {
    const segment = this.context.geometry.createSegment(c1, c2);
    const midpoint = this.context.geometry.midpointBetweenPoints(c1, c2);
    const bbox = this.context.geometry.boundingBoxForSegment(segment);
    const length = this.context.geometry.distancePointToPoint(c1, c2);

    const vec = this.context.geometry.createVector(c2.x - c1.x, c2.y - c1.y);
    const ref = this.context.geometry.createVector(1, 0);
    const angle = this.context.geometry.signedAngleBetweenVectors(ref, vec, true);

    return this.createAndDispatchObject(
      'Construction Diagonal',
      { segment, length, angle },
      bbox,
      midpoint
    );
  }
}
