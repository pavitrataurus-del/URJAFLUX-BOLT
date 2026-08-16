// URJAFLUX AI OS - Enterprise Knowledge Upload Pipeline Service
// Handles end-to-end ingestion: Detection -> OCR -> Extraction -> Chunking -> Metadata -> Category -> Indexing -> Firestore Persistence -> Lifecycle Management

import { db, db as pipelineDb } from "../firebase";
import { getAuth } from "firebase/auth";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  query, 
  where 
} from "firebase/firestore";
import { safeSetDoc, inspectFirestorePayload } from "../utils/firestoreSanitizer";
import { KnowledgeVaultService, VaultDocument, VaultRule } from "./knowledgeVaultService";
import {
  parsePageSegments,
} from "./knowledgeVaultRuleExtractionService";
import {
  KNOWLEDGE_MAX_OCR_PAGES_PER_UPLOAD,
  KNOWLEDGE_OCR_PAGE_MIN_CHARS,
} from "./knowledgeVaultLimits";
import { normalizeVisionOcrText } from "./knowledgeVaultOcrTextUtils";
import { readFileArrayBuffer, extractDocxPlainText, isDocxBuffer } from "./docxTextExtractionService";
import {
  KnowledgeVaultPageOcrService,
  mergeOcrIntoPageMarkedText,
} from "./knowledgeVaultPageOcrService";
import { DocumentStructurePipelineRunner } from "../core/knowledge_ingestion/pipeline/DocumentStructurePipelineRunner";
import { SemanticKnowledgePipelineStage } from "../core/knowledge_ingestion/semantic/SemanticKnowledgePipelineStage";
import { KnowledgeIntelligenceService } from "../core/knowledge_ingestion/intelligence/KnowledgeIntelligenceService";
import { KnowledgeIndexManager } from "../core/knowledge_ingestion/retrieval/KnowledgeIndexManager";
import { EmbeddingEngine } from "../core/knowledge_ingestion/embeddings/EmbeddingEngine";
import { GraphBuilder } from "../core/knowledge_ingestion/graph/GraphBuilder";
import { MultimodalObjectDetector } from "../core/knowledge_ingestion/multimodal/MultimodalObjectDetector";
import { CentralObjectRegistry } from "../core/knowledge_ingestion/multimodal/CentralObjectRegistry";
import { PdfPipelineLogger } from "../utils/pdfPipelineLogger";
import { EnterprisePdfStorageService } from "../core/storage/EnterprisePdfStorageService";
import {
  uploadKnowledgeVaultPdf,
  deleteKnowledgeVaultPdf,
  ensureKnowledgeVaultFirebaseDriverAsync,
  getActiveKnowledgeVaultCloudProvider,
  type KnowledgeVaultPdfUploadResult,
} from "./knowledgeVaultStorageService";
import { ImportJobManager } from "../core/import_engine/ImportJobManager";
import { EnterpriseImportEngine } from "../core/import_engine/EnterpriseImportEngine";
import { UniversalIngestionEngine } from "../core/knowledge_ingestion/services/UniversalIngestionEngine";
import { EmbeddedPdfImageExtractionService } from "../core/ocr/services/EmbeddedPdfImageExtractionService";
import { 
  StageId, 
  PipelineStageInfo, 
  StageExecutionState, 
  PipelineLogEntry, 
  DocumentUploadParams, 
  KnowledgeDocument, 
  StageStatus 
} from "../types";

export const PIPELINE_STAGES: PipelineStageInfo[] = [
  { id: 1, name: "Stage 1: Binary Document Archival", shortName: "Binary Archival", description: "Immutable PDF/Word/Text storage in Enterprise Storage", estimatedProgress: 12.5 },
  { id: 2, name: "Stage 2: Enterprise Import Job Creation", shortName: "Import Job", description: "Job registration & metrics initialization", estimatedProgress: 25 },
  { id: 3, name: "Stage 3: Document Text Extraction", shortName: "Text Extraction", description: "PDF parsing, Word extraction, or plain text load", estimatedProgress: 37.5 },
  { id: 4, name: "Stage 4: OCR Evaluation & Execution", shortName: "OCR Evaluation", description: "Vision OCR for scanned PDFs; skipped for Word/Text", estimatedProgress: 50 },
  { id: 5, name: "Stage 5: Layout Analysis & Structure", shortName: "Layout Analysis", description: "Headings, paragraphs & table reconstruction", estimatedProgress: 62.5 },
  { id: 6, name: "Stage 6: Embedded PDF Image Extraction", shortName: "Image Extraction", description: "Raster image segment extraction (PDF only)", estimatedProgress: 75 },
  { id: 7, name: "Stage 7: Knowledge Extraction Engine", shortName: "Knowledge Extraction", description: "Semantic units, concept clusters & relationships", estimatedProgress: 87.5 },
  { id: 8, name: "Stage 8: Knowledge Vault Registration", shortName: "Vault Registration", description: "Saving and indexing knowledge in the Knowledge Vault", estimatedProgress: 100 },
];

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type PipelineStepStatus = 
  | "PENDING"
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
  | "DETECTING"
  | "PROCESSING"
  | "OCR_PROCESSING"
  | "TEXT_EXTRACTED"
  | "CHUNKING"
  | "METADATA_GENERATION"
  | "CATEGORIZING"
  | "INDEXING"
  | "SAVING_FIRESTORE"
  | "READY_FOR_RULE_EXTRACTION"
  | "COMPLETED"
  | "FAILED";

export type SupportedFileType =
  | "pdf"
  | "scanned_pdf"
  | "docx"
  | "txt"
  | "md"
  | "csv"
  | "xlsx"
  | "image";

export function resolveUploadDocumentFormat(file: {
  name: string;
  type?: string;
  dataUrlOrText?: string;
}): {
  isPdf: boolean;
  isDocx: boolean;
  isText: boolean;
  label: string;
} {
  const lower = file.name.toLowerCase();
  const isPdf =
    lower.endsWith(".pdf") ||
    file.type === "application/pdf" ||
    (typeof file.dataUrlOrText === "string" && file.dataUrlOrText.startsWith("data:application/pdf"));
  const isDocx =
    lower.endsWith(".docx") ||
    lower.endsWith(".doc") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const isText =
    Boolean(file.type?.includes("text")) ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md") ||
    lower.endsWith(".csv") ||
    lower.endsWith(".json");

  const label = isPdf ? "PDF" : isDocx ? "Word" : isText ? "Text" : "Document";
  return { isPdf, isDocx, isText, label };
}

export function wrapTextAsSinglePageDocument(text: string): string {
  const cleaned = text.trim();
  if (!cleaned) return "";
  if (/---\s*PAGE\s+\d+\s+OF\s+\d+\s*---/i.test(cleaned)) return cleaned;
  return `--- PAGE 1 OF 1 ---\n${cleaned}`;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  totalChunks: number;
  content: string;
  text?: string;
  pageNumber?: number;
  wordCount: number;
  tokenEstimate: number;
  startCharIndex: number;
  endCharIndex: number;
  category: string;
  keywords: string[];
  createdAt: string;
}

export interface DocumentMetadata {
  documentId: string;
  fileHash: string;
  originalFileName: string;
  fileSizeBytes: number;
  mimeType: string;
  detectedType: SupportedFileType;
  isScanned: boolean;
  wordCount: number;
  characterCount: number;
  estimatedPages: number;
  detectedLanguage: string;
  autoCategory: string;
  keywords: string[];
  summary: string;
  uploadedBy: string;
  createdAt: string;
}

export interface PipelineErrorDetails {
  message: string;
  stackTrace?: string;
  stageNumber?: number;
  stageName?: string;
  fileName?: string;
  pageNumber?: number;
  durationMs?: number;
}

export interface StageTimingMetric {
  stageNumber: number;
  stageName: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";
  details?: string;
}

export interface PipelineProgressState {
  fileId: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  currentStep: PipelineStepStatus;
  progressPercent: number;
  statusMessage: string;
  errorMessage?: string;
  errorDetails?: PipelineErrorDetails;
  isDuplicate?: boolean;
  existingDocumentId?: string;
  extractedChunkCount?: number;
  extractedRuleCount?: number;
  processedDocument?: VaultDocument;

