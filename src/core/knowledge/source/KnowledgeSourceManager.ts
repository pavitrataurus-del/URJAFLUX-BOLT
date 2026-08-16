import { IKnowledgeSource, ApprovalStatus } from "../namespace/NamespaceTypes";
import { EventBus } from "../../../infrastructure/events/EventBus";
import { KnowledgeEventType, createKnowledgeEvent } from "../events/KnowledgeEvents";
import { EnterpriseError } from "../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../infrastructure/error/ErrorTypes";
import { KnowledgeNamespaceEngine } from "../namespace/KnowledgeNamespaceEngine";

export class KnowledgeSourceManager {
  private static instance: KnowledgeSourceManager;
  private sources: Map<string, IKnowledgeSource> = new Map();

  private constructor() {}

  public static getInstance(): KnowledgeSourceManager {
    if (!KnowledgeSourceManager.instance) {
      KnowledgeSourceManager.instance = new KnowledgeSourceManager();
    }
    return KnowledgeSourceManager.instance;
  }

  public registerSource(source: IKnowledgeSource): void {
    this.validateSource(source);

    if (this.sources.has(source.id)) {
      throw new EnterpriseError(`Source ${source.id} already exists.`, { category: ErrorCategory.CONFLICT });
    }

    const nsEngine = KnowledgeNamespaceEngine.getInstance();
    const ns = nsEngine.getNamespace(source.namespaceId);
    if (!ns) {
      throw new EnterpriseError(`Namespace ${source.namespaceId} not found.`, { category: ErrorCategory.NOT_FOUND });
    }

    this.sources.set(source.id, source);

    EventBus.getInstance().publish(createKnowledgeEvent(KnowledgeEventType.KNOWLEDGE_SOURCE_REGISTERED, { sourceId: source.id }));
  }

  public getSource(id: string): IKnowledgeSource | undefined {
    return this.sources.get(id);
  }

  public updateSource(id: string, updates: Partial<IKnowledgeSource>): void {
    const source = this.sources.get(id);
    if (!source) {
      throw new EnterpriseError(`Source ${id} not found.`, { category: ErrorCategory.NOT_FOUND });
    }

    Object.assign(source, updates);
    this.validateSource(source);

    EventBus.getInstance().publish(createKnowledgeEvent(KnowledgeEventType.KNOWLEDGE_SOURCE_UPDATED, { sourceId: id }));
  }

  public listSourcesByNamespace(namespaceId: string): IKnowledgeSource[] {
    return Array.from(this.sources.values()).filter(s => s.namespaceId === namespaceId);
  }

  private validateSource(source: IKnowledgeSource): void {
    if (!source.id || !source.title || !source.language || !source.namespaceId || !source.version || !source.approvalStatus) {
      throw new EnterpriseError("Missing required knowledge source metadata.", { category: ErrorCategory.VALIDATION });
    }
  }

  public clear(): void {
    this.sources.clear();
  }
}
