import { StructuredDocument } from '../reconstruction/StructuredDocument';
import { ParsedDocument, NodeType, TableNode, ParagraphNode, HeadingNode } from '../../knowledge_parsing/types/document.types';
import { OCRDocument } from '../models/OCRDocument';
import { OCRContractViolation, OCRCompatibilityReport } from './OCRCompatibilityReport';
import { StandardStructuredDocumentAdapter } from './IStructuredDocumentAdapter';
import { Logger } from '../../utils/logger';

export class OCRContractValidator {
  private static readonly adapter = new StandardStructuredDocumentAdapter();

  public static validateContract(docInput: StructuredDocument | ParsedDocument | OCRDocument | unknown): OCRCompatibilityReport {
    Logger.info('[OCRContractValidator] Validating OCR document contract compatibility');

    const violations: OCRContractViolation[] = [];

    // 1. Adapt input to ParsedDocument for uniform contract inspection
    let parsedDoc: ParsedDocument;
    try {
      parsedDoc = this.adapter.adaptToParsedDocument(docInput);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      violations.push(new OCRContractViolation({
        type: 'METADATA',
        severity: 'CRITICAL',
        message: `Failed to adapt input to contract specification: ${errMsg}`
      }));

      return new OCRCompatibilityReport({
        documentId: 'unknown_doc',
        isCompatible: false,
        compatibilityScore: 0.0,
        violations
      });
    }

    const docId = parsedDoc.documentId;

    // 2. Metadata completeness check
    this.validateMetadata(parsedDoc, violations);

    // 3. Pages & Missing Blocks check
    if (!parsedDoc.structure.pages || parsedDoc.structure.pages.length === 0) {
      violations.push(new OCRContractViolation({
        type: 'MISSING_BLOCK',
        severity: 'CRITICAL',
        message: 'Document structure contains zero pages.'
      }));
    } else {
      let previousOrderIndex = -1;

      for (const page of parsedDoc.structure.pages) {
        if (!page.nodes || page.nodes.length === 0) {
          violations.push(new OCRContractViolation({
            type: 'MISSING_BLOCK',
            severity: 'WARNING',
            pageNumber: page.pageNumber,
            nodeId: page.id,
            message: `Page ${page.pageNumber} contains no structural content nodes.`
          }));
          continue;
        }

        // Validate Nodes within Page
        for (const node of page.nodes) {
          // Bounding box validation
          this.validateBoundingBox(node, page.pageNumber, violations);

          // Reading order validation
          if (node.orderIndex !== undefined) {
            if (node.orderIndex <= previousOrderIndex && page.nodes.length > 1) {
              violations.push(new OCRContractViolation({
                type: 'READING_ORDER',
                severity: 'WARNING',
                pageNumber: page.pageNumber,
                nodeId: node.id,
                message: `Reading order index regression or duplicate at node ${node.id} (index: ${node.orderIndex}, previous: ${previousOrderIndex}).`
              }));
            }
            previousOrderIndex = node.orderIndex;
          }

          // Node type specific validation
          if (node.type === NodeType.PARAGRAPH) {
            this.validateParagraph(node as ParagraphNode, page.pageNumber, violations);
          } else if (node.type === NodeType.HEADING) {
            this.validateHeading(node as HeadingNode, page.pageNumber, violations);
          } else if (node.type === NodeType.TABLE) {
            this.validateTable(node as TableNode, page.pageNumber, violations);
          }
        }
      }
    }

    return new OCRCompatibilityReport({
      documentId: docId,
      violations
    });
  }

  private static validateMetadata(doc: ParsedDocument, violations: OCRContractViolation[]): void {
    const meta = doc.metadata;
    if (!meta) {
      violations.push(new OCRContractViolation({
        type: 'METADATA',
        severity: 'CRITICAL',
        message: 'Document metadata object is completely missing.'
      }));
      return;
    }

    if (!meta.title || meta.title.trim().length === 0) {
      violations.push(new OCRContractViolation({
        type: 'METADATA',
        severity: 'WARNING',
        message: 'Document title is missing or empty.'
      }));
    }

    if (!meta.language || meta.language.trim().length === 0) {
      violations.push(new OCRContractViolation({
        type: 'METADATA',
        severity: 'INFO',
        message: 'Document primary language code is not explicitly specified.'
      }));
    }

    if (meta.pageCount === undefined || meta.pageCount <= 0) {
      violations.push(new OCRContractViolation({
        type: 'METADATA',
        severity: 'WARNING',
        message: `Invalid document pageCount in metadata: ${meta.pageCount}`
      }));
    }
  }

