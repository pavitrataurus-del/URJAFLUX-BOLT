// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE HIERARCHY MANAGER (PHASE 2)
// Navigation & Hierarchy Engine: Domain -> Book -> Chapter -> Topic -> Subtopic
// ============================================================================

import { 
  IVaultKnowledgeRecord, 
  IKnowledgeHierarchyNode, 
  KnowledgeDomain 
} from "../types/vaultRecord.types";

export interface IHierarchyTreeNode {
  id: string;
  name: string;
  level: 'DOMAIN' | 'BOOK' | 'CHAPTER' | 'TOPIC' | 'SUBTOPIC' | 'KNOWLEDGE_ITEM';
  recordCount: number;
  children: Map<string, IHierarchyTreeNode>;
  recordIds: string[];
}

export class KnowledgeHierarchyManager {
  private static instance: KnowledgeHierarchyManager;
  private rootDomains: Map<string, IHierarchyTreeNode> = new Map();

  private constructor() {}

  public static getInstance(): KnowledgeHierarchyManager {
    if (!KnowledgeHierarchyManager.instance) {
      KnowledgeHierarchyManager.instance = new KnowledgeHierarchyManager();
    }
    return KnowledgeHierarchyManager.instance;
  }

  /**
   * Registers a Vault Record into the Knowledge Hierarchy Tree
   */
  public registerRecord(record: IVaultKnowledgeRecord): void {
    const loc = record.hierarchyLocation;
    const domainKey = loc.domain;
    const bookKey = loc.bookTitle || "Canonical Works";
    const chapterKey = loc.chapter || "General Principles";
    const topicKey = loc.topic || "Core Teachings";
    const subtopicKey = loc.subtopic || "General";

    // 1. Domain Node
    let domainNode = this.rootDomains.get(domainKey);
    if (!domainNode) {
      domainNode = {
        id: `DOM-${domainKey}`,
        name: domainKey,
        level: 'DOMAIN',
        recordCount: 0,
        children: new Map(),
        recordIds: []
      };
      this.rootDomains.set(domainKey, domainNode);
    }
    domainNode.recordCount++;
    if (!domainNode.recordIds.includes(record.recordId)) domainNode.recordIds.push(record.recordId);

    // 2. Book Node
    let bookNode = domainNode.children.get(bookKey);
    if (!bookNode) {
      bookNode = {
        id: `BK-${domainKey}-${bookKey}`,
        name: bookKey,
        level: 'BOOK',
        recordCount: 0,
        children: new Map(),
        recordIds: []
      };
      domainNode.children.set(bookKey, bookNode);
    }
    bookNode.recordCount++;
    if (!bookNode.recordIds.includes(record.recordId)) bookNode.recordIds.push(record.recordId);

    // 3. Chapter Node
    let chapterNode = bookNode.children.get(chapterKey);
    if (!chapterNode) {
      chapterNode = {
        id: `CH-${domainKey}-${bookKey}-${chapterKey}`,
        name: chapterKey,
        level: 'CHAPTER',
        recordCount: 0,
        children: new Map(),
        recordIds: []
      };
      bookNode.children.set(chapterKey, chapterNode);
    }
    chapterNode.recordCount++;
    if (!chapterNode.recordIds.includes(record.recordId)) chapterNode.recordIds.push(record.recordId);

    // 4. Topic Node
    let topicNode = chapterNode.children.get(topicKey);
    if (!topicNode) {
      topicNode = {
        id: `TP-${domainKey}-${chapterKey}-${topicKey}`,
        name: topicKey,
        level: 'TOPIC',
        recordCount: 0,
        children: new Map(),
        recordIds: []
      };
      chapterNode.children.set(topicKey, topicNode);
    }
    topicNode.recordCount++;
    if (!topicNode.recordIds.includes(record.recordId)) topicNode.recordIds.push(record.recordId);

    // 5. Subtopic Node
    let subtopicNode = topicNode.children.get(subtopicKey);
    if (!subtopicNode) {
      subtopicNode = {
        id: `STP-${domainKey}-${topicKey}-${subtopicKey}`,
        name: subtopicKey,
        level: 'SUBTOPIC',
        recordCount: 0,
        children: new Map(),
        recordIds: []
      };
      topicNode.children.set(subtopicKey, subtopicNode);
    }
    subtopicNode.recordCount++;
    if (!subtopicNode.recordIds.includes(record.recordId)) subtopicNode.recordIds.push(record.recordId);
  }

  /**
   * Retrieves the full hierarchy tree for a given Domain or entire Vault
   */
  public getHierarchyTree(domain?: KnowledgeDomain): any {
    if (domain && this.rootDomains.has(domain)) {
      return this.serializeNode(this.rootDomains.get(domain)!);
    }

    const tree: any[] = [];
    this.rootDomains.forEach(node => {
      tree.push(this.serializeNode(node));
    });

    return tree;
  }

  /**
   * Serializes Map-based node structure to clean JSON serializable object
   */
  private serializeNode(node: IHierarchyTreeNode): any {
    const childrenArray: any[] = [];
    node.children.forEach(child => {
      childrenArray.push(this.serializeNode(child));
    });

    return {
      id: node.id,
      name: node.name,
      level: node.level,
      recordCount: node.recordCount,
      recordIds: node.recordIds,
      children: childrenArray
    };
  }

  /**
   * Gets hierarchical node path string for a record
   */
  public buildNodePath(loc: IKnowledgeHierarchyNode): string {
    return `${loc.domain} > ${loc.bookTitle} > ${loc.chapter} > ${loc.topic} > ${loc.subtopic}`;
  }

  public clear(): void {
    this.rootDomains.clear();
  }
}

export const knowledgeHierarchyManager = KnowledgeHierarchyManager.getInstance();
