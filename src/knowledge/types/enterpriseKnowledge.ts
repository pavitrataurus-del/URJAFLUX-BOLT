// Enterprise Knowledge Management System Types - Sprint 4
// Normalised domain interfaces and structures matching classical architecture

export type SourceFormat = "BOOK" | "PDF" | "DOCX" | "TXT" | "MARKDOWN";

export enum SourceStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ARCHIVED = "archived",
  DEPRECATED = "deprecated"
}

export enum RuleStatus {
  DRAFT = "draft",
  APPROVED = "approved",
  DEPRECATED = "deprecated"
}

export enum CrossReferenceType {
  REFERENCES = "references",
  CALCULATES = "calculates",
  OVERRIDES = "overrides",
  COMPLEMENTS = "complements",
  INFLUENCES = "influences"
}

// 1. Knowledge Library - Core Source
export interface KnowledgeSource {
  id: string;        // Permanent Universal ID (e.g., BOOK-UUID)
  uuid: string;      // Standard UUID
  title: string;
  author: string;
  publisher: string;
  edition: string;
  language: string;
  category: string;
  subCategory: string;
  tags: string[];
  status: SourceStatus;
  version: string;   // e.g., "VERSION-1.0.0"
  createdAt: string;
  updatedAt: string;
  format: SourceFormat;
}

// 3. Knowledge Structure - Hierarchical Nodes
export interface KnowledgeChapter {
  id: string;        // Permanent CH-UUID
  bookId: string;    // Parent BOOK-ID
  title: string;
  chapterNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeSection {
  id: string;        // Permanent SECTION-UUID
  chapterId: string; // Parent CH-ID
  title: string;
  sectionNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeTopic {
  id: string;        // Permanent TOPIC-UUID
  sectionId: string; // Parent SECTION-ID
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeRule {
  id: string;        // Permanent RULE-UUID
  topicId: string;   // Parent TOPIC-ID
  title: string;
  statement: string; // Core prescriptive text
  category: string;
  version: string;
  status: RuleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FormulaVariable {
  name: string;      // e.g., "Width"
  symbol: string;    // e.g., "W"
  description: string;
  unit?: string;     // e.g., "Hasta"
}

export interface KnowledgeFormula {
  id: string;        // Permanent FORMULA-UUID
  ruleId?: string;   // Associated RULE-ID if any
  title: string;
  expression: string;// e.g., "(W * L * 8) % 12"
  variables: FormulaVariable[];
  outputType: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeExample {
  id: string;        // Permanent EXAMPLE-UUID
  targetId: string;  // RULE-ID or FORMULA-ID
  scenario: string;
  inputData: Record<string, unknown>;
  expectedOutput: string;
  explanation: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeException {
  id: string;        // Permanent EXCEPTION-UUID
  ruleId: string;    // RULE-ID
  condition: string;
  overrideAction: string;
  mitigation: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeCrossReference {
  id: string;
  sourceId: string;  // e.g., RULE-A
  targetId: string;  // e.g., FORMULA-B, TOPIC-C, EVIDENCE-D, etc.
  type: CrossReferenceType;
  description?: string;
  createdAt: string;
}

// 7. Evidence System
export interface KnowledgeEvidence {
  id: string;        // Permanent EVIDENCE-UUID
  targetId: string;  // RULE-ID or FORMULA-ID
  sourceBookId: string; // BOOK-ID
  chapter: string;   // CH-ID or title
  page: number;
  paragraph: string;
  confidence: number; // 0.0 to 1.0
  evidenceNotes: string;
  createdAt: string;
}

// 5. Knowledge Graph
export interface KnowledgeGraphNode {
  id: string;        // UUID/ID of the entity
  type: "book" | "chapter" | "section" | "topic" | "rule" | "formula" | "example" | "exception" | "evidence";
  label: string;
  properties: Record<string, unknown>;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties?: Record<string, unknown>;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

// 6. Version Management
export interface VersionLog {
  id: string;        // Permanent VERSION-UUID
  entityId: string;  // Target entity being edited
  entityType: "book" | "rule" | "formula" | "example" | "exception" | "evidence" | "chapter" | "section" | "topic";
  version: string;   // e.g., "1.0.0" -> "1.0.1"
  editor: string;    // Name / ID of editor
  timestamp: string;
  changeSummary: string;
  snapshot: string;  // Serialised JSON representation of the entity state
  createdAt: string;
}

// 9. Plugin Ready Support
export interface KnowledgePlugin {
  id: string;        // e.g., "vastu", "lalkitab"
  name: string;
  supportedCategories: string[];
  version: string;
  onIngest?: (source: KnowledgeSource, content: string) => Promise<void>;
  onVerifyRule?: (rule: KnowledgeRule) => boolean;
  onBeforeSave?: <T>(entityId: string, type: string, data: T) => T;
}
