// Knowledge Ingestion System Types for URJAFLUX Platform

export interface IngestedBook {
  id: string; // Traceable Book ID
  title: string;
  author: string;
  translator?: string;
  publisher?: string;
  publicationYear?: number;
  language: string;
  category: string; // e.g., "Vastu Shastra", "Agama", "Ayadi Numerology"
  isbn?: string;
  totalPages?: number;
  status: "uploaded" | "ocr_processed" | "analyzed" | "active";
  version: string; // e.g., "1.0.0"
  hash: string; // SHA-256 simulation for deduplication of books
  createdAt: string;
  updatedAt: string;
  metadata?: {
    chaptersDetected?: number;
    rulesCount?: number;
    formulasCount?: number;
  };
}

export interface BookPage {
  id: string; // bookId_pageNo
  bookId: string;
  pageNumber: number;
  rawText: string;
  ocrConfidence: number;
  layoutBlocks: LayoutBlock[];
}

export interface LayoutBlock {
  id: string;
  type: "heading" | "subheading" | "body" | "footnote" | "table" | "verse_sanskrit" | "verse_translation" | "caption";
  text: string;
  bbox?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface BookChapter {
  id: string; // bookId_chapterNo
  bookId: string;
  title: string;
  chapterNumber: number;
  startPage: number;
  endPage: number;
  topics: string[];
}

export interface RuleEvidence {
  sourceBookId: string;
  sourceBookTitle: string;
  chapterTitle?: string;
  pageNumber: number;
  verseNumber?: string; // e.g., "Verse III.14"
  originalCitation: string; // Original shloka or direct quote
  translation: string; // English translation or modern commentary
  confidenceScore: number; // 0.0 to 1.0 based on extraction fidelity
}

export interface ExtractedRule {
  id: string; // Permanent Rule ID: e.g., RULE-000001
  bookId: string;
  chapterId?: string;
  pageNumber: number;
  verseNumber?: string;
  title: string;
  statement: string; // The core prescriptive or descriptive rule text
  category: string; // e.g., "Orientation", "Entrance", "Proportions", "Brahmasthan"
  topics: string[]; // e.g., ["North-East", "Water-Element", "Kitchen-Placement"]
  formulaId?: string; // Opt-in linking to calculations
  evidence: RuleEvidence;
  crossReferences: string[]; // Permanent IDs of other related rules
  version: string; // For tracing rule evolutions
  status: "draft" | "approved" | "deprecated";
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedFormula {
  id: string; // Permanent Formula ID: e.g., FORMULA-000001
  bookId: string;
  chapterId?: string;
  pageNumber: number;
  title: string;
  expression: string; // Mathematical representation, e.g., "(Area * 8) % 12"
  variables: FormulaVariable[];
  outputType: "Yoni" | "Vaya" | "Aya" | "Vyaya" | "Nakshatra" | "Tithi" | "Amsa" | "GeneralNumber" | "DimensionMultiplier";
  description: string;
  evidence: RuleEvidence;
  crossReferences: string[]; // Permanent IDs of other related formulas
  version: string;
  status: "draft" | "approved" | "deprecated";
  createdAt: string;
  updatedAt: string;
}

export interface FormulaVariable {
  name: string; // e.g., "W", "L"
  symbol: string; // e.g., "width", "length"
  description: string;
  unit?: string; // e.g., "Hasta", "Angula", "Meters"
}

// Knowledge Graph Structures for Inter-book and Intra-book relationship modeling
export interface KnowledgeGraphNode {
  id: string; // Matches Book ID, Chapter ID, Topic Name, Rule ID, or Formula ID
  type: "book" | "chapter" | "topic" | "rule" | "formula";
  label: string;
  properties: Record<string, any>;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  type: "defined_in" | "contains_chapter" | "belongs_to_topic" | "cross_references" | "calculates" | "influences";
  properties?: Record<string, any>;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

// Version Control Tracking
export interface KnowledgeCommit {
  id: string; // e.g., COMMIT-000001
  author: string;
  message: string;
  timestamp: string;
  changedEntities: Array<{
    type: "book" | "rule" | "formula";
    entityId: string;
    action: "added" | "modified" | "deprecated";
  }>;
}

export interface KnowledgeIngestionSummary {
  bookId: string;
  title: string;
  totalPages: number;
  chaptersCount: number;
  rulesExtracted: number;
  formulasExtracted: number;
  confidenceAverage: number;
}
