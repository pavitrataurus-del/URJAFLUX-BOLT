// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE VAULT MASTER STORE (PHASE 2)
// Single Source of Truth Engine supporting Multi-Domain Structured Knowledge
// ============================================================================

import { 
  IVaultKnowledgeRecord, 
  IPublicVaultRecordView, 
  KnowledgeDomain, 
  VaultKnowledgeCategory,
  IVaultSourceMetadata,
  IKnowledgeHierarchyNode,
  IVaultKnowledgePayload,
  IVaultConfidenceScore,
  IVaultEvidence,
  IVaultCitation,
  IFounderNote
} from "../types/vaultRecord.types";
import { KnowledgeHierarchyManager } from "../hierarchy/KnowledgeHierarchyManager";
import { KnowledgeRelationshipManager } from "../relationships/KnowledgeRelationshipManager";
import { KnowledgeVersionManager } from "../versioning/KnowledgeVersionManager";
import { KnowledgeSearchIndexer } from "../search/KnowledgeSearchIndexer";
import { IStructuredKnowledgeItem } from "../../knowledge_ingestion/types/knowledgePipeline.types";

const MASTER_VAULT_STORAGE_KEY = "urjaflux_knowledge_vault_master_records_v2";

export class KnowledgeVaultStore {
  private static instance: KnowledgeVaultStore;
  private records: Map<string, IVaultKnowledgeRecord> = new Map();

