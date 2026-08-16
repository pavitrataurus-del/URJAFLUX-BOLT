import { IKnowledgePackageData, IKnowledgeEvidenceData } from '../types/package.types';
import { IKnowledgeObjectData } from '../types/knowledge.types';
import { IKnowledgeRelationshipData } from '../types/relationship.types';
import { IKnowledgeMetricsData } from '../types/metrics.types';
import { KnowledgeObject } from './KnowledgeObject';
import { KnowledgeRelationship } from './KnowledgeRelationship';
import { KnowledgeEvidence } from './KnowledgeEvidence';

export class KnowledgePackage implements IKnowledgePackageData {
  public readonly packageId: string;
  public readonly documentId: string;
  public readonly packageHash: string;
  public readonly sourceFileName: string;
  public readonly version: string;
  public readonly createdAt: number;
  public readonly objects: readonly KnowledgeObject[];
  public readonly relationships: readonly KnowledgeRelationship[];
  public readonly evidenceList: readonly KnowledgeEvidence[];
  public readonly metrics: IKnowledgeMetricsData;
  public readonly metadata: Record<string, unknown>;

  constructor(data: IKnowledgePackageData) {
    this.packageId = data.packageId;
    this.documentId = data.documentId;
    this.packageHash = data.packageHash;
    this.sourceFileName = data.sourceFileName;
    this.version = data.version;
    this.createdAt = data.createdAt;
    this.objects = data.objects.map((obj) =>
      obj instanceof KnowledgeObject ? obj : new KnowledgeObject(obj)
    );
    this.relationships = data.relationships.map((rel) =>
      rel instanceof KnowledgeRelationship ? rel : new KnowledgeRelationship(rel)
    );
    this.evidenceList = data.evidenceList.map((ev) =>
      ev instanceof KnowledgeEvidence ? ev : new KnowledgeEvidence(ev)
    );
    this.metrics = data.metrics;
    this.metadata = data.metadata;
  }

  public toJSON(): IKnowledgePackageData {
    return {
      packageId: this.packageId,
      documentId: this.documentId,
      packageHash: this.packageHash,
      sourceFileName: this.sourceFileName,
      version: this.version,
      createdAt: this.createdAt,
      objects: this.objects.map((obj) => obj.toJSON()),
      relationships: this.relationships.map((rel) => rel.toJSON()),
      evidenceList: this.evidenceList.map((ev) => ev.toJSON()),
      metrics: this.metrics,
      metadata: this.metadata
    };
  }

  public static fromJSON(json: IKnowledgePackageData): KnowledgePackage {
    return new KnowledgePackage(json);
  }
}
