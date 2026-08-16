import { WorkflowEvent } from "./WorkflowTypes";

export type EventCallback = (event: WorkflowEvent) => Promise<void> | void;

export interface Subscription {
  id: string;
  sourcePattern: string; // '*' or specific source 'DOMAIN-011'
  namePattern: string;   // '*' or specific event 'CAD_IMPORT_COMPLETED'
  callback: EventCallback;
  filter?: (event: WorkflowEvent) => boolean;
}

export class EnterpriseEventBus {
  private static instance: EnterpriseEventBus;
  private subscriptions: Subscription[] = [];
  private eventHistory: WorkflowEvent[] = [];
  private deadLetterQueue: { event: WorkflowEvent; reason: string; timestamp: string }[] = [];

  private constructor() {}

  public static getInstance(): EnterpriseEventBus {
    if (!EnterpriseEventBus.instance) {
      EnterpriseEventBus.instance = new EnterpriseEventBus();
    }
    return EnterpriseEventBus.instance;
  }

  public subscribe(
    sourcePattern: string,
    namePattern: string,
    callback: EventCallback,
    filter?: (event: WorkflowEvent) => boolean
  ): string {
    const id = Math.random().toString(36).substring(2, 11);
    this.subscriptions.push({ id, sourcePattern, namePattern, callback, filter });
    return id;
  }

  public unsubscribe(id: string): void {
    this.subscriptions = this.subscriptions.filter(sub => sub.id !== id);
  }

  public async publish(eventInput: Omit<WorkflowEvent, 'id' | 'timestamp' | 'receivedAt'>): Promise<void> {
    const event: WorkflowEvent = {
      ...eventInput,
      id: `evt_${Math.random().toString(36).substring(2, 15)}`,
      timestamp: new Date().toISOString(),
      receivedAt: new Date().toISOString()
    };

    this.eventHistory.push(event);

    // Filter and find matched subscriptions
    const matchedSubs = this.subscriptions.filter(sub => {
      const sourceMatch = sub.sourcePattern === '*' || sub.sourcePattern === event.source;
      const nameMatch = sub.namePattern === '*' || sub.namePattern === event.name;
      const filterMatch = !sub.filter || sub.filter(event);
      return sourceMatch && nameMatch && filterMatch;
    });

    for (const sub of matchedSubs) {
      // Execute each async/sync with safety retries
      this.executeWithRetry(sub, event, 3, 100);
    }
  }

  private async executeWithRetry(
    sub: Subscription,
    event: WorkflowEvent,
    retriesLeft: number,
    delayMs: number
  ): Promise<void> {
    try {
      await sub.callback(event);
    } catch (err: any) {
      if (retriesLeft > 0) {
        setTimeout(() => {
          this.executeWithRetry(sub, event, retriesLeft - 1, delayMs * 2);
        }, delayMs);
      } else {
        // Push to Dead Letter Queue
        this.deadLetterQueue.push({
          event,
          reason: err?.message || 'Execution retries exhausted',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  public getHistory(): WorkflowEvent[] {
    return [...this.eventHistory];
  }

  public getDLQ() {
    return [...this.deadLetterQueue];
  }

  public clearHistory(): void {
    this.eventHistory = [];
    this.deadLetterQueue = [];
  }
}
