// ============================================================================
// DOCUMENT STRUCTURE ENGINE TYPES & MODEL (PHASE 2A)
// ============================================================================

export interface BoundingCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DocumentParagraph {
  id: string;
  documentId: string;
  chapterId: string;
  sectionId: string;
  subSectionId?: string;
  paragraphId: string;
  pageNumber: number;
  sourceDocument: string;
  rawText: string;
  cleanText: string;
  boundingCoordinates?: BoundingCoordinates;
}

export interface DocumentTable {
  id: string;
  chapterId: string;
  sectionId: string;
  pageNumber: number;
  caption?: string;
  headers: string[];
  rows: string[][];
  rawMarkdown?: string;
}

export interface DocumentFormula {
  id: string;
  chapterId: string;
  sectionId: string;
  pageNumber: number;
  expression: string;
  explanation?: string;
  formulaName?: string;
}

export interface DocumentImageRef {
  id: string;
  chapterId: string;
  sectionId: string;
  pageNumber: number;
  caption?: string;
  imageUrlOrRef?: string;
}

export interface DocumentFootnote {
  id: string;
  pageNumber: number;
  marker: string;
  text: string;
}

export interface DocumentSubSection {
  id: string;
  title: string;
  level: number;
  paragraphs: DocumentParagraph[];
  tables: DocumentTable[];
  formulae: DocumentFormula[];
  images: DocumentImageRef[];
}

export interface DocumentSection {
  id: string;
  title: string;
  subSections: DocumentSubSection[];
  paragraphs: DocumentParagraph[];
  tables: DocumentTable[];
  formulae: DocumentFormula[];
  images: DocumentImageRef[];
}

export interface DocumentChapter {
  id: string;
  title: string;
  chapterNumber: number;
  sections: DocumentSection[];
  appendices?: DocumentSection[];
}

export interface StructuredDocumentModel {
  documentId: string;
  title: string;
  originalName: string;
  fileType: string;
  sizeBytes: number;
  originalText: string;
  ocrText?: string;
  correctedOcrText?: string;
  cleanText: string;
  metadata: Record<string, any>;
  chapters: DocumentChapter[];
  appendices: DocumentSection[];
  footnotes: DocumentFootnote[];
  headers: string[];
}

/**
 * LOCK 28 - Administrator Quality Metrics
 */
export interface IngestionQualityMetrics {
  documentId: string;
  ocrConfidence: number;
  isScanned: boolean;
  usedOcr: boolean;
  detectedChaptersCount: number;
  detectedSectionsCount: number;
  detectedParagraphsCount: number;
  detectedTablesCount: number;
  detectedFormulaeCount: number;
  detectedImagesCount: number;
  processingTimeMs: number;
  warnings: string[];
  errors: string[];
  timestamp: string;
}
