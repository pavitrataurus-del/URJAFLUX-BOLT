import { GeometryEngine } from '../../geometry/GeometryEngine';
import { ObjectEngine } from '../../engines/ObjectEngine';
import { CommandEngine } from '../../commands/CommandEngine';
import { ToolEngine } from '../ToolEngine';
import { ConstructionToolContext } from './types';
import { PointTool } from './tools/PointTool';
import { LineTool } from './tools/LineTool';
import { RectangleTool } from './tools/RectangleTool';
import { CircleTool } from './tools/CircleTool';
import { PolygonTool } from './tools/PolygonTool';
import { DiagonalTool } from './tools/DiagonalTool';

export class ConstructionToolManager {
  public readonly pointTool: PointTool;
  public readonly lineTool: LineTool;
  public readonly rectangleTool: RectangleTool;
  public readonly circleTool: CircleTool;
  public readonly polygonTool: PolygonTool;
  public readonly diagonalTool: DiagonalTool;

  constructor(
    private readonly geometry: GeometryEngine,
    private readonly objects: ObjectEngine,
    private readonly commands: CommandEngine
  ) {
    const context: ConstructionToolContext = {
      geometry: this.geometry,
      objects: this.objects,
      commands: this.commands
    };

    this.pointTool = new PointTool(context);
    this.lineTool = new LineTool(context);
    this.rectangleTool = new RectangleTool(context);
    this.circleTool = new CircleTool(context);
    this.polygonTool = new PolygonTool(context);
    this.diagonalTool = new DiagonalTool(context);
  }

  /**
   * Registers all 6 construction tools into the provided ToolEngine instance.
   */
  public registerWithToolEngine(toolEngine: ToolEngine): void {
    toolEngine.registerTool(this.pointTool);
    toolEngine.registerTool(this.lineTool);
    toolEngine.registerTool(this.rectangleTool);
    toolEngine.registerTool(this.circleTool);
    toolEngine.registerTool(this.polygonTool);
    toolEngine.registerTool(this.diagonalTool);
  }

  /**
   * Unregisters all 6 construction tools from the provided ToolEngine instance.
   */
  public unregisterFromToolEngine(toolEngine: ToolEngine): void {
    toolEngine.unregisterTool(this.pointTool.id);
    toolEngine.unregisterTool(this.lineTool.id);
    toolEngine.unregisterTool(this.rectangleTool.id);
    toolEngine.unregisterTool(this.circleTool.id);
    toolEngine.unregisterTool(this.polygonTool.id);
    toolEngine.unregisterTool(this.diagonalTool.id);
  }
}
