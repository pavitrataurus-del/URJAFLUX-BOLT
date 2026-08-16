import { KnowledgeSource } from '../models/KnowledgeSource';
import { KnowledgeSourceType } from '../models/KnowledgeSourceType';
import { KnowledgeSourceMetadata } from '../models/KnowledgeSourceMetadata';
import { KnowledgeSourceRegistry, knowledgeSourceRegistry } from '../registry/KnowledgeSourceRegistry';
import { KnowledgeSourceCatalog } from '../registry/KnowledgeSourceCatalog';
import { ApprovalWorkflow } from '../approval/ApprovalWorkflow';
import { ApprovalPolicy } from '../approval/ApprovalPolicy';
import { TrustLevel } from '../approval/TrustLevel';
import { DuplicateSourceDetector, IDuplicateCheckResultData } from '../fingerprint/DuplicateSourceDetector';
import { MetadataValidator } from '../metadata/MetadataValidator';
import { MetadataNormalizer } from '../metadata/MetadataNormalizer';
import { MetadataResolver } from '../metadata/MetadataResolver';
import { KnowledgeSourceVersion } from '../models/KnowledgeSourceVersion';
import { KnowledgeSourceAnalyzer, IAnalysisResultData } from '../classification/KnowledgeSourceAnalyzer';
import { OCRRequirement } from '../classification/OCRRequirement';
import { OCRMetadata } from '../models/OCRMetadata';

export interface IRegistrationRequestOptions {
  readonly title: string;
  readonly author: string;
  readonly sourceType: KnowledgeSourceType;
  readonly rawBufferOrString?: string | Uint8Array;
  readonly filename?: string;
  readonly metadata?: Partial<KnowledgeSourceMetadata>;
  readonly trustLevel?: TrustLevel;
  readonly autoApprove?: boolean;
}

