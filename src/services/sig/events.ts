import { SIGNode, SIGBaseEdge } from "../../types/sig";
import { TenantID } from "../../types/rules";

/**
 * Supported Domain Event types for the Spatial Intelligence Graph.
 */
export type SIGDomainEventType = 
  | "NODE_REGISTERED"
  | "NODE_UPDATED"
  | "NODE_REMOVED"
  | "NODES_CONNECTED"
  | "NODES_DISCONNECTED";

export interface NodeRegisteredEventPayload {
  node: SIGNode;
  userId: string;
}

export interface NodeUpdatedEventPayload {
  newNode: SIGNode;
  userId: string;
}

export interface NodeRemovedEventPayload {
  nodeId: string;
  userId: string;
}

export interface NodesConnectedEventPayload {
  edge: SIGBaseEdge;
  userId: string;
}

export interface NodesDisconnectedEventPayload {
  edgeId: string;
  userId: string;
}

export type SIGDomainEventPayload =
  | NodeRegisteredEventPayload
  | NodeUpdatedEventPayload
  | NodeRemovedEventPayload
  | NodesConnectedEventPayload
  | NodesDisconnectedEventPayload;

/**
 * Represents a discrete Domain Event fired by the Spatial Intelligence Graph module.
 */
export interface SIGDomainEvent {
  id: string;
  type: SIGDomainEventType;
  tenantId: TenantID;
  timestamp: string;
  payload: SIGDomainEventPayload;
}

/**
 * Event Listener interface following the Observer/Subscriber Pattern.
 */
export interface ISIGEventListener {
  onEvent(event: SIGDomainEvent): void;
}

/**
 * Thread-safe Event Dispatcher managing registration and dispatch of graph Domain Events.
 */
export class SIGEventDispatcher {
  private static instance: SIGEventDispatcher | null = null;
  private listeners: Map<SIGDomainEventType, ISIGEventListener[]> = new Map();

  private constructor() {}

  /**
   * Singleton accessor for global event coordination.
   */
  public static getInstance(): SIGEventDispatcher {
    if (!SIGEventDispatcher.instance) {
      SIGEventDispatcher.instance = new SIGEventDispatcher();
    }
    return SIGEventDispatcher.instance;
  }

  /**
   * Registers a callback listener for a specific graph Domain Event type.
   */
  public registerListener(type: SIGDomainEventType, listener: ISIGEventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  /**
   * Removes a callback listener for a specific graph Domain Event type.
   */
  public removeListener(type: SIGDomainEventType, listener: ISIGEventListener): boolean {
    const registry = this.listeners.get(type);
    if (!registry) return false;
    const index = registry.indexOf(listener);
    if (index > -1) {
      registry.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Synchronously dispatches the Domain Event to all registered subscribers.
   */
  public dispatch(event: SIGDomainEvent): void {
    const registry = this.listeners.get(event.type) || [];
    for (const listener of registry) {
      try {
        listener.onEvent(event);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[SIGEventDispatcher] Listener error on event '${event.type}':`, errorMsg);
      }
    }
  }
}
