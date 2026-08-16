# Knowledge Engine

This document details the architecture, data models, search strategies, and integration patterns of the **Enterprise Vedic Knowledge Engine** within URJAFLUX AI OS.

---

## Engine Architectural Overview

The Knowledge Engine manages, indexes, and queries scriptural and classical architectural databases. It acts as the "Source of Truth" for the entire platform, providing verifiable, trace-logged citation evidence (evidence nodes) for every diagnostic finding and recommended remedy. 

```text
       Vedic Scripture Upload (PDF/TXT/MarkDown)
                         ↓
               OCR & Document Parser
                         ↓
    Hierarchical Normalization (Chapter/Section/Topic)
                         ↓
  Vedic Ingestion Engine (Extract Rules & Ayadi Formulas)
                         ↓
      Scriptural Knowledge Registry / RAG Index
                         ↓
                   Rule Context
                         ↓
       Active Evaluation (Rule/Formula execution)
```

---

## Core Data Models

The Knowledge Engine maps scriptures into a highly structured, relational model designed for fast traversal and precise citation.

### 1. Ingested Book Model (`IngestedBook`)
Represents a complete Vedic book or scripture registered in the system.
```typescript
export interface IngestedBook {
  id: string;               // Unique ID: e.g., BOOK-UUID
  title: string;            // Book Title
  author: string;           // Original author (e.g., "Sage Mayamuni")
  translator?: string;      // Modern translator/editor
  publisher?: string;
  publicationYear?: number;
  language: string;         // e.g., "Sanskrit", "English"
  category: string;         // e.g., "Vastu Shastra", "Ayadi Numerology"
  status: "uploaded" | "ocr_processed" | "analyzed" | "active";
  version: string;          // e.g., "1.0.0"
  hash: string;             // Document hash for duplicate detection
  createdAt: string;
  updatedAt: string;
  metadata?: {
    chaptersDetected?: number;
    rulesCount?: number;
    formulasCount?: number;
  };
}
```

### 2. Knowledge Structure (Chapters, Sections, and Topics)
These interfaces define the structural hierarchy of a parsed book, allowing nested navigation down to individual concepts.
```typescript
export interface KnowledgeChapter {
  id: string;               // Permanent CH-UUID
  bookId: string;           // Parent Book ID
  title: string;            // Chapter Name
  chapterNumber: number;
  createdAt: string;
}

export interface KnowledgeSection {
  id: string;               // Permanent SEC-UUID
  chapterId: string;        // Parent Chapter ID
  title: string;
  sectionNumber: number;
}

export interface KnowledgeTopic {
  id: string;               // Permanent TOPIC-UUID
  sectionId: string;        // Parent Section ID
  title: string;            // e.g., "Brahmasthan proportions"
  description: string;
}
```

### 3. Rule Evidence Model (`RuleEvidence`)
Integrates directly with Vastu diagnostics to verify why a rule exists by citing specific passages and verses.
```typescript
export interface RuleEvidence {
  sourceBookId: string;
  sourceBookTitle: string;
  chapterTitle?: string;
  pageNumber: number;
  verseNumber?: string;     // e.g., "Verse III.14"
  originalCitation: string; // Original shloka/quote (Sanskrit/classical text)
  translation: string;      // Modern translated text
  confidenceScore: number;  // 0.0 to 1.0 (indicating OCR/parsing fidelity)
}
```

### 4. Extracted Rule Model (`ExtractedRule`)
Represents a prescriptive standard extracted from the scripture, which can be compiled into the Active Rule Engine.
```typescript
export interface ExtractedRule {
  id: string;               // Unique RULE-UUID
  bookId: string;
  chapterId?: string;
  pageNumber: number;
  verseNumber?: string;
  title: string;
  statement: string;        // Prescriptive rule string
  category: string;         // e.g., "Orientation", "Entrance", "Proportions"
  topics: string[];
  formulaId?: string;       // Linked formula for calculations
  evidence: RuleEvidence;   // Scriptural citation anchor
  crossReferences: string[];// Other related Rule IDs
  status: "draft" | "approved" | "deprecated";
  version: string;
}
```

### 5. Extracted Formula Model (`ExtractedFormula`)
Represents mathematical calculations (e.g., Ayadi dimensions, area evaluations) specified in the classical scripture.
```typescript
export interface ExtractedFormula {
  id: string;               // Unique FORMULA-UUID
  bookId: string;
  chapterId?: string;
  pageNumber: number;
  title: string;
  expression: string;       // Math evaluation formula (e.g., "(Area * 8) % 12")
  variables: FormulaVariable[];
  outputType: "Yoni" | "Vaya" | "Aya" | "Vyaya" | "Nakshatra" | "Tithi" | "GeneralNumber";
  evidence: RuleEvidence;
  crossReferences: string[];
  version: string;
  status: "draft" | "approved" | "deprecated";
}
```

---

## Scripture Search & Indexing Engine

The platform performs high-performance text and structural lookups across the parsed Vedic libraries:
* **Canonical Registry Index**: Registers books as standalone modules. Searches are cached to minimize file I/O or Firestore queries.
* **Semantic Keyword Search**: Scans rules, shlokas, and commentaries based on metadata tags (e.g., searching "Water-Element" filters rules relevant to the North-East quadrant).
* **Reference Chaining**: Rules can override or complement other rules via `crossReferences`.

---

## Ingestion Versioning & Plugin Integration

* **Strict Versioning**: Ingested content utilizes standard semantic versioning. If a rule structure changes, previous audit logs preserve reference pointers to the exact historical version used during evaluation.
* **Plugin Packs**: New scriptures can be registered as standalone `KnowledgePacks` containing active rules and formulas. When a pack is loaded, it registers itself with the central `KnowledgeRegistry`, extending the platform's analytical capabilities without requiring application rebuilds.
