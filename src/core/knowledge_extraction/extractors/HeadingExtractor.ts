import { BaseNode, NodeType, HeadingNode } from '../../knowledge_parsing/types/document.types';
import {
  KnowledgeCategory,
  KnowledgeSeverity,
  KnowledgeEvidenceType
} from '../types/knowledge.types';
import { PipelineContext } from '../pipeline/PipelineContext';
import {
  BaseKnowledgeExtractor,
  IExtractorCapabilities,
  IExtractionResult,
  IExtractorMetrics
} from './BaseKnowledgeExtractor';
import { KnowledgeObject } from '../models/KnowledgeObject';
import { KnowledgeEvidence } from '../models/KnowledgeEvidence';

export class HeadingExtractor extends BaseKnowledgeExtractor {
  public readonly capabilities: IExtractorCapabilities = {
    name: 'HeadingExtractor',
    version: '1.0.0',
    priority: 10,
    supportedNodeTypes: [NodeType.HEADING],
    supportedCategories: [KnowledgeCategory.OBJECT, KnowledgeCategory.REFERENCE, KnowledgeCategory.UNKNOWN],
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

    if (node.type !== NodeType.HEADING) {
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
        warnings: [`Node ${node.id} is not a HEADING node`],
        errors: []
      };
    }

    const headingNode = node as HeadingNode;
    const documentId = context.document.documentId;
    const rawText = headingNode.text.trim();

    if (!rawText) {
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
        warnings: [`Heading node ${node.id} contains empty text`],
        errors: []
      };
    }

    // 1. Evidence
    const evidence = this.createEvidence(
      documentId,
      headingNode,
      rawText,
      KnowledgeEvidenceType.HEADING_TEXT,
      'RULE_EXPLICIT_HEADING_TEXT'
    );
    evidenceList.push(evidence);

    // 2. Knowledge Object for Heading Structure
    const headingObj = this.createKnowledgeObject(
      documentId,
      headingNode.id,
      KnowledgeCategory.OBJECT,
      'DocumentHeading',
      'title',
      rawText,
      1.0,
      KnowledgeSeverity.INFORMATIONAL,
      {
        headingLevel: headingNode.level,
        orderIndex: headingNode.orderIndex,
        pageNumber: headingNode.pageNumber
      }
    );
    objects.push(headingObj);

    // 3. Knowledge Object for Heading Level Attribute
    const levelObj = this.createKnowledgeObject(
      documentId,
      headingNode.id,
      KnowledgeCategory.REFERENCE,
      rawText,
      'headingLevel',
      headingNode.level,
      1.0,
      KnowledgeSeverity.INFORMATIONAL,
      {
        orderIndex: headingNode.orderIndex
      }
    );
    objects.push(levelObj);

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
