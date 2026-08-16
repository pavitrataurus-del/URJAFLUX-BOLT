import { BaseEngine } from '../types/BaseEngine';
import { Logger } from '../utils/logger';

export interface BaseTool {
  id: string;
  name: string;
  icon?: string;
  activate?: () => void;
  deactivate?: () => void;
  onPointerDown?: (event: any) => void;
  onPointerMove?: (event: any) => void;
  onPointerUp?: (event: any) => void;
}

export class ToolEngine implements BaseEngine {
  public readonly name = 'ToolEngine';
  private initialized = false;
  
  private registry: Map<string, BaseTool> = new Map();
  private activeToolId: string | null = null;

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.registry.clear();
    this.activeToolId = null;
    this.initialized = true;
    Logger.info(`${this.name} initialized.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    
    if (this.activeToolId) {
      const activeTool = this.registry.get(this.activeToolId);
      if (activeTool?.deactivate) {
        activeTool.deactivate();
      }
    }
    
    this.registry.clear();
    this.activeToolId = null;
    this.initialized = false;
    Logger.info(`${this.name} shutdown.`);
  }

  public registerTool(tool: BaseTool): void {
    if (!this.initialized) {
      Logger.warn(`[${this.name}] Cannot register tool because engine is not initialized.`);
      return;
    }
    
    this.registry.set(tool.id, tool);
    Logger.debug(`[${this.name}] Registered tool: ${tool.name} (${tool.id})`);
  }

  public unregisterTool(toolId: string): void {
    if (!this.initialized) return;
    
    if (this.activeToolId === toolId) {
      this.setActiveTool(null);
    }
    
    this.registry.delete(toolId);
    Logger.debug(`[${this.name}] Unregistered tool: ${toolId}`);
  }

  public getTool(toolId: string): BaseTool | undefined {
    return this.registry.get(toolId);
  }
  
  public getAllTools(): BaseTool[] {
    return Array.from(this.registry.values());
  }

  public setActiveTool(toolId: string | null): void {
    if (!this.initialized) return;

    if (this.activeToolId === toolId) {
      return; // Already active
    }

    // Deactivate current tool
    if (this.activeToolId) {
      const currentTool = this.registry.get(this.activeToolId);
      if (currentTool?.deactivate) {
        try {
          currentTool.deactivate();
        } catch (error) {
          Logger.error(`[${this.name}] Error deactivating tool ${this.activeToolId}:`, error);
        }
      }
    }

    this.activeToolId = toolId;

    // Activate new tool
    if (this.activeToolId) {
      const newTool = this.registry.get(this.activeToolId);
      if (!newTool) {
        Logger.warn(`[${this.name}] Attempted to activate unknown tool: ${this.activeToolId}`);
        this.activeToolId = null; // Revert to no active tool
        return;
      }
      
      if (newTool.activate) {
        try {
          newTool.activate();
        } catch (error) {
          Logger.error(`[${this.name}] Error activating tool ${this.activeToolId}:`, error);
        }
      }
      Logger.debug(`[${this.name}] Active tool changed to: ${newTool.name}`);
    } else {
      Logger.debug(`[${this.name}] Active tool cleared`);
    }
  }

  public getActiveTool(): BaseTool | undefined {
    if (!this.activeToolId) return undefined;
    return this.registry.get(this.activeToolId);
  }
}