  private static validateBoundingBox(node: { id: string; boundingBox?: { x: number; y: number; width: number; height: number; confidence?: number } }, pageNumber: number, violations: OCRContractViolation[]): void {
    if (!node.boundingBox) {
      violations.push(new OCRContractViolation({
        type: 'BOUNDING_BOX',
        severity: 'INFO',
        pageNumber,
        nodeId: node.id,
        message: `Node ${node.id} does not contain bounding box coordinates.`
      }));
      return;
    }

    const bbox = node.boundingBox;
    if (bbox.width <= 0 || bbox.height <= 0 || bbox.x < 0 || bbox.y < 0) {
      violations.push(new OCRContractViolation({
        type: 'BOUNDING_BOX',
        severity: 'WARNING',
        pageNumber,
        nodeId: node.id,
        message: `Node ${node.id} has invalid or degenerate bounding box dimensions (x: ${bbox.x}, y: ${bbox.y}, w: ${bbox.width}, h: ${bbox.height}).`
      }));
    }

    if (bbox.confidence !== undefined) {
      if (bbox.confidence < 0 || bbox.confidence > 1.0) {
        violations.push(new OCRContractViolation({
          type: 'CONFIDENCE',
          severity: 'WARNING',
          pageNumber,
          nodeId: node.id,
          message: `Node ${node.id} confidence score out of bounds [0, 1]: ${bbox.confidence}`
        }));
      } else if (bbox.confidence < 0.50) {
        violations.push(new OCRContractViolation({
          type: 'CONFIDENCE',
          severity: 'INFO',
          pageNumber,
          nodeId: node.id,
          message: `Node ${node.id} has low extraction confidence (${Math.round(bbox.confidence * 100)}%).`
        }));
      }
    }
  }

  private static validateParagraph(node: ParagraphNode, pageNumber: number, violations: OCRContractViolation[]): void {
    const text = node.text || '';

    if (text.trim().length === 0) {
      violations.push(new OCRContractViolation({
        type: 'BROKEN_PARAGRAPH',
        severity: 'WARNING',
        pageNumber,
        nodeId: node.id,
        message: `Paragraph node ${node.id} contains empty text.`
      }));
      return;
    }

    // Check for corrupt replacement characters or high ratio of non-printable noise
    const replacementChars = (text.match(/\uFFFD/g) || []).length;
    if (replacementChars > 3) {
      violations.push(new OCRContractViolation({
        type: 'BROKEN_PARAGRAPH',
        severity: 'CRITICAL',
        pageNumber,
        nodeId: node.id,
        message: `Paragraph node ${node.id} contains ${replacementChars} unparseable unicode replacement characters.`
      }));
    }
  }

  private static validateHeading(node: HeadingNode, pageNumber: number, violations: OCRContractViolation[]): void {
    if (!node.text || node.text.trim().length === 0) {
      violations.push(new OCRContractViolation({
        type: 'BROKEN_PARAGRAPH',
        severity: 'WARNING',
        pageNumber,
        nodeId: node.id,
        message: `Heading node ${node.id} contains empty text.`
      }));
    }

    if (node.level < 1 || node.level > 6) {
      violations.push(new OCRContractViolation({
        type: 'READING_ORDER',
        severity: 'WARNING',
        pageNumber,
        nodeId: node.id,
        message: `Heading level ${node.level} is out of standard range (1-6).`
      }));
    }
  }

  private static validateTable(node: TableNode, pageNumber: number, violations: OCRContractViolation[]): void {
    if (node.rowCount <= 0 || node.colCount <= 0) {
      violations.push(new OCRContractViolation({
        type: 'TABLE_INTEGRITY',
        severity: 'CRITICAL',
        pageNumber,
        nodeId: node.id,
        message: `Table node ${node.id} has invalid dimensions (${node.rowCount}x${node.colCount}).`
      }));
      return;
    }

    if (!node.cells || node.cells.length === 0) {
      violations.push(new OCRContractViolation({
        type: 'TABLE_INTEGRITY',
        severity: 'CRITICAL',
        pageNumber,
        nodeId: node.id,
        message: `Table node ${node.id} has zero cell records.`
      }));
      return;
    }

    // Validate cell row/col bounds
    for (const cell of node.cells) {
      if (cell.rowIndex >= node.rowCount || cell.colIndex >= node.colCount || cell.rowIndex < 0 || cell.colIndex < 0) {
        violations.push(new OCRContractViolation({
          type: 'TABLE_INTEGRITY',
          severity: 'WARNING',
          pageNumber,
          nodeId: node.id,
          message: `Cell at row ${cell.rowIndex}, col ${cell.colIndex} exceeds table dimensions (${node.rowCount}x${node.colCount}).`
        }));
      }
    }
  }
}
