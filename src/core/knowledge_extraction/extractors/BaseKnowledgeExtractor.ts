import { BaseNode, NodeType } from '../../knowledge_parsing/types/document.types';
import {
  KnowledgeCategory,
  KnowledgeSeverity,
  KnowledgeStatus,
  KnowledgeEvidenceType
} from '../types/knowledge.types';
import { KnowledgeRelationshipType } from '../types/relationship.types';
import { KnowledgeObject } from '../models/KnowledgeObject';
import { KnowledgeEvidence } from '../models/KnowledgeEvidence';
import { KnowledgeRelationship } from '../models/KnowledgeRelationship';
import { PipelineContext } from '../pipeline/PipelineContext';

export interface IExtractorCapabilities {
  readonly name: string;
  readonly version: string;
  readonly priority: number;
  readonly supportedNodeTypes: readonly NodeType[];
  readonly supportedCategories: readonly KnowledgeCategory[];
  readonly enabled: boolean;
}

export interface IExtractorMetrics {
  readonly executionTimeMs: number;
  readonly objectsProduced: number;
  readonly evidenceProduced: number;
  readonly relationshipsProduced: number;
  readonly nodesVisited: number;
  readonly warnings: number;
  readonly skippedNodes: number;
  readonly errors: number;
}

export interface IExtractionResult {
  readonly objects: readonly KnowledgeObject[];
  readonly evidence: readonly KnowledgeEvidence[];
  readonly relationships: readonly KnowledgeRelationship[];
  readonly metrics: IExtractorMetrics;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

export abstract class BaseKnowledgeExtractor {
  public abstract readonly capabilities: IExtractorCapabilities;

  public canExtract(node: BaseNode): boolean {
    if (!this.capabilities.enabled) {
      return false;
    }
    return this.capabilities.supportedNodeTypes.includes(node.type);
  }

  public abstract extract(
    node: BaseNode,
    context: PipelineContext
  ): Promise<IExtractionResult>;

  protected createEvidence(
    documentId: string,
    node: BaseNode,
    quotedText: string,
    evidenceType: KnowledgeEvidenceType,
    ruleName: string,
    confidence = 1.0
  ): KnowledgeEvidence {
    const evidenceId = `ev-${node.id}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    return new KnowledgeEvidence({
      evidenceId,
      documentId,
      nodeId: node.id,
      pageNumber: node.pageNumber,
      byteOffset: node.sourceLocation?.byteOffset,
      characterOffset: node.sourceLocation?.characterOffset,
      lineNumber: node.sourceLocation?.lineIndex,
      quotedText,
      sourceLocation: node.sourceLocation,
      confidence,
      evidenceType,
      extractedByRule: ruleName,
      pipelineStage: 'EXTRACTOR_DISPATCH'
    });
  }

  protected createKnowledgeObject(
    documentId: string,
    nodeId: string,
    category: KnowledgeCategory,
    entity: string,
    attribute: string,
    value: string | number | boolean | Record<string, unknown> | readonly unknown[],
    confidence = 1.0,
    severity: KnowledgeSeverity = KnowledgeSeverity.INFORMATIONAL,
    metadata: Record<string, unknown> = {}
  ): KnowledgeObject {
    const knowledgeId = `kobj-${nodeId}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    return new KnowledgeObject({
      knowledgeId,
      category,
      entity,
      attribute,
      value,
      confidence,
      status: KnowledgeStatus.EXTRACTED,
      severity,
      metadata: {
        ...metadata,
        extractorName: this.capabilities.name,
        extractorVersion: this.capabilities.version
      },
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      sourceDocumentId: documentId,
      sourceNodeId: nodeId
    });
  }

  protected createRelationship(
    sourceKnowledgeId: string,
    targetKnowledgeId: string,
    relationshipType: KnowledgeRelationshipType | string,
    confidence = 1.0,
    metadata: Record<string, unknown> = {}
  ): KnowledgeRelationship {
    const relationshipId = `rel-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    return new KnowledgeRelationship({
      relationshipId,
      sourceKnowledgeId,
      targetKnowledgeId,
      relationshipType,
      confidence,
      metadata,
      createdAt: Date.now(),
      version: '1.0.0'
    });
  }

  protected createEmptyMetrics(): IExtractorMetrics {
    return {
      executionTimeMs: 0,
      objectsProduced: 0,
      evidenceProduced: 0,
      relationshipsProduced: 0,
      nodesVisited: 0,
      warnings: 0,
      skippedNodes: 0,
      errors: 0
    };
  }
}
