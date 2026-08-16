import { SIGNode, SIGEntityType } from "../../types/sig";
import { TenantID } from "../../types/rules";

/**
 * High-performance domain wrapper for Spatial Intelligence Graph (SIG) Nodes.
 * Provides type-safe getters and casting capabilities for individual entity schemas.
 */
export class GraphNode {
  constructor(public readonly inner: SIGNode) {}

  public get id(): string {
    return this.inner.id;
  }

  public get type(): SIGEntityType {
    return this.inner.type;
  }

  public get tenantId(): TenantID {
    return this.inner.tenantId;
  }

  public get version(): number {
    return this.inner.version;
  }

  public get lifecycleState(): "ACTIVE" | "ARCHIVED" | "DRAFT" | "DELETED" {
    return this.inner.lifecycleState;
  }

  public get properties(): Record<string, any> {
    return this.inner.properties;
  }

  /**
   * Retrieves a typed property from the node payload safely.
   */
  public getProperty<T>(key: string, defaultValue?: T): T {
    if (this.inner.properties && key in this.inner.properties) {
      return this.inner.properties[key] as T;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Property '${key}' does not exist on Node of type '${this.inner.type}'.`);
  }

  /**
   * Helper utility to determine if node is an SKO (Spatial Knowledge Object).
   */
  public isSKO(): boolean {
    return this.inner.type === SIGEntityType.SPATIAL_KNOWLEDGE_OBJECT;
  }

  /**
   * Helper utility to determine if node is a Rule.
   */
  public isRule(): boolean {
    return this.inner.type === SIGEntityType.RULE;
  }
}
