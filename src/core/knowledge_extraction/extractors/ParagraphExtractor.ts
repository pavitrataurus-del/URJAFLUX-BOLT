import { BaseNode, NodeType, ParagraphNode } from '../../knowledge_parsing/types/document.types';
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

export class ParagraphExtractor extends BaseKnowledgeExtractor {
  public readonly capabilities: IExtractorCapabilities = {
    name: 'ParagraphExtractor',
    version: '1.0.0',
    priority: 20,
    supportedNodeTypes: [NodeType.PARAGRAPH],
    supportedCategories: [
      KnowledgeCategory.RULE,
      KnowledgeCategory.PRINCIPLE,
      KnowledgeCategory.CONSTRAINT,
      KnowledgeCategory.WARNING,
      KnowledgeCategory.DEFINITION,
      KnowledgeCategory.PROCEDURE,
      KnowledgeCategory.MEASUREMENT
    ],
    enabled: true
  };

  private static readonly KEY_VALUE_REGEX = /^([A-Za-z0-9\s_\-\.]+)\s*[:=]\s*(.+)$/;
  private static readonly MEASUREMENT_REGEX = /(\d+(?:\.\d+)?)\s*(meters?|m|cm|mm|ft|feet|inches|in|deg|degrees|°|sqft|sqm|kg|lbs|%|percent)/i;
  private static readonly WARNING_REGEX = /^(WARNING|CAUTION|NOTE|IMPORTANT|ALERT)\s*[:\-]/i;
  private static readonly CONSTRAINT_REGEX = /\b(MUST NOT|SHALL NOT|SHOULD NOT|FORBIDDEN|PROHIBITED|NEVER)\b/i;
  private static readonly PROCEDURE_REGEX = /^(STEP\s*\d+|PROCEDURE|\d+\.)\s*[:\-]/i;
  private static readonly DEFINITION_REGEX = /^([A-Za-z0-9\s_\-]+)\s+(is defined as|means|refers to)\s+(.+)$/i;

  public async extract(
    node: BaseNode,
    context: PipelineContext
  ): Promise<IExtractionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];
    const objects: KnowledgeObject[] = [];
    const evidenceList: KnowledgeEvidence[] = [];

    if (node.type !== NodeType.PARAGRAPH) {
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
        warnings: [`Node ${node.id} is not a PARAGRAPH node`],
        errors: []
      };
    }

    const paragraphNode = node as ParagraphNode;
    const documentId = context.document.documentId;
    const rawText = paragraphNode.text.trim();

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
        warnings: [`Paragraph node ${node.id} contains empty text`],
        errors: []
      };
    }

    // Always create primary quoted evidence
    const evidence = this.createEvidence(
      documentId,
      paragraphNode,
      rawText,
      KnowledgeEvidenceType.QUOTED_TEXT,
      'RULE_PARAGRAPH_QUOTED_TEXT'
    );
    evidenceList.push(evidence);

    // Rule 1: Warning / Caution
    if (ParagraphExtractor.WARNING_REGEX.test(rawText)) {
      const match = rawText.match(ParagraphExtractor.WARNING_REGEX);
      const label = match ? match[1].toUpperCase() : 'WARNING';
      const warningObj = this.createKnowledgeObject(
        documentId,
        paragraphNode.id,
        KnowledgeCategory.WARNING,
        label,
        'statement',
        rawText,
        1.0,
        KnowledgeSeverity.HIGH,
        { ruleType: 'EXPLICIT_WARNING_PREFIX' }
      );
      objects.push(warningObj);
    }

    // Rule 2: Constraint (MUST NOT, SHALL NOT, etc.)
    if (ParagraphExtractor.CONSTRAINT_REGEX.test(rawText)) {
      const constraintObj = this.createKnowledgeObject(
        documentId,
        paragraphNode.id,
        KnowledgeCategory.CONSTRAINT,
        'ExplicitConstraint',
        'statement',
        rawText,
        1.0,
        KnowledgeSeverity.HIGH,
        { ruleType: 'EXPLICIT_PROHIBITION_KEYWORD' }
      );
      objects.push(constraintObj);
    }

    // Rule 3: Key-Value pair
    if (ParagraphExtractor.KEY_VALUE_REGEX.test(rawText)) {
      const match = rawText.match(ParagraphExtractor.KEY_VALUE_REGEX);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        const kvObj = this.createKnowledgeObject(
          documentId,
          paragraphNode.id,
          KnowledgeCategory.DEFINITION,
          key,
          'value',
          value,
          1.0,
          KnowledgeSeverity.INFORMATIONAL,
          { ruleType: 'EXPLICIT_KEY_VALUE_PATTERN' }
        );
        objects.push(kvObj);
      }
    }

    // Rule 4: Measurement
    if (ParagraphExtractor.MEASUREMENT_REGEX.test(rawText)) {
      const match = rawText.match(ParagraphExtractor.MEASUREMENT_REGEX);
      if (match) {
        const numericVal = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        const measurementObj = this.createKnowledgeObject(
          documentId,
          paragraphNode.id,
          KnowledgeCategory.MEASUREMENT,
          'ExplicitMeasurement',
          unit,
          numericVal,
          1.0,
          KnowledgeSeverity.INFORMATIONAL,
          {
            rawText,
            extractedUnit: unit,
            numericValue: numericVal,
            ruleType: 'EXPLICIT_MEASUREMENT_UNIT_PATTERN'
          }
        );
        objects.push(measurementObj);
      }
    }

    // Rule 5: Procedure step
    if (ParagraphExtractor.PROCEDURE_REGEX.test(rawText)) {
      const procedureObj = this.createKnowledgeObject(
        documentId,
        paragraphNode.id,
        KnowledgeCategory.PROCEDURE,
        'ProcedureStep',
        'instruction',
        rawText,
        1.0,
        KnowledgeSeverity.INFORMATIONAL,
        { ruleType: 'EXPLICIT_PROCEDURE_STEP_PREFIX' }
      );
      objects.push(procedureObj);
    }

    // Rule 6: Explicit Definition ("X is defined as Y")
    if (ParagraphExtractor.DEFINITION_REGEX.test(rawText)) {
      const match = rawText.match(ParagraphExtractor.DEFINITION_REGEX);
      if (match) {
        const term = match[1].trim();
        const definition = match[3].trim();
        const defObj = this.createKnowledgeObject(
          documentId,
          paragraphNode.id,
          KnowledgeCategory.DEFINITION,
          term,
          'definition',
          definition,
          1.0,
          KnowledgeSeverity.INFORMATIONAL,
          { ruleType: 'EXPLICIT_DEFINITION_SENTENCE' }
        );
        objects.push(defObj);
      }
    }

    // Fallback Rule: If no specific category matched, generate standard RULE statement
    if (objects.length === 0) {
      const generalObj = this.createKnowledgeObject(
        documentId,
        paragraphNode.id,
        KnowledgeCategory.RULE,
        'DocumentStatement',
        'content',
        rawText,
        1.0,
        KnowledgeSeverity.INFORMATIONAL,
        { ruleType: 'FALLBACK_PARAGRAPH_STATEMENT' }
      );
      objects.push(generalObj);
    }

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
