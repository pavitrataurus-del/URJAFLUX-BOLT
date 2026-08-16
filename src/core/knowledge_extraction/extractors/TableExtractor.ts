import { BaseNode, NodeType, TableNode } from '../../knowledge_parsing/types/document.types';
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

export class TableExtractor extends BaseKnowledgeExtractor {
  public readonly capabilities: IExtractorCapabilities = {
    name: 'TableExtractor',
    version: '1.0.0',
    priority: 30,
    supportedNodeTypes: [NodeType.TABLE],
    supportedCategories: [
      KnowledgeCategory.OBJECT,
      KnowledgeCategory.MEASUREMENT,
      KnowledgeCategory.DEFINITION
    ],
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

    if (node.type !== NodeType.TABLE) {
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
        warnings: [`Node ${node.id} is not a TABLE node`],
        errors: []
      };
    }

    const tableNode = node as TableNode;
    const documentId = context.document.documentId;

    // 1. Table Metadata Object
    const tableTitle = tableNode.caption || `Table_${tableNode.id}`;
    const tableMetaObj = this.createKnowledgeObject(
      documentId,
      tableNode.id,
      KnowledgeCategory.OBJECT,
      tableTitle,
      'dimensions',
      `${tableNode.rowCount}x${tableNode.colCount}`,
      1.0,
      KnowledgeSeverity.INFORMATIONAL,
      {
        caption: tableNode.caption,
        rowCount: tableNode.rowCount,
        colCount: tableNode.colCount,
        totalCells: tableNode.cells.length
      }
    );
    objects.push(tableMetaObj);

    // Build header map (colIndex -> headerContent)
    const headerMap = new Map<number, string>();
    tableNode.cells.forEach((cell) => {
      if (cell.isHeader || cell.rowIndex === 0) {
        if (cell.content && cell.content.trim()) {
          headerMap.set(cell.colIndex, cell.content.trim());
        }
      }
    });

    // 2. Extract Cell Knowledge Objects & Evidence
    for (const cell of tableNode.cells) {
      const cellText = cell.content ? cell.content.trim() : '';
      if (!cellText) continue;

      const headerName = headerMap.get(cell.colIndex) || `Column_${cell.colIndex}`;

      // Evidence for table cell
      const cellEv = this.createEvidence(
        documentId,
        tableNode,
        `[Row ${cell.rowIndex}, Col ${cell.colIndex} (${headerName})]: ${cellText}`,
        KnowledgeEvidenceType.TABLE_CELL,
        'RULE_TABLE_CELL_EXPLICIT'
      );
      evidenceList.push(cellEv);

      // Non-header cell data mapping
      if (!cell.isHeader && cell.rowIndex > 0) {
        // Find row entity key (first cell of row or row number)
        const rowKeyCell = tableNode.cells.find((c) => c.rowIndex === cell.rowIndex && c.colIndex === 0);
        const entityName = (rowKeyCell && rowKeyCell.content.trim()) ? rowKeyCell.content.trim() : `Row_${cell.rowIndex}`;

        const cellObj = this.createKnowledgeObject(
          documentId,
          `${tableNode.id}_r${cell.rowIndex}_c${cell.colIndex}`,
          KnowledgeCategory.DEFINITION,
          entityName,
          headerName,
          cellText,
          1.0,
          KnowledgeSeverity.INFORMATIONAL,
          {
            tableId: tableNode.id,
            rowIndex: cell.rowIndex,
            colIndex: cell.colIndex,
            isHeader: !!cell.isHeader
          }
        );
        objects.push(cellObj);
      }
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
