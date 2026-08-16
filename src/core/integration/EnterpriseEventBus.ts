// Module 3: Enterprise Event Bus Engine
import { BusEvent, DeadLetterQueueItem, EventPriority } from "../../types/integrationPlatform";

type EventSubscriberFn = (event: BusEvent) => Promise<void> | void;

export class EnterpriseEventBusStore {
  private subscribers: Map<string, EventSubscriberFn[]> = new Map(); // topic -> callbacks
  private eventHistory: BusEvent[] = [];
  private deadLetterQueue: DeadLetterQueueItem[] = [];
  private highPriorityQueue: BusEvent[] = [];
  private normalPriorityQueue: BusEvent[] = [];
  private lowPriorityQueue: BusEvent[] = [];

  constructor() {
    this.seedCanonicalEvents();
  }

  private seedCanonicalEvents(): void {
    const defaultEvents: BusEvent[] = [
      {
        id: "EVT-1001",
        topic: "project.imported",
        publisher: "CAD_INGESTION_SERVICE",
        priority: "HIGH",
        payload: { projectId: "PRJ-CAD-8801", filename: "Tech_Park_Tower_B.dxf", layerCount: 42 },
        correlationId: "CORR-9901-A",
        tenantId: "tenant_org_01",
        version: "1.0",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: "EVT-1002",
        topic: "analysis.finished",
        publisher: "VASTU_SIMULATION_ENGINE",
        priority: "HIGH",
        payload: { projectId: "PRJ-CAD-8801", complianceScore: 94.5, defectCount: 2 },
        correlationId: "CORR-9901-A",
        tenantId: "tenant_org_01",
        version: "1.0",
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString()
      },
      {
        id: "EVT-1003",
        topic: "report.generated",
        publisher: "EXPLAINABLE_RAG_ENGINE",
        priority: "NORMAL",
        payload: { reportId: "RPT-2026-901", pdfUrl: "s3://urjaflux-reports/RPT-2026-901.pdf" },
        correlationId: "CORR-9901-A",
        tenantId: "tenant_org_01",
        version: "1.0",
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ];

    defaultEvents.forEach(evt => {
      this.eventHistory.unshift(evt);
    });

    // Seed sample DLQ
    this.deadLetterQueue.push({
      id: "DLQ-5001",
      event: {
        id: "EVT-ERR-9001",
        topic: "webhook.dispatch.failed",
        publisher: "OUTBOUND_WEBHOOK_SERVICE",
        priority: "LOW",
        payload: { endpoint: "https://invalid-customer-webhook.com/api" },
        correlationId: "CORR-ERR-77",
        tenantId: "tenant_org_01",
        version: "1.0",
        timestamp: new Date(Date.now() - 1800000).toISOString()
      },
      failureReason: "HTTP 504 Gateway Timeout on endpoint target server",
      retryCount: 3,
      maxRetries: 3,
      lastAttemptAt: new Date(Date.now() - 900000).toISOString(),
      status: "PENDING_REPLAY"
    });
  }

  // Subscribe to Event Topic or wildcard pattern
  public subscribe(topic: string, callback: EventSubscriberFn): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic)!.push(callback);

    // Unsubscribe helper
    return () => {
      const subs = this.subscribers.get(topic) || [];
      this.subscribers.set(topic, subs.filter(fn => fn !== callback));
    };
  }

  // Publish Event
  public publish<T = Record<string, unknown>>(
    topic: string,
    publisher: string,
    payload: T,
    tenantId: string = "tenant_org_01",
    priority: EventPriority = "NORMAL",
    correlationId?: string
  ): BusEvent<T> {
    const event: BusEvent<T> = {
      id: `EVT-${Date.now().toString(36).toUpperCase()}`,
      topic,
      publisher,
      priority,
      payload,
      correlationId: correlationId || `CORR-${Date.now().toString(36).toUpperCase()}`,
      tenantId,
      version: "1.0",
      timestamp: new Date().toISOString()
    };

    // Store in audit history
    this.eventHistory.unshift(event as unknown as BusEvent);

    // Route into Priority Queue
    if (priority === "HIGH") this.highPriorityQueue.push(event as unknown as BusEvent);
    else if (priority === "NORMAL") this.normalPriorityQueue.push(event as unknown as BusEvent);
    else this.lowPriorityQueue.push(event as unknown as BusEvent);

    // Dispatch immediately to registered subscribers
    this.dispatchSubscribers(event as unknown as BusEvent);

    return event;
  }

  private async dispatchSubscribers(event: BusEvent): Promise<void> {
    const directCallbacks = this.subscribers.get(event.topic) || [];
    const wildcardCallbacks = this.subscribers.get("*") || [];
    const allCallbacks = [...directCallbacks, ...wildcardCallbacks];

    for (const callback of allCallbacks) {
      try {
        await callback(event);
      } catch (err) {
        // Handle subscriber failure -> Push to Dead Letter Queue
        this.pushToDeadLetterQueue(event, (err as Error).message);
      }
    }
  }

  public pushToDeadLetterQueue(event: BusEvent, failureReason: string): DeadLetterQueueItem {
    const dlqItem: DeadLetterQueueItem = {
      id: `DLQ-${Date.now().toString(36).toUpperCase()}`,
      event,
      failureReason,
      retryCount: 1,
      maxRetries: 3,
      lastAttemptAt: new Date().toISOString(),
      status: "PENDING_REPLAY"
    };
    this.deadLetterQueue.unshift(dlqItem);
    return dlqItem;
  }

  public replayDeadLetterItem(dlqId: string): boolean {
    const item = this.deadLetterQueue.find(d => d.id === dlqId);
    if (!item) return false;

    item.status = "REPLAYED";
    item.lastAttemptAt = new Date().toISOString();

    // Re-publish event
    this.publish(
      item.event.topic,
      `${item.event.publisher}_REPLAY`,
      item.event.payload,
      item.event.tenantId,
      item.event.priority,
      item.event.correlationId
    );

    return true;
  }

  public getEventHistory(tenantId?: string): BusEvent[] {
    if (!tenantId) return this.eventHistory;
    return this.eventHistory.filter(e => e.tenantId === tenantId || e.tenantId === "global_tenant");
  }

  public getDeadLetterQueue(tenantId?: string): DeadLetterQueueItem[] {
    if (!tenantId) return this.deadLetterQueue;
    return this.deadLetterQueue.filter(d => d.event.tenantId === tenantId || d.event.tenantId === "global_tenant");
  }

  public getQueueMetrics(): { high: number; normal: number; low: number; totalProcessed: number; dlqDepth: number } {
    return {
      high: this.highPriorityQueue.length,
      normal: this.normalPriorityQueue.length,
      low: this.lowPriorityQueue.length,
      totalProcessed: this.eventHistory.length,
      dlqDepth: this.deadLetterQueue.filter(d => d.status === "PENDING_REPLAY").length
    };
  }
}

export const EnterpriseEventBus = new EnterpriseEventBusStore();
