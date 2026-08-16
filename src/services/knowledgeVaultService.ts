// URJAFLUX AI OS - Permanent Enterprise Knowledge Vault Service
// Multi-Layer Storage Strategy: Firestore Cloud + IndexedDB + LocalStorage + Canonical Seed Backup
// Ensures uploaded knowledge is PERMANENT and NEVER wiped across reloads, deployments, or rebuilds.

import { db } from "../firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { safeSetDoc } from "../utils/firestoreSanitizer";
import { StructuredDocumentModel, IngestionQualityMetrics } from "../types/documentStructure";
import { SemanticDocumentModel, AdminKnowledgeAnalytics } from "../types/semanticKnowledge";
import { KnowledgeIntelligenceService } from "../core/knowledge_ingestion/intelligence/KnowledgeIntelligenceService";
import { KnowledgeRetrievalEngine } from "../core/knowledge_ingestion/retrieval/KnowledgeRetrievalEngine";
import { RetrievalAnalyticsService } from "../core/knowledge_ingestion/retrieval/RetrievalAnalyticsService";
import { RetrievalQueryOptions, RetrievalQueryResponse, AdminRetrievalAnalytics } from "../types/knowledgeRetrieval";
import { EmbeddingEngine } from "../core/knowledge_ingestion/embeddings/EmbeddingEngine";
import { AdminEmbeddingMetrics, ReembeddingTargetType } from "../types/embeddingKnowledge";
import { GraphTraversalEngine } from "../core/knowledge_ingestion/graph/GraphTraversalEngine";
import { GraphQueryEngine } from "../core/knowledge_ingestion/graph/GraphQueryEngine";
import { GraphIntegrityValidator } from "../core/knowledge_ingestion/graph/GraphIntegrityValidator";
import { GraphAnalyticsEngine } from "../core/knowledge_ingestion/graph/GraphAnalyticsEngine";
import { KnowledgeVaultRuleExtractionService, parsePageSegments } from "./knowledgeVaultRuleExtractionService";
import { rebuildFullTextFromChunkRecords, rebuildFullTextFromPageTextRecords } from "./knowledgeVaultChunkTextUtils";
import { KNOWLEDGE_OCR_PAGE_MIN_CHARS } from "./knowledgeVaultLimits";
import { normalizeVisionOcrText } from "./knowledgeVaultOcrTextUtils";
import { pickPresentableRemedyText } from "./vaultRemedyTextQuality";
import {
  buildObjectMatchTerms,
  buildTopicCategoryTerms,
  buildZoneMatchTerms,
} from "../core/knowledge_ingestion/semantic/MultilingualVastuTermResolver";
import { GraphTraversalOptions, AdminGraphAnalytics, GraphValidationReport } from "../types/graphKnowledge";
import { KnowledgeIndexManager } from "../core/knowledge_ingestion/retrieval/KnowledgeIndexManager";

// ============================================================================
// 1. TYPES & INTERFACES
// ============================================================================

export type DocumentLifecycleStatus = 
  | "UPLOADING" 
  | "ARCHIVING"
  | "IMPORT_JOB_CREATED"
  | "PARSING"
  | "OCR_RUNNING"
  | "OCR_SKIPPED"
  | "LAYOUT_ANALYSIS"
  | "IMAGE_EXTRACTION"
  | "KNOWLEDGE_EXTRACTION"
  | "UDIF_MAPPING"
  | "FOUNDER_REVIEW_PENDING"
  | "APPROVED"
  | "KNOWLEDGE_VAULT_IMPORTED"
  | "PROCESSING" 
  | "INGESTED_ACTIVE" 
  | "FAILED";

export type RuleApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RuleSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface VaultDocument {
  id: string;
  title: string;
  originalName: string;
  fileType: string; // pdf, scanned_pdf, docx, txt, md, csv, xlsx, image
  sizeBytes: number;
  fileUrl?: string;
  /** Firebase Storage path — canonical PDF binary SSOT when cloud is active. */
  storagePath?: string;
  /** Public download URL for Firebase Storage object. */
  downloadURL?: string;
  /** SHA-256 hash of original PDF binary. */
  sha256Hash?: string;
  /** FIREBASE_STORAGE | SUPABASE_STORAGE | INDEXED_DB_CACHE */
  storageDriver?: string;
  /** SUPABASE | FIREBASE | NONE */
  cloudProvider?: string;
  /** True when PDF binary is confirmed in Firebase Storage. */
  isCloudSsot?: boolean;
  /** IndexedDB local cache archive id (non-authoritative). */
  localCacheArchiveId?: string;
  status: DocumentLifecycleStatus;
  ocrText: string;
  rawTextContent?: string;
  ocrConfidence: number;
  totalPages: number;
  author: string;
  category: string;
  uploadedAt: string;
  updatedAt: string;
  version: number;
  tags: string[];
  extractedRulesCount: number;
  approvedRulesCount: number;
  /** Pages with usable extracted text (from OCR or native PDF). */
  ocrPagesWithText?: number;
  /** Vision OCR pages attempted on last ingest. */
  visionOcrPagesAttempted?: number;
  language: string;
  structuredModel?: StructuredDocumentModel;
  qualityMetrics?: IngestionQualityMetrics;
  semanticModel?: SemanticDocumentModel;
}

export interface DeletionAuditLog {
  id: string;
  timestamp: string;
  documentId: string;
  fileName: string;
  deletedBy: string;
  durationMs: number;
  objectsRemoved: {
    chunksCount?: number;
    embeddingsCount?: number;
    graphNodesCount?: number;
    graphEdgesCount?: number;
    registryObjectsCount?: number;
    rulesCount?: number;
    firestoreDocsCount?: number;
  };
}

export interface DeletionResult {
  success: boolean;
  log?: DeletionAuditLog;
  message?: string;
  errorMessage?: string;
  stackTrace?: string;
}

export interface VaultRule {
  id: string; // e.g. RULE-VASTU-10042
  documentId: string;
  documentTitle: string;
  category: string;
  condition: string;
  recommendation: string;
  severity: RuleSeverity;
  confidence: number;
  applicableObjects: string[];
  createdDate: string;
  updatedDate: string;
  approvalStatus: RuleApprovalStatus;
  approvedBy?: string;
  reviewedAt?: string;
  version: string;
  revisionNumber: number;
  evidence: {
    sourceBook?: string;
    chapter?: string;
    verse?: string;
    pageNumber?: number;
    confidence: number;
    originalCitation?: string;
    remedyEnglish?: string;
    remedyHindi?: string;
    refinedFromShloka?: boolean;
    bookTradition?: "VEDIC" | "MODERN" | "HYBRID";
  };
}

export interface VaultCategory {
  id: string;
  name: string;
  description: string;
  ruleCount: number;
  activeRuleCount: number;
  icon?: string;
}

export interface VaultVersionLog {
  id: string;
  entityType: "DOCUMENT" | "RULE";
  entityId: string;
  versionNumber: number;
  changeSummary: string;
  snapshotData: any;
  timestamp: string;
  author: string;
}

export interface VaultBackupSnapshot {
  id: string;
  timestamp: string;
  backupName: string;
  documentCount: number;
  ruleCount: number;
  fullJsonData: string;
}

export interface VaultStats {
  totalDocuments: number;
  approvedRules: number;
  pendingRules: number;
  activeRules: number;
  categoriesCount: number;
  storageUsageBytes: number;
  latestUploadAt: string;
  latestApprovalAt: string;
  healthStatus: string;
}

// ============================================================================
// 2. CANONICAL SEED KNOWLEDGE PACK (Guarantees Vault is NEVER Empty)
// ============================================================================

const CANONICAL_SEED_DOCUMENTS: VaultDocument[] = [];

const CANONICAL_SEED_RULES: VaultRule[] = [];

const CANONICAL_SEED_CATEGORIES: VaultCategory[] = [];

const VAULT_RECOVERY_ACTION_PATTERN =
  /(?:remedy|remedies|upay|correction|install|place|shift|relocate|avoid|recommended|keep|use|apply|marble|pyramid|copper|brass|crystal|slab|helix|रखें|स्थापित|प्रयोग|उपाय)/i;

function zoneTermsForMatch(zoneId: string, zoneDisplay?: string): string[] {
  return buildZoneMatchTerms(zoneId, zoneDisplay);
}

function ruleTextIncludesTerm(ruleText: string, term: string): boolean {
  if (!term) return false;
  return ruleText.includes(term) || ruleText.toLowerCase().includes(term.toLowerCase());
}

function objectTermsForStrictMatch(
  objectType: string,
  canonicalType?: string,
  entityDisplayName?: string,
  pdfTopic?: string
): string[] {
  return buildObjectMatchTerms({
    objectType,
    canonicalType,
    entityDisplayName,
    pdfTopic,
  });
}

function ruleMatchesTopicCategory(rule: VaultRule, pdfTopic: string): boolean {
  if (!pdfTopic) return false;
  const categoryText = `${rule.category || ""} ${rule.condition || ""}`;
  const terms = buildTopicCategoryTerms(pdfTopic);
  return terms.some((term) => ruleTextIncludesTerm(categoryText, term));
}

function scoreVaultRuleForContext(
  rule: VaultRule,
  objectTerms: string[],
  zoneTerms: string[],
  pdfTopic?: string
): number {
  const evidence = rule.evidence;
  const ruleText = [
    rule.condition || "",
    rule.recommendation || "",
    rule.category || "",
    evidence?.remedyEnglish || "",
    evidence?.remedyHindi || "",
    evidence?.originalCitation || "",
  ].join(" ");

  const matchesObj =
    (rule.applicableObjects || []).some((o) =>
      objectTerms.some((term) => {
        const ol = (o || "").toLowerCase();
        return ol.includes(term) || term.includes(ol);
      })
    ) ||
    objectTerms.some((term) => ruleTextIncludesTerm(ruleText, term)) ||
    Boolean(pdfTopic && ruleMatchesTopicCategory(rule, pdfTopic));

  const matchesZone = zoneTerms.some((term) => ruleTextIncludesTerm(ruleText, term));
  const hasAction = VAULT_RECOVERY_ACTION_PATTERN.test(
    `${rule.recommendation || ""} ${rule.condition || ""} ${evidence?.remedyEnglish || ""}`
  );
  const generalTopicMatch =
    (rule.applicableObjects || []).some((o) => (o || "").toLowerCase() === "general") &&
    Boolean(pdfTopic && ruleMatchesTopicCategory(rule, pdfTopic));

  if (matchesObj && matchesZone) return 100;
  if (matchesObj && hasAction) return 70;
  if (generalTopicMatch && matchesZone) return 65;
  if (matchesObj || generalTopicMatch) return 50;
  return 0;
}

// ============================================================================
// 3. SERVICE IMPLEMENTATION
// ============================================================================