export interface IRegistrationResultData {
  readonly success: boolean;
  readonly source?: KnowledgeSource;
  readonly duplicateCheck?: IDuplicateCheckResultData;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export class KnowledgeSourceService {
  private static instance: KnowledgeSourceService | null = null;

  private readonly registry: KnowledgeSourceRegistry;
  private readonly catalog: KnowledgeSourceCatalog;
  private readonly workflow: ApprovalWorkflow;

  private constructor() {
    this.registry = knowledgeSourceRegistry;
    this.catalog = new KnowledgeSourceCatalog(this.registry);
    this.workflow = new ApprovalWorkflow(ApprovalPolicy.defaultPolicy());
  }

  public static getInstance(): KnowledgeSourceService {
    if (!KnowledgeSourceService.instance) {
      KnowledgeSourceService.instance = new KnowledgeSourceService();
    }
    return KnowledgeSourceService.instance;
  }

  public detectSourceType(rawBufferOrString?: string | Uint8Array, filename?: string): KnowledgeSourceType {
    if (filename) {
      const ext = filename.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') return 'DIGITAL_PDF';
      if (ext === 'epub') return 'EPUB';
      if (ext === 'docx') return 'DOCX';
      if (ext === 'txt') return 'TXT';
      if (ext === 'md' || ext === 'markdown') return 'MARKDOWN';
      if (ext === 'html' || ext === 'htm') return 'HTML';
      if (['png', 'jpg', 'jpeg', 'tiff', 'bmp', 'webp'].includes(ext || '')) return 'IMAGE';
    }

    if (rawBufferOrString) {
      const str = typeof rawBufferOrString === 'string'
        ? rawBufferOrString
        : String.fromCharCode.apply(null, Array.from(rawBufferOrString.slice(0, 512)));

      if (str.startsWith('%PDF')) {
        return str.includes('/Font') ? 'DIGITAL_PDF' : 'SCANNED_PDF';
      }
      if (str.includes('<html') || str.includes('<!DOCTYPE html')) {
        return 'HTML';
      }
    }

    return 'DIGITAL_PDF';
  }

  public registerSource(options: IRegistrationRequestOptions): IRegistrationResultData {
    const rawMeta = new KnowledgeSourceMetadata({
      title: options.title,
      author: options.author,
      ...(options.metadata ? options.metadata : {})
    });

    const normalizedMeta = MetadataNormalizer.normalize(rawMeta);
    const valResult = MetadataValidator.validate(normalizedMeta);

    if (!valResult.isValid) {
      return Object.freeze({
        success: false,
        errors: valResult.errors,
        warnings: valResult.warnings
      });
    }

    const fingerprint = DuplicateSourceDetector.generateSimpleChecksum(
      options.rawBufferOrString || `${options.title}_${options.author}_${Date.now()}`
    );

    const detectedType = options.sourceType || this.detectSourceType(options.rawBufferOrString, options.filename);

    // Analysis for Classification & OCR Requirements
    const analysis: IAnalysisResultData = KnowledgeSourceAnalyzer.analyzeSource(
      detectedType,
      normalizedMeta,
      options.rawBufferOrString
    );

    const draftSource = new KnowledgeSource({
      sourceType: detectedType,
      status: 'DRAFT',
      trustLevel: options.trustLevel || 'UNKNOWN',
      metadata: normalizedMeta,
      fingerprint,
      version: new KnowledgeSourceVersion(),
      ocrMetadata: analysis.initialOcrMetadata,
      classification: analysis.classification,
      ocrRequirement: analysis.ocrRequirement
    });

    // Check duplicate
    const duplicateCheck = DuplicateSourceDetector.detectDuplicate(
      draftSource,
      this.registry.getAllSources()
    );

    if (duplicateCheck.isDuplicate) {
      return Object.freeze({
        success: false,
        duplicateCheck,
        errors: Object.freeze([
          `Duplicate source detected. Matches existing source ID '${duplicateCheck.matchedSourceId}' via ${duplicateCheck.matchType}`
        ]),
        warnings: valResult.warnings
      });
    }

    let finalSource = draftSource;

    if (options.autoApprove) {
      const approvalRes = this.workflow.approve(draftSource, 'SYSTEM_AUTO_APPROVER', 'Auto-approved on registration');
      if (approvalRes.success) {
        finalSource = approvalRes.source;
      }
    }

    this.registry.registerSource(finalSource);

    return Object.freeze({
      success: true,
      source: finalSource,
      duplicateCheck,
      errors: Object.freeze([]),
      warnings: valResult.warnings
    });
  }

  public analyzeSource(sourceId: string, rawBufferOrString?: string | Uint8Array): KnowledgeSource | null {
    const existing = this.registry.getSourceById(sourceId);
    if (!existing) return null;

    const analysis = KnowledgeSourceAnalyzer.analyzeSource(
      existing.sourceType,
      existing.metadata,
      rawBufferOrString
    );

    const updated = existing
      .withClassification(analysis.classification, analysis.ocrRequirement)
      .withOcrMetadata(analysis.initialOcrMetadata);

    this.registry.registerSource(updated);
    return updated;
  }

  public determineOCRRequirement(sourceId: string): OCRRequirement | null {
    const existing = this.registry.getSourceById(sourceId);
    if (!existing) return null;

    if (existing.ocrRequirement) {
      return existing.ocrRequirement;
    }

    const analysis = KnowledgeSourceAnalyzer.analyzeSource(existing.sourceType, existing.metadata);
    return analysis.ocrRequirement;
  }

  public approveSource(sourceId: string, reviewer: string, notes?: string): KnowledgeSource | null {
    const existing = this.registry.getSourceById(sourceId);
    if (!existing) return null;

    const res = this.workflow.approve(existing, reviewer, notes);
    if (res.success) {
      this.registry.registerSource(res.source);
      return res.source;
    }
    return null;
  }

  public rejectSource(sourceId: string, reviewer: string, reason: string): KnowledgeSource | null {
    const existing = this.registry.getSourceById(sourceId);
    if (!existing) return null;

    const res = this.workflow.reject(existing, reviewer, reason);
    if (res.success) {
      this.registry.registerSource(res.source);
      return res.source;
    }
    return null;
  }

  public updateMetadata(
    sourceId: string,
    patch: Partial<KnowledgeSourceMetadata>
  ): KnowledgeSource | null {
    const existing = this.registry.getSourceById(sourceId);
    if (!existing) return null;

    const resolved = MetadataResolver.resolve(existing.metadata, patch);
    const normalized = MetadataNormalizer.normalize(resolved);
    const updated = existing.withMetadata(normalized);

    this.registry.registerSource(updated);
    return updated;
  }

  public updateOcrMetadata(sourceId: string, ocrMetadata: OCRMetadata): KnowledgeSource | null {
    const existing = this.registry.getSourceById(sourceId);
    if (!existing) return null;

    const updated = existing.withOcrMetadata(ocrMetadata);
    this.registry.registerSource(updated);
    return updated;
  }

  public getSourceById(sourceId: string): KnowledgeSource | null {
    return this.registry.getSourceById(sourceId);
  }

  public getSourceByChecksum(checksum: string): KnowledgeSource | null {
    return this.registry.getSourceByChecksum(checksum);
  }

  public lookupVersions(sourceId: string): readonly KnowledgeSource[] {
    return this.registry.getVersionHistory(sourceId);
  }

  public getRegistry(): KnowledgeSourceRegistry {
    return this.registry;
  }

  public getCatalog(): KnowledgeSourceCatalog {
    return this.catalog;
  }
}

export const knowledgeSourceService = KnowledgeSourceService.getInstance();
