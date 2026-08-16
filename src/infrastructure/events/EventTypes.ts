export interface IEvent<T = any> {
  id: string;
  type: string;
  payload: T;
  timestamp: number;
  correlationId?: string;
  tenantId?: string;
  priority?: EventPriority;
}

export enum EventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

export type EventHandler<T = any> = (event: IEvent<T>) => Promise<void> | void;

export interface IEventSubscription {
  id: string;
  unsubscribe(): void;
}
