import { ApplicationEngine } from '../engines/ApplicationEngine';
import { BaseEvent, EventHandler } from '../types/BaseEvent';
import { BaseCommand } from '../types/BaseCommand';
import { USOMBaseObject } from '../usom/types';
import { Logger } from '../utils/logger';

interface Subscription {
  eventType: string;
  handler: EventHandler;
}

export class EngineAdapter {
  private engine: ApplicationEngine | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private isInitialized = false;

  constructor() {}

  public async initialize(engine: ApplicationEngine): Promise<void> {
    if (this.isInitialized && this.engine === engine) return;
    this.engine = engine;
    this.isInitialized = true;
    
    // Subscribe any handlers registered before engine initialization finished
    for (const sub of this.subscriptions.values()) {
      if (this.engine?.events) {
        this.engine.events.subscribe(sub.eventType, sub.handler);
      }
    }
    Logger.info('[EngineAdapter] Initialized');
  }

  public shutdown(): void {
    if (!this.isInitialized) return;
    this.unsubscribeAll();
    this.engine = null;
    this.isInitialized = false;
    Logger.info('[EngineAdapter] Shutdown');
  }

  public subscribe(eventType: string, handler: EventHandler): string {
    const subId = Math.random().toString(36).substring(7);
    this.subscriptions.set(subId, { eventType, handler });

    if (this.engine?.events) {
      this.engine.events.subscribe(eventType, handler);
    }
    return subId;
  }

  public unsubscribe(subId: string): void {
    const sub = this.subscriptions.get(subId);
    if (sub) {
      if (this.engine?.events) {
        this.engine.events.unsubscribe(sub.eventType, sub.handler);
      }
      this.subscriptions.delete(subId);
    }
  }

  public unsubscribeAll(): void {
    if (this.engine?.events) {
      for (const sub of this.subscriptions.values()) {
        this.engine.events.unsubscribe(sub.eventType, sub.handler);
      }
    }
    this.subscriptions.clear();
  }

  public dispatchCommand(command: BaseCommand, context?: any): void {
    if (!this.engine?.commands) {
      Logger.warn('[EngineAdapter] Cannot dispatch command: engine not initialized');
      return;
    }
    this.engine.commands.execute(command, context || this.engine);
  }

  public getObject(id: string): USOMBaseObject | undefined {
    if (!this.engine?.objects) return undefined;
    return this.engine.objects.getObject(id);
  }

  public getAllObjects(): USOMBaseObject[] {
    if (!this.engine?.objects) return [];
    return this.engine.objects.getAllObjects();
  }

  public getSelection(): string[] {
    if (!this.engine?.selection) return [];
    return this.engine.selection.getSelection();
  }

  public getDirectionEngine() {
    return this.engine?.direction;
  }

  public getGeometryEngine() {
    return this.engine?.geometry;
  }

  public getEngine(): ApplicationEngine | null {
    return this.engine;
  }
}

export const engineAdapter = new EngineAdapter();
