import { IKnowledgeObjectData } from './knowledge.types';
import { IKnowledgeRelationshipData } from './relationship.types';
import { IKnowledgeMetricsData } from './metrics.types';
import { SourceLocation } from '../../knowledge_parsing/types/document.types';
import { KnowledgeEvidenceType } from './knowledge.types';

export interface IKnowledgeEvidenceData {
  readonly evidenceId: string;
  readonly documentId: string;
  readonly nodeId: string;
  readonly pageNumber?: number;
  readonly byteOffset?: number;
  readonly characterOffset?: number;
  readonly lineNumber?: number;
  readonly quotedText: string;
  readonly sourceLocation?: SourceLocation;
  readonly confidence: number;
  readonly evidenceType: KnowledgeEvidenceType;
  readonly extractedByRule?: string;
  readonly pipelineStage?: string;
}

export interface IKnowledgePackageData {
  readonly packageId: string;
  readonly documentId: string;
  readonly packageHash: string;
  readonly sourceFileName: string;
  readonly version: string;
  readonly createdAt: number;
  readonly objects: readonly IKnowledgeObjectData[];
  readonly relationships: readonly IKnowledgeRelationshipData[];
  readonly evidenceList: readonly IKnowledgeEvidenceData[];
  readonly metrics: IKnowledgeMetricsData;
  readonly metadata: Record<string, unknown>;
}
