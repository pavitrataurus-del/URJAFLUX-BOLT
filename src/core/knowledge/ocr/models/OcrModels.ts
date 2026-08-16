export interface IOcrPoint {
  x: number;
  y: number;
}

export interface IOcrBoundingBox {
  vertices: IOcrPoint[];
}

export interface IOcrWord {
  id: string;
  text: string;
  confidence: number;
  boundingBox: IOcrBoundingBox;
  language?: string;
}

export interface IOcrLine {
  id: string;
  text: string;
  words: IOcrWord[];
  confidence: number;
  boundingBox: IOcrBoundingBox;
  language?: string;
  readingOrder?: number;
}

export interface IOcrParagraph {
  id: string;
  lines: IOcrLine[];
  confidence: number;
  boundingBox: IOcrBoundingBox;
  language?: string;
  readingOrder?: number;
}

export interface IOcrBlock {
  id: string;
  paragraphs: IOcrParagraph[];
  confidence: number;
  boundingBox: IOcrBoundingBox;
  blockType: "TEXT" | "TABLE" | "PICTURE" | "UNKNOWN" | "LIST" | "HEADER" | "FOOTER";
  readingOrder?: number;
}

export interface IOcrPage {
  id: string;
  pageNumber: number;
  blocks: IOcrBlock[];
  width: number;
  height: number;
  language?: string;
  confidence: number;
  rotation?: number;
}

export interface IOcrResult {
  id: string;
  documentId: string;
  pages: IOcrPage[];
  fullText: string;
  providerMetadata: Record<string, any>;
  overallConfidence: number;
  languageDetected?: string;
}
