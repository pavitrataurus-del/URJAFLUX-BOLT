import { SIGBaseEdge, SIGRelationshipType } from "../../types/sig";
import { TenantID } from "../../types/rules";

/**
 * High-performance domain wrapper for Spatial Intelligence Graph (SIG) Edges.
 * Enforces directed relationships, weights, and property parameters.
 */
export class GraphEdge {
  constructor(public readonly inner: SIGBaseEdge) {}

  public get id(): string {
    return this.inner.id;
  }

  public get type(): SIGRelationshipType {
    return this.inner.type;
  }

  public get tenantId(): TenantID {
    return this.inner.tenantId;
  }

  public get sourceId(): string {
    return this.inner.sourceId;
  }

  public get targetId(): string {
    return this.inner.targetId;
  }

  public get weight(): number {
    return this.inner.weight;
  }

  public get properties(): Record<string, any> {
    return this.inner.properties;
  }

  /**
   * Retrieves a typed edge property from the payload safely.
   */
  public getProperty<T>(key: string, defaultValue?: T): T {
    if (this.inner.properties && key in this.inner.properties) {
      return this.inner.properties[key] as T;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Property '${key}' does not exist on Edge of type '${this.inner.type}'.`);
  }
}
