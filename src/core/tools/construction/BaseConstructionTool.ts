import { BaseTool } from '../ToolEngine';
import { ConstructionToolContext, ConstructionType } from './types';
import { USOMBaseObject, USOMObjectType } from '../../usom/types';
import { CreateConstructionObjectCommand } from './commands/CreateConstructionObjectCommand';
import { generateId } from '../../utils/id';
import { Point2D, BoundingBox } from '../../geometry/types';

export abstract class BaseConstructionTool implements BaseTool {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly constructionType: ConstructionType;
  public icon?: string;

  protected isActive = false;

  constructor(protected readonly context: ConstructionToolContext) {}

  public activate(): void {
    this.isActive = true;
    this.resetState();
  }

  public deactivate(): void {
    this.isActive = false;
    this.resetState();
  }

  public abstract onPointerDown(event: any): void;
  public abstract onPointerMove(event: any): void;
  public abstract onPointerUp(event: any): void;
  public abstract resetState(): void;

  /**
   * Helper to dispatch command-based object creation without direct object mutation.
   */
  protected async createAndDispatchObject(
    name: string,
    data: Record<string, any>,
    bbox: BoundingBox,
    position: Point2D
  ): Promise<USOMBaseObject> {
    const object: USOMBaseObject = {
      id: generateId(),
      type: USOMObjectType.CONSTRUCTION_ELEMENT,
      name,
      transform: {
        position: { x: position.x, y: position.y },
        rotation: 0,
        scale: { x: 1, y: 1 }
      },
      metadata: {
        constructionType: this.constructionType,
        data,
        boundingBox: {
          x: bbox.min.x,
          y: bbox.min.y,
          width: bbox.max.x - bbox.min.x,
          height: bbox.max.y - bbox.min.y
        }
      },
      isVisible: true,
      isLocked: false,
      isSelected: false,
      zIndex: 100
    };

    const command = new CreateConstructionObjectCommand(object);
    await this.context.commands.execute(command, this.context.objects);
    return object;
  }
}
