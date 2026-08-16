import { INamespace, ApprovalStatus } from "./NamespaceTypes";
import { EventBus } from "../../../infrastructure/events/EventBus";
import { KnowledgeEventType, createKnowledgeEvent } from "../events/KnowledgeEvents";
import { EnterpriseError } from "../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../infrastructure/error/ErrorTypes";

export class KnowledgeNamespaceEngine {
  private static instance: KnowledgeNamespaceEngine;
  private namespaces: Map<string, INamespace> = new Map();

  private constructor() {}

  public static getInstance(): KnowledgeNamespaceEngine {
    if (!KnowledgeNamespaceEngine.instance) {
      KnowledgeNamespaceEngine.instance = new KnowledgeNamespaceEngine();
    }
    return KnowledgeNamespaceEngine.instance;
  }

  public registerNamespace(namespace: INamespace): void {
    this.validateNamespace(namespace);

    if (this.namespaces.has(namespace.id)) {
      throw new EnterpriseError(`Namespace ${namespace.id} already exists.`, { category: ErrorCategory.CONFLICT });
    }

    this.namespaces.set(namespace.id, namespace);

    EventBus.getInstance().publish(createKnowledgeEvent(KnowledgeEventType.NAMESPACE_REGISTERED, { namespaceId: namespace.id }));
  }

  public activateNamespace(id: string): void {
    const ns = this.namespaces.get(id);
    if (!ns) {
      throw new EnterpriseError(`Namespace ${id} not found.`, { category: ErrorCategory.NOT_FOUND });
    }
    
    if (ns.approvalStatus !== ApprovalStatus.APPROVED) {
       throw new EnterpriseError(`Namespace ${id} is not APPROVED. Cannot activate.`, { category: ErrorCategory.VALIDATION });
    }

    ns.isActive = true;
    EventBus.getInstance().publish(createKnowledgeEvent(KnowledgeEventType.NAMESPACE_ACTIVATED, { namespaceId: id }));
  }

  public deactivateNamespace(id: string): void {
    const ns = this.namespaces.get(id);
    if (!ns) {
      throw new EnterpriseError(`Namespace ${id} not found.`, { category: ErrorCategory.NOT_FOUND });
    }

    ns.isActive = false;
    EventBus.getInstance().publish(createKnowledgeEvent(KnowledgeEventType.NAMESPACE_DEACTIVATED, { namespaceId: id }));
  }

  public getNamespace(id: string): INamespace | undefined {
    return this.namespaces.get(id);
  }

  public listNamespaces(activeOnly = false): INamespace[] {
    const all = Array.from(this.namespaces.values());
    if (activeOnly) {
      return all.filter(n => n.isActive);
    }
    return all;
  }

  public updateNamespace(id: string, updates: Partial<INamespace>): void {
    const ns = this.namespaces.get(id);
    if (!ns) {
      throw new EnterpriseError(`Namespace ${id} not found.`, { category: ErrorCategory.NOT_FOUND });
    }
    
    Object.assign(ns, updates);
    this.validateNamespace(ns);
  }

  private validateNamespace(ns: INamespace): void {
    if (!ns.id || !ns.name || !ns.version || !ns.approvalStatus) {
      throw new EnterpriseError("Missing required namespace metadata.", { category: ErrorCategory.VALIDATION });
    }
  }

  public clear(): void {
    this.namespaces.clear();
  }
}