  // Real-Time Ingestion Metrics
  stageNumber?: number;
  stageName?: string;
  currentPage?: number;
  totalPages?: number;
  startTimeMs?: number;
  elapsedMs?: number;
  estimatedTimeRemainingMs?: number;
  pagesPerSecond?: number;
  extractionMode?: "Native Text" | "Vision OCR" | "Hybrid" | "Analyzing";
  memoryUsageMB?: number;
  stageTimings?: Record<number, StageTimingMetric>;
}

export interface DocumentHistoryEntry {
  id: string;
  documentId: string;
  timestamp: string;
  action: "UPLOADED" | "OCR_PROCESSED font-mono" | "CHUNKED" | "INDEXED" | "VERSION_UPDATED" | "RULE_EXTRACTED";
  summary: string;
  actor: string;
  snapshotStatus: string;
}

function countPagesWithExtractableText(fullText: string): number {
  const segments = parsePageSegments(fullText);
  const pageMarkerRe = /---\s*PAGE\s+\d+\s+OF\s+\d+\s*---/gi;
  if (segments.length === 0) {
    return normalizeVisionOcrText(fullText).trim().length >= KNOWLEDGE_OCR_PAGE_MIN_CHARS ? 1 : 0;
  }
  return segments.filter((segment) => {
    const body = normalizeVisionOcrText(segment.text.replace(pageMarkerRe, "")).trim();
    return body.length >= KNOWLEDGE_OCR_PAGE_MIN_CHARS;
  }).length;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export class KnowledgeUploadPipelineService {
  private static LOCAL_CHUNKS_KEY = "urjaflux_pipeline_chunks_v1";
  private static LOCAL_METADATA_KEY = "urjaflux_pipeline_metadata_v1";
  private static LOCAL_HISTORY_KEY = "urjaflux_pipeline_history_v1";

  // Active Pipeline Execution Idempotency Locks
  private static activePipelinesMap = new Map<string, Promise<VaultDocument>>();
  private static completedPipelineResults = new Map<string, VaultDocument>();
  private static pipelineRunCallCount = 0;

  private stageListeners: Array<(states: Map<StageId, StageExecutionState>, currentStage: StageId, progress: number) => void> = [];
  private logListeners: Array<(log: PipelineLogEntry) => void> = [];
  private stageStates: Map<StageId, StageExecutionState> = new Map();
  private currentStageId: StageId = 1;
  private overallProgressPercent: number = 0;

  constructor() {
    this.initStageStates();
  }

  private initStageStates(): void {
    this.stageStates.clear();
    PIPELINE_STAGES.forEach((stage) => {
      this.stageStates.set(stage.id, {
        stageId: stage.id,
        status: 'pending',
        progress: 0,
        detail: stage.description,
      });
    });
  }

  public onStageChange(listener: (states: Map<StageId, StageExecutionState>, currentStage: StageId, progress: number) => void): () => void {
    this.stageListeners.push(listener);
    listener(new Map(this.stageStates), this.currentStageId, this.overallProgressPercent);
    return () => {
      this.stageListeners = this.stageListeners.filter((l) => l !== listener);
    };
  }

  public onLog(listener: (log: PipelineLogEntry) => void): () => void {
    this.logListeners.push(listener);
    return () => {
      this.logListeners = this.logListeners.filter((l) => l !== listener);
    };
  }

  private emitStageChange(currentStage: StageId, progress: number): void {
    this.currentStageId = currentStage;
    this.overallProgressPercent = progress;
    const statesCopy = new Map(this.stageStates);
    this.stageListeners.forEach((fn) => fn(statesCopy, currentStage, progress));
  }

  private emitLog(stageId: StageId, level: 'info' | 'warn' | 'error' | 'success', message: string, payloadSnapshot?: Record<string, unknown>): void {
    const entry: PipelineLogEntry = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      stageId,
      level,
      message,
      payloadSnapshot,
    };
    this.logListeners.forEach((fn) => fn(entry));
  }

  private updateStageState(
    stageId: StageId,
    status: StageStatus,
    progress: number,
    detail: string,
    isFallbackTriggered?: boolean,
    fallbackReason?: string
  ): void {
    const current = this.stageStates.get(stageId) || {
      stageId,
      status: 'pending',
      progress: 0,
      detail: '',
    };
    const newState: StageExecutionState = {
      ...current,
      stageId,
      status,
      progress,
      detail,
      ...(status === 'running' && !current.startedAt ? { startedAt: Date.now() } : {}),
      ...(status === 'completed' || status === 'fallback' ? { completedAt: Date.now() } : {}),
      ...(isFallbackTriggered !== undefined ? { isFallbackTriggered } : {}),
      ...(fallbackReason ? { fallbackReason } : {}),
    };
    this.stageStates.set(stageId, newState);
  }

  /**
   * Execution trigger method for simulated UI ingestion workflow with 8-stage progress.
   */
  public async executePipeline(params: DocumentUploadParams): Promise<KnowledgeDocument> {
    this.initStageStates();
    this.overallProgressPercent = 0;
    this.currentStageId = 1;

    this.emitLog(1, 'info', `[Ingestion Started] Initializing 8-stage pipeline for document: ${params.fileName} (${params.fileSizeMB} MB, ${params.pageCount} pages)`);
    this.emitStageChange(1, 0);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let s = 1; s <= PIPELINE_STAGES.length; s++) {
      const stageId = s as StageId;
      const stageInfo = PIPELINE_STAGES[s - 1];

      this.updateStageState(stageId, 'running', 50, `Executing ${stageInfo.name}...`);
      this.emitLog(stageId, 'info', `[Stage ${stageId} RUNNING] ${stageInfo.name}`);
      this.emitStageChange(stageId, Math.round(((s - 1) / PIPELINE_STAGES.length) * 100));

      await delay(120);

      this.updateStageState(stageId, 'completed', 100, `Completed ${stageInfo.shortName}`);
      this.emitLog(stageId, 'success', `[Stage ${stageId} COMPLETED] ${stageInfo.name} completed successfully.`);
      this.emitStageChange(stageId, Math.round((s / PIPELINE_STAGES.length) * 100));
    }

    const docId = `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const docResult: KnowledgeDocument = {
      id: docId,
      title: params.fileName.replace(/\.[^/.]+$/, ''),
      fileSizeMB: params.fileSizeMB,
      pageCount: params.pageCount,
      uploadedAt: new Date().toISOString(),
      status: 'indexed',
      currentStage: 8,
      progress: 100,
      sanitized: false,
      chunkCount: Math.max(Math.round(params.pageCount * 4.2), 12),
      graphNodesCount: Math.max(Math.round(params.pageCount * 8.5), 24),
      vectorDimensions: 768,
      metadata: {
        title: params.fileName,
        category: params.documentType || 'Vastu & Spatial Design PDF',
        author: 'Urjaflux AI OS Ingestion Engine',
        tags: ['Vastu', 'Spatial Geometry', 'Direct Sync'],
        rawPayloadSizeKB: Math.round(params.fileSizeMB * 1024),
        persistedPayloadSizeKB: Math.round(params.fileSizeMB * 1024),
        firestoreWriteMode: 'direct',
      },
    };

    try {
      await KnowledgeVaultService.uploadDocument({
        customDocId: docId,
        title: docResult.title,
        originalName: params.fileName,
        fileType: 'pdf',
        sizeBytes: params.fileSizeMB * 1024 * 1024,
        fileUrlOrBase64: '',
        rawTextContent: "",
        category: docResult.metadata.category,
        author: docResult.metadata.author || 'Chief Knowledge Engineer',
        totalPages: params.pageCount,
      });
    } catch (e) {
      console.warn('[Pipeline executePipeline] Vault save notice:', e);
    }

    return docResult;
  }

  private static persistChunksToLocalStorage(newChunks: KnowledgeChunk[]): void {
    if (typeof localStorage === "undefined") return;
    try {
      const existingStr = localStorage.getItem(this.LOCAL_CHUNKS_KEY);
      const existing: KnowledgeChunk[] = existingStr ? JSON.parse(existingStr) : [];
      const mergedMap = new Map<string, KnowledgeChunk>();
      existing.forEach(c => mergedMap.set(c.id, c));
      newChunks.forEach(c => mergedMap.set(c.id, c));
      
      const allChunks = Array.from(mergedMap.values());
      let count = allChunks.length;
      while (count > 0) {
        try {
          localStorage.setItem(this.LOCAL_CHUNKS_KEY, JSON.stringify(allChunks.slice(-count)));
          return;
        } catch {
          count = Math.floor(count / 2);
        }
      }
    } catch (e) {
      console.warn("[Pipeline] Local storage chunks write warning (retaining in-memory):", e);
    }
  }

  private static persistMetadataToLocalStorage(metadata: DocumentMetadata): void {
    if (typeof localStorage === "undefined") return;
    try {
      const existingStr = localStorage.getItem(this.LOCAL_METADATA_KEY);
      const existing: DocumentMetadata[] = existingStr ? JSON.parse(existingStr) : [];
      const filtered = existing.filter(m => m.documentId !== metadata.documentId);
      filtered.push(metadata);
      localStorage.setItem(this.LOCAL_METADATA_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn("[Pipeline] Local storage metadata write warning:", e);
    }
  }

  public static getLocalChunksForDocument(documentId: string): KnowledgeChunk[] {
    if (typeof localStorage === "undefined") return [];
    try {
      const chunksStr = localStorage.getItem(this.LOCAL_CHUNKS_KEY);
      if (!chunksStr) return [];
      const chunks: KnowledgeChunk[] = JSON.parse(chunksStr);
      return chunks.filter((c) => c.documentId === documentId);
    } catch {
      return [];
    }
  }

  public static removeDocumentArtifacts(documentId: string): void {
    if (typeof localStorage === "undefined") return;
    try {
      const chunksStr = localStorage.getItem(this.LOCAL_CHUNKS_KEY);
      if (chunksStr) {
        const chunks: KnowledgeChunk[] = JSON.parse(chunksStr);
        const remainingChunks = chunks.filter(c => c.documentId !== documentId);
        localStorage.setItem(this.LOCAL_CHUNKS_KEY, JSON.stringify(remainingChunks));
      }

      const metaStr = localStorage.getItem(this.LOCAL_METADATA_KEY);
      if (metaStr) {
        const meta: DocumentMetadata[] = JSON.parse(metaStr);
        const remainingMeta = meta.filter(m => m.documentId !== documentId);
        localStorage.setItem(this.LOCAL_METADATA_KEY, JSON.stringify(remainingMeta));
      }
    } catch (e) {
      console.warn("[Pipeline] Error removing local storage artifacts for doc:", documentId, e);
    }
  }

  public static clearAllArtifacts(): void {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.removeItem(this.LOCAL_CHUNKS_KEY);
      localStorage.removeItem(this.LOCAL_METADATA_KEY);
      localStorage.removeItem(this.LOCAL_HISTORY_KEY);
    } catch (e) {
      console.warn("[Pipeline] Error clearing all pipeline artifacts:", e);
    }
  }

  /**
   * Generates a deterministic content signature / hash for duplicate detection.
   */
  public static generateFileSignature(fileName: string, sizeBytes: number, rawTextPreview: string): string {
    const textSnippet = (rawTextPreview || "").slice(0, 200).replace(/\s+/g, "");
    let hash = 0;
    const str = `${fileName}_${sizeBytes}_${textSnippet}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `HASH-${Math.abs(hash).toString(16).toUpperCase()}`;
  }

  /**
   * Step 1: Detects document properties (Searchable PDF vs Scanned Image PDF vs Raw Text)
   */
  public static detectDocumentType(fileName: string, rawText: string, fileSizeBytes: number): {
    detectedType: SupportedFileType;
    isScanned: boolean;
    reason: string;
  } {
    const ext = fileName.split('.').pop()?.toLowerCase() || "";

    if (ext === "txt" || ext === "md") {
      return { detectedType: "txt", isScanned: false, reason: "Plain text / Markdown document" };
    }
    if (ext === "csv" || ext === "xlsx" || ext === "xls") {
      return { detectedType: "csv", isScanned: false, reason: "Structured tabular spreadsheet" };
    }
    if (ext === "docx" || ext === "doc") {
      return { detectedType: "docx", isScanned: false, reason: "Microsoft Word OpenXML Document" };
    }
    if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp" || ext === "bmp") {
      return { detectedType: "image", isScanned: true, reason: "Image file requiring OCR vision recognition" };
    }

    if (ext === "pdf") {
      // Check if PDF has embedded searchable text or needs OCR
      const textLength = (rawText || "").trim().length;
      if (textLength > 100) {
        return { detectedType: "pdf", isScanned: false, reason: "Searchable PDF with vector text content" };
      } else {
        return { detectedType: "scanned_pdf", isScanned: true, reason: "Scanned / Image-only PDF with minimal text vector layers" };
      }
    }

    return { detectedType: "pdf", isScanned: false, reason: "Standard document type" };
  }

  /**
   * Step 2 & 3: Extracts clean text or runs OCR if required.
   */
  public static async processTextExtraction(
    fileData: { name: string; size: number; dataUrlOrText: string },
    isScanned: boolean
  ): Promise<{ text: string; ocrConfidence: number }> {
    const isDataUrl = fileData.dataUrlOrText.startsWith("data:");

    // For plain text files (TXT, MD, CSV, JSON), return raw text directly
    if (!isDataUrl && fileData.dataUrlOrText.length > 0) {
      return {
        text: fileData.dataUrlOrText,
        ocrConfidence: 99.5
      };
    }

    // For binary files (PDFs, Images, DOCX, etc.) passed as Data URLs, run OCR Vision extraction
    if (isDataUrl) {
      try {
        const isPdfOrImage = fileData.dataUrlOrText.startsWith("data:image/") || fileData.dataUrlOrText.startsWith("data:application/pdf");
        const promptText = isPdfOrImage
          ? "Perform OCR text extraction on this Vastu Shastra treatise page. Return all Sanskrit, Hindi, and English text verbatim without missing any rules."
          : `Extract and summarize all Vastu Shastra rules, spatial guidelines, directional principles, and room placements from this document file (${fileData.name}).`;

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3500);

        const resp = await fetch("/api/vision/recognize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            imageDataUrl: fileData.dataUrlOrText,
            promptText
          })
        }).finally(() => clearTimeout(timer));

        if (resp.ok) {
          const json = await resp.json();
          const extractedText = json.rawJsonText || json.text;
          if (extractedText && extractedText.trim().length > 10) {
            return {
              text: extractedText.trim(),
              ocrConfidence: 96.8
            };
          }
        }
      } catch (e) {
        console.warn("[Upload Pipeline] OCR service fallback:", e);
      }
    }

    // No synthetic text — empty extraction must surface as zero-confidence, not fake rules.
    return {
      text: "",
      ocrConfidence: 0,
    };
  }

  /**
   * Step 4: Chunk Generation (Semantic overlapping text chunks for vector / RAG search)
   */
  public static generateSemanticChunks(
    documentId: string,
    documentTitle: string,
    rawText: string,
    category: string,
    chunkSize: number = 600,
    overlap: number = 100
  ): KnowledgeChunk[] {
    const text = rawText.trim();
    if (!text) return [];

    const chunks: KnowledgeChunk[] = [];
    let startIdx = 0;
    let chunkIndex = 0;

    while (startIdx < text.length) {
      const endIdx = Math.min(startIdx + chunkSize, text.length);
      let chunkText = text.substring(startIdx, endIdx);

      // Adjust to end on full sentence boundary if possible
      if (endIdx < text.length) {
        const lastPeriod = chunkText.lastIndexOf('.');
        if (lastPeriod > chunkSize * 0.6) {
          chunkText = chunkText.substring(0, lastPeriod + 1);
        }
      }

      const words = chunkText.split(/\s+/).filter(Boolean);
      const keywords = Array.from(new Set(words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, "")).filter(w => w.length > 4))).slice(0, 8);

      chunks.push({
        id: `CHUNK-${documentId}-${chunkIndex + 1}`,
        documentId,
        documentTitle,
        chunkIndex: chunkIndex + 1,
        totalChunks: 0, // updated after loop
        content: chunkText,
        wordCount: words.length,
        tokenEstimate: Math.ceil(words.length * 1.3),
        startCharIndex: startIdx,
        endCharIndex: startIdx + chunkText.length,
        category,
        keywords,
        createdAt: new Date().toISOString()
      });

      startIdx += Math.max(chunkText.length - overlap, 100);
      chunkIndex++;
    }

    // Set totalChunks count across all chunks
    chunks.forEach(c => c.totalChunks = chunks.length);
    return chunks;
  }

  /**
   * Page-boundary chunks — one or more chunks per PDF page with pageNumber metadata.
   */
  public static generatePageAwareChunks(
    documentId: string,
    documentTitle: string,
    rawText: string,
    category: string,
    maxChunkChars: number = 900
  ): KnowledgeChunk[] {
    const pages = parsePageSegments(rawText.trim());
    if (pages.length === 0) return [];

    const chunks: KnowledgeChunk[] = [];
    let chunkIndex = 0;

    for (const page of pages) {
      const pageText = page.text.trim();
      if (!pageText || pageText.length < 8) continue;

      let offset = 0;
      while (offset < pageText.length) {
        const slice = pageText.slice(offset, offset + maxChunkChars);
        const chunkText = slice.trim();
        if (!chunkText) break;

        const words = chunkText.split(/\s+/).filter(Boolean);
        const keywords = Array.from(
          new Set(
            words
              .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""))
              .filter((w) => w.length > 4)
          )
        ).slice(0, 8);

        chunkIndex++;
        chunks.push({
          id: `CHUNK-${documentId}-P${page.pageNumber}-${chunkIndex}`,
          documentId,
          documentTitle,
          chunkIndex,
          totalChunks: 0,
          content: chunkText,
          text: chunkText,
          pageNumber: page.pageNumber,
          wordCount: words.length,
          tokenEstimate: Math.ceil(words.length * 1.3),
          startCharIndex: offset,
          endCharIndex: offset + chunkText.length,
          category,
          keywords,
          createdAt: new Date().toISOString(),
        });

        if (offset + maxChunkChars >= pageText.length) break;
        offset += Math.max(maxChunkChars - 120, 200);
      }
    }

    chunks.forEach((c) => {
      c.totalChunks = chunks.length;
    });
    return chunks;
  }

  public static chooseKnowledgeChunks(
    documentId: string,
    documentTitle: string,
    rawText: string,
    category: string
  ): KnowledgeChunk[] {
    const text = rawText.trim();
    if (!text) return [];
    if (/---\s*PAGE\s+\d+\s+OF\s+\d+\s*---/i.test(text)) {
      const pageChunks = this.generatePageAwareChunks(documentId, documentTitle, text, category);
      if (pageChunks.length > 0) return pageChunks;
    }
    return this.generateSemanticChunks(documentId, documentTitle, text, category);
  }

  /**
   * Prefer structured paragraph text (with page anchors) over marker-only PDF stream text.
   */
  public static buildExtractionTextFromStructure(
    pageMarkedText: string,
    structuredModel: {
      cleanText?: string;
      ocrText?: string;
      correctedOcrText?: string;
      chapters?: Array<{
        sections?: Array<{
          paragraphs?: Array<{ pageNumber?: number; cleanText?: string; rawText?: string }>;
          subSections?: Array<{
            paragraphs?: Array<{ pageNumber?: number; cleanText?: string; rawText?: string }>;
          }>;
        }>;
      }>;
    } | null | undefined,
    totalPages: number
  ): string {
    if (!structuredModel) return pageMarkedText;

    const segments: string[] = [];
    const pushParagraph = (pageNumber: number, text: string) => {
      const body = text.trim();
      if (!body || body.length < 8) return;
      if (/^Extracted OCR content for/i.test(body)) return;
      segments.push(`--- PAGE ${pageNumber} OF ${totalPages} ---\n${body}`);
    };

    for (const chapter of structuredModel.chapters || []) {
      for (const section of chapter.sections || []) {
        for (const p of section.paragraphs || []) {
          pushParagraph(p.pageNumber || 1, p.cleanText || p.rawText || "");
        }
        for (const sub of section.subSections || []) {
          for (const p of sub.paragraphs || []) {
            pushParagraph(p.pageNumber || 1, p.cleanText || p.rawText || "");
          }
        }
      }
    }

    if (segments.length > 0) {
      const structuredBodyLen = segments
        .join("\n\n")
        .replace(/--- PAGE \d+ OF \d+ ---/gi, "")
        .trim().length;
      const pageMarkedBodyLen = pageMarkedText.replace(/--- PAGE \d+ OF \d+ ---/gi, "").trim().length;
      if (structuredBodyLen >= pageMarkedBodyLen * 0.85) {
        return segments.join("\n\n");
      }
      console.warn(
        `[ENTERPRISE PIPELINE] Structure model has less text (${structuredBodyLen} chars) than page-marked OCR stream (${pageMarkedBodyLen} chars) — keeping OCR text.`
      );
    }

    const markerBodyLen = pageMarkedText.replace(/--- PAGE \d+ OF \d+ ---/gi, "").trim().length;
    const hasPageInventory = /--- PAGE \d+ OF \d+ ---/i.test(pageMarkedText);

    const fallback =
      structuredModel.correctedOcrText?.trim() ||
      structuredModel.cleanText?.trim() ||
      structuredModel.ocrText?.trim() ||
      "";

    if (/^Extracted OCR content for/i.test(fallback)) {
      return pageMarkedText;
    }
    if (/^Parsed Vastu Shastra treatise document content/i.test(fallback)) {
      return pageMarkedText;
    }

    // Never discard a multi-page inventory for a tiny template fallback string.
    if (hasPageInventory && fallback.length < pageMarkedText.length * 0.5) {
      return pageMarkedText;
    }

    if (fallback.length > markerBodyLen) {
      return fallback;
    }

    return pageMarkedText;
  }

  /** Detect scanned/sparse treatises that need Vision OCR even with a junk native text layer. */
  public static resolveOcrPageTargets(
    pagesNeedingOcr: number[],
    fullExtractedText: string,
    totalPages: number
  ): { needsVisionOcr: boolean; ocrPageTargets: number[]; avgCharsPerPage: number } {
    const markerStripped = fullExtractedText.replace(/--- PAGE \d+ OF \d+ ---/gi, "").trim();
    const avgCharsPerPage = markerStripped.length / Math.max(totalPages, 1);
    const sparseScannedDoc = totalPages > 5 && avgCharsPerPage < 80;

    let ocrPageTargets = pagesNeedingOcr;
    if (ocrPageTargets.length === 0 && sparseScannedDoc) {
      ocrPageTargets = Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const needsVisionOcr =
      ocrPageTargets.length > 0 || fullExtractedText.trim().length <= 10 || sparseScannedDoc;

    return { needsVisionOcr, ocrPageTargets, avgCharsPerPage };
  }

  /**
   * Step 5: Automatic Category Detection from document content
   */
  public static detectCategory(text: string, fileName: string): string {
    const content = (text + " " + fileName).toLowerCase();

    if (
      content.includes("lal kitab") ||
      content.includes("lal-kitab") ||
      content.includes("lalkitab") ||
      content.includes("लाल किताब")
    ) {
      return "Lal Kitab";
    }
    if (
      content.includes("numerology") ||
      content.includes("ayadi") ||
      content.includes("name number") ||
      content.includes("life path") ||
      content.includes("अंक ज्योतिष")
    ) {
      return content.includes("ayadi") || content.includes("yoni") || content.includes("perimeter")
        ? "Ayadi Numerology"
        : "Numerology";
    }
    if (
      content.includes("astrology") ||
      content.includes("kundli") ||
      content.includes("graha") ||
      content.includes("rashi") ||
      content.includes("ज्योतिष")
    ) {
      return "Astrology";
    }

    if (content.includes("toilet") || content.includes("wc") || content.includes("ablution")) {
      return "Toilet Rules";
    }
    if (content.includes("kitchen") || content.includes("agni") || content.includes("stove") || content.includes("cooking")) {
      return "Kitchen Rules";
    }
    if (content.includes("ayadi") || content.includes("yoni") || content.includes("perimeter") || content.includes("formula")) {
      return "Ayadi Formulas";
    }
    if (content.includes("bedroom") || content.includes("nairutya") || content.includes("sleeping")) {
      return "Bedroom Rules";
    }
    if (content.includes("entrance") || content.includes("mahadwara") || content.includes("door") || content.includes("devta")) {
      return "Entrance Rules";
    }
    if (content.includes("brahmasthan") || content.includes("center") || content.includes("open sky")) {
      return "Brahmasthan (Center)";
    }
    if (content.includes("water") || content.includes("borewell") || content.includes("tank") || content.includes("sump")) {
      return "Water Elements";
    }
    if (content.includes("pyramid") || content.includes("helix") || content.includes("remedy") || content.includes("correction")) {
      return "Remedies & Corrections";
    }

    return "Vastu Shastra";
  }

  /**
   * Step 6: Metadata Generation
   */
  public static generateMetadata(
    documentId: string,
    file: { name: string; size: number },
    detectedType: SupportedFileType,
    isScanned: boolean,
    rawText: string,
    category: string,
    fileHash: string
  ): DocumentMetadata {
    const words = rawText.trim().split(/\s+/).filter(Boolean);
    const keywords = Array.from(new Set(
      words
        .map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ""))
        .filter(w => w.length > 4 && !["about", "which", "there", "their", "where", "would"].includes(w))
    )).slice(0, 12);

    return {
      documentId,
      fileHash,
      originalFileName: file.name,
      fileSizeBytes: file.size,
      mimeType: detectedType === "pdf" ? "application/pdf" : "text/plain",
      detectedType,
      isScanned,
      wordCount: words.length,
      characterCount: rawText.length,
      estimatedPages: Math.max(Math.ceil(words.length / 350), 1),
      detectedLanguage: "English / Sanskrit",
      autoCategory: category,
      keywords,
      summary: rawText.slice(0, 300) + (rawText.length > 300 ? "..." : ""),
      uploadedBy: "Chief Knowledge Engineer",
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Checks for duplicate documents in KnowledgeVaultService before processing.
   */
  public static async checkForDuplicate(fileHash: string, fileName: string): Promise<{
    isDuplicate: boolean;
    existingDocument?: VaultDocument;
  }> {
    return KnowledgeVaultService.checkForDuplicate(fileName, 1024, fileHash);
  }

  /**
   * Helper to resolve ArrayBuffer from File, rawBuffer, or DataURL
   */
  private static async resolveArrayBuffer(file: {
    name: string;
    size: number;
    type: string;
    dataUrlOrText: string;
    rawBuffer?: ArrayBuffer;
    fileObj?: File;
  }): Promise<ArrayBuffer | null> {
    if (file.rawBuffer && file.rawBuffer.byteLength > 0) {
      return file.rawBuffer;
    }
    if (file.fileObj) {
      try {
        const fromFile = await readFileArrayBuffer(file.fileObj);
        if (fromFile.byteLength > 0) return fromFile;
      } catch (e) {
        console.warn("[Pipeline] Error reading File object arrayBuffer:", e);
      }
    }
    if (file.dataUrlOrText.startsWith("data:")) {
      try {
        const base64Index = file.dataUrlOrText.indexOf(";base64,");
        if (base64Index !== -1) {
          const base64Str = file.dataUrlOrText.substring(base64Index + 8);
          const binaryStr = atob(base64Str);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          return bytes.buffer;
        }
      } catch (e) {
        console.warn("[Pipeline] Base64 decode failed:", e);
      }
    }
    return null;
  }

  /** Build a stable content sample for doc IDs — uses file bytes when dataUrlOrText is empty (PDF uploads). */
  private static async buildDocIdContentSample(file: {
    dataUrlOrText: string;
    fileObj?: File;
    rawBuffer?: ArrayBuffer;
  }): Promise<string> {
    if (file.dataUrlOrText && file.dataUrlOrText.trim().length > 0) {
      return file.dataUrlOrText.slice(0, 2048);
    }

    const buf = await this.resolveArrayBuffer(file);
    if (!buf || buf.byteLength === 0) return "";

    const sampleBytes = new Uint8Array(buf.slice(0, Math.min(buf.byteLength, 65536)));
    let hex = "";
    for (let i = 0; i < Math.min(sampleBytes.length, 256); i++) {
      hex += sampleBytes[i].toString(16).padStart(2, "0");
    }
    return `bin:${buf.byteLength}:${hex}`;
  }

  /**
   * Main Orchestrator: Executes the Knowledge Ingestion Pipeline.
   * KnowledgeUploadPipelineService is a PURE STATELESS processing engine that delegates document creation,
   * document IDs, Firestore writes, and lifecycle states strictly to KnowledgeVaultService.
   */
  public static async runPipeline(
    file: { 
      name: string; 
      size: number; 
      type: string; 
      dataUrlOrText: string; 
      extractedNativeText?: string;
      rawBuffer?: ArrayBuffer; 
      fileObj?: File 
    },
    onProgress: (state: PipelineProgressState) => void,
    userOverrideCategory?: string,
    options?: { forceReIngest?: boolean }
  ): Promise<VaultDocument> {
    const forceReIngest = options?.forceReIngest !== false;
    if (file.size === 0) {
      throw new Error(`File is empty (0 bytes): ${file.name}. Save the document and upload again.`);
    }
    const contentSample = await this.buildDocIdContentSample(file);
    const docId = await KnowledgeVaultService.computeSHA256DocId(file.name, file.size, contentSample);
    const fileHash = this.generateFileSignature(file.name, file.size, contentSample);

    this.pipelineRunCallCount++;
    const runCallNum = this.pipelineRunCallCount;

    console.log(`\n[Pipeline Trace] runPipeline() called (#${runCallNum}) for file: ${file.name} (DocID: ${docId})`);

    // Always allow user re-uploads to run a fresh pipeline (same file picker fix + rule refresh).
    if (forceReIngest) {
      this.completedPipelineResults.delete(docId);
    }

    // IDEMPOTENCY GUARD 1: If pipeline is currently executing for this docId, return active promise
    if (this.activePipelinesMap.has(docId)) {
      console.warn(`[Pipeline Trace] runPipeline() called (#${runCallNum}) — joining in-flight pipeline for ${docId}`);
      return this.activePipelinesMap.get(docId)!;
    }

    // IDEMPOTENCY GUARD 2: Skip only when explicitly not forcing re-ingest
    if (!forceReIngest && this.completedPipelineResults.has(docId)) {
      console.warn(`[Pipeline Trace] runPipeline() called (#${runCallNum}) [BLOCKED BY IDEMPOTENCY GUARD]`);
      console.warn(`   Reason: Pipeline execution for ${file.name} (${docId}) is ALREADY COMPLETED. Returning canonical document.`);
      return this.completedPipelineResults.get(docId)!;
    }

    const executionPromise = (async () => {
      try {
        const result = await this.executePipelineInternal(file, onProgress, userOverrideCategory, docId, fileHash);
        this.completedPipelineResults.set(docId, result);
        return result;
      } finally {
        this.activePipelinesMap.delete(docId);
      }
    })();

    this.activePipelinesMap.set(docId, executionPromise);
    return executionPromise;
  }

  private static async executePipelineInternal(
    file: { 
      name: string; 
      size: number; 
      type: string; 
      dataUrlOrText: string; 
      extractedNativeText?: string;
      rawBuffer?: ArrayBuffer; 
      fileObj?: File 
    },
    onProgress: (state: PipelineProgressState) => void,
    userOverrideCategory: string | undefined,
    docId: string,
    fileHash: string
  ): Promise<VaultDocument> {
    const startTimeMs = Date.now();

    const getMemoryUsageMB = (): number | undefined => {
      if (typeof window !== "undefined" && (window.performance as any)?.memory?.usedJSHeapSize) {
        return Math.round((window.performance as any).memory.usedJSHeapSize / (1024 * 1024));
      }
      if (typeof process !== "undefined" && process.memoryUsage) {
        try {
          return Math.round(process.memoryUsage().heapUsed / (1024 * 1024));
        } catch {
          return undefined;
        }
      }
      return undefined;
    };

    const stageTimings: Record<number, StageTimingMetric> = {
      1: { stageNumber: 1, stageName: "Binary Document Archival", startTime: 0, status: "PENDING" },
      2: { stageNumber: 2, stageName: "Enterprise Import Job Creation", startTime: 0, status: "PENDING" },
      3: { stageNumber: 3, stageName: "PDF Parsing & Text Streaming", startTime: 0, status: "PENDING" },
      4: { stageNumber: 4, stageName: "OCR Evaluation & Execution", startTime: 0, status: "PENDING" },
      5: { stageNumber: 5, stageName: "Layout Analysis & Structure", startTime: 0, status: "PENDING" },
      6: { stageNumber: 6, stageName: "Embedded PDF Image Extraction", startTime: 0, status: "PENDING" },
      7: { stageNumber: 7, stageName: "Knowledge Extraction Engine", startTime: 0, status: "PENDING" },
      8: { stageNumber: 8, stageName: "Knowledge Vault Registration", startTime: 0, status: "PENDING" }
    };

    // Initial state
    const progressState: PipelineProgressState = {
      fileId: docId,
      fileName: file.name,
      fileSizeBytes: file.size,
      fileType: file.type || "pdf",
      currentStep: "PENDING",
      progressPercent: 5,
      statusMessage: "Initializing Knowledge Ingestion Pipeline...",
      stageNumber: 1,
      stageName: "File Selection",
      currentPage: 0,
      totalPages: 1,
      startTimeMs,
      elapsedMs: 0,
      estimatedTimeRemainingMs: 0,
      pagesPerSecond: 0,
      extractionMode: "Analyzing",
      memoryUsageMB: getMemoryUsageMB(),
      stageTimings: { ...stageTimings }
    };

    const notifyLiveProgress = (extra?: Partial<PipelineProgressState>) => {
      if (extra) Object.assign(progressState, extra);
      const now = Date.now();
      progressState.elapsedMs = now - startTimeMs;
      progressState.memoryUsageMB = getMemoryUsageMB();

      if (progressState.currentPage && progressState.currentPage > 0 && progressState.elapsedMs > 0) {
        progressState.pagesPerSecond = Number(((progressState.currentPage / (progressState.elapsedMs / 1000))).toFixed(1));
        if (progressState.totalPages && progressState.currentPage < progressState.totalPages) {
          const remainingPages = progressState.totalPages - progressState.currentPage;
          progressState.estimatedTimeRemainingMs = progressState.pagesPerSecond > 0
            ? Math.max(0, Math.round((remainingPages / progressState.pagesPerSecond) * 1000))
            : 0;
        } else {
          progressState.estimatedTimeRemainingMs = 0;
        }
      } else if (progressState.progressPercent > 0 && progressState.progressPercent < 100) {
        const elapsedSec = progressState.elapsedMs / 1000;
        const estTotalSec = elapsedSec / (progressState.progressPercent / 100);
        progressState.estimatedTimeRemainingMs = Math.max(0, Math.round((estTotalSec - elapsedSec) * 1000));
      } else {
        progressState.estimatedTimeRemainingMs = 0;
      }

      onProgress({ ...progressState });
    };

    const executeTimedStage = async <T>(
      stageNumber: number,
      stageName: string,
      fn: () => Promise<T>,
      details?: string
    ): Promise<T> => {
      const start = Date.now();
      stageTimings[stageNumber] = {
        stageNumber,
        stageName,
        startTime: start,
        status: "RUNNING",
        details
      };
      notifyLiveProgress({
        stageNumber,
        stageName,
        stageTimings: { ...stageTimings }
      });

      try {
        const result = await fn();
        const end = Date.now();
        stageTimings[stageNumber] = {
          stageNumber,
          stageName,
          startTime: start,
          endTime: end,
          durationMs: end - start,
          status: "COMPLETED",
          details
        };
        notifyLiveProgress({ stageTimings: { ...stageTimings } });
        return result;
      } catch (err: any) {
        const end = Date.now();
        stageTimings[stageNumber] = {
          stageNumber,
          stageName,
          startTime: start,
          endTime: end,
          durationMs: end - start,
          status: "FAILED",
          details: err?.message || String(err)
        };
        notifyLiveProgress({ stageTimings: { ...stageTimings } });
        throw err;
      }
    };

    // Continuous heartbeat ticker for ultra-smooth UI updates
    const heartbeat = setInterval(() => {
      if (progressState.currentStep !== "COMPLETED" && progressState.currentStep !== "FAILED") {
        notifyLiveProgress();
      }
    }, 200);

    try {
      // =========================================================================
      // STAGE 1: Immutable Binary Document Archival
      // =========================================================================
      const format = resolveUploadDocumentFormat(file);

      notifyLiveProgress({
        stageNumber: 1,
        stageName: "Binary Document Archival",
        currentStep: "ARCHIVING",
        progressPercent: 10,
        statusMessage: `Storing ${format.label} document in Enterprise Storage...`,
      });

      let storedBinary: any = null;
      let vaultStorageResult: KnowledgeVaultPdfUploadResult | null = null;
      let buffer: ArrayBuffer = new ArrayBuffer(0);

      await executeTimedStage(1, "Binary Document Archival", async () => {
        buffer = await PdfPipelineLogger.executeStage(
          1,
          "Binary Document Archival",
          file.name,
          async () => {
            const buf = await this.resolveArrayBuffer(file);
            if (!buf || buf.byteLength === 0) {
              throw new Error(
                `FileReader Error: Could not read file bytes for ${file.name}. Re-select the file and try again.`
              );
            }

            const pdfStorage = EnterprisePdfStorageService.getInstance();
            if (getActiveKnowledgeVaultCloudProvider() !== "SUPABASE") {
              await ensureKnowledgeVaultFirebaseDriverAsync();
              pdfStorage.configureKnowledgeVaultStorageDriver();
            }

            vaultStorageResult = await uploadKnowledgeVaultPdf(
              docId,
              buf,
              file.name,
              file.type || "application/pdf"
            );

            storedBinary = {
              id: vaultStorageResult.localCacheArchiveId,
              sha256Hash: vaultStorageResult.sha256Hash,
              storagePath: vaultStorageResult.storagePath,
            };
            return buf;
          },
          undefined,
          (buf) =>
            `Binary Document Archival Success: Firebase SSOT + cache — ${buf.byteLength} bytes (cloud=${vaultStorageResult?.isCloudSsot ?? false})`
        );
      });

      const { isPdf, isDocx, isText } = format;

      // =========================================================================
      // STAGE 2: Enterprise Import Job Creation (ImportJobManager)
      // =========================================================================
      notifyLiveProgress({
        stageNumber: 2,
        stageName: "Enterprise Import Job Creation",
        currentStep: "IMPORT_JOB_CREATED",
        progressPercent: 20,
        statusMessage: "Registering enterprise import job..."
      });

      let dupCheckResult: any = null;
      await executeTimedStage(2, "Enterprise Import Job Creation", async () => {
        const importEngine = EnterpriseImportEngine.getInstance();
        const jobMetrics = importEngine.jobManager.createJob(
          docId,
          file.name,
          file.size,
          "PdfDocumentParser",
          1
        );
        console.log(`[ENTERPRISE PIPELINE] Registered Import Job: ${jobMetrics.jobId}`);

        // Duplicate Check
        dupCheckResult = await KnowledgeVaultService.checkForDuplicate(file.name, file.size, file.dataUrlOrText);
      });

      if (dupCheckResult?.isDuplicate && dupCheckResult?.existingDocument) {
        console.log(
          `[ENTERPRISE PIPELINE] Duplicate file detected (${dupCheckResult.existingDocument.title}) — continuing re-ingest to refresh chunks and rules.`
        );
        notifyLiveProgress({
          statusMessage: `Re-ingesting "${dupCheckResult.existingDocument.title}" — refreshing chunks and auto-approved rules...`,
          progressPercent: 22,
        });
      }

      let fullExtractedText = "";
      let totalPagesCount = 1;
      let pagesNeedingOcr: number[] = [];

      // =========================================================================
      // STAGE 3: Document Text Extraction (PDF / Word / Text)
      // =========================================================================
      notifyLiveProgress({
        stageNumber: 3,
        stageName: "Document Text Extraction",
        currentStep: "PARSING",
        progressPercent: 30,
        statusMessage: isPdf
          ? "Parsing PDF structure and streaming page text..."
          : isDocx
          ? "Extracting text from Word document..."
          : isText
          ? "Loading plain text document..."
          : "Extracting document text...",
      });

      await executeTimedStage(3, "Document Text Extraction", async () => {
        if (isPdf) {
          const { PdfDocumentParser } = await import("../core/import_engine/parsers/PdfDocumentParser");
          const pdfParser = new PdfDocumentParser();

          await PdfPipelineLogger.executeStage(
            3,
            "Document Text Extraction",
            file.name,
            async () => {
              const validation = await pdfParser.validateFile(buffer);
              if (!validation.isValid) {
                throw new Error(`PDF Validation Error for ${file.name}: ${validation.error}`);
              }

              let pagesProcessed = 0;
              await pdfParser.streamPages(buffer, async (pageChunk) => {
                pagesProcessed++;
                if (pageChunk.extractedText.trim().length <= 10) {
                  pagesNeedingOcr.push(pageChunk.pageNumber);
                }
                fullExtractedText += `\n--- PAGE ${pageChunk.pageNumber} OF ${pageChunk.totalPages} ---\n${pageChunk.extractedText}\n`;
                totalPagesCount = pageChunk.totalPages;

                notifyLiveProgress({
                  currentPage: pageChunk.pageNumber,
                  totalPages: pageChunk.totalPages,
                  progressPercent: 30 + Math.floor((pagesProcessed / pageChunk.totalPages) * 10),
                  statusMessage: `Parsing Page ${pageChunk.pageNumber} of ${pageChunk.totalPages}...`
                });
              });

              if (fullExtractedText.trim().length > 10) {
                file.extractedNativeText = fullExtractedText.trim();
              }
              return fullExtractedText;
            },
            undefined,
            () => `Parsed ${totalPagesCount} pages successfully`
          );
        } else if (isDocx) {
          if (!isDocxBuffer(buffer)) {
            throw new Error(`Invalid DOCX archive for ${file.name}. Export again from Microsoft Word as .docx.`);
          }

          const docxText = await extractDocxPlainText(buffer);
          if (!docxText.trim()) {
            throw new Error(`DOCX file ${file.name} contains no extractable Vastu text.`);
          }

          fullExtractedText = `--- PAGE 1 OF 1 ---\n${docxText}`;
          file.extractedNativeText = fullExtractedText;
          totalPagesCount = 1;
        } else if (isText) {
          const textBody = (file.dataUrlOrText || file.extractedNativeText || "").trim();
          if (!textBody) {
            throw new Error(`Text file ${file.name} is empty or could not be read.`);
          }
          fullExtractedText = wrapTextAsSinglePageDocument(textBody);
          file.extractedNativeText = fullExtractedText;
          totalPagesCount = 1;
        } else {
          file.extractedNativeText = file.dataUrlOrText;
          fullExtractedText = file.dataUrlOrText;
          totalPagesCount = 1;
        }
      });

      // =========================================================================
      // STAGE 4: OCR Evaluation & Execution (OCRService)
      // =========================================================================
      const ocrPlan = this.resolveOcrPageTargets(pagesNeedingOcr, fullExtractedText, totalPagesCount);
      const { needsVisionOcr, ocrPageTargets } = ocrPlan;
      let visionOcrPagesAttempted = 0;
      let visionOcrPagesSucceeded = 0;

      notifyLiveProgress({
        stageNumber: 4,
        stageName: "OCR Evaluation & Execution",
        currentStep: needsVisionOcr ? "OCR_RUNNING" : "OCR_SKIPPED",
        progressPercent: 40,
        extractionMode: needsVisionOcr ? "Vision OCR" : "Native Text",
        statusMessage: needsVisionOcr
          ? `Scanned/sparse PDF detected — Vision OCR starting (${Math.min(ocrPageTargets.length, KNOWLEDGE_MAX_OCR_PAGES_PER_UPLOAD)} pages via OpenRouter → Groq → Gemini)...`
          : isPdf
          ? "Native PDF text extracted successfully; OCR skipped."
          : "Word/Text document — OCR not required.",
      });

      await executeTimedStage(4, "OCR Evaluation & Execution", async () => {
        if (!needsVisionOcr || ocrPageTargets.length === 0 || !isPdf || buffer.byteLength === 0) {
          if (isPdf && ocrPageTargets.length === 0) {
            console.log("[ENTERPRISE PIPELINE] OCR skipped — document has sufficient native text.");
          }
          await new Promise((r) => setTimeout(r, 0));
          return;
        }

        const batchSize = Math.min(ocrPageTargets.length, KNOWLEDGE_MAX_OCR_PAGES_PER_UPLOAD);
        visionOcrPagesAttempted = batchSize;
        notifyLiveProgress({
          extractionMode: "Vision OCR",
          statusMessage: `Vision OCR on ${batchSize} scanned pages (of ${ocrPageTargets.length})...`,
          progressPercent: 41,
        });

        const ocrResults = await KnowledgeVaultPageOcrService.ocrPdfPages(
          buffer,
          ocrPageTargets,
          file.name,
          (current, total, pageNumber) => {
            notifyLiveProgress({
              extractionMode: "Vision OCR",
              currentPage: pageNumber,
              totalPages: totalPagesCount,
              progressPercent: 41 + Math.floor((current / Math.max(total, 1)) * 8),
              statusMessage: `Vision OCR page ${pageNumber} (${current}/${total})...`,
            });
          }
        );

        visionOcrPagesSucceeded = ocrResults.size;

        if (ocrResults.size > 0) {
          fullExtractedText = mergeOcrIntoPageMarkedText(fullExtractedText, ocrResults, totalPagesCount);
          file.extractedNativeText = fullExtractedText;
          console.log(`[ENTERPRISE PIPELINE] OCR extracted text for ${ocrResults.size} page(s).`);
          const ocrShortfall = batchSize - ocrResults.size;
          notifyLiveProgress({
            extractionMode: "Hybrid",
            statusMessage:
              ocrShortfall > 5
                ? `Vision OCR: ${ocrResults.size}/${batchSize} pages — daily API quota may limit further pages. Re-upload tomorrow or refresh rules from stored chunks.`
                : `Vision OCR complete — extracted text from ${ocrResults.size} page(s).`,
            progressPercent: 49,
          });
        } else {
          console.warn("[ENTERPRISE PIPELINE] Vision OCR returned no usable text — check OPENROUTER/GROQ/GEMINI keys on server.");
          notifyLiveProgress({
            extractionMode: "Vision OCR",
            statusMessage: "Vision OCR finished but no text returned — verify OCR API keys in .env",
            progressPercent: 49,
          });
        }
      }, needsVisionOcr ? "Vision OCR Evaluation Active" : "Native Text Verified - OCR Skipped");

      // =========================================================================
      // STAGE 5: Layout Analysis & Structure (DocumentStructurePipelineRunner)
      // =========================================================================
      notifyLiveProgress({
        stageNumber: 5,
        stageName: "Layout Analysis & Structure",
        currentStep: "LAYOUT_ANALYSIS",
        progressPercent: 50,
        statusMessage: "Executing Layout Analysis & Heading/Paragraph/Table Reconstruction..."
      });

      let structureResult: any = null;
      await executeTimedStage(5, "Layout Analysis & Structure", async () => {
        const structureRunner = new DocumentStructurePipelineRunner();
        structureResult = await structureRunner.runPipeline(
          {
            ...file,
            extractedNativeText: fullExtractedText.trim() || file.extractedNativeText,
          },
          docId,
          userOverrideCategory || "Vastu Shastra",
          (step, percent) => {
            notifyLiveProgress({
              progressPercent: 50 + Math.floor((percent / 100) * 10),
              statusMessage: `Layout Analysis: ${step}`
            });
          }
        );
      });

      if (structureResult?.structuredModel) {
        fullExtractedText = this.buildExtractionTextFromStructure(
          fullExtractedText,
          structureResult.structuredModel,
          totalPagesCount
        );
      }

      // =========================================================================
      // STAGE 6: Embedded PDF Image Extraction (EmbeddedPdfImageExtractionService)
      // =========================================================================
      notifyLiveProgress({
        stageNumber: 6,
        stageName: "Embedded PDF Image Extraction",
        currentStep: "IMAGE_EXTRACTION",
        progressPercent: 60,
        statusMessage: "Extracting embedded raster image segments and diagrams..."
      });

      let imageReport: any = null;
      await executeTimedStage(6, "Embedded PDF Image Extraction", async () => {
        if (!isPdf) {
          console.log("[ENTERPRISE PIPELINE] Image extraction skipped — not a PDF document.");
          return;
        }

        const imageExtractor = EmbeddedPdfImageExtractionService.getInstance();
        imageReport = await imageExtractor.extractEmbeddedImages(
          buffer,
          totalPagesCount,
          undefined,
          (pInfo) => {
            notifyLiveProgress({
              stageNumber: 6,
              stageName: "Embedded PDF Image Extraction",
              currentStep: "IMAGE_EXTRACTION",
              currentPage: pInfo.currentPage,
              totalPages: pInfo.totalPages,
              progressPercent: 60 + Math.floor((pInfo.currentPage / Math.max(1, pInfo.totalPages)) * 10),
              statusMessage: `Extracting images (Page ${pInfo.currentPage} of ${pInfo.totalPages}, ${pInfo.imagesExtracted} images found)...`
            });
          }
        );
        console.log(`[ENTERPRISE PIPELINE] Extracted ${imageReport.totalImagesExtracted} embedded image segments.`);
      });

      // =========================================================================
      // STAGE 7: Knowledge Extraction Engine
      // =========================================================================
      notifyLiveProgress({
        stageNumber: 7,
        stageName: "Knowledge Extraction Engine",
        currentStep: "KNOWLEDGE_EXTRACTION",
        progressPercent: 70,
        statusMessage: "Extracting semantic units, concept clusters, and relationships..."
      });

      const category = userOverrideCategory && userOverrideCategory !== "All"
        ? userOverrideCategory
        : this.detectCategory(fullExtractedText, file.name);

      const detectedDoc = this.detectDocumentType(file.name, fullExtractedText, file.size);

      let chunks: KnowledgeChunk[] = [];
      await executeTimedStage(7, "Knowledge Extraction Engine", async () => {
        chunks = this.chooseKnowledgeChunks(docId, file.name.replace(/\.[^/.]+$/, ""), fullExtractedText, category);
        progressState.extractedChunkCount = chunks.length;

        const semanticStage = new SemanticKnowledgePipelineStage();
        const semanticModel = await semanticStage.execute(structureResult.structuredModel);
        await KnowledgeIntelligenceService.processDocumentKnowledge(
          structureResult.structuredModel,
          semanticModel
        );
      });

      // =========================================================================
      // STAGE 8: Knowledge Vault Registration
      // =========================================================================
      notifyLiveProgress({
        stageNumber: 8,
        stageName: "Knowledge Vault Registration",
        currentStep: "SAVING_FIRESTORE",
        progressPercent: 90,
        statusMessage: "Saving knowledge to the Knowledge Vault..."
      });

      // Separate metadata from full extracted text to avoid Firestore 1MB document limit & LocalStorage quota errors
      const textPreview = fullExtractedText && fullExtractedText.length > 2000
        ? fullExtractedText.substring(0, 2000) + "... [Truncated for storage limit - full text preserved in sub-collection chunks]"
        : (fullExtractedText || "");

      let approvedDocRecord: VaultDocument = {
        id: docId,
        title: file.name.replace(/\.[^/.]+$/, ""),
        originalName: file.name,
        fileType: detectedDoc.detectedType,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "INGESTED_ACTIVE" as any,
        category,
        author: "Uploaded Treatise",
        totalPages: totalPagesCount,
        ocrText: textPreview,
        rawTextContent: textPreview,
        ocrConfidence: needsVisionOcr ? 0.85 : 1.0,
        version: 1,
        tags: [category, "Enterprise Ingestion"],
        extractedRulesCount: 0,
        approvedRulesCount: 0,
        ocrPagesWithText: countPagesWithExtractableText(fullExtractedText),
        visionOcrPagesAttempted: needsVisionOcr ? visionOcrPagesAttempted : 0,
        language: "Sanskrit/English",
        ...(vaultStorageResult
          ? {
              storagePath: vaultStorageResult.storagePath,
              downloadURL: vaultStorageResult.downloadURL,
              sha256Hash: vaultStorageResult.sha256Hash,
              storageDriver: vaultStorageResult.storageDriver,
              cloudProvider: vaultStorageResult.cloudProvider,
              isCloudSsot: vaultStorageResult.isCloudSsot,
              localCacheArchiveId: vaultStorageResult.localCacheArchiveId,
              fileUrl: vaultStorageResult.downloadURL,
            }
          : {}),
      };

      await executeTimedStage(8, "Knowledge Vault Registration", async () => {
        const ingestionEngine = UniversalIngestionEngine.getInstance();
        const pkg = await ingestionEngine.ingestExtractedDocument(
          file.name,
          file.size,
          fullExtractedText,
          category as any,
          "System Administrator"
        );
        console.log(`[ENTERPRISE PIPELINE] Package registered in Knowledge Vault: ${pkg.id}`);

        if (pkg?.id) {
          await ingestionEngine.approvePackage(pkg.id, "System Administrator", "Auto-approved for Knowledge Vault", true);
        }

        await KnowledgeVaultService.registerVaultDocument(
          approvedDocRecord,
          "Stage 8 (KnowledgeUploadPipelineService)",
          chunks,
          fullExtractedText
        );
        const registered = KnowledgeVaultService.getDocumentById(docId);
        if (registered) {
          approvedDocRecord.extractedRulesCount = registered.extractedRulesCount ?? 0;
          approvedDocRecord.approvedRulesCount = registered.approvedRulesCount ?? 0;
        }
      });

      // Complete Ingestion Pipeline at Stage 8
      clearInterval(heartbeat);
      notifyLiveProgress({
        stageNumber: 8,
        stageName: "Knowledge Vault Registration",
        currentStep: "COMPLETED",
        progressPercent: 100,
        statusMessage: "Knowledge successfully added to the Knowledge Vault.",
        processedDocument: approvedDocRecord,
        stageTimings: { ...stageTimings }
      });

      return approvedDocRecord;
    } catch (error: any) {
      clearInterval(heartbeat);
      console.error("[Upload Pipeline] Error during ingestion:", error);

      const errorMsg = error?.message || String(error);
      const stack = error?.stack || "No stack trace available";

      progressState.errorDetails = {
        message: errorMsg,
        stackTrace: stack,
        stageNumber: progressState.stageNumber || 1,
        stageName: progressState.stageName || "Unknown Stage",
        fileName: file.name,
        pageNumber: progressState.currentPage,
        durationMs: Date.now() - startTimeMs
      };

      progressState.currentStep = "FAILED";
      progressState.errorMessage = errorMsg;
      progressState.statusMessage = `Pipeline Exception in Stage ${progressState.stageNumber || 1} (${progressState.stageName || "Pipeline"}): ${errorMsg}`;

      onProgress({ ...progressState });
      throw error; // Expose original error without suppressing or wrapping into generic message
    }
  }

  /**
   * Document History Logger
   */
  public static logDocumentHistory(
    documentId: string, 
    action: DocumentHistoryEntry["action"], 
    summary: string, 
    actor: string
  ): void {
    const entry: DocumentHistoryEntry = {
      id: `HIST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      documentId,
      timestamp: new Date().toISOString(),
      action,
      summary,
      actor,
      snapshotStatus: "READY_FOR_RULE_EXTRACTION"
    };

    if (db) {
      try {
        const p = safeSetDoc(doc(db, "knowledge_history", entry.id), entry);
        const t = new Promise((resolve) => setTimeout(resolve, 1500));
        Promise.race([p, t]).catch(() => {});
      } catch (e) {}
    }
  }
}
