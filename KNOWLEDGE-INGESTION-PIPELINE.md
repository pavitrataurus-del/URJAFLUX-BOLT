# DOMAIN-002A: Universal Knowledge Ingestion & Intelligence Pipeline Architecture

## Executive Architecture Summary

The **Universal Knowledge Ingestion & Intelligence Pipeline** (DOMAIN-002A) forms the enterprise-grade ingestion gateway for URJAFLUX AI OS. 

Every future knowledge domain—including **Vastu**, **Chakra**, **Lal Kitab**, **Numerology**, **Astrology (Jyotish)**, and future empirical/shastra libraries—must pass through this unified pipeline before entering the canonical **Knowledge Graph**.

---

## 17 Build Modules Overview

1. **Universal Document Import**: Supports PDF, Scanned PDF, DOCX, TXT, Markdown, HTML, EPUB, Images, and audio/video transcripts.
2. **OCR Engine**: Multi-lingual Devanagari, Sanskrit, and English recognition powered by Gemini-2.5-Pro API. Captures page mappings, paragraph/line coordinates, tables, and images.
3. **Document Classification**: Automatic domain classification into Vastu, Chakra, Lal Kitab, Numerology, Astrology, Research Papers, Books, Articles, Reference Manuals, and Expert Notes with manual Admin override.
4. **Metadata Extraction**: 14-field canonical metadata schema (Title, Author, Publisher, Edition, Year, Language, ISBN, Document Type, Domain, Keywords, Quality, Priority, Approval Status, Version).
5. **Smart Chunking Engine**: Context-aware semantic chunking that strictly preserves boundaries around Rules, Tables, Remedies, Definitions, Algorithms, Mantras, and Narrative passages without mid-sentence fractures.
6. **Entity Extraction**: Automated multi-entity extraction covering 19 distinct entity types (Objects, Rooms, Directions, Zones, Chakras, Elements, Yantras, Mantras, Remedies, Planets, Numbers, Deities, Symbols, Colors, Shapes, Crystals, Metals, Plants, Diseases).
7. **Relationship Extraction**: Automated edge extraction covering 13 relationship types (`SUPPORTS`, `BALANCES`, `BLOCKS`, `AFFECTS`, `LOCATED_IN`, `ASSOCIATED_WITH`, `CONNECTED_TO`, `CONFLICTS_WITH`, `INTERACTS_WITH`, `DEPENDS_ON`, `REMEDIED_BY`, `INFLUENCES`, `RELATED_TO`).
8. **Knowledge Normalization**: Synonym and dialect mapping (e.g., Ishan / Ishanya / NE / North-East -> North-East (NE) Ishan Zone) enforcing Admin approval before canonical consolidation.
9. **Duplicate Detection**: Cross-entity and document similarity scanning detecting candidate duplicates across Documents, Rules, Remedies, Mantras, Entities, and Relationships.
10. **Conflict Detection**: Preserves contradictory scriptural claims (*Book A vs Book B*, *Scriptural Variance*) without deleting knowledge, routing disputes to expert Acharya review.
11. **Evidence Builder**: Attaches primary source titles, supporting shastra references, page/paragraph coordinates, confidence scores, and knowledge priority.
12. **Knowledge Quality Engine**: Algorithmic 0–100 quality scoring across 7 mathematical sub-metrics with letter grades (`A+`, `A`, `B`, `C`, `F`).
13. **Expert Review Workspace**: Comprehensive SME interface providing tools to Approve, Reject, Merge, Split, Edit, Archive, Restore, Comment, and Audit.
14. **Knowledge Graph Integration**: Strict gatekeeping ensuring ONLY approved knowledge enters the Knowledge Graph, maintaining provenance and bidirectional edges.
15. **Search Preparation**: Prepares multi-index vector embeddings, hybrid keyword maps, and graph edge paths for AI reasoning engines.
16. **Audit Trail**: Complete immutable versioning and transaction logs capturing importer, reviewer, timestamps, action types, and rollback references.
17. **Security & RBAC Enforcement**:
    * **Admin Role**: Full visibility into OCR confidence, raw extracted entities, draft items, conflict logs, reviewer notes, and audit logs.
    * **End User Role**: Sanitized view displaying ONLY approved shastra canons, approved entities, and approved relationships—strictly hiding OCR internal scores, draft items, and conflict discussions.

---

## Workflow Dataflow Diagram

```
 [ Input File / Script ]
         │
         ▼
 ┌───────────────────────┐
 │  Universal Importer   │  (PDF, DOCX, TXT, EPUB, Images)
 └──────────┬────────────┘
            │
            ▼
 ┌───────────────────────┐
 │   Gemini OCR Engine   │  (Devanagari, Sanskrit, English)
 └──────────┬────────────┘
            │
            ▼
 ┌───────────────────────┐
 │ Domain Classifier &   │  (Vastu, Chakra, Lal Kitab, Numerology,
 │ Metadata Extractor    │   Astrology, Research Papers)
 └──────────┬────────────┘
            │
            ▼
 ┌───────────────────────┐
 │ Smart Chunking Engine │  (Preserves Rules, Tables, Remedies, Mantras)
 └──────────┬────────────┘
            │
            ▼
 ┌───────────────────────┐
 │ Entity & Relationship │  (19 Entity Types, 13 Relationship Types)
 │ Extractor             │
 └──────────┬────────────┘
            │
            ▼
 ┌───────────────────────┐
 │ Normalization, Dupes  │  (Concept Normalization & Conflict Logging)
 │ & Conflict Engine     │
 └──────────┬────────────┘
            │
            ▼
 ┌───────────────────────┐
 │ Quality Engine (0-100)│  (OCR, Metadata, Ontology, Evidence)
 └──────────┬────────────┘
            │
            ▼
 ┌───────────────────────┐
 │ Expert Review Queue   │  (SME Sign-off & RBAC Sanitization)
 └──────────┬────────────┘
            │
            ▼
 ┌───────────────────────┐
 │ Knowledge Graph Sync  │  (Spanner / Firestore Knowledge Graph)
 └───────────────────────┘
```
