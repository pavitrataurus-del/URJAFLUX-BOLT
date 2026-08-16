// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE SEARCH INDEXER (PHASE 2)
// Structural Search Index Architecture (Keyword, Topic, Citation, Rule, Author, Domain)
// ============================================================================

import { 
  IVaultKnowledgeRecord, 
  KnowledgeDomain, 
  VaultKnowledgeCategory 
} from "../types/vaultRecord.types";

export interface ISearchIndexStats {
  totalIndexedRecords: number;
  keywordTokensCount: number;
  topicTokensCount: number;
  citationIndexCount: number;
  ruleIndexCount: number;
  authorIndexCount: number;
  domainIndexCount: number;
}

export class KnowledgeSearchIndexer {
  private static instance: KnowledgeSearchIndexer;

  // In-Memory Structural Search Index Maps
  private keywordIndex: Map<string, Set<string>> = new Map();
  private topicIndex: Map<string, Set<string>> = new Map();
  private citationIndex: Map<string, Set<string>> = new Map();
  private ruleIndex: Map<string, Set<string>> = new Map();
  private authorIndex: Map<string, Set<string>> = new Map();
  private domainIndex: Map<string, Set<string>> = new Map();
  private categoryIndex: Map<VaultKnowledgeCategory, Set<string>> = new Map();

  private constructor() {}

  public static getInstance(): KnowledgeSearchIndexer {
    if (!KnowledgeSearchIndexer.instance) {
      KnowledgeSearchIndexer.instance = new KnowledgeSearchIndexer();
    }
    return KnowledgeSearchIndexer.instance;
  }

  /**
   * Indexes a Vault Knowledge Record into structural search maps
   */
  public indexRecord(record: IVaultKnowledgeRecord): void {
    const id = record.recordId;

    // 1. Domain Indexing
    const domain = record.sourceMetadata.domain;
    if (!this.domainIndex.has(domain)) {
      this.domainIndex.set(domain, new Set());
    }
    this.domainIndex.get(domain)!.add(id);

    // 2. Category Indexing
    const cat = record.category;
    if (!this.categoryIndex.has(cat)) {
      this.categoryIndex.set(cat, new Set());
    }
    this.categoryIndex.get(cat)!.add(id);

    // 3. Author Indexing
    const author = record.sourceMetadata.authorInfo.authorName.toLowerCase();
    if (author) {
      if (!this.authorIndex.has(author)) {
        this.authorIndex.set(author, new Set());
      }
      this.authorIndex.get(author)!.add(id);
    }

    // 4. Citation Indexing
    const citId = record.citation.citationId;
    if (citId) {
      if (!this.citationIndex.has(citId)) {
        this.citationIndex.set(citId, new Set());
      }
      this.citationIndex.get(citId)!.add(id);
    }
    if (record.citation.traceabilityHash) {
      const hashKey = record.citation.traceabilityHash.toLowerCase();
      if (!this.citationIndex.has(hashKey)) {
        this.citationIndex.set(hashKey, new Set());
      }
      this.citationIndex.get(hashKey)!.add(id);
    }

    // 5. Topic & Subtopic Indexing
    const loc = record.hierarchyLocation;
    const topics = [loc.chapter, loc.topic, loc.subtopic].filter(Boolean);
    topics.forEach(t => {
      const normalized = t.toLowerCase();
      if (!this.topicIndex.has(normalized)) {
        this.topicIndex.set(normalized, new Set());
      }
      this.topicIndex.get(normalized)!.add(id);
    });

    // 6. Rule Indexing
    if (record.knowledgePayload.rule || record.category === 'RULE') {
      const ruleText = record.knowledgePayload.rule || record.knowledgePayload.statement;
      const ruleKey = ruleText.slice(0, 40).toLowerCase();
      if (!this.ruleIndex.has(ruleKey)) {
        this.ruleIndex.set(ruleKey, new Set());
      }
      this.ruleIndex.get(ruleKey)!.add(id);
    }

    // 7. Keyword Token Indexing
    const textToTokenize = [
      record.knowledgePayload.title,
      record.knowledgePayload.statement,
      record.knowledgePayload.rule,
      record.knowledgePayload.dosha,
      record.knowledgePayload.remedy,
      ...record.knowledgePayload.targetZones,
      ...record.knowledgePayload.targetPlanets,
      ...record.knowledgePayload.targetChakras
    ].filter(Boolean).join(" ");

    const tokens = this.tokenize(textToTokenize);
    tokens.forEach(token => {
      if (!this.keywordIndex.has(token)) {
        this.keywordIndex.set(token, new Set());
      }
      this.keywordIndex.get(token)!.add(id);
    });
  }

  /**
   * Search Wrappers — Prepared structures for future query algorithms
   */

  public searchByKeyword(keyword: string): string[] {
    const tokens = this.tokenize(keyword);
    if (tokens.length === 0) return [];

    let matchingIds: Set<string> | null = null;
    tokens.forEach(token => {
      const ids = this.keywordIndex.get(token) || new Set();
      if (matchingIds === null) {
        matchingIds = new Set(ids);
      } else {
        // Intersect
        matchingIds = new Set(Array.from(matchingIds).filter(id => ids.has(id)));
      }
    });

    return matchingIds ? Array.from(matchingIds) : [];
  }

  public searchByTopic(topic: string): string[] {
    const norm = topic.toLowerCase();
    const result = new Set<string>();
    this.topicIndex.forEach((ids, key) => {
      if (key.includes(norm)) {
        ids.forEach(id => result.add(id));
      }
    });
    return Array.from(result);
  }

  public searchByCitation(citationOrHash: string): string[] {
    const key = citationOrHash.toLowerCase();
    const ids = this.citationIndex.get(key);
    return ids ? Array.from(ids) : [];
  }

  public searchByAuthor(authorName: string): string[] {
    const norm = authorName.toLowerCase();
    const result = new Set<string>();
    this.authorIndex.forEach((ids, key) => {
      if (key.includes(norm)) {
        ids.forEach(id => result.add(id));
      }
    });
    return Array.from(result);
  }

  public searchByDomain(domain: KnowledgeDomain): string[] {
    const ids = this.domainIndex.get(domain);
    return ids ? Array.from(ids) : [];
  }

  public searchByCategory(category: VaultKnowledgeCategory): string[] {
    const ids = this.categoryIndex.get(category);
    return ids ? Array.from(ids) : [];
  }

  public getIndexStats(): ISearchIndexStats {
    let totalIndexed = 0;
    const allRecords = new Set<string>();
    this.domainIndex.forEach(ids => ids.forEach(id => allRecords.add(id)));
    totalIndexed = allRecords.size;

    return {
      totalIndexedRecords: totalIndexed,
      keywordTokensCount: this.keywordIndex.size,
      topicTokensCount: this.topicIndex.size,
      citationIndexCount: this.citationIndex.size,
      ruleIndexCount: this.ruleIndex.size,
      authorIndexCount: this.authorIndex.size,
      domainIndexCount: this.domainIndex.size
    };
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, "")
      .split(/\s+/)
      .filter(t => t.length > 2);
  }

  public clear(): void {
    this.keywordIndex.clear();
    this.topicIndex.clear();
    this.citationIndex.clear();
    this.ruleIndex.clear();
    this.authorIndex.clear();
    this.domainIndex.clear();
    this.categoryIndex.clear();
  }
}

export const knowledgeSearchIndexer = KnowledgeSearchIndexer.getInstance();