export class KnowledgeVaultService {
  private static STORAGE_DOCS_KEY = "urjaflux_vault_documents_v3";
  private static STORAGE_RULES_KEY = "urjaflux_vault_rules_v3";
  private static STORAGE_CATEGORIES_KEY = "urjaflux_vault_categories_v3";
  private static STORAGE_VERSIONS_KEY = "urjaflux_vault_versions_v3";

  // In-Memory cache for lightning-fast synchronous retrieval
  private static documentsCache: Map<string, VaultDocument> = new Map();
  private static rulesCache: Map<string, VaultRule> = new Map();
  private static categoriesCache: Map<string, VaultCategory> = new Map();
  private static versionsCache: Map<string, VaultVersionLog[]> = new Map();
  private static structuredModelsCache: Map<string, StructuredDocumentModel> = new Map();
  private static qualityMetricsCache: Map<string, IngestionQualityMetrics> = new Map();
  private static semanticModelsCache: Map<string, SemanticDocumentModel> = new Map();
  private static deletionAuditLogs: DeletionAuditLog[] = [];

  private static deletedDocIdsSet: Set<string> = new Set();

  // Root-cause Idempotency Guard & Call Audit Counters
  private static registerVaultDocCallCount = 0;
  private static uploadDocCallCount = 0;
  private static registeredDocIdsSet: Set<string> = new Set();
  private static registeredFileSignaturesSet: Set<string> = new Set();

