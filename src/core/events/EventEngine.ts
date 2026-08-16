import { BaseEngine } from '../types/BaseEngine';
import { BaseEvent, EventHandler, EventBus } from '../types/BaseEvent';
import { Logger } from '../utils/logger';

export class EventEngine implements BaseEngine, EventBus {
  public readonly name = 'EventEngine';
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private initialized = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.handlers.clear();
    this.initialized = true;
    Logger.info(`${this.name} initialized.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    this.handlers.clear();
    this.initialized = false;
    Logger.info(`${this.name} shutdown.`);
  }

  public subscribe<T = any>(eventType: string, handler: EventHandler<T>): void {
    if (!this.initialized) {
      Logger.warn(`[${this.name}] Cannot subscribe to ${eventType} because engine is not initialized.`);
      return;
    }
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler<any>);
    Logger.debug(`[${this.name}] Subscribed to event: ${eventType}`);
  }

  public unsubscribe<T = any>(eventType: string, handler: EventHandler<T>): void {
    if (!this.initialized) return;
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.delete(handler as EventHandler<any>);
      if (eventHandlers.size === 0) {
        this.handlers.delete(eventType);
      }
      Logger.debug(`[${this.name}] Unsubscribed from event: ${eventType}`);
    }
  }

  public publish<T = any>(event: BaseEvent<T>): void {
    if (!this.initialized) {
      Logger.warn(`[${this.name}] Cannot publish ${event.type} because engine is not initialized.`);
      return;
    }
    Logger.debug(`[${this.name}] Publishing event: ${event.type}`, event.payload);
    
    const eventHandlers = this.handlers.get(event.type);
    if (eventHandlers) {
      eventHandlers.forEach((handler) => {
        try {
          // Fire-and-forget to not block publisher, or await if strictly necessary.
          // Event handlers can be async or sync. We do not await them here to avoid tight coupling and blocking.
          const result = handler(event);
          if (result instanceof Promise) {
            result.catch(err => Logger.error(`[${this.name}] Error in async event handler for ${event.type}:`, err));
          }
        } catch (err) {
          Logger.error(`[${this.name}] Error in event handler for ${event.type}:`, err);
        }
      });
    }
  }
}
