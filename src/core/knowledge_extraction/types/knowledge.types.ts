import { SourceLocation } from '../../knowledge_parsing/types/document.types';

export enum KnowledgeCategory {
  RULE = 'RULE',
  PRINCIPLE = 'PRINCIPLE',
  CONSTRAINT = 'CONSTRAINT',
  WARNING = 'WARNING',
  EXCEPTION = 'EXCEPTION',
  DEFINITION = 'DEFINITION',
  PROCEDURE = 'PROCEDURE',
  MEASUREMENT = 'MEASUREMENT',
  OBJECT = 'OBJECT',
  DIRECTION = 'DIRECTION',
  REFERENCE = 'REFERENCE',
  RELATIONSHIP = 'RELATIONSHIP',
  UNKNOWN = 'UNKNOWN'
}

export enum KnowledgeEvidenceType {
  QUOTED_TEXT = 'QUOTED_TEXT',
  TABLE_CELL = 'TABLE_CELL',
  HEADING_TEXT = 'HEADING_TEXT',
  FOOTNOTE_TEXT = 'FOOTNOTE_TEXT',
  CODE_SNIPPET = 'CODE_SNIPPET',
  METADATA_KEY_VALUE = 'METADATA_KEY_VALUE',
  COMPOSITE = 'COMPOSITE'
}

export enum KnowledgeSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFORMATIONAL = 'INFORMATIONAL'
}

export enum KnowledgeStatus {
  DRAFT = 'DRAFT',
  EXTRACTED = 'EXTRACTED',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED'
}

export interface IKnowledgeObjectData {
  readonly knowledgeId: string;
  readonly category: KnowledgeCategory;
  readonly entity: string;
  readonly attribute: string;
  readonly value: string | number | boolean | Record<string, unknown> | readonly unknown[];
  readonly confidence: number;
  readonly status: KnowledgeStatus;
  readonly severity: KnowledgeSeverity;
  readonly metadata: Record<string, unknown>;
  readonly version: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly sourceDocumentId: string;
  readonly sourceNodeId: string;
  readonly sourceLocation?: SourceLocation;
}
