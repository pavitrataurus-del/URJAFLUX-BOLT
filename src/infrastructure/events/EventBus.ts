import { IEvent, EventHandler, IEventSubscription, EventPriority } from "./EventTypes";
import { Logger } from "../logging/Logger";
import { ErrorHandler } from "../error/ErrorHandler";
import { EnterpriseError } from "../error/EnterpriseError";
import { ErrorCategory } from "../error/ErrorTypes";

interface SubscriptionRecord {
  id: string;
  handler: EventHandler;
}

export class EventBus {
  private static instance: EventBus;
  private subscribers: Map<string, SubscriptionRecord[]> = new Map();
  private eventHistory: IEvent[] = [];
  private maxHistorySize = 1000;

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe<T = any>(eventType: string, handler: EventHandler<T>): IEventSubscription {
    const id = Math.random().toString(36).substring(2, 9);
    
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    
    this.subscribers.get(eventType)!.push({ id, handler });
    
    return {
      id,
      unsubscribe: () => this.unsubscribe(eventType, id)
    };
  }

  private unsubscribe(eventType: string, subscriptionId: string): void {
    if (!this.subscribers.has(eventType)) return;
    
    const records = this.subscribers.get(eventType)!;
    const filtered = records.filter(r => r.id !== subscriptionId);
    
    if (filtered.length === 0) {
      this.subscribers.delete(eventType);
    } else {
      this.subscribers.set(eventType, filtered);
    }
  }

  public async publish<T = any>(event: IEvent<T>): Promise<void> {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    if (!this.subscribers.has(event.type)) {
      return;
    }

    const handlers = this.subscribers.get(event.type)!;
    
    // Non-blocking dispatch
    Promise.all(handlers.map(async (record) => {
      try {
        await record.handler(event);
      } catch (err: any) {
        ErrorHandler.getInstance().handleError(new EnterpriseError(`Event handler failed for ${event.type}`, {
          category: ErrorCategory.SYSTEM,
          rootCause: err,
          context: { eventId: event.id, eventType: event.type }
        }));
      }
    })).catch(() => {});
  }

  public getHistory(): IEvent[] {
    return [...this.eventHistory];
  }
}
