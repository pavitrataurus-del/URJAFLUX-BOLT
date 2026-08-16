import { BaseEngine } from '../types/BaseEngine';
import { EventEngine } from '../events/EventEngine';
import { CameraEngine } from './CameraEngine';
import { InfiniteCanvasEngine } from './InfiniteCanvasEngine';
import { GridEngine } from './GridEngine';
import { CoordinateController } from './CoordinateController';
import { NavigationController } from './NavigationController';
import { ObjectEngine } from '../engines/ObjectEngine';
import { Logger } from '../utils/logger';

export class WorkspaceEngine implements BaseEngine {
  public readonly name = 'WorkspaceEngine';
  private initialized = false;

  public readonly camera: CameraEngine;
  public readonly canvas: InfiniteCanvasEngine;
  public readonly grid: GridEngine;
  public readonly coords: CoordinateController;
  public readonly navigation: NavigationController;

  constructor(
    private events: EventEngine,
    private objects: ObjectEngine
  ) {
    this.camera = new CameraEngine(this.events);
    this.canvas = new InfiniteCanvasEngine(this.objects);
    this.grid = new GridEngine();
    
    this.coords = new CoordinateController(this.camera, this.grid);
    this.navigation = new NavigationController(this.camera, this.canvas, this.coords, this.events);
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    Logger.info(`[${this.name}] Initializing Workspace components...`);
    
    await this.camera.initialize();
    await this.canvas.initialize();
    await this.grid.initialize();

    this.initialized = true;
    Logger.info(`[${this.name}] Initialized successfully.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    
    await this.grid.shutdown();
    await this.canvas.shutdown();
    await this.camera.shutdown();
    
    this.initialized = false;
    Logger.info(`[${this.name}] Shutdown complete.`);
  }
}
