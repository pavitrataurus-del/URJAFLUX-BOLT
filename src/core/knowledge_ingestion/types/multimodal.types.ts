export type MultimodalObjectType =
  | 'TEXT_BLOCK'
  | 'TABLE'
  | 'IMAGE'
  | 'DIAGRAM'
  | 'CHART'
  | 'FORMULA'
  | 'FLOOR_PLAN'
  | 'YANTRA'
  | 'FOOTNOTE'
  | 'CAPTION'
  | 'HEADER'
  | 'FOOTER'
  | 'REFERENCE'
  | 'PAGE_NUMBER';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TableCell {
  rowIndex: number;
  colIndex: number;
  value: string;
  isHeader?: boolean;
  colSpan?: number;
  rowSpan?: number;
  isMerged?: boolean;
  isNestedHeader?: boolean;
  colorCode?: string;
  numericValue?: number;
  unit?: string;
}

export interface TableStructure {
  rows: number;
  columns: number;
  headers: string[];
  nestedHeaders?: string[][];
  hasMergedCells?: boolean;
  isMultiPage?: boolean;
  footnotes?: string[];
  cells: TableCell[];
  domainType?: 'VASTU' | 'LAL_KITAB' | 'NUMEROLOGY' | 'ENGINEERING' | 'GENERAL';
  vastuTableMeta?: {
    category: 'Ayadi' | 'Direction' | 'Slope' | 'Element' | 'Room Placement' | 'Water Tank' | 'Staircase' | 'Dimension';
  };
  lalKitabTableMeta?: {
    planet?: string;
    house?: string;
    remedy?: string;
    exception?: string;
    combination?: string;
    activationRules?: string;
  };
  numerologyTableMeta?: {
    birthNumber?: number;
    destinyNumber?: number;
    planetNumbers?: Record<string, number>;
    compatibility?: string[];
  };
}

export interface FormulaVariable {
  symbol: string;
  name: string;
  unit?: string;
  dimension?: string;
}

export interface FormulaStructure {
  formulaName: string;
  latexOrExpression: string;
  variables: FormulaVariable[];
  domain: 'Aya' | 'Vyaya' | 'Nakshatra' | 'Numerology' | 'Hydraulic' | 'Structural' | 'Engineering';
  constraints?: string[];
  executableFn?: string;
  exampleInputs?: Record<string, number>;
  exampleOutputs?: Record<string, number>;
  dependentFormulas?: string[];
  chainedOutputSymbol?: string;
  dimensionCheck?: {
    isConsistent: boolean;
    warning?: string;
  };
}

export interface SpatialFloorPlanElement {
  type: 'WALL' | 'DOOR' | 'WINDOW' | 'ROOM' | 'STAIRS' | 'COLUMN' | 'BEAM' | 'COMPASS' | 'NORTH_ARROW' | 'LABEL';
  label: string;
  zone?: string;
  dimensions?: string;
  bbox?: BoundingBox;
  confidenceScore?: number;
}

export interface SpatialFloorPlanStructure {
  northDirectionDegrees: number;
  detectedElements: SpatialFloorPlanElement[];
  vastuComplianceScore?: number;
  iouScore?: number;
  visualOverlaySvg?: string;
}

export interface YantraStructure {
  geometry: 'SRI_YANTRA' | 'KUBER_YANTRA' | 'VASTU_PURUSHA_MANDALA' | 'GEOMETRIC_GRID' | 'NAVARATNA_GRID' | 'UNKNOWN_YANTRA' | 'MODIFIED_YANTRA' | 'DAMAGED_GEOMETRY';
  symbols: string[];
  numbers: number[];
  directionalLayout: Record<string, string>;
  sacredRegions: string[];
  purpose: string;
  classificationConfidence: number;
  similarityScore: number;
  unknownDetectionConfidence?: number;
  falsePositiveFilterPassed: boolean;
}

export interface MultimodalObject {
  objectId: string;
  documentId: string;
  pageNumber: number;
  boundingBox: BoundingBox;
  parentChapterId?: string;
  parentSectionId?: string;
  parentParagraphId?: string;
  objectType: MultimodalObjectType;
  confidenceScore: number;
  rawText?: string;
  caption?: string;
  tableData?: TableStructure;
  formulaData?: FormulaStructure;
  spatialData?: SpatialFloorPlanStructure;
  yantraData?: YantraStructure;
  embeddingId?: string;
  graphNodeId?: string;
  multimodalEmbedding?: number[];
  metadata?: Record<string, any>;
}

export interface MultimodalQualityMetrics {
  textCoveragePct: number;
  tableCoveragePct: number;
  imageCoveragePct: number;
  formulaCoveragePct: number;
  diagramCoveragePct: number;
  captionCoveragePct: number;
  objectExtractionAccuracy: number;
  ocrAccuracy: number;
  citationAccuracy: number;
}

export interface MultimodalSearchResult {
  object: MultimodalObject;
  relevanceScore: number;
  cosineSimilarity?: number;
  citation: string;
  graphRelationships: string[];
}

export interface CrossObjectReasoningResult {
  query: string;
  targetObjectType: MultimodalObjectType;
  matchedObjects: MultimodalObject[];
  evidenceChain: {
    step: number;
    entityType: 'DOCUMENT' | 'CHAPTER' | 'SECTION' | 'PARAGRAPH' | 'GRAPH_NODE' | 'OBJECT' | 'EMBEDDING';
    entityId: string;
    description: string;
  }[];
  reasoningSummary: string;
  confidenceScore: number;
}
