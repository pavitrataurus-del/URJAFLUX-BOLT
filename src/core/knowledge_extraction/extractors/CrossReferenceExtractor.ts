import { BaseNode, NodeType, CrossReferenceNode } from '../../knowledge_parsing/types/document.types';
import {
  KnowledgeCategory,
  KnowledgeSeverity,
  KnowledgeEvidenceType
} from '../types/knowledge.types';
import { KnowledgeRelationshipType } from '../types/relationship.types';
import { PipelineContext } from '../pipeline/PipelineContext';
import {
  BaseKnowledgeExtractor,
  IExtractorCapabilities,
  IExtractionResult,
  IExtractorMetrics
} from './BaseKnowledgeExtractor';
import { KnowledgeObject } from '../models/KnowledgeObject';
import { KnowledgeEvidence } from '../models/KnowledgeEvidence';

export class CrossReferenceExtractor extends BaseKnowledgeExtractor {
  public readonly capabilities: IExtractorCapabilities = {
    name: 'CrossReferenceExtractor',
    version: '1.0.0',
    priority: 50,
    supportedNodeTypes: [NodeType.CROSS_REF],
    supportedCategories: [KnowledgeCategory.REFERENCE, KnowledgeCategory.RELATIONSHIP],
    enabled: true
  };

  public async extract(
    node: BaseNode,
    context: PipelineContext
  ): Promise<IExtractionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];
    const objects: KnowledgeObject[] = [];
    const evidenceList: KnowledgeEvidence[] = [];

    if (node.type !== NodeType.CROSS_REF) {
      return {
        objects: [],
        evidence: [],
        relationships: [],
        metrics: {
          ...this.createEmptyMetrics(),
          nodesVisited: 1,
          skippedNodes: 1,
          executionTimeMs: Date.now() - startTime
        },
        warnings: [`Node ${node.id} is not a CROSS_REF node`],
        errors: []
      };
    }

    const crossRefNode = node as CrossReferenceNode;
    const documentId = context.document.documentId;
    const displayText = crossRefNode.displayText.trim();
    const targetId = crossRefNode.targetId.trim();

    if (!displayText && !targetId) {
      return {
        objects: [],
        evidence: [],
        relationships: [],
        metrics: {
          ...this.createEmptyMetrics(),
          nodesVisited: 1,
          skippedNodes: 1,
          warnings: 1,
          executionTimeMs: Date.now() - startTime
        },
        warnings: [`CrossReference node ${node.id} contains empty targetId and displayText`],
        errors: []
      };
    }

    // 1. Evidence
    const evidence = this.createEvidence(
      documentId,
      crossRefNode,
      `[CrossReference]: ${displayText} (Target: ${targetId})`,
      KnowledgeEvidenceType.QUOTED_TEXT,
      'RULE_CROSS_REF_EXPLICIT'
    );
    evidenceList.push(evidence);

    // 2. Knowledge Object representing the explicit CrossReference link
    const refObj = this.createKnowledgeObject(
      documentId,
      crossRefNode.id,
      KnowledgeCategory.REFERENCE,
      'CrossReferenceLink',
      'displayText',
      displayText,
      1.0,
      KnowledgeSeverity.INFORMATIONAL,
      {
        targetId,
        pageNumber: crossRefNode.pageNumber,
        sourceLocation: crossRefNode.sourceLocation,
        relationshipTypePending: KnowledgeRelationshipType.REFERENCES
      }
    );
    objects.push(refObj);

    const metrics: IExtractorMetrics = {
      executionTimeMs: Date.now() - startTime,
      objectsProduced: objects.length,
      evidenceProduced: evidenceList.length,
      relationshipsProduced: 0,
      nodesVisited: 1,
      warnings: warnings.length,
      skippedNodes: 0,
      errors: errors.length
    };

    return {
      objects,
      evidence: evidenceList,
      relationships: [],
      metrics,
      warnings,
      errors
    };
  }
}
