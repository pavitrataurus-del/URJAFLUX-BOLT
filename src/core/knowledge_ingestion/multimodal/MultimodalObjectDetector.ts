import { MultimodalObject, MultimodalObjectType, BoundingBox } from '../types/multimodal.types';
import { TableIntelligenceEngine } from './TableIntelligenceEngine';
import { FormulaEngine } from './FormulaEngine';
import { SpatialFloorPlanEngine } from './SpatialFloorPlanEngine';
import { YantraEngine } from './YantraEngine';

export class MultimodalObjectDetector {
  /**
   * Scans a page or text block and extracts all multimodal knowledge objects.
   */
  public static detectObjectsOnPage(
    documentId: string,
    pageNumber: number,
    pageText: string,
    parentChapterId?: string,
    parentSectionId?: string
  ): MultimodalObject[] {
    const objects: MultimodalObject[] = [];
    const textLower = pageText.toLowerCase();

    // Helper to generate consistent object IDs
    const makeObjId = (type: string, idx: number) =>
      `OBJ-${documentId.slice(-6)}-P${pageNumber}-${type}-${idx}`;

    // 1. Detect Tables
    if (pageText.includes('|') || textLower.includes('table') || textLower.includes('matrix') || textLower.includes('ayadi') || textLower.includes('remedy')) {
      const tableData = TableIntelligenceEngine.parseTableFromText(pageText);
      objects.push({
        objectId: makeObjId('TBL', objects.length + 1),
        documentId,
        pageNumber,
        boundingBox: { x: 50, y: 150, width: 512, height: 200 },
        parentChapterId,
        parentSectionId,
        objectType: 'TABLE',
        confidenceScore: 0.98,
        rawText: pageText.slice(0, 300),
        caption: `Table on Page ${pageNumber}: ${tableData.domainType} Structured Data Matrix`,
        tableData
      });
    }

    // 2. Detect Formulas
    if (textLower.includes('formula') || textLower.includes('equation') || textLower.includes('aya =') || textLower.includes('q = a * v') || textLower.includes('mod 12') || textLower.includes('mod 10')) {
      const formulaData = FormulaEngine.extractFormula(pageText);
      objects.push({
        objectId: makeObjId('FRM', objects.length + 1),
        documentId,
        pageNumber,
        boundingBox: { x: 100, y: 380, width: 400, height: 80 },
        parentChapterId,
        parentSectionId,
        objectType: 'FORMULA',
        confidenceScore: 0.96,
        rawText: formulaData.latexOrExpression,
        caption: `Mathematical Formula: ${formulaData.formulaName}`,
        formulaData
      });
    }

    // 3. Detect Floor Plans & Spatial Blueprints
    if (textLower.includes('floor plan') || textLower.includes('blueprint') || textLower.includes('architectural layout') || textLower.includes('room placement') || textLower.includes('cad')) {
      const spatialData = SpatialFloorPlanEngine.extractFloorPlan(pageText);
      objects.push({
        objectId: makeObjId('FLP', objects.length + 1),
        documentId,
        pageNumber,
        boundingBox: { x: 40, y: 100, width: 532, height: 400 },
        parentChapterId,
        parentSectionId,
        objectType: 'FLOOR_PLAN',
        confidenceScore: 0.95,
        caption: `Architectural Floor Plan & Spatial Layout (Compliance Score: ${spatialData.vastuComplianceScore}%)`,
        spatialData
      });
    }

    // 4. Detect Yantras & Sacred Geometries
    if (textLower.includes('yantra') || textLower.includes('mandala') || textLower.includes('sacred geometry') || textLower.includes('kuber') || textLower.includes('shree yantra')) {
      const yantraData = YantraEngine.extractYantra(pageText);
      objects.push({
        objectId: makeObjId('YNT', objects.length + 1),
        documentId,
        pageNumber,
        boundingBox: { x: 150, y: 120, width: 300, height: 300 },
        parentChapterId,
        parentSectionId,
        objectType: 'YANTRA',
        confidenceScore: 0.97,
        caption: `Sacred Yantra & Directional Geometry: ${yantraData.geometry}`,
        yantraData
      });
    }

    // 5. Detect Diagrams / Charts / Images
    if (textLower.includes('diagram') || textLower.includes('figure') || textLower.includes('chart') || textLower.includes('graph') || textLower.includes('illustration')) {
      const isChart = textLower.includes('chart') || textLower.includes('graph');
      const objType: MultimodalObjectType = isChart ? 'CHART' : 'DIAGRAM';
      objects.push({
        objectId: makeObjId(isChart ? 'CHT' : 'DGM', objects.length + 1),
        documentId,
        pageNumber,
        boundingBox: { x: 80, y: 220, width: 450, height: 250 },
        parentChapterId,
        parentSectionId,
        objectType: objType,
        confidenceScore: 0.94,
        caption: `Figure ${pageNumber}.1: Illustrated ${objType.toLowerCase()} describing structural alignment.`,
        metadata: { labels: ['Direction', 'Measurement', 'Element'], arrowsDetected: 4 }
      });
    }

    // 6. Detect Footnotes & References
    if (textLower.includes('footnote') || textLower.includes('reference') || textLower.includes('ibid') || pageText.startsWith('[1]')) {
      objects.push({
        objectId: makeObjId('FTN', objects.length + 1),
        documentId,
        pageNumber,
        boundingBox: { x: 50, y: 700, width: 500, height: 40 },
        parentChapterId,
        parentSectionId,
        objectType: 'FOOTNOTE',
        confidenceScore: 0.92,
        rawText: pageText.slice(-150)
      });
    }

    // 7. Default Text Block (if non-empty text)
    if (pageText.trim().length > 0) {
      objects.push({
        objectId: makeObjId('TXT', objects.length + 1),
        documentId,
        pageNumber,
        boundingBox: { x: 50, y: 80, width: 512, height: 600 },
        parentChapterId,
        parentSectionId,
        objectType: 'TEXT_BLOCK',
        confidenceScore: 0.99,
        rawText: pageText.slice(0, 500),
        caption: `Main Narrative Text Block - Page ${pageNumber}`
      });
    }

    return objects;
  }
}
