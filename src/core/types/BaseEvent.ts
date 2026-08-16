export interface BaseEvent<T = any> {
  readonly type: string;
  readonly timestamp: number;
  readonly payload: T;
  readonly source: string; // The engine/module that emitted the event
}

export type EventHandler<T = any> = (event: BaseEvent<T>) => void | Promise<void>;

export interface EventBus {
  subscribe<T>(eventType: string, handler: EventHandler<T>): void;
  unsubscribe<T>(eventType: string, handler: EventHandler<T>): void;
  publish<T>(event: BaseEvent<T>): void;
}
