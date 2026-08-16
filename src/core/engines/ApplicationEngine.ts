import { BaseEngine } from '../types/BaseEngine';
import { EventEngine } from '../events/EventEngine';
import { CommandEngine } from '../commands/CommandEngine';
import { ValidationEngine } from '../validation/ValidationEngine';
import { ToolEngine } from '../tools/ToolEngine';
import { MasterChakraEngine } from './MasterChakraEngine';
import { DirectionEngine } from './DirectionEngine';
import { GeometryEngine } from '../geometry/GeometryEngine';
import { ObjectEngine } from './ObjectEngine';
import { SelectionEngine } from './SelectionEngine';
import { TransformEngine } from './TransformEngine';
import { WorkspaceEngine } from '../workspace/WorkspaceEngine';
import { RenderingEngine } from '../rendering/RenderingEngine';
import { Logger } from '../utils/logger';

export class ApplicationEngine implements BaseEngine {
  public readonly name = 'ApplicationEngine';
  private initialized = false;

  // Core system engines
  public readonly events: EventEngine;
  public readonly commands: CommandEngine;
  public readonly validation: ValidationEngine;
  public readonly tools: ToolEngine;
  public readonly masterChakra: MasterChakraEngine;
  public readonly direction: DirectionEngine;
  public readonly geometry: GeometryEngine;
  
  // Sprint 3 engines
  public readonly objects: ObjectEngine;
  public readonly selection: SelectionEngine;
  public readonly transform: TransformEngine;
  
  // Sprint 5 engines (Workspace encompasses Camera, Grid, Canvas, Coordinates, Navigation)
  public readonly workspace: WorkspaceEngine;
  
  // Sprint 4 engines
  public readonly rendering: RenderingEngine;

  constructor() {
    this.events = new EventEngine();
    this.commands = new CommandEngine(this.events);
    this.validation = new ValidationEngine();
    this.tools = new ToolEngine();
    this.masterChakra = new MasterChakraEngine();
    this.direction = new DirectionEngine(this.events);
    this.geometry = new GeometryEngine();
    
    this.objects = new ObjectEngine(this.events);
    this.selection = new SelectionEngine(this.events, this.objects);
    this.transform = new TransformEngine(this.objects, this.commands);
    
    this.workspace = new WorkspaceEngine(this.events, this.objects);
    this.rendering = new RenderingEngine(this.workspace.camera, this.objects, this.selection);
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    
    Logger.info(`[${this.name}] Starting initialization sequence...`);

    try {
      await this.events.initialize();
      await this.commands.initialize();
      await this.validation.initialize();
      await this.tools.initialize();
      await this.masterChakra.initialize();
      await this.direction.initialize();
      await this.geometry.initialize();
      
      await this.objects.initialize();
      await this.selection.initialize();
      await this.transform.initialize();
      
      await this.workspace.initialize();
      await this.rendering.initialize();
      
      const { MasterChakraRenderer } = await import("../rendering/renderers/MasterChakraRenderer");
      this.rendering.registry.registerRenderer(new MasterChakraRenderer());

      this.initialized = true;
      Logger.info(`[${this.name}] System core initialized successfully.`);
      
      this.events.publish({
        type: 'SYSTEM_INITIALIZED',
        timestamp: Date.now(),
        payload: { success: true },
        source: this.name
      });
    } catch (error: any) {
      Logger.error(`[${this.name}] Failed to initialize system core:`, error);
      throw new Error(`ApplicationEngine initialization failed: ${error.message}`);
    }
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;

    Logger.info(`[${this.name}] Starting shutdown sequence...`);
    
    this.events.publish({
      type: 'SYSTEM_SHUTDOWN',
      timestamp: Date.now(),
      payload: {},
      source: this.name
    });

    try {
      await this.rendering.shutdown();
      await this.workspace.shutdown();
      
      await this.transform.shutdown();
      await this.selection.shutdown();
      await this.objects.shutdown();
      
      await this.direction.shutdown();
      await this.geometry.shutdown();
      await this.masterChakra.shutdown();
      await this.tools.shutdown();
      await this.validation.shutdown();
      await this.commands.shutdown();
      await this.events.shutdown();

      this.initialized = false;
      Logger.info(`[${this.name}] System core shutdown complete.`);
    } catch (error: any) {
      Logger.error(`[${this.name}] Error during shutdown sequence:`, error);
      throw error;
    }
  }
}
