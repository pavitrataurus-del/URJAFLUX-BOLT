import { KnowledgeSourceType } from './KnowledgeSourceType';
import { KnowledgeSourceStatus } from './KnowledgeSourceStatus';
import { KnowledgeSourceMetadata, IKnowledgeSourceMetadataData } from './KnowledgeSourceMetadata';
import { KnowledgeSourceVersion, IKnowledgeSourceVersionData } from './KnowledgeSourceVersion';
import { KnowledgeFingerprint, IKnowledgeFingerprintData } from '../fingerprint/KnowledgeFingerprint';
import { TrustLevel } from '../approval/TrustLevel';
import { OCRMetadata, IOCRMetadataData } from './OCRMetadata';
import { DocumentClassification, IDocumentClassificationData } from '../classification/DocumentClassification';
import { OCRRequirement, IOCRRequirementData } from '../classification/OCRRequirement';

export interface IKnowledgeSourceData {
  readonly sourceId: string;
  readonly sourceType: KnowledgeSourceType;
  readonly status: KnowledgeSourceStatus;
  readonly trustLevel: TrustLevel;
  readonly metadata: IKnowledgeSourceMetadataData;
  readonly version: IKnowledgeSourceVersionData;
  readonly fingerprint: IKnowledgeFingerprintData;
  readonly ocrMetadata?: IOCRMetadataData;
  readonly classification?: IDocumentClassificationData;
  readonly ocrRequirement?: IOCRRequirementData;
  readonly reviewer?: string;
  readonly approvedAt?: number;
  readonly approvalNotes?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export class KnowledgeSource implements IKnowledgeSourceData {
  public readonly sourceId: string;
  public readonly sourceType: KnowledgeSourceType;
  public readonly status: KnowledgeSourceStatus;
  public readonly trustLevel: TrustLevel;
  public readonly metadata: KnowledgeSourceMetadata;
  public readonly version: KnowledgeSourceVersion;
  public readonly fingerprint: KnowledgeFingerprint;
  public readonly ocrMetadata?: OCRMetadata;
  public readonly classification?: DocumentClassification;
  public readonly ocrRequirement?: OCRRequirement;
  public readonly reviewer?: string;
  public readonly approvedAt?: number;
  public readonly approvalNotes?: string;
  public readonly createdAt: number;
  public readonly updatedAt: number;

  constructor(data: {
    sourceId?: string;
    sourceType: KnowledgeSourceType;
    status?: KnowledgeSourceStatus;
    trustLevel?: TrustLevel;
    metadata: KnowledgeSourceMetadata;
    version?: KnowledgeSourceVersion;
    fingerprint: KnowledgeFingerprint;
    ocrMetadata?: OCRMetadata;
    classification?: DocumentClassification;
    ocrRequirement?: OCRRequirement;
    reviewer?: string;
    approvedAt?: number;
    approvalNotes?: string;
    createdAt?: number;
    updatedAt?: number;
  }) {
    this.sourceId = data.sourceId || `ks_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.sourceType = data.sourceType;
    this.status = data.status || 'DRAFT';
    this.trustLevel = data.trustLevel || 'UNKNOWN';
    this.metadata = data.metadata;
    this.version = data.version || new KnowledgeSourceVersion();
    this.fingerprint = data.fingerprint;
    this.ocrMetadata = data.ocrMetadata;
    this.classification = data.classification;
    this.ocrRequirement = data.ocrRequirement;
    this.reviewer = data.reviewer;
    this.approvedAt = data.approvedAt;
    this.approvalNotes = data.approvalNotes;
    this.createdAt = data.createdAt ?? Date.now();
    this.updatedAt = data.updatedAt ?? Date.now();

    Object.freeze(this);
  }

  // Convenient Getters for direct model access
  public get title(): string { return this.metadata.title; }
  public get subtitle(): string | undefined { return this.metadata.subtitle; }
  public get author(): string { return this.metadata.author; }
  public get publisher(): string | undefined { return this.metadata.publisher; }
  public get edition(): string | undefined { return this.metadata.edition; }
  public get publicationYear(): number | undefined { return this.metadata.publicationYear; }
  public get language(): string { return this.metadata.language; }
  public get isbn(): string | undefined { return this.metadata.isbn; }
  public get doi(): string | undefined { return this.metadata.doi; }
  public get description(): string | undefined { return this.metadata.description; }
  public get keywords(): readonly string[] { return this.metadata.keywords; }
  public get tags(): readonly string[] { return this.metadata.tags; }
  public get category(): string { return this.metadata.category; }
  public get fileSize(): number { return this.metadata.fileSize; }
  public get pageCount(): number { return this.metadata.pageCount; }
  public get checksum(): string { return this.fingerprint.checksum; }
  public get license(): string { return this.metadata.license; }

  public withStatus(
    status: KnowledgeSourceStatus,
    reviewer?: string,
    notes?: string
  ): KnowledgeSource {
    return new KnowledgeSource({
      ...this,
      status,
      reviewer: reviewer || this.reviewer,
      approvalNotes: notes !== undefined ? notes : this.approvalNotes,
      approvedAt: status === 'APPROVED' ? Date.now() : this.approvedAt,
      updatedAt: Date.now()
    });
  }

  public withTrustLevel(trustLevel: TrustLevel): KnowledgeSource {
    return new KnowledgeSource({
      ...this,
      trustLevel,
      updatedAt: Date.now()
    });
  }

  public withMetadata(metadata: KnowledgeSourceMetadata): KnowledgeSource {
    return new KnowledgeSource({
      ...this,
      metadata,
      updatedAt: Date.now()
    });
  }

  public withVersion(version: KnowledgeSourceVersion): KnowledgeSource {
    return new KnowledgeSource({
      ...this,
      version,
      updatedAt: Date.now()
    });
  }

  public withOcrMetadata(ocrMetadata: OCRMetadata): KnowledgeSource {
    return new KnowledgeSource({
      ...this,
      ocrMetadata,
      updatedAt: Date.now()
    });
  }

  public withClassification(
    classification: DocumentClassification,
    ocrRequirement?: OCRRequirement
  ): KnowledgeSource {
    return new KnowledgeSource({
      ...this,
      classification,
      ocrRequirement: ocrRequirement || this.ocrRequirement,
      updatedAt: Date.now()
    });
  }

  public toJSON(): IKnowledgeSourceData {
    return {
      sourceId: this.sourceId,
      sourceType: this.sourceType,
      status: this.status,
      trustLevel: this.trustLevel,
      metadata: this.metadata.toJSON(),
      version: this.version.toJSON(),
      fingerprint: this.fingerprint.toJSON(),
      ocrMetadata: this.ocrMetadata?.toJSON(),
      classification: this.classification?.toJSON(),
      ocrRequirement: this.ocrRequirement?.toJSON(),
      reviewer: this.reviewer,
      approvedAt: this.approvedAt,
      approvalNotes: this.approvalNotes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
