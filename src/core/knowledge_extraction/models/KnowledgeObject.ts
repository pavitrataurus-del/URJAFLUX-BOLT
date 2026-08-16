import { SourceLocation } from '../../knowledge_parsing/types/document.types';
import {
  KnowledgeCategory,
  KnowledgeSeverity,
  KnowledgeStatus,
  IKnowledgeObjectData
} from '../types/knowledge.types';

export class KnowledgeObject implements IKnowledgeObjectData {
  public readonly knowledgeId: string;
  public readonly category: KnowledgeCategory;
  public readonly entity: string;
  public readonly attribute: string;
  public readonly value: string | number | boolean | Record<string, unknown> | readonly unknown[];
  public readonly confidence: number;
  public readonly status: KnowledgeStatus;
  public readonly severity: KnowledgeSeverity;
  public readonly metadata: Record<string, unknown>;
  public readonly version: string;
  public readonly createdAt: number;
  public readonly updatedAt: number;
  public readonly sourceDocumentId: string;
  public readonly sourceNodeId: string;
  public readonly sourceLocation?: SourceLocation;

  constructor(data: IKnowledgeObjectData) {
    this.knowledgeId = data.knowledgeId;
    this.category = data.category;
    this.entity = data.entity;
    this.attribute = data.attribute;
    this.value = data.value;
    this.confidence = data.confidence;
    this.status = data.status;
    this.severity = data.severity;
    this.metadata = data.metadata;
    this.version = data.version;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.sourceDocumentId = data.sourceDocumentId;
    this.sourceNodeId = data.sourceNodeId;
    this.sourceLocation = data.sourceLocation;
  }

  public withStatus(newStatus: KnowledgeStatus): KnowledgeObject {
    return new KnowledgeObject({
      ...this.toJSON(),
      status: newStatus,
      updatedAt: Date.now()
    });
  }

  public withSeverity(newSeverity: KnowledgeSeverity): KnowledgeObject {
    return new KnowledgeObject({
      ...this.toJSON(),
      severity: newSeverity,
      updatedAt: Date.now()
    });
  }

  public toJSON(): IKnowledgeObjectData {
    return {
      knowledgeId: this.knowledgeId,
      category: this.category,
      entity: this.entity,
      attribute: this.attribute,
      value: this.value,
      confidence: this.confidence,
      status: this.status,
      severity: this.severity,
      metadata: this.metadata,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      sourceDocumentId: this.sourceDocumentId,
      sourceNodeId: this.sourceNodeId,
      sourceLocation: this.sourceLocation
    };
  }

  public static fromJSON(json: IKnowledgeObjectData): KnowledgeObject {
    return new KnowledgeObject(json);
  }
}