  private hierarchyManager = KnowledgeHierarchyManager.getInstance();
  private relationshipManager = KnowledgeRelationshipManager.getInstance();
  private versionManager = KnowledgeVersionManager.getInstance();
  private searchIndexer = KnowledgeSearchIndexer.getInstance();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): KnowledgeVaultStore {
    if (!KnowledgeVaultStore.instance) {
      KnowledgeVaultStore.instance = new KnowledgeVaultStore();
    }
    return KnowledgeVaultStore.instance;
  }

  private loadFromStorage() {
    try {
      if (typeof localStorage === "undefined") return;
      const raw = localStorage.getItem(MASTER_VAULT_STORAGE_KEY);
      if (raw) {
        const parsed: IVaultKnowledgeRecord[] = JSON.parse(raw);
        parsed.forEach(r => {
          this.records.set(r.recordId, r);
          this.hierarchyManager.registerRecord(r);
          this.searchIndexer.indexRecord(r);
        });
        // Re-build relationships
        parsed.forEach(r => {
          this.relationshipManager.autoRegisterRecordRelationships(r, Array.from(this.records.values()));
        });
      }
    } catch (err) {
      console.error("[KnowledgeVaultStore] Failed loading master vault records", err);
    }
  }

  private saveToStorage() {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(
        MASTER_VAULT_STORAGE_KEY,
        JSON.stringify(Array.from(this.records.values()))
      );
    } catch (err) {
      console.error("[KnowledgeVaultStore] Failed saving master vault records", err);
    }
  }

  /**
   * Converts a Founder-Approved Phase 1 Knowledge Item into a full Phase 2 Structured Vault Record
   */
  public storeApprovedItem(
    item: IStructuredKnowledgeItem,
    approvedBy: string,
    founderComments?: string
  ): IVaultKnowledgeRecord {
    const recordId = `VAULT-${item.id}`;
    const timestamp = new Date().toISOString();

    const sourceMetadata: IVaultSourceMetadata = {
      sourceId: item.sourceId,
      bookTitle: item.citation.sourceTitle || "Canonical Shastra Work",
      authorInfo: {
        authorId: `AUTH-${item.citation.author}`,
        authorName: item.citation.author || "Canonical Authority",
        credibilityScore: 99.0,
        primaryAffiliation: "Ancient Shastra Repository"
      },
      edition: item.citation.edition || "1st Edition",
      publicationYear: 2026,
      language: "Sanskrit / English",
      domain: item.domain,
      isbnOrRef: `REF-${item.sourceId}`,
      fileSizeBytes: 1024,
      checksum: item.citation.traceabilityHash
    };

    const hierarchyLocation: IKnowledgeHierarchyNode = {
      domain: item.domain,
      bookTitle: item.citation.sourceTitle,
      chapter: item.chapterSection || "General Principles",
      topic: `${item.domain} ${item.itemType}s`,
      subtopic: item.targetZones.length > 0 ? item.targetZones.join(", ") : "General",
      nodePath: `${item.domain} > ${item.citation.sourceTitle} > ${item.chapterSection}`
    };

    const category: VaultKnowledgeCategory = item.itemType as VaultKnowledgeCategory;

    const knowledgePayload: IVaultKnowledgePayload = {
      title: item.title,
      statement: item.content,
      rule: item.itemType === 'RULE' ? item.content : undefined,
      dosha: item.itemType === 'DOSHA' ? item.content : undefined,
      remedy: item.itemType === 'REMEDY' ? item.content : undefined,
      cause: item.conditions.length > 0 ? item.conditions.join("; ") : undefined,
      effect: item.itemType === 'POSITIVE_FINDING' ? item.content : undefined,
      conditions: item.conditions,
      exceptions: item.exceptions,
      remedies: item.remedies,
      alternativeRemedies: [],
      contraindications: [],
      targetZones: item.targetZones,
      targetPlanets: item.targetPlanets,
      targetChakras: item.targetChakras,
      targetElements: []
    };

    const confidence: IVaultConfidenceScore = {
      score: item.confidenceScore || 0.95,
      qualitativeLevel: item.confidenceScore > 0.9 ? 'ABSOLUTE_CANONICAL' : 'HIGH_AUTHORITY',
      evidencePriority: item.evidencePriority || 'HIGH'
    };

    const evidence: IVaultEvidence = {
      verbatimQuote: item.rawQuote || item.content,
      rawSnippet: item.content,
      pageNumber: item.pageNumber,
      lineStart: item.lineStart,
      lineEnd: item.lineEnd,
      paragraphRef: item.citation.paragraphRef,
      chapterSection: item.chapterSection
    };

    const citation: IVaultCitation = {
      citationId: item.citation.citationId,
      sourceId: item.sourceId,
      bookTitle: item.citation.sourceTitle,
      authorName: item.citation.author,
      edition: item.citation.edition,
      pageNumber: item.pageNumber,
      lineStart: item.lineStart,
      lineEnd: item.lineEnd,
      paragraphRef: item.citation.paragraphRef,
      chapterSection: item.chapterSection,
      exactEvidenceQuote: item.citation.exactEvidenceQuote,
      traceabilityHash: item.citation.traceabilityHash
    };

    const founderNotes: IFounderNote = {
      approvedBy,
      approvedAt: timestamp,
      founderComments,
      privacyLevel: 'INTERNAL_EVIDENCE_ONLY',
      editHistory: []
    };

    const immutableHash = item.citation.traceabilityHash;

    const versionInfo = this.versionManager.createInitialVersion();

    const record: IVaultKnowledgeRecord = {
      recordId,
      immutableHash,
      approvalStatus: 'APPROVED',
      versionInfo,
      auditHistory: [
        {
          auditId: `AUD-INIT-${recordId}`,
          timestamp,
          action: "FOUNDER_APPROVED",
          actor: approvedBy,
          notes: founderComments || "Approved by Founder",
          recordHashAtAction: immutableHash
        }
      ],
      sourceMetadata,
      hierarchyLocation,
      category,
      knowledgePayload,
      confidence,
      evidence,
      citation,
      relationships: [],
      founderNotes,
      crossReferences: [],
      relatedDomains: [item.domain]
    };

    this.records.set(recordId, record);
    this.hierarchyManager.registerRecord(record);
    this.searchIndexer.indexRecord(record);
    this.relationshipManager.autoRegisterRecordRelationships(record, Array.from(this.records.values()));

    this.saveToStorage();
    return record;
  }

  /**
   * Retrieves full internal record (Single Source of Truth)
   */
  public getRecordById(recordId: string): IVaultKnowledgeRecord | undefined {
    return this.records.get(recordId);
  }

  /**
   * Founder Privacy Rule Enforcement: Returns public presentation view record
   * Omits internal book name, author ref, and exact internal lines.
   */
  public getPublicViewRecord(recordId: string): IPublicVaultRecordView | undefined {
    const record = this.records.get(recordId);
    if (!record) return undefined;

    return {
      recordId: record.recordId,
      domain: record.sourceMetadata.domain,
      category: record.category,
      title: record.knowledgePayload.title,
      statement: record.knowledgePayload.statement,
      rule: record.knowledgePayload.rule,
      dosha: record.knowledgePayload.dosha,
      cause: record.knowledgePayload.cause,
      effect: record.knowledgePayload.effect,
      conditions: record.knowledgePayload.conditions,
      exceptions: record.knowledgePayload.exceptions,
      remedies: record.knowledgePayload.remedies,
      alternativeRemedies: record.knowledgePayload.alternativeRemedies,
      contraindications: record.knowledgePayload.contraindications,
      confidenceLevel: record.confidence.qualitativeLevel,
      evidenceHash: record.immutableHash,
      version: record.versionInfo.version
    };
  }

  /**
   * Query Vault Records with filters
   */
  public queryVault(filters?: {
    domain?: KnowledgeDomain;
    category?: VaultKnowledgeCategory;
    zone?: string;
    planet?: string;
    searchQuery?: string;
  }): IVaultKnowledgeRecord[] {
    let list = Array.from(this.records.values());

    if (filters?.domain) {
      list = list.filter(r => r.sourceMetadata.domain === filters.domain);
    }

    if (filters?.category) {
      list = list.filter(r => r.category === filters.category);
    }

    if (filters?.zone) {
      const z = filters.zone.toUpperCase();
      list = list.filter(r => r.knowledgePayload.targetZones.some(tz => tz.toUpperCase() === z));
    }

    if (filters?.planet) {
      const p = filters.planet.toLowerCase();
      list = list.filter(r => r.knowledgePayload.targetPlanets.some(tp => tp.toLowerCase() === p));
    }

    if (filters?.searchQuery) {
      const matchedIds = this.searchIndexer.searchByKeyword(filters.searchQuery);
      list = list.filter(r => matchedIds.includes(r.recordId));
    }

    return list;
  }

  public getAllRecords(): IVaultKnowledgeRecord[] {
    return Array.from(this.records.values());
  }

  public getVaultStats() {
    const records = Array.from(this.records.values());
    const domainBreakdown: Record<string, number> = {};
    const categoryBreakdown: Record<string, number> = {};

    records.forEach(r => {
      const d = r.sourceMetadata.domain;
      const c = r.category;
      domainBreakdown[d] = (domainBreakdown[d] || 0) + 1;
      categoryBreakdown[c] = (categoryBreakdown[c] || 0) + 1;
    });

    const indexStats = this.searchIndexer.getIndexStats();
    const totalRelationships = this.relationshipManager.getAllRelationships().length;

    return {
      totalRecords: records.length,
      domainBreakdown,
      categoryBreakdown,
      totalRelationships,
      searchIndexStats: indexStats,
      singleSourceOfTruthStatus: "ACTIVE_VERIFIED"
    };
  }

  public clear(): void {
    this.records.clear();
    this.hierarchyManager.clear();
    this.relationshipManager.clear();
    this.searchIndexer.clear();
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(MASTER_VAULT_STORAGE_KEY);
    }
  }
}

export const knowledgeVaultStore = KnowledgeVaultStore.getInstance();
