import { IOntologyNode } from "./OntologyTypes";
import { EventBus } from "../../../infrastructure/events/EventBus";
import { KnowledgeEventType, createKnowledgeEvent } from "../events/KnowledgeEvents";
import { EnterpriseError } from "../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../infrastructure/error/ErrorTypes";

export class UniversalOntologyEngine {
  private static instance: UniversalOntologyEngine;
  private nodes: Map<string, IOntologyNode> = new Map();
  private aliasIndex: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): UniversalOntologyEngine {
    if (!UniversalOntologyEngine.instance) {
      UniversalOntologyEngine.instance = new UniversalOntologyEngine();
    }
    return UniversalOntologyEngine.instance;
  }

  public registerConcept(node: IOntologyNode): void {
    this.validateNode(node);
    
    if (this.nodes.has(node.id)) {
      throw new EnterpriseError(`Concept with ID ${node.id} already exists.`, { category: ErrorCategory.CONFLICT });
    }

    if (node.parentId && !this.nodes.has(node.parentId)) {
      throw new EnterpriseError(`Parent ID ${node.parentId} not found.`, { category: ErrorCategory.NOT_FOUND });
    }

    this.checkCircularInheritance(node.id, node.parentId);

    this.nodes.set(node.id, node);
    this.updateAliasIndex(node);

    if (node.parentId) {
      const parent = this.nodes.get(node.parentId)!;
      if (!parent.childrenIds.includes(node.id)) {
        parent.childrenIds.push(node.id);
      }
    }

    EventBus.getInstance().publish(createKnowledgeEvent(KnowledgeEventType.ONTOLOGY_CREATED, { nodeId: node.id }));
  }

  public updateConcept(node: IOntologyNode): void {
    if (!this.nodes.has(node.id)) {
      throw new EnterpriseError(`Concept with ID ${node.id} not found.`, { category: ErrorCategory.NOT_FOUND });
    }
    this.validateNode(node);
    this.checkCircularInheritance(node.id, node.parentId);

    const oldNode = this.nodes.get(node.id)!;
    this.removeAliasIndex(oldNode);

    this.nodes.set(node.id, node);
    this.updateAliasIndex(node);
    
    if (node.parentId !== oldNode.parentId) {
      if (oldNode.parentId) {
        const oldParent = this.nodes.get(oldNode.parentId);
        if (oldParent) {
          oldParent.childrenIds = oldParent.childrenIds.filter(id => id !== node.id);
        }
      }
      if (node.parentId) {
        const newParent = this.nodes.get(node.parentId);
        if (newParent && !newParent.childrenIds.includes(node.id)) {
          newParent.childrenIds.push(node.id);
        }
      }
    }
    
    EventBus.getInstance().publish(createKnowledgeEvent(KnowledgeEventType.ONTOLOGY_UPDATED, { nodeId: node.id }));
  }

  public getConcept(id: string): IOntologyNode | undefined {
    return this.nodes.get(id);
  }

  public resolveAlias(alias: string): IOntologyNode | undefined {
    const nodeId = this.aliasIndex.get(alias.toLowerCase());
    if (nodeId) return this.nodes.get(nodeId);
    return undefined;
  }

  public searchConcept(query: string): IOntologyNode[] {
    const q = query.toLowerCase();
    const results: IOntologyNode[] = [];
    for (const node of this.nodes.values()) {
      if (
        node.canonicalName.toLowerCase().includes(q) ||
        node.aliases.some(a => a.toLowerCase().includes(q)) ||
        Object.values(node.labels).some(l => typeof l === 'string' && l.toLowerCase().includes(q))
      ) {
        results.push(node);
      }
    }
    return results;
  }

  private validateNode(node: IOntologyNode): void {
    if (!node.id || !node.canonicalName || !node.type || !node.labels || !node.version) {
      throw new EnterpriseError("Missing required ontology metadata.", { category: ErrorCategory.VALIDATION });
    }
  }

  private updateAliasIndex(node: IOntologyNode): void {
    this.aliasIndex.set(node.canonicalName.toLowerCase(), node.id);
    for (const alias of node.aliases) {
      const lowerAlias = alias.toLowerCase();
      if (this.aliasIndex.has(lowerAlias) && this.aliasIndex.get(lowerAlias) !== node.id) {
         throw new EnterpriseError(`Alias ${alias} conflicts with existing node.`, { category: ErrorCategory.CONFLICT });
      }
      this.aliasIndex.set(lowerAlias, node.id);
    }
  }
  
  private removeAliasIndex(node: IOntologyNode): void {
    this.aliasIndex.delete(node.canonicalName.toLowerCase());
    for (const alias of node.aliases) {
      this.aliasIndex.delete(alias.toLowerCase());
    }
  }

  private checkCircularInheritance(nodeId: string, parentId?: string): void {
    let currentParentId = parentId;
    while (currentParentId) {
      if (currentParentId === nodeId) {
        throw new EnterpriseError(`Circular inheritance detected for node ${nodeId}.`, { category: ErrorCategory.VALIDATION });
      }
      const parent = this.nodes.get(currentParentId);
      currentParentId = parent?.parentId;
    }
  }
  
  public clear(): void {
    this.nodes.clear();
    this.aliasIndex.clear();
  }
}