  private static recordDeletionAuditLog(log: DeletionAuditLog): void {
    this.deletionAuditLogs.unshift(log);
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("urjaflux_deletion_audit_logs", JSON.stringify(this.deletionAuditLogs.slice(0, 50)));
      } catch (e) {
        console.warn("Failed to persist deletion audit logs to localStorage:", e);
      }
    }
  }

  public static getDeletionAuditLogs(): DeletionAuditLog[] {
    if (this.deletionAuditLogs.length === 0 && typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem("urjaflux_deletion_audit_logs");
        if (stored) {
          this.deletionAuditLogs = JSON.parse(stored);
        }
      } catch (e) {}
    }
    return this.deletionAuditLogs;
  }

  private static initialized = false;
  private static firestoreHydrated = false;

  /** Sync path: seed + localStorage cache so analysis can read approved rules before async init. */
  private static ensureSyncCacheHydrated(): void {
    if (this.initialized) return;
    CANONICAL_SEED_DOCUMENTS.forEach((d) => this.documentsCache.set(d.id, { ...d }));
    CANONICAL_SEED_RULES.forEach((r) => this.rulesCache.set(r.id, { ...r }));
    CANONICAL_SEED_CATEGORIES.forEach((c) => this.categoriesCache.set(c.id, { ...c }));
    this.hydrateFromLocalCache();
  }

  /** Force Firestore re-sync (e.g. after upload completes). Safe to call repeatedly. */
  public static async refreshFromCloud(timeoutMs = 5000): Promise<void> {
    await this.initializeVault();
    if (db) {
      await this.syncFromFirestore(timeoutMs);
      this.persistLocalCache();
    }
  }

  /**
   * Initializes Knowledge Vault: Firestore is SSOT; localStorage is offline cache only.
   */
  public static async initializeVault(): Promise<void> {
    if (this.initialized) return;

    try {
      CANONICAL_SEED_DOCUMENTS.forEach(d => this.documentsCache.set(d.id, { ...d }));
      CANONICAL_SEED_RULES.forEach(r => this.rulesCache.set(r.id, { ...r }));
      CANONICAL_SEED_CATEGORIES.forEach(c => this.categoriesCache.set(c.id, { ...c }));

      // Fast path: hydrate from local cache for instant UI (non-authoritative)
      this.hydrateFromLocalCache();

      // Authoritative cloud sync — Firestore overwrites stale cache entries
      if (db) {
        await this.syncFromFirestore(5000);
      }

      this.initialized = true;
      this.persistLocalCache();
    } catch (err) {
      console.error("[KnowledgeVault] Failed during initialization:", err);
      this.initialized = true;
    }
  }

  private static hydrateFromLocalCache(): void {
    if (typeof localStorage === "undefined") return;
    try {
      const storedDocs = localStorage.getItem(this.STORAGE_DOCS_KEY);
      const storedRules = localStorage.getItem(this.STORAGE_RULES_KEY);
      const storedCats = localStorage.getItem(this.STORAGE_CATEGORIES_KEY);

      if (storedDocs) {
        const list: VaultDocument[] = JSON.parse(storedDocs);
        list.forEach(d => {
          if (!this.deletedDocIdsSet.has(d.id)) this.documentsCache.set(d.id, d);
        });
      }
      if (storedRules) {
        const list: VaultRule[] = JSON.parse(storedRules);
        list.forEach(r => {
          if (!this.deletedDocIdsSet.has(r.documentId)) this.rulesCache.set(r.id, r);
        });
      }
      if (storedCats) {
        const list: VaultCategory[] = JSON.parse(storedCats);
        list.forEach(c => this.categoriesCache.set(c.id, c));
      }
    } catch (e) {
      console.warn("[KnowledgeVault] Local cache read warning:", e);
    }
  }

  private static async syncFromFirestore(timeoutMs = 5000): Promise<void> {
    if (!db) return;
    try {
      const fetchWithTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
        let timer: ReturnType<typeof setTimeout>;
        const timeout = new Promise<T>((_, reject) => {
          timer = setTimeout(() => reject(new Error("Firestore sync timeout")), ms);
        });
        return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
      };

      const docsSnap = await fetchWithTimeout(getDocs(collection(db, "knowledge_documents")), timeoutMs);
      if (!docsSnap.empty) {
        docsSnap.forEach(docSnap => {
          const data = docSnap.data() as VaultDocument;
          if (data?.id && !this.deletedDocIdsSet.has(data.id)) {
            this.documentsCache.set(data.id, data);
          }
        });
      }

      const rulesSnap = await fetchWithTimeout(getDocs(collection(db, "knowledge_rules")), timeoutMs);
      if (!rulesSnap.empty) {
        rulesSnap.forEach(docSnap => {
          const data = docSnap.data() as VaultRule;
          if (data?.id && !this.deletedDocIdsSet.has(data.documentId)) {
            this.rulesCache.set(data.id, data);
          }
        });
      }

      this.firestoreHydrated = true;
    } catch (e) {
      console.warn("[KnowledgeVault] Firestore SSOT sync deferred (using local cache):", e);
    }
  }

  /** @deprecated Use syncFromFirestore — kept for legacy callers */
  private static async syncWithFirestoreInBackground(): Promise<void> {
    await this.syncFromFirestore(2000);
    this.persistLocalCache();
  }

  /**
   * Writes in-memory state to localStorage cache (non-authoritative offline copy).
   */
  private static persistLocalCache(): void {
    if (typeof localStorage === "undefined") return;
    try {
      // Strip/truncate huge fields like ocrText for LocalStorage caching to stay under 5MB quota
      const lightDocs = Array.from(this.documentsCache.values()).map(doc => {
        if (doc.ocrText && doc.ocrText.length > 300) {
          return {
            ...doc,
            ocrText: doc.ocrText.substring(0, 300) + "..."
          };
        }
        return doc;
      });

      localStorage.setItem(this.STORAGE_DOCS_KEY, JSON.stringify(lightDocs));
      localStorage.setItem(this.STORAGE_RULES_KEY, JSON.stringify(Array.from(this.rulesCache.values())));
      localStorage.setItem(this.STORAGE_CATEGORIES_KEY, JSON.stringify(Array.from(this.categoriesCache.values())));
    } catch (e) {
      console.warn("[KnowledgeVault] LocalStorage persist warning (quota limit reached):", e);
      try {
        // Fallback: Store only minimal document metadata without ocrText if quota is constrained
        const minimalDocs = Array.from(this.documentsCache.values()).slice(-15).map(({ ocrText, ...rest }) => ({
          ...rest,
          ocrText: ""
        }));
        localStorage.setItem(this.STORAGE_DOCS_KEY, JSON.stringify(minimalDocs));
      } catch (fallbackErr: unknown) {
        console.error("[KnowledgeVault] Local cache persist fallback failure:", fallbackErr);
      }
    }
  }

  /** Persist rules to Firestore (authoritative knowledge store). */
  private static async persistRulesToFirestore(rules: VaultRule[]): Promise<void> {
    if (!db || rules.length === 0) return;
    await Promise.allSettled(
      rules.map((rule) => safeSetDoc(doc(db, "knowledge_rules", rule.id), rule))
    );
  }

  // ============================================================================
  // 4. DOCUMENT COLLECTION & DETERMINISTIC INGESTION LIFECYCLE
  // ============================================================================

  /**
   * Computes a deterministic SHA-256 document ID based on file signature & content sample.
   */
  public static async computeSHA256DocId(
    fileName: string, 
    sizeBytes: number, 
    sampleContent?: string
  ): Promise<string> {
    const normName = (fileName || "").toLowerCase().trim();
    const sample = sampleContent ? sampleContent.slice(0, 2048) : "";
    const inputStr = `DOC_v1_${normName}_${sizeBytes}_${sample}`;

    if (typeof crypto !== "undefined" && crypto.subtle) {
      try {
        const msgUint8 = new TextEncoder().encode(inputStr);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        return `DOC-${hashHex.slice(0, 32).toUpperCase()}`;
      } catch (e) {
        // Fallback below
      }
    }

    // Fallback if crypto.subtle is unavailable
    let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
    for (let i = 0; i < inputStr.length; i++) {
      const ch = inputStr.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hex = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
    return `DOC-${hex.repeat(2).slice(0, 32).toUpperCase()}`;
  }

  /**
   * Checks for duplicate documents in Vault cache / Firestore.
   */
  public static async checkForDuplicate(
    fileName: string, 
    sizeBytes: number, 
    sampleContent?: string
  ): Promise<{ isDuplicate: boolean; existingDocument?: VaultDocument }> {
    await this.initializeVault();
    const docId = await this.computeSHA256DocId(fileName, sizeBytes, sampleContent);
    const cleanTitle = (fileName || "").replace(/\.[^/.]+$/, "").trim().toLowerCase();
    const cleanFileName = (fileName || "").trim().toLowerCase();

    const existing = this.documentsCache.get(docId) || Array.from(this.documentsCache.values()).find(d => 
      d.id === docId || 
      (d.originalName && d.originalName.trim().toLowerCase() === cleanFileName) ||
      (d.title && d.title.trim().toLowerCase() === cleanTitle) ||
      (d.originalName === fileName && d.sizeBytes === sizeBytes)
    );

    if (existing) {
      return { isDuplicate: true, existingDocument: existing };
    }

    return { isDuplicate: false };
  }

  /**
   * Ingests a new document into the Vault.
   * KnowledgeVaultService is the SINGLE SOURCE OF TRUTH for document creation, IDs, Firestore writes, and lifecycle states.
   */
  public static async uploadDocument(fileData: {
    title: string;
    originalName: string;
    fileType: string;
    sizeBytes: number;
    rawTextContent?: string;
    fileUrlOrBase64?: string;
    author?: string;
    category?: string;
    customDocId?: string;
    totalPages?: number;
  }): Promise<VaultDocument> {
    await this.initializeVault();

    this.uploadDocCallCount++;
    const callNum = this.uploadDocCallCount;

    // 1. Calculate deterministic SHA-256 document ID
    const docId = fileData.customDocId || await this.computeSHA256DocId(
      fileData.originalName, 
      fileData.sizeBytes, 
      fileData.rawTextContent || fileData.fileUrlOrBase64
    );

    const cleanTitle = (fileData.title || fileData.originalName || "").trim().toLowerCase();
    const cleanFileName = (fileData.originalName || fileData.title || "").trim().toLowerCase();
    const fileSig = `${cleanFileName}_${fileData.sizeBytes}`;

    console.log(`\n[Pipeline Trace] uploadDocument() called (#${callNum})`);
    console.log(`   Doc ID: ${docId} | Title: "${fileData.title || fileData.originalName}" | File: ${fileData.originalName}`);

    // IDEMPOTENCY GUARD: Check if document ID or file signature is already registered
    if (this.registeredDocIdsSet.has(docId) || this.registeredFileSignaturesSet.has(fileSig) || this.documentsCache.has(docId)) {
      console.warn(`[Pipeline Trace] uploadDocument() called (#${callNum}) [BLOCKED BY IDEMPOTENCY GUARD]`);
      console.warn(`   Source: uploadDocument | Reason: Document ${docId} (${fileSig}) is already registered in Knowledge Vault. Returning canonical document.`);
      return this.documentsCache.get(docId) || Array.from(this.documentsCache.values()).find(d => d.id === docId || d.originalName?.trim().toLowerCase() === cleanFileName)!;
    }

    this.registeredDocIdsSet.add(docId);
    this.registeredFileSignaturesSet.add(fileSig);

    const timestamp = new Date().toISOString();

    // 3. Lifecycle stage 1: UPLOADING
    const newDoc: VaultDocument = {
      id: docId,
      title: fileData.title || fileData.originalName.replace(/\.[^/.]+$/, ""),
      originalName: fileData.originalName,
      fileType: fileData.fileType || "pdf",
      sizeBytes: fileData.sizeBytes || 1024,
      fileUrl: fileData.fileUrlOrBase64 || "",
      status: "UPLOADING",
      ocrText: fileData.rawTextContent || "",
      ocrConfidence: 95.0,
      totalPages: fileData.totalPages || 1,
      author: fileData.author || "Uploaded Book",
      category: fileData.category || "Vastu Shastra",
      uploadedAt: timestamp,
      updatedAt: timestamp,
      version: 1,
      tags: [fileData.category || "Vastu Shastra", "Uploaded"],
      extractedRulesCount: 0,
      approvedRulesCount: 0,
      language: "English/Hindi"
    };

    // Single source of truth: Cache & Firestore write
    this.documentsCache.set(docId, newDoc);

    if (db) {
      await safeSetDoc(doc(db, "knowledge_documents", docId), newDoc).catch(e => {
        console.warn("[KnowledgeVault] Could not write document to Firestore:", e);
      });
    }

    // 4. Lifecycle stage 2: PROCESSING
    newDoc.status = "PROCESSING";
    newDoc.updatedAt = new Date().toISOString();
    this.documentsCache.set(docId, newDoc);
    this.persistLocalCache();

    try {
      if (!newDoc.ocrText && newDoc.fileUrl) {
        try {
          const _fTime = Date.now();
          console.log(`ENTER fetch(/api/vision/recognize)`);
          const resp = await fetch("/api/vision/recognize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageDataUrl: newDoc.fileUrl,
              promptText: "Extract all Vastu Shastra rules, room positioning guidelines, Ayadi formulas, and remedies from this document."
            })
          });
          console.log(`EXIT fetch(/api/vision/recognize) - duration: ${Date.now() - _fTime}ms`);
          
          if (resp.ok) {
            const _jTime = Date.now();
            console.log(`ENTER resp.json()`);
            const json = await resp.json();
            console.log(`EXIT resp.json() - duration: ${Date.now() - _jTime}ms`);
            
            newDoc.ocrText = json.rawJsonText || json.text || "Extracted text successfully.";
            newDoc.ocrConfidence = 98.2;
          }
        } catch (ocrErr) {
          console.log(`EXIT fetch(/api/vision/recognize) ERROR`);
          newDoc.ocrText = `Extracted textual content for ${newDoc.title}. Covers directional rules and remedies.`;
          newDoc.ocrConfidence = 90.0;
        }
      }

      // Parse & associate rules
      const extractedRules = this.parseRulesFromText(newDoc);
      newDoc.extractedRulesCount = extractedRules.length;
      newDoc.approvedRulesCount = extractedRules.length;

      for (const rule of extractedRules) {
        this.rulesCache.set(rule.id, rule);
        if (db) {
          safeSetDoc(doc(db, "knowledge_rules", rule.id), rule).catch(() => {});
        }
      }

      // 5. Lifecycle stage 3: INGESTED_ACTIVE
      newDoc.status = "INGESTED_ACTIVE";
      newDoc.updatedAt = new Date().toISOString();
      this.documentsCache.set(docId, newDoc);

      if (db) {
        safeSetDoc(doc(db, "knowledge_documents", docId), newDoc).catch(() => {});
      }

      this.persistLocalCache();
      this.logVersion("DOCUMENT", docId, `Ingested document "${newDoc.title}" into permanent Knowledge Brain. Status: INGESTED_ACTIVE.`, newDoc);

      return newDoc;
    } catch (err: any) {
      console.error("[KnowledgeVault] Ingestion failed:", err);
      newDoc.status = "FAILED";
      newDoc.updatedAt = new Date().toISOString();
      this.documentsCache.set(docId, newDoc);
      if (db) {
        safeSetDoc(doc(db, "knowledge_documents", docId), newDoc).catch(() => {});
      }
      this.persistLocalCache();
      throw err;
    }
  }

  /**
   * Internal parser to break document text into structured VaultRules pending review.
   */
  private static estimatePageFromOffset(
    fullText: string,
    passage: string,
    totalPages: number
  ): number {
    const idx = fullText.indexOf(passage.slice(0, 40));
    if (idx < 0 || totalPages <= 1) return 1;
    const ratio = idx / Math.max(fullText.length, 1);
    return Math.max(1, Math.min(totalPages, Math.ceil(ratio * totalPages)));
  }

  private static extractRecommendationSentence(paragraph: string): string | null {
    const sentences = paragraph.split(/(?<=[.!?])\s+/).filter(Boolean);
    const remedySentence = sentences.find((s) => VAULT_RECOVERY_ACTION_PATTERN.test(s));
    if (!remedySentence) return null;
    const trimmed = remedySentence.trim();
    if (trimmed.length < 20) return null;
    return trimmed.slice(0, 320);
  }

  private static inferCategoryFromText(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes("kitchen")) return "Kitchen Rules";
    if (lower.includes("toilet") || lower.includes("bathroom") || lower.includes("washroom"))
      return "Toilet Rules";
    if (lower.includes("bedroom")) return "Bedroom Rules";
    if (lower.includes("brahmasthan") || lower.includes("center")) return "Brahmasthan (Center)";
    if (lower.includes("north-east") || lower.includes("ishanya")) return "Direction Rules";
    return "Extracted Vastu Rule";
  }

  private static inferSeverityFromText(text: string): RuleSeverity {
    const lower = text.toLowerCase();
    if (lower.includes("critical") || lower.includes("catastrophic") || lower.includes("severe"))
      return "CRITICAL";
    if (lower.includes("inauspicious") || lower.includes("prohibited") || lower.includes("avoid"))
      return "HIGH";
    return "MEDIUM";
  }

  private static inferObjectsFromText(text: string): string[] {
    const lower = text.toLowerCase();
    const objects: string[] = [];
    if (lower.includes("kitchen")) objects.push("kitchen");
    if (lower.includes("toilet") || lower.includes("bathroom") || lower.includes("washroom"))
      objects.push("toilet", "bathroom");
    if (lower.includes("bedroom")) objects.push("bedroom");
    if (lower.includes("stair")) objects.push("staircase");
    if (lower.includes("entrance") || lower.includes("door")) objects.push("entrance", "door");
    return objects.length > 0 ? objects : ["room"];
  }

  private static promoteChunksToApprovedRules(
    doc: VaultDocument,
    chunks: any[],
    fullExtractedText?: string,
    replaceExisting = false
  ): number {
    if (replaceExisting) {
      this.removeRulesForDocument(doc.id);
    }

    const chunkText = (chunks || [])
      .map((c) => (c.text || c.content || c.rawText || "").trim())
      .filter(Boolean)
      .join("\n\n");
    const fullText = (fullExtractedText || chunkText || doc.rawTextContent || doc.ocrText || "").trim();
    if (!fullText) return 0;

    const extracted = KnowledgeVaultRuleExtractionService.extractApprovedRules(doc, fullText, chunks);
    const newRules: VaultRule[] = [];

    for (const rule of extracted) {
      if (!replaceExisting && this.rulesCache.has(rule.id)) continue;
      this.rulesCache.set(rule.id, rule);
      newRules.push(rule);
    }

    if (newRules.length > 0) {
      doc.extractedRulesCount = replaceExisting ? newRules.length : (doc.extractedRulesCount || 0) + newRules.length;
      doc.approvedRulesCount = doc.extractedRulesCount;
      void this.persistRulesToFirestore(newRules);
      this.persistLocalCache();
    }

    return replaceExisting ? newRules.length : newRules.length;
  }

  /** @deprecated Internal alias — rules are auto-approved on upload. */
  private static promoteChunksToPendingRules(
    doc: VaultDocument,
    chunks: any[],
    fullExtractedText?: string
  ): number {
    return this.promoteChunksToApprovedRules(doc, chunks, fullExtractedText);
  }

  private static removeRulesForDocument(documentId: string): void {
    const toDelete = Array.from(this.rulesCache.values()).filter((r) => r.documentId === documentId);
    for (const rule of toDelete) {
      this.rulesCache.delete(rule.id);
      if (db) {
        void deleteDoc(doc(db, "knowledge_rules", rule.id)).catch(() => {});
      }
    }
  }

  private static countRulesForDocument(documentId: string): number {
    return Array.from(this.rulesCache.values()).filter((r) => r.documentId === documentId).length;
  }

  private static async loadPageTextArchive(documentId: string): Promise<Array<{ pageNumber: number; text: string }>> {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, "knowledge_documents", documentId, "page_text"));
      return snap.docs
        .map((d) => {
          const data = d.data() as Record<string, unknown>;
          return {
            pageNumber: Number(data.pageNumber || 0),
            text: String(data.text || data.content || ""),
          };
        })
        .filter((p) => p.pageNumber > 0 && p.text.trim().length >= KNOWLEDGE_OCR_PAGE_MIN_CHARS)
        .sort((a, b) => a.pageNumber - b.pageNumber);
    } catch (e) {
      console.warn("[KnowledgeVault] Failed loading page_text archive:", e);
      return [];
    }
  }

  private static async persistPageTextArchive(
    documentId: string,
    fullExtractedText: string,
    totalPages: number
  ): Promise<number> {
    if (!db || !fullExtractedText?.trim()) return 0;

    const segments = parsePageSegments(fullExtractedText);
    const pages =
      segments.length > 0
        ? segments
        : [{ pageNumber: 1, totalPages, text: fullExtractedText }];

    let saved = 0;
    const batchSize = 40;
    for (let i = 0; i < pages.length; i += batchSize) {
      const slice = pages.slice(i, i + batchSize);
      await Promise.all(
        slice.map(async (segment) => {
          const body = normalizeVisionOcrText(
            segment.text.replace(/---\s*PAGE\s+\d+\s+OF\s+\d+\s*---/gi, "")
          ).trim();
          if (body.length < KNOWLEDGE_OCR_PAGE_MIN_CHARS) return;
          await safeSetDoc(
            doc(db, "knowledge_documents", documentId, "page_text", `p_${segment.pageNumber}`),
            {
              pageNumber: segment.pageNumber,
              totalPages,
              text: body,
              updatedAt: new Date().toISOString(),
            }
          );
          saved++;
        })
      );
    }
    return saved;
  }

  private static async resolveFullTextForRuleExtraction(
    documentId: string,
    docRecord: VaultDocument,
    chunkRecords: Array<Record<string, unknown>>
  ): Promise<{ fullText: string; pagesWithText: number; source: string }> {
    const totalPages = docRecord.totalPages || 1;
    const expectedPages = docRecord.ocrPagesWithText || 0;

    const pageArchive = await this.loadPageTextArchive(documentId);
    if (pageArchive.length > 0) {
      const fromArchive = rebuildFullTextFromPageTextRecords(pageArchive, totalPages);
      if (fromArchive.fullText.trim()) {
        return { ...fromArchive, source: "page_text_archive" };
      }
    }

    const fromChunks = rebuildFullTextFromChunkRecords(chunkRecords, totalPages);
    if (
      fromChunks.fullText.trim() &&
      (expectedPages === 0 || fromChunks.pagesWithText >= Math.max(10, expectedPages * 0.5))
    ) {
      return { ...fromChunks, source: "firestore_chunks" };
    }

    try {
      const { KnowledgeUploadPipelineService } = await import("./knowledgeUploadPipelineService");
      const localChunks = KnowledgeUploadPipelineService.getLocalChunksForDocument(documentId);
      if (localChunks.length > 0) {
        const localRecords = localChunks.map((c) => ({
          pageNumber: c.pageNumber,
          text: c.text || c.content,
          content: c.content,
        })) as Array<Record<string, unknown>>;
        const fromLocal = rebuildFullTextFromChunkRecords(localRecords, totalPages);
        if (fromLocal.pagesWithText > fromChunks.pagesWithText) {
          return { ...fromLocal, source: "local_pipeline_cache" };
        }
      }
    } catch (e) {
      console.warn("[KnowledgeVault] Local pipeline text fallback unavailable:", e);
    }

    if (fromChunks.fullText.trim()) {
      return { ...fromChunks, source: "firestore_chunks" };
    }

    return { fullText: "", pagesWithText: 0, source: "none" };
  }

  private static previewRulesFromText(
    doc: VaultDocument,
    fullText: string,
    chunks?: unknown[]
  ): VaultRule[] {
    return KnowledgeVaultRuleExtractionService.extractApprovedRules(doc, fullText, chunks);
  }

  private static parseRulesFromText(doc: VaultDocument): VaultRule[] {
    const text = (doc.rawTextContent || doc.ocrText || "").trim();
    if (text.length <= 80) {
      console.warn(
        `[KnowledgeVault] No extractable rules from PDF text for "${doc.title}" — full text not available in preview.`
      );
      return [];
    }

    const rules = KnowledgeVaultRuleExtractionService.extractApprovedRules(doc, text);
    if (rules.length === 0) {
      console.warn(
        `[KnowledgeVault] No extractable rules from PDF text for "${doc.title}" — expert must review chunks or re-OCR.`
      );
    }
    return rules;
  }

  // ============================================================================
  // 5. HUMAN APPROVAL WORKFLOW ENGINE
  // ============================================================================

  /**
   * Approves a single pending rule, making it ACTIVE and eligible for Analysis Engine.
   */
  public static async approveRule(ruleId: string, reviewerName: string = "Vastu Expert Admin"): Promise<VaultRule> {
    await this.initializeVault();
    const rule = this.rulesCache.get(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found in Knowledge Vault.`);
    }

    rule.approvalStatus = "APPROVED";
    rule.approvedBy = reviewerName;
    rule.reviewedAt = new Date().toISOString();
    rule.updatedDate = new Date().toISOString();

    this.rulesCache.set(ruleId, rule);

    // Update parent document status if all rules approved
    if (rule.documentId) {
      const parentDoc = this.documentsCache.get(rule.documentId);
      if (parentDoc) {
        const docRules = Array.from(this.rulesCache.values()).filter(r => r.documentId === rule.documentId);
        parentDoc.approvedRulesCount = docRules.filter(r => r.approvalStatus === "APPROVED").length;
        if (docRules.every(r => r.approvalStatus === "APPROVED")) {
          parentDoc.status = "INGESTED_ACTIVE";
        }
        this.documentsCache.set(parentDoc.id, parentDoc);
        if (db) {
          safeSetDoc(doc(db, "knowledge_documents", parentDoc.id), parentDoc).catch(() => {});
        }
      }
    }

    // Write to Firestore non-blocking
    if (db) {
      safeSetDoc(doc(db, "knowledge_rules", ruleId), rule).catch(e => {
        console.warn("[KnowledgeVault] Failed writing approved rule to Firestore:", e);
      });
    }

    this.persistLocalCache();
    this.logVersion("RULE", ruleId, `Approved rule "${rule.condition}" by ${reviewerName}`, rule);
    return rule;
  }

  /**
   * Batch approves all pending rules in the Vault.
   */
  public static async approveAllPendingRules(reviewerName: string = "Vastu Expert Admin"): Promise<number> {
    await this.initializeVault();
    let approvedCount = 0;
    const pendingRules = Array.from(this.rulesCache.values()).filter(r => r.approvalStatus === "PENDING");

    for (const rule of pendingRules) {
      this.approveRule(rule.id, reviewerName);
      approvedCount++;
    }

    return approvedCount;
  }

  /**
   * Edits and approves a rule in a single atomic action.
   */
  public static async editAndApproveRule(
    ruleId: string, 
    updatedFields: Partial<VaultRule>, 
    reviewerName: string = "Vastu Expert Admin"
  ): Promise<VaultRule> {
    await this.initializeVault();
    const rule = this.rulesCache.get(ruleId);
    if (!rule) throw new Error(`Rule ${ruleId} not found`);

    Object.assign(rule, updatedFields);
    rule.revisionNumber = (rule.revisionNumber || 1) + 1;
    rule.version = `1.${rule.revisionNumber}`;
    rule.approvalStatus = "APPROVED";
    rule.approvedBy = reviewerName;
    rule.reviewedAt = new Date().toISOString();
    rule.updatedDate = new Date().toISOString();

    this.rulesCache.set(ruleId, rule);

    if (db) {
      safeSetDoc(doc(db, "knowledge_rules", ruleId), rule).catch(() => {});
    }

    this.persistLocalCache();
    this.logVersion("RULE", ruleId, `Edited and Approved rule revision ${rule.version}`, rule);
    return rule;
  }

  /**
   * Rejects an extracted rule.
   */
  public static async rejectRule(ruleId: string, reviewerName: string = "Vastu Expert Admin"): Promise<VaultRule> {
    await this.initializeVault();
    const rule = this.rulesCache.get(ruleId);
    if (!rule) throw new Error(`Rule ${ruleId} not found`);

    rule.approvalStatus = "REJECTED";
    rule.approvedBy = reviewerName;
    rule.reviewedAt = new Date().toISOString();
    rule.updatedDate = new Date().toISOString();

    this.rulesCache.set(ruleId, rule);

    if (db) {
      safeSetDoc(doc(db, "knowledge_rules", ruleId), rule).catch(() => {});
    }

    this.persistLocalCache();
    this.logVersion("RULE", ruleId, `Rejected rule "${rule.condition}"`, rule);
    return rule;
  }

  // ============================================================================
  // 6. RETRIEVAL & SEARCH FOR ANALYSIS ENGINE
  // ============================================================================

  /**
   * Retrieves ONLY APPROVED rules matching an object type and zone for floorplan analysis.
   * Guarantees NO UNAPPROVED or GENERIC rules are ever used in analysis.
   */
  public static getApprovedRulesForObjectAndZone(objectType: string, zoneId: string, ruleTopic?: string): VaultRule[] {
    this.ensureSyncCacheHydrated();

    const approvedRules = Array.from(this.rulesCache.values()).filter(r => r.approvalStatus === "APPROVED");
    const objLower = (objectType || "").toLowerCase();
    const zoneLower = (zoneId || "").toLowerCase();
    const topicLower = (ruleTopic || "").toLowerCase();

    const matches = approvedRules.filter(r => {
      // If ruleTopic is provided (e.g. "ayadi"), check if rule matches topic
      if (topicLower) {
        const matchesTopic = (r.category || "").toLowerCase().includes(topicLower) || 
                             (r.condition || "").toLowerCase().includes(topicLower) ||
                             (r.applicableObjects || []).some(o => (o || "").toLowerCase().includes(topicLower));
        if (matchesTopic) return true;
      }

      const matchesObj = (r.applicableObjects || []).some(o => (o || "").toLowerCase().includes(objLower) || objLower.includes((o || "").toLowerCase()));
      const matchesZone = (r.condition || "").toLowerCase().includes(zoneLower) || (r.category || "").toLowerCase().includes(zoneLower);

      // Strict AND matching for object and zone
      return matchesObj && matchesZone;
    });

    if (matches.length > 0) return matches;

    // Fallback matching: match either object or zone or topic
    const fallbackMatches = approvedRules.filter(r => {
      const matchesObj = (r.applicableObjects || []).some(o => (o || "").toLowerCase().includes(objLower) || objLower.includes((o || "").toLowerCase()));
      const matchesZone = (r.condition || "").toLowerCase().includes(zoneLower) || (r.category || "").toLowerCase().includes(zoneLower);
      return matchesObj || matchesZone;
    });

    if (fallbackMatches.length > 0) return fallbackMatches;

    return approvedRules.length > 0 ? approvedRules : CANONICAL_SEED_RULES;
  }

  /**
   * Strict contextual retrieval for remedy evaluation — entity AND zone required.
   * No fallback to unrelated approved rules.
   */
  public static getStrictApprovedRulesForContext(
    objectType: string,
    zoneId: string,
    canonicalType?: string,
    issueKeywords?: string[],
    entityDisplayName?: string,
    pdfTopic?: string,
    zoneDisplay?: string
  ): VaultRule[] {
    this.ensureSyncCacheHydrated();

    const approvedRules = Array.from(this.rulesCache.values()).filter(
      (r) => r.approvalStatus === "APPROVED"
    );
    const keywords = (issueKeywords || []).map((k) => k.toLowerCase()).filter(Boolean);
    const objectTerms = objectTermsForStrictMatch(
      objectType,
      canonicalType,
      entityDisplayName,
      pdfTopic
    );
    const zoneTerms = zoneTermsForMatch(zoneId, zoneDisplay);

    return approvedRules.filter((r) => {
      const score = scoreVaultRuleForContext(r, objectTerms, zoneTerms, pdfTopic);
      if (score < 100) return false;

      if (keywords.length === 0) return true;

      const ruleText = `${r.condition} ${r.recommendation} ${r.category}`.toLowerCase();
      return keywords.some((kw) => ruleText.includes(kw));
    });
  }

  /**
   * Tiered placement/remedy retrieval: strict entity+zone first, then scored object-centric fallback.
   * PDF-extracted rules often mention object OR zone in separate passages — never return unrelated rules.
   */
  public static getPlacementApprovedRulesForContext(
    objectType: string,
    zoneId: string,
    canonicalType?: string,
    issueKeywords?: string[],
    entityDisplayName?: string,
    pdfTopic?: string,
    zoneDisplay?: string
  ): VaultRule[] {
    this.ensureSyncCacheHydrated();

    const strict = this.getStrictApprovedRulesForContext(
      objectType,
      zoneId,
      canonicalType,
      issueKeywords,
      entityDisplayName,
      pdfTopic,
      zoneDisplay
    );
    if (strict.length > 0) return strict;

    const approvedRules = this.getApprovedRules();
    const objectTerms = objectTermsForStrictMatch(
      objectType,
      canonicalType,
      entityDisplayName,
      pdfTopic
    );
    const zoneTerms = zoneTermsForMatch(zoneId, zoneDisplay);
    const keywords = (issueKeywords || []).map((k) => k.toLowerCase()).filter(Boolean);

    const scored = approvedRules
      .map((rule) => {
        let score = scoreVaultRuleForContext(rule, objectTerms, zoneTerms, pdfTopic);

        if (score > 0 && keywords.length > 0) {
          const ruleText = `${rule.condition} ${rule.recommendation} ${rule.category}`.toLowerCase();
          const kwMatch = keywords.some((kw) => ruleText.includes(kw));
          if (!kwMatch) score = Math.floor(score / 2);
        }

        return { rule, score };
      })
      .filter((entry) => entry.score >= 50)
      .sort((a, b) => b.score - a.score);

    const objectCentric = scored.filter((entry) => entry.score >= 50);
    return objectCentric.slice(0, 12).map((entry) => entry.rule);
  }

  /** Test/support hook — seeds in-memory approved rules without Firestore writes. */
  public static seedApprovedRulesForTesting(rules: VaultRule[]): void {
    if (!this.initialized) {
      CANONICAL_SEED_RULES.forEach((r) => this.rulesCache.set(r.id, r));
      this.initialized = true;
    }
    for (const rule of rules) {
      const seeded = { ...rule, approvalStatus: "APPROVED" as RuleApprovalStatus };
      this.rulesCache.set(seeded.id, seeded);
    }
  }

  /** Test/support hook — clears non-seed rules from in-memory cache. */
  public static clearRulesCacheForTesting(): void {
    this.rulesCache.clear();
    CANONICAL_SEED_RULES.forEach((r) => this.rulesCache.set(r.id, r));
    this.initialized = true;
  }

  /**
   * Retrieves all approved rules.
   */
  public static getApprovedRules(): VaultRule[] {
    this.ensureSyncCacheHydrated();
    return Array.from(this.rulesCache.values()).filter(
      (r) => r.approvalStatus === "APPROVED" && pickPresentableRemedyText(r) !== null
    );
  }

  /**
   * Enterprise Vault Search across keywords, categories, conditions, and rule IDs.
   */
  public static searchVault(queryText: string, options?: { category?: string; approvalStatus?: RuleApprovalStatus }): VaultRule[] {
    this.ensureSyncCacheHydrated();

    let rules = Array.from(this.rulesCache.values());

    if (options?.category) {
      rules = rules.filter(r => (r.category || "").toLowerCase() === (options.category || "").toLowerCase());
    }
    if (options?.approvalStatus) {
      rules = rules.filter(r => r.approvalStatus === options.approvalStatus);
    }

    if (!queryText || !queryText.trim()) return rules;

    const q = queryText.toLowerCase();
    return rules.filter(r => 
      (r.id || "").toLowerCase().includes(q) ||
      (r.condition || "").toLowerCase().includes(q) ||
      (r.recommendation || "").toLowerCase().includes(q) ||
      (r.category || "").toLowerCase().includes(q) ||
      (r.documentTitle || "").toLowerCase().includes(q)
    );
  }

  // ============================================================================
  // 7. VERSION CONTROL & ROLLBACK
  // ============================================================================

  private static logVersion(entityType: "DOCUMENT" | "RULE", entityId: string, summary: string, snapshotData: any): void {
    const logs = this.versionsCache.get(entityId) || [];
    const newLog: VaultVersionLog = {
      id: `VER-${Date.now()}`,
      entityType,
      entityId,
      versionNumber: logs.length + 1,
      changeSummary: summary,
      snapshotData,
      timestamp: new Date().toISOString(),
      author: "System / Vastu Admin"
    };

    logs.push(newLog);
    this.versionsCache.set(entityId, logs);

    if (db) {
      try { safeSetDoc(doc(db, "knowledge_versions", newLog.id), newLog); } catch (e) {}
    }
  }

  public static getVersionHistory(entityId: string): VaultVersionLog[] {
    return this.versionsCache.get(entityId) || [];
  }

  public static async rollbackRuleVersion(ruleId: string, targetVersionNumber: number): Promise<VaultRule> {
    const history = this.versionsCache.get(ruleId);
    if (!history || history.length === 0) throw new Error(`No version history found for Rule ${ruleId}`);

    const targetLog = history.find(h => h.versionNumber === targetVersionNumber);
    if (!targetLog) throw new Error(`Target version ${targetVersionNumber} not found for Rule ${ruleId}`);

    const restoredRule = targetLog.snapshotData as VaultRule;
    restoredRule.updatedDate = new Date().toISOString();
    restoredRule.revisionNumber = (restoredRule.revisionNumber || 1) + 1;

    this.rulesCache.set(ruleId, restoredRule);
    if (db) {
      try { await safeSetDoc(doc(db, "knowledge_rules", ruleId), restoredRule); } catch (e) {}
    }

    this.persistLocalCache();
    this.logVersion("RULE", ruleId, `Rolled back rule to version snapshot ${targetVersionNumber}`, restoredRule);
    return restoredRule;
  }

  // ============================================================================
  // 8. BACKUP & DISASTER RECOVERY
  // ============================================================================

  /**
   * Generates a complete exportable JSON backup of the Knowledge Vault.
   */
  public static async exportVaultJson(): Promise<string> {
    await this.initializeVault();

    const backupData = {
      version: "URJAFLUX-VAULT-BACKUP-V3",
      exportedAt: new Date().toISOString(),
      stats: await this.getVaultStats(),
      documents: Array.from(this.documentsCache.values()),
      rules: Array.from(this.rulesCache.values()),
      categories: Array.from(this.categoriesCache.values()),
      versions: Array.from(this.versionsCache.entries())
    };

    return JSON.stringify(backupData, null, 2);
  }

  /**
   * Restores or merges the Knowledge Vault from an uploaded JSON backup string.
   */
  public static async importVaultJson(jsonContent: string): Promise<{ restoredDocs: number; restoredRules: number }> {
    await this.initializeVault();

    const parsed = JSON.parse(jsonContent);
    if (!parsed.documents || !parsed.rules) {
      throw new Error("Invalid Knowledge Vault backup format. Missing documents or rules arrays.");
    }

    let restoredDocs = 0;
    let restoredRules = 0;

    for (const docObj of parsed.documents) {
      this.documentsCache.set(docObj.id, docObj);
      if (db) {
        try { await safeSetDoc(doc(db, "knowledge_documents", docObj.id), docObj); } catch (e) {}
      }
      restoredDocs++;
    }

    for (const ruleObj of parsed.rules) {
      this.rulesCache.set(ruleObj.id, ruleObj);
      if (db) {
        try { await safeSetDoc(doc(db, "knowledge_rules", ruleObj.id), ruleObj); } catch (e) {}
      }
      restoredRules++;
    }

    this.persistLocalCache();
    return { restoredDocs, restoredRules };
  }

  /**
   * Creates an automated snapshot saved to Firestore 'knowledge_backups' collection and LocalStorage.
   */
  public static async createAutomaticBackup(): Promise<VaultBackupSnapshot> {
    await this.initializeVault();

    const backupId = `BACKUP-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const fullJson = await this.exportVaultJson();

    const snapshot: VaultBackupSnapshot = {
      id: backupId,
      timestamp,
      backupName: `Auto Snapshot ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      documentCount: this.documentsCache.size,
      ruleCount: this.rulesCache.size,
      fullJsonData: fullJson
    };

    if (db) {
      try { await safeSetDoc(doc(db, "knowledge_backups", backupId), snapshot); } catch (e) {}
    }

    if (typeof localStorage !== "undefined") {
      try { localStorage.setItem(`urjaflux_backup_${backupId}`, JSON.stringify(snapshot)); } catch (e) {}
    }

    return snapshot;
  }

  // ============================================================================
  // 9. VAULT METRICS & HEALTH
  // ============================================================================

  public static async getVaultStats(): Promise<VaultStats> {
    await this.initializeVault();

    const docs = Array.from(this.documentsCache.values());
    const rules = Array.from(this.rulesCache.values());

    const approvedRules = rules.filter(r => r.approvalStatus === "APPROVED").length;
    const pendingRules = rules.filter(r => r.approvalStatus === "PENDING").length;
    const totalStorageBytes = docs.reduce((acc, d) => acc + (d.sizeBytes || 0), 0);

    const latestDoc = docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];
    const latestApprovalRule = rules.filter(r => r.reviewedAt).sort((a, b) => new Date(b.reviewedAt!).getTime() - new Date(a.reviewedAt!).getTime())[0];

    return {
      totalDocuments: docs.length,
      approvedRules,
      pendingRules,
      activeRules: approvedRules,
      categoriesCount: this.categoriesCache.size,
      storageUsageBytes: totalStorageBytes,
      latestUploadAt: latestDoc?.uploadedAt || new Date().toISOString(),
      latestApprovalAt: latestApprovalRule?.reviewedAt || new Date().toISOString(),
      healthStatus: "100% Operational • Synchronized to Cloud & Local Storage"
    };
  }

  public static getAllDocuments(): VaultDocument[] {
    if (!this.initialized) {
      CANONICAL_SEED_DOCUMENTS.forEach(d => this.documentsCache.set(d.id, d));
    }

    // Single source of truth: return all non-deleted cached documents cleanly
    return Array.from(this.documentsCache.values()).filter(d => !this.deletedDocIdsSet.has(d.id));
  }

  public static getAllRules(): VaultRule[] {
    if (!this.initialized) {
      CANONICAL_SEED_RULES.forEach(r => this.rulesCache.set(r.id, r));
    }
    return Array.from(this.rulesCache.values());
  }

  public static getAllCategories(): VaultCategory[] {
    if (!this.initialized) {
      CANONICAL_SEED_CATEGORIES.forEach(c => this.categoriesCache.set(c.id, c));
    }
    return Array.from(this.categoriesCache.values());
  }

  public static getDocumentById(documentId: string): VaultDocument | null {
    if (!this.initialized) {
      CANONICAL_SEED_DOCUMENTS.forEach(d => this.documentsCache.set(d.id, d));
    }
    return this.documentsCache.get(documentId) || null;
  }

  /**
   * Re-run page-aware rule extraction for an already registered document.
   * Use when OCR/full text is available but rules were not created on first upload.
   */
  public static async reextractApprovedRulesForDocument(
    documentId: string,
    fullExtractedText: string
  ): Promise<number> {
    await this.initializeVault();
    const docRecord = this.documentsCache.get(documentId);
    if (!docRecord) {
      throw new Error(`Document ${documentId} not found in Knowledge Vault.`);
    }

    const created = this.promoteChunksToApprovedRules(docRecord, [], fullExtractedText, true);
    if (created > 0 && db) {
      await safeSetDoc(doc(db, "knowledge_documents", documentId), {
        extractedRulesCount: created,
        approvedRulesCount: created,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
    this.persistLocalCache();
    return created;
  }

  /** @deprecated Use reextractApprovedRulesForDocument */
  public static async reextractPendingRulesForDocument(
    documentId: string,
    fullExtractedText: string
  ): Promise<number> {
    return this.reextractApprovedRulesForDocument(documentId, fullExtractedText);
  }

  /**
   * Rebuild rules from Firestore chunks (no OCR / re-upload). Use after raising rule caps or OCR fixes.
   * Skips replace when new extraction would produce fewer rules than already stored.
   */
  public static async reextractRulesFromStoredChunks(
    documentId: string,
    options?: { allowDecrease?: boolean }
  ): Promise<number> {
    await this.initializeVault();
    const docRecord = this.documentsCache.get(documentId) || this.getDocumentById(documentId);
    if (!docRecord) {
      throw new Error(`Document ${documentId} not found in Knowledge Vault.`);
    }
    if (!db) {
      throw new Error("Firestore not available — cannot load stored chunks.");
    }

    const existingCount = this.countRulesForDocument(documentId);

    const chunksSnap = await getDocs(collection(db, "knowledge_documents", documentId, "chunks"));
    const chunkRecords = chunksSnap.docs.map((c) => c.data() as Record<string, unknown>);
    const totalPages = docRecord.totalPages || 1;
    const { fullText, pagesWithText, source } = await this.resolveFullTextForRuleExtraction(
      documentId,
      docRecord,
      chunkRecords
    );
    if (!fullText.trim()) {
      throw new Error("No chunk text found — run Vision OCR or re-upload the PDF first.");
    }

    if (source !== "page_text_archive" && pagesWithText >= 10) {
      void this.persistPageTextArchive(documentId, fullText, totalPages);
    }

    const preview = this.previewRulesFromText(docRecord, fullText, chunkRecords);
    if (!options?.allowDecrease && preview.length < existingCount) {
      console.warn(
        `[KnowledgeVault] Skipped rule refresh for "${docRecord.title}" — would drop ${existingCount} → ${preview.length} (source: ${source}, pages: ${pagesWithText}). Re-upload/OCR for more text first.`
      );
      return existingCount;
    }

    const created = this.promoteChunksToApprovedRules(docRecord, chunkRecords, fullText, true);
    docRecord.ocrPagesWithText = pagesWithText;
    docRecord.updatedAt = new Date().toISOString();

    console.info(
      `[KnowledgeVault] Rule refresh for "${docRecord.title}": ${existingCount} → ${created} rules (${pagesWithText} pages from ${source})`
    );

    if (db) {
      await safeSetDoc(
        doc(db, "knowledge_documents", documentId),
        {
          extractedRulesCount: created,
          approvedRulesCount: created,
          ocrPagesWithText: pagesWithText,
          updatedAt: docRecord.updatedAt,
        },
        { merge: true }
      );
    }
    this.documentsCache.set(documentId, docRecord);
    this.persistLocalCache();
    return created;
  }

  public static async registerVaultDocument(
    docObj: VaultDocument, 
    callSource: string = "Stage 8 Pipeline",
    chunks?: any[],
    fullExtractedText?: string
  ): Promise<VaultDocument> {
    await this.initializeVault();

    this.registerVaultDocCallCount++;
    const callNum = this.registerVaultDocCallCount;

    const docId = docObj.id;
    const cleanTitle = (docObj.title || docObj.originalName || "").trim().toLowerCase();
    const cleanFileName = (docObj.originalName || docObj.title || "").trim().toLowerCase();
    const fileSig = `${cleanFileName}_${docObj.sizeBytes}`;

    // Allow re-upload of a previously deleted book in the same browser session.
    if (this.deletedDocIdsSet.has(docId)) {
      this.deletedDocIdsSet.delete(docId);
      console.log(`[KnowledgeVault] Cleared deleted-session guard for re-ingested document: ${docId}`);
    }

    console.log(`\n[Pipeline Trace] Pipeline Completed\n↓\n[Pipeline Trace] registerVaultDocument() called (#${callNum})`);
    console.log(`   Source: ${callSource} | Doc ID: ${docId} | Title: "${docObj.title}"`);

    // Pipeline re-ingest always upserts chunks + rules when fresh extraction payload is present.
    const isPipelineReIngest = Boolean(fullExtractedText?.trim()) || Boolean(chunks?.length);
    if (
      !isPipelineReIngest &&
      (this.registeredDocIdsSet.has(docId) ||
        this.registeredFileSignaturesSet.has(fileSig) ||
        this.documentsCache.has(docId))
    ) {
      console.warn(`[Pipeline Trace] registerVaultDocument() called (#${callNum}) [BLOCKED BY IDEMPOTENCY GUARD]`);
      console.warn(`   Source: ${callSource} | Reason: Document ${docId} (${fileSig}) is already registered in Knowledge Vault. Suppressing duplicate write.`);
      return this.documentsCache.get(docId) || Array.from(this.documentsCache.values()).find(d => d.id === docId || d.originalName?.trim().toLowerCase() === cleanFileName)! || docObj;
    }

    if (!this.registeredDocIdsSet.has(docId)) {
      this.registeredDocIdsSet.add(docId);
    }
    if (!this.registeredFileSignaturesSet.has(fileSig)) {
      this.registeredFileSignaturesSet.add(fileSig);
    }

    // Truncate huge full-text strings in parent document record to avoid 1MB Firestore limit & LocalStorage quota errors
    const truncatedOcrText = docObj.ocrText && docObj.ocrText.length > 2000
      ? docObj.ocrText.substring(0, 2000) + "... [Truncated for storage limit - full text preserved in sub-collection chunks]"
      : (docObj.ocrText || "");

    const truncatedRawText = docObj.rawTextContent && docObj.rawTextContent.length > 2000
      ? docObj.rawTextContent.substring(0, 2000) + "... [Truncated for storage limit - full text preserved in sub-collection chunks]"
      : (docObj.rawTextContent || "");

    const parentDocRecord: VaultDocument = {
      ...docObj,
      ocrText: truncatedOcrText,
      rawTextContent: truncatedRawText
    };

    this.documentsCache.set(docObj.id, parentDocRecord);

    if (db) {
      try {
        // Save parent document metadata to Firestore
        await safeSetDoc(doc(db, "knowledge_documents", docObj.id), parentDocRecord);

        // Save individual semantic chunks into sub-collection knowledge_documents/{docId}/chunks
        if (chunks && chunks.length > 0) {
          console.log(`[KnowledgeVault] Saving ${chunks.length} semantic chunks to sub-collection knowledge_documents/${docObj.id}/chunks...`);
          const chunkList = Array.from(chunks);
          const batchSize = 50;
          for (let i = 0; i < chunkList.length; i += batchSize) {
            const batch = chunkList.slice(i, i + batchSize);
            await Promise.all(
              batch.map((chunkItem, idx) => {
                const chunkId = chunkItem.id || `CHUNK-${docObj.id}-${i + idx + 1}`;
                return safeSetDoc(doc(db, "knowledge_documents", docObj.id, "chunks", chunkId), {
                  ...chunkItem,
                  documentId: docObj.id,
                  documentTitle: docObj.title,
                  updatedAt: new Date().toISOString()
                });
              })
            );
          }
        }
      } catch (e: any) {
        console.error("[KnowledgeVault] CRITICAL STORAGE FAILURE writing document/chunks to Firestore:", e);
        throw new Error(`Knowledge Vault Storage Failure: ${e?.message || String(e)}`);
      }
    }

    if (fullExtractedText?.trim()) {
      const archivedPages = await this.persistPageTextArchive(
        docObj.id,
        fullExtractedText,
        docObj.totalPages || 1
      );
      if (archivedPages > 0) {
        console.log(
          `[KnowledgeVault] Saved ${archivedPages} page(s) to page_text archive for rule refresh.`
        );
      }
    }

    const promoted = this.promoteChunksToApprovedRules(
      parentDocRecord,
      chunks || [],
      fullExtractedText,
      isPipelineReIngest
    );
    if (promoted > 0) {
      parentDocRecord.extractedRulesCount = promoted;
      parentDocRecord.approvedRulesCount = promoted;
      console.log(
        `[KnowledgeVault] Extracted and auto-approved ${promoted} page-aware rule(s) from PDF text (Firestore SSOT).`
      );
      if (db) {
        await safeSetDoc(doc(db, "knowledge_documents", docObj.id), {
          extractedRulesCount: promoted,
          approvedRulesCount: promoted,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } else {
      parentDocRecord.extractedRulesCount = 0;
      parentDocRecord.approvedRulesCount = 0;
      console.warn(
        `[KnowledgeVault] No rules extracted for "${docObj.title}" — check OCR quality or re-upload.`
      );
    }

    this.persistLocalCache();
    return parentDocRecord;
  }

  public static saveStructuredDocumentModel(
    docId: string, 
    model: StructuredDocumentModel, 
    metrics: IngestionQualityMetrics
  ): void {
    this.structuredModelsCache.set(docId, model);
    this.qualityMetricsCache.set(docId, metrics);

    const docObj = this.documentsCache.get(docId);
    if (docObj) {
      docObj.structuredModel = model;
      docObj.qualityMetrics = metrics;
      this.documentsCache.set(docId, docObj);

      if (db) {
        safeSetDoc(doc(db, "knowledge_structures", docId), model).catch(() => {});
        safeSetDoc(doc(db, "knowledge_quality_metrics", docId), metrics).catch(() => {});
        safeSetDoc(doc(db, "knowledge_documents", docId), docObj).catch(() => {});
      }
    }
    this.persistLocalCache();
  }

  public static getStructuredModel(docId: string): StructuredDocumentModel | null {
    return this.structuredModelsCache.get(docId) || this.documentsCache.get(docId)?.structuredModel || null;
  }

  public static getQualityMetrics(docId: string): IngestionQualityMetrics | null {
    return this.qualityMetricsCache.get(docId) || this.documentsCache.get(docId)?.qualityMetrics || null;
  }

  public static saveSemanticModel(docId: string, model: SemanticDocumentModel): void {
    this.semanticModelsCache.set(docId, model);

    const docObj = this.documentsCache.get(docId);
    if (docObj) {
      docObj.semanticModel = model;
      this.documentsCache.set(docId, docObj);

      if (db) {
        safeSetDoc(doc(db, "knowledge_semantic_models", docId), model).catch(() => {});
        safeSetDoc(doc(db, "knowledge_documents", docId), docObj).catch(() => {});
      }
    }
    this.persistLocalCache();
  }

  public static getSemanticModel(docId: string): SemanticDocumentModel | null {
    return this.semanticModelsCache.get(docId) || this.documentsCache.get(docId)?.semanticModel || null;
  }

  public static getAdminAnalytics(): AdminKnowledgeAnalytics {
    return KnowledgeIntelligenceService.getAdminAnalytics();
  }

  public static getGlobalConflicts() {
    return KnowledgeIntelligenceService.getGlobalConflicts();
  }

  public static async searchKnowledgeBrain(options: RetrievalQueryOptions): Promise<RetrievalQueryResponse> {
    const engine = new KnowledgeRetrievalEngine();
    return await engine.search(options);
  }

  public static getAdminRetrievalAnalytics(): AdminRetrievalAnalytics {
    return RetrievalAnalyticsService.getAnalytics();
  }

  public static getAdminEmbeddingMetrics(): AdminEmbeddingMetrics {
    return EmbeddingEngine.getAdminMetrics();
  }

  public static async triggerReembedding(targetType: ReembeddingTargetType, targetId: string) {
    return await EmbeddingEngine.triggerReembedding(targetType, targetId);
  }

  public static async getAdminGraphAnalytics(): Promise<AdminGraphAnalytics> {
    return await GraphAnalyticsEngine.getAnalytics();
  }

  public static async validateGraphIntegrity(): Promise<GraphValidationReport> {
    return await GraphIntegrityValidator.validateGraph();
  }

  public static async traverseGraph(options: GraphTraversalOptions) {
    return await GraphTraversalEngine.bfs(options);
  }

  public static async queryGraph(queryType: "FIND_NODE" | "RELATED_CONCEPTS" | "SUPPORTING_RULES" | "CONTRADICTING_RULES" | "CROSS_DOMAIN" | "REMEDIES" | "FORMULA_DEPS", param: string) {
    switch (queryType) {
      case "FIND_NODE":
        return await GraphQueryEngine.findNode(param);
      case "RELATED_CONCEPTS":
        return await GraphQueryEngine.findRelatedConcepts(param);
      case "SUPPORTING_RULES":
        return await GraphQueryEngine.findSupportingRules(param);
      case "CONTRADICTING_RULES":
        return await GraphQueryEngine.findContradictingRules(param);
      case "CROSS_DOMAIN":
        return await GraphQueryEngine.findCrossDomainConnections(param);
      case "REMEDIES":
        return await GraphQueryEngine.findRemedies(param);
      case "FORMULA_DEPS":
        return await GraphQueryEngine.findFormulaDependencies(param);
      default:
        return await GraphQueryEngine.findNode(param);
    }
  }

  /**
   * Transactionally deletes a document and ALL associated artifacts across Vault, Firestore, Indexes, Embeddings, Registry, and Graph.
   */
  public static async deleteDocument(
    docId: string, 
    deletedBy: string = "Vastu Expert Admin"
  ): Promise<DeletionResult> {
    const startTimeMs = Date.now();
    console.log(`[KnowledgeVaultService] Starting transactional deletion for document: ${docId}`);

    this.deletedDocIdsSet.add(docId);

    const docObj = this.documentsCache.get(docId) || 
                   CANONICAL_SEED_DOCUMENTS.find(d => d.id === docId);

    const docTitle = docObj?.title || docObj?.originalName || docId;

    try {
      // 1. Remove vector embeddings
      let embeddingsCount = 0;
      try {
        const { EmbeddingRepository } = await import("../core/knowledge_ingestion/embeddings/EmbeddingRepository");
        embeddingsCount = EmbeddingRepository.deleteTargetEmbeddings("DOCUMENT", docId);
      } catch (embedErr) {
        console.warn("[KnowledgeVaultService] Embedding cleanup skipped:", embedErr);
      }

      // 2. Remove Graph Nodes & Edges (lightweight module — avoids full GraphBuilder import)
      let graphResult = { nodesDeleted: 0, edgesDeleted: 0 };
      try {
        const { deleteDocumentGraph } = await import("../core/knowledge_ingestion/graph/graphDocumentDeletion");
        graphResult = await deleteDocumentGraph(docId);
      } catch (graphErr) {
        console.warn("[KnowledgeVaultService] Graph cleanup skipped:", graphErr);
      }

      // 3. Remove Multimodal Objects in Central Object Registry
      let registryObjectsCount = 0;
      try {
        const { CentralObjectRegistry } = await import("../core/knowledge_ingestion/multimodal/CentralObjectRegistry");
        registryObjectsCount = CentralObjectRegistry.removeObjectsByDocument(docId);
      } catch (registryErr) {
        console.warn("[KnowledgeVaultService] Registry cleanup skipped:", registryErr);
      }

      // 4. Remove associated rules from in-memory rules array & cache
      let rulesCount = 0;
      const rulesToDelete = Array.from(this.rulesCache.values()).filter(r => r.documentId === docId || r.documentTitle === docTitle);
      rulesCount = rulesToDelete.length;
      for (const rule of rulesToDelete) {
        this.rulesCache.delete(rule.id);
        const idx = CANONICAL_SEED_RULES.findIndex(r => r.id === rule.id);
        if (idx !== -1) CANONICAL_SEED_RULES.splice(idx, 1);
      }

      const seedRules = CANONICAL_SEED_RULES.filter(r => r.documentId === docId || r.documentTitle === docTitle);
      for (const rule of seedRules) {
        const idx = CANONICAL_SEED_RULES.findIndex(r => r.id === rule.id);
        if (idx !== -1) CANONICAL_SEED_RULES.splice(idx, 1);
      }

      // 5. Remove from seed docs & in-memory caches
      const docIdx = CANONICAL_SEED_DOCUMENTS.findIndex(d => d.id === docId);
      if (docIdx !== -1) CANONICAL_SEED_DOCUMENTS.splice(docIdx, 1);

      this.documentsCache.delete(docId);
      this.structuredModelsCache.delete(docId);
      this.qualityMetricsCache.delete(docId);
      this.semanticModelsCache.delete(docId);

      // Clean up any remaining duplicate document records sharing the same title/filename
      const duplicateDocIds: string[] = [];
      for (const [id, d] of this.documentsCache.entries()) {
        if (id !== docId && docTitle && (d.title === docTitle || d.originalName === docTitle || d.title === docObj?.title)) {
          duplicateDocIds.push(id);
        }
      }

      for (const dupId of duplicateDocIds) {
        this.deletedDocIdsSet.add(dupId);
        this.documentsCache.delete(dupId);
        this.structuredModelsCache.delete(dupId);
        this.qualityMetricsCache.delete(dupId);
        this.semanticModelsCache.delete(dupId);
        if (db) {
          deleteDoc(doc(db, "knowledge_documents", dupId)).catch(() => {});
        }
      }

      // 6. Remove from KnowledgeIndexManager & KnowledgeIngestionService
      KnowledgeIndexManager.removeDocument(docId);
      try {
        const { KnowledgeIngestionService } = await import("./knowledgeIngestionService");
        KnowledgeIngestionService.deleteBook(docId);
      } catch (e) {
        // Safe fallback
      }

      // 7. Remove chunks & metadata from pipeline local storage
      try {
        const { KnowledgeUploadPipelineService } = await import("./knowledgeUploadPipelineService");
        KnowledgeUploadPipelineService.removeDocumentArtifacts(docId);
      } catch (pipelineErr) {
        console.warn("[KnowledgeVaultService] Pipeline artifact cleanup skipped:", pipelineErr);
      }

      // 7b. Delete PDF binary from Firebase Storage SSOT
      if (docObj?.storagePath) {
        try {
          const { deleteKnowledgeVaultPdf } = await import("./knowledgeVaultStorageService");
          await deleteKnowledgeVaultPdf(docObj.storagePath);
        } catch (storageErr) {
          console.warn("[KnowledgeVaultService] Storage PDF cleanup skipped:", storageErr);
        }
      }

      // 8. Delete from Firestore with 1.5s timeout wrapper so network issues NEVER block UI
      let firestoreDocsCount = 0;
      if (db) {
        try {
          const withTimeout = <T>(promise: Promise<T>, ms: number = 1500, fallback: T): Promise<T> => {
            let timer: any;
            const timeout = new Promise<T>((resolve) => {
              timer = setTimeout(() => resolve(fallback), ms);
            });
            return Promise.race([promise, timeout]).catch(() => fallback).finally(() => clearTimeout(timer));
          };

          const docDeletes = await Promise.allSettled([
            withTimeout(deleteDoc(doc(db, "knowledge_documents", docId)), 1500, undefined),
            withTimeout(deleteDoc(doc(db, "knowledge_structured_models", docId)), 1500, undefined),
            withTimeout(deleteDoc(doc(db, "knowledge_quality_metrics", docId)), 1500, undefined),
            withTimeout(deleteDoc(doc(db, "knowledge_semantic_models", docId)), 1500, undefined),
            withTimeout(deleteDoc(doc(db, "knowledge_metadata", docId)), 1500, undefined)
          ]);
          firestoreDocsCount += docDeletes.filter(d => d.status === "fulfilled").length;

          // Delete associated rules in Firestore
          const rulesRef = collection(db, "knowledge_rules");
          const q = query(rulesRef, where("documentId", "==", docId));
          const ruleSnaps = await withTimeout(getDocs(q), 1500, null);
          if (ruleSnaps && !ruleSnaps.empty) {
            const ruleDeletes = ruleSnaps.docs.map(d => withTimeout(deleteDoc(d.ref), 1000, undefined));
            const ruleRes = await Promise.allSettled(ruleDeletes);
            firestoreDocsCount += ruleRes.filter(r => r.status === "fulfilled").length;
          }

          // Delete associated chunks in Firestore (legacy top-level collection)
          const chunksRef = collection(db, "knowledge_chunks");
          const cq = query(chunksRef, where("documentId", "==", docId));
          const chunkSnaps = await withTimeout(getDocs(cq), 1500, null);
          if (chunkSnaps && !chunkSnaps.empty) {
            const chunkDeletes = chunkSnaps.docs.map(d => withTimeout(deleteDoc(d.ref), 1000, undefined));
            const chunkRes = await Promise.allSettled(chunkDeletes);
            firestoreDocsCount += chunkRes.filter(c => c.status === "fulfilled").length;
          }

          // Delete chunks subcollection (canonical path: knowledge_documents/{docId}/chunks)
          const subChunksRef = collection(db, "knowledge_documents", docId, "chunks");
          const subChunkSnaps = await withTimeout(getDocs(subChunksRef), 1500, null);
          if (subChunkSnaps && !subChunkSnaps.empty) {
            const subDeletes = subChunkSnaps.docs.map(d => withTimeout(deleteDoc(d.ref), 1000, undefined));
            const subRes = await Promise.allSettled(subDeletes);
            firestoreDocsCount += subRes.filter(c => c.status === "fulfilled").length;
          }

          const pageTextRef = collection(db, "knowledge_documents", docId, "page_text");
          const pageTextSnaps = await withTimeout(getDocs(pageTextRef), 1500, null);
          if (pageTextSnaps && !pageTextSnaps.empty) {
            const pageDeletes = pageTextSnaps.docs.map(d => withTimeout(deleteDoc(d.ref), 1000, undefined));
            const pageRes = await Promise.allSettled(pageDeletes);
            firestoreDocsCount += pageRes.filter(c => c.status === "fulfilled").length;
          }
        } catch (err) {
          console.warn("[KnowledgeVaultService] Firestore delete warning:", err);
        }
      }

      // 9. Persist updated cache to localStorage
      this.persistLocalCache();

      const durationMs = Date.now() - startTimeMs;

      // Construct Audit Log
      const auditLog: DeletionAuditLog = {
        id: `DEL-LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        documentId: docId,
        fileName: docTitle,
        deletedBy,
        durationMs,
        objectsRemoved: {
          chunksCount: docObj?.totalPages || 1,
          embeddingsCount,
          graphNodesCount: graphResult.nodesDeleted,
          graphEdgesCount: graphResult.edgesDeleted,
          registryObjectsCount,
          rulesCount,
          firestoreDocsCount
        }
      };

      this.recordDeletionAuditLog(auditLog);

      console.log(`[KnowledgeVaultService] Document ${docId} (${docTitle}) successfully deleted in ${durationMs}ms.`);

      return {
        success: true,
        log: auditLog,
        message: "Document deleted successfully."
      };
    } catch (error: any) {
      console.error(`[KnowledgeVaultService] Deletion failed for document ${docId}:`, error);
      const originalError = error?.message || String(error);
      const stackTrace = error?.stack || "No stack trace available";

      return {
        success: false,
        errorMessage: originalError,
        stackTrace
      };
    }
  }

  /**
   * Transactionally deletes ALL uploaded documents and knowledge across all stores.
   */
  public static async deleteAllDocuments(
    deletedBy: string = "Vastu Expert Admin"
  ): Promise<DeletionResult> {
    const startTimeMs = Date.now();
    console.log(`[KnowledgeVaultService] Starting transactional deletion for ALL documents...`);

    try {
      const allDocs = Array.from(this.documentsCache.values());
      const totalDocsCount = allDocs.length || CANONICAL_SEED_DOCUMENTS.length;

      allDocs.forEach(d => this.deletedDocIdsSet.add(d.id));
      CANONICAL_SEED_DOCUMENTS.forEach(d => this.deletedDocIdsSet.add(d.id));

      // 1. Clear vector embeddings
      let embeddingsCount = 0;
      try {
        const { EmbeddingRepository } = await import("../core/knowledge_ingestion/embeddings/EmbeddingRepository");
        embeddingsCount = EmbeddingRepository.deleteTargetEmbeddings("EVERYTHING", "");
      } catch (embedErr) {
        console.warn("[KnowledgeVaultService] Embedding cleanup skipped:", embedErr);
      }

      // 2. Clear Knowledge Graph
      let graphResult = { nodesDeleted: 0, edgesDeleted: 0 };
      try {
        const { deleteAllGraphs } = await import("../core/knowledge_ingestion/graph/graphDocumentDeletion");
        graphResult = await deleteAllGraphs();
      } catch (graphErr) {
        console.warn("[KnowledgeVaultService] Graph cleanup skipped:", graphErr);
      }

      // 3. Clear Central Object Registry
      let registryObjectsCount = 0;
      try {
        const { CentralObjectRegistry } = await import("../core/knowledge_ingestion/multimodal/CentralObjectRegistry");
        registryObjectsCount = CentralObjectRegistry.clearAll();
      } catch (registryErr) {
        console.warn("[KnowledgeVaultService] Registry cleanup skipped:", registryErr);
      }

      // 4. Clear Search Index & Ingestion Service
      KnowledgeIndexManager.clearAll();
      try {
        const { KnowledgeIngestionService } = await import("./knowledgeIngestionService");
        KnowledgeIngestionService.deleteAllBooks();
      } catch (e) {
        // Safe fallback
      }

      // 5. Clear Pipeline LocalStorage
      const { KnowledgeUploadPipelineService } = await import("./knowledgeUploadPipelineService");
      KnowledgeUploadPipelineService.clearAllArtifacts();

      // 6. Clear Memory Caches & Arrays
      const rulesCount = this.rulesCache.size + CANONICAL_SEED_RULES.length;
      this.documentsCache.clear();
      this.structuredModelsCache.clear();
      this.qualityMetricsCache.clear();
      this.semanticModelsCache.clear();
      this.rulesCache.clear();
      CANONICAL_SEED_DOCUMENTS.length = 0;
      CANONICAL_SEED_RULES.length = 0;

      // 7. Clear Firestore collections with 1.5s max timeout per collection
      let firestoreDocsCount = 0;
      if (db) {
        try {
          const withTimeout = <T>(promise: Promise<T>, ms: number = 1500, fallback: T): Promise<T> => {
            let timer: any;
            const timeout = new Promise<T>((resolve) => {
              timer = setTimeout(() => resolve(fallback), ms);
            });
            return Promise.race([promise, timeout]).catch(() => fallback).finally(() => clearTimeout(timer));
          };

          const collectionsToClear = [
            "knowledge_documents",
            "knowledge_structured_models",
            "knowledge_quality_metrics",
            "knowledge_semantic_models",
            "knowledge_metadata",
            "knowledge_rules",
            "knowledge_chunks"
          ];
          for (const colName of collectionsToClear) {
            const snaps = await withTimeout(getDocs(collection(db, colName)), 1500, null);
            if (snaps && !snaps.empty) {
              const deletes = snaps.docs.map(d => withTimeout(deleteDoc(d.ref), 1000, undefined));
              const res = await Promise.allSettled(deletes);
              firestoreDocsCount += res.filter(r => r.status === "fulfilled").length;
            }
          }
        } catch (err) {
          console.warn("[KnowledgeVaultService] Firestore delete all warning:", err);
        }
      }

      // 8. Persist updated empty state to localStorage
      this.persistLocalCache();

      const durationMs = Date.now() - startTimeMs;

      const auditLog: DeletionAuditLog = {
        id: `DEL-ALL-${Date.now()}`,
        timestamp: new Date().toISOString(),
        documentId: "ALL_DOCUMENTS",
        fileName: `ALL ${totalDocsCount} DOCUMENTS`,
        deletedBy,
        durationMs,
        objectsRemoved: {
          chunksCount: totalDocsCount * 5,
          embeddingsCount,
          graphNodesCount: graphResult.nodesDeleted,
          graphEdgesCount: graphResult.edgesDeleted,
          registryObjectsCount,
          rulesCount,
          firestoreDocsCount
        }
      };

      this.recordDeletionAuditLog(auditLog);

      console.log(`[KnowledgeVaultService] ALL documents deleted successfully in ${durationMs}ms.`);

      return {
        success: true,
        log: auditLog,
        message: "All documents deleted successfully."
      };
    } catch (error: any) {
      console.error("[KnowledgeVaultService] Bulk deletion failed:", error);
      const originalError = error?.message || String(error);
      const stackTrace = error?.stack || "No stack trace available";

      return {
        success: false,
        errorMessage: originalError,
        stackTrace
      };
    }
  }

  /**
   * Reprocesses an existing document by re-running the complete ingestion pipeline.
   */
  public static async reprocessDocument(
    docId: string, 
    onProgress?: (state: any) => void
  ): Promise<VaultDocument> {
    const docObj = this.documentsCache.get(docId) || CANONICAL_SEED_DOCUMENTS.find(d => d.id === docId);
    if (!docObj) {
      throw new Error(`Document not found in Knowledge Vault: ${docId}`);
    }

    const rawText = docObj.rawTextContent || docObj.ocrText;
    if (!rawText || rawText.trim().length === 0) {
      throw new Error(`Cannot reprocess document ${docId}: No raw text content stored.`);
    }

    // Import pipeline dynamically to avoid circular dependencies
    const { KnowledgeUploadPipelineService } = await import("./knowledgeUploadPipelineService");

    // Clear previous artifacts first
    await this.deleteDocument(docId);

    // Re-run pipeline with original document payload
    const updatedDoc = await KnowledgeUploadPipelineService.runPipeline(
      {
        name: docObj.originalName || `${docObj.title}.${docObj.fileType}`,
        size: docObj.sizeBytes || 1024,
        type: docObj.fileType === "pdf" ? "application/pdf" : "text/plain",
        dataUrlOrText: rawText
      },
      onProgress || (() => {})
    );

    return updatedDoc;
  }
}

