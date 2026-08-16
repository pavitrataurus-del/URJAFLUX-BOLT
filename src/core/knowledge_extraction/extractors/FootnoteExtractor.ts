import { BaseNode, NodeType, FootnoteNode } from '../../knowledge_parsing/types/document.types';
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

export class FootnoteExtractor extends BaseKnowledgeExtractor {
  public readonly capabilities: IExtractorCapabilities = {
    name: 'FootnoteExtractor',
    version: '1.0.0',
    priority: 40,
    supportedNodeTypes: [NodeType.FOOTNOTE],
    supportedCategories: [KnowledgeCategory.REFERENCE, KnowledgeCategory.DEFINITION],
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

    if (node.type !== NodeType.FOOTNOTE) {
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
        warnings: [`Node ${node.id} is not a FOOTNOTE node`],
        errors: []
      };
    }

    const footnoteNode = node as FootnoteNode;
    const documentId = context.document.documentId;
    const rawText = footnoteNode.text.trim();
    const symbol = footnoteNode.symbol.trim() || '*';

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
        warnings: [`Footnote node ${node.id} contains empty text`],
        errors: []
      };
    }

    // 1. Evidence
    const evidence = this.createEvidence(
      documentId,
      footnoteNode,
      `[Footnote ${symbol}]: ${rawText}`,
      KnowledgeEvidenceType.FOOTNOTE_TEXT,
      'RULE_FOOTNOTE_EXPLICIT_TEXT'
    );
    evidenceList.push(evidence);

    // 2. Knowledge Object
    const fnObj = this.createKnowledgeObject(
      documentId,
      footnoteNode.id,
      KnowledgeCategory.REFERENCE,
      `Footnote_${symbol}`,
      'content',
      rawText,
      1.0,
      KnowledgeSeverity.INFORMATIONAL,
      {
        symbol,
        pageNumber: footnoteNode.pageNumber,
        sourceLocation: footnoteNode.sourceLocation
      }
    );
    objects.push(fnObj);

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
