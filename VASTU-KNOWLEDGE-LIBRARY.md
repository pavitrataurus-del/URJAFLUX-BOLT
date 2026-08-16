# DOMAIN-001 — ENTERPRISE VASTU MASTER KNOWLEDGE LIBRARY
## URJAFLUX AI OS

VERSION: DOMAIN-001 (RC-1)  
PHASE: Knowledge Engineering & Enterprise Knowledge Graph Certification  
STATUS: Approved & Active  

---

### EXECUTIVE SUMMARY

The Enterprise Vastu Master Knowledge Library establishes the foundational Knowledge Engineering architecture for URJAFLUX AI OS. This library standardizes all classical Sanskrit shastras (Mayamatam, Samarangana Sutradhara, Brihat Samhita, Manasara), modern research papers, industrial guidelines, and specialized regional texts into an AI-ready, searchable, explainable Knowledge Graph.

All future knowledge domains (Chakra, Lal Kitab, Numerology, Astrology, Feng Shui) will reuse this core Knowledge Engineering pipeline.

---

### ARCHITECTURAL HIGHLIGHTS

1. **Multi-Source Knowledge Ingestion**:
   - Supports ingestion of Printed Books, Scanned Books, OCR PDFs, Native PDFs, Images, Research Papers, Ancient Sanskrit Texts, and Notes.
   - Normalizes titles, authors, publishers, publication dates, languages, categories, and subjects.

2. **Domain Classification Engine**:
   - Categorizes all incoming texts into 14 standardized Vastu domains: Residential Vastu, Commercial Vastu, Industrial Vastu, Apartment Vastu, Temple Architecture, Factories, Hospitals, Hotels, Schools, Offices, Landscape, Urban Planning, Traditional Texts, and Research.

3. **Canonical Vastu Ontology**:
   - Classifies domain knowledge into 22 core entity types: Room, Direction, Zone, Element, Object, Rule, Recommendation, Remedy, Yantra, Chakra, Planet, Number, Symbol, Mantra, Material, Shape, Geometry, Energy Field, Deities, Doshas, Positive Conditions, and Negative Conditions.

4. **Bidirectional Knowledge Graph**:
   - Links entities using 10 formal relationship types: `LOCATED_IN`, `ASSOCIATED_WITH`, `CAUSES`, `AFFECTS`, `BALANCES`, `REMEDIES`, `RULES`, `GOVERNS`, `SUPPORTS`, `CONFLICTS_WITH`.

5. **Conflict Resolution Engine**:
   - Identifies contradictions across classical sources (Book A vs Book B).
   - Flags discrepancies for Expert Review (`Pending -> Reviewed -> Approved -> Rejected -> Needs Revision`).
   - Strictly enforces that internal conflicts are hidden from end users.

6. **Knowledge Quality Scoring Engine**:
   - Computes composite Quality Scores (0-100) based on OCR accuracy, metadata completeness, ontology depth, relationship density, embedding quality, and expert approval.

7. **RBAC Security & Data Isolation**:
   - **ADMIN Role**: Complete visibility into raw source pages, OCR confidence scores, conflict chains, expert notes, and unapproved draft knowledge.
   - **END_USER Role**: Strict access restricted ONLY to `APPROVED` documents, canonical entities, and high-level summaries. Internal OCR output and conflict discussions are strictly redacted.

---

### COMPONENT MAP

- `src/core/knowledge_sources/services/KnowledgeSourceService.ts`: Core ingestion & normalization orchestrator.
- `src/core/knowledge_sources/vastu/VastuKnowledgeTypes.ts`: Domain models and type definitions.
- `src/core/knowledge_sources/vastu/VastuOntologyCatalog.ts`: Entity and relationship catalog repository.
- `src/core/knowledge_sources/vastu/VastuConflictEngine.ts`: Source discrepancy detector and review queue.
- `src/core/knowledge_sources/vastu/VastuDuplicateEngine.ts`: Fuzzy and semantic duplicate detector.
- `src/core/knowledge_sources/vastu/VastuQualityEngine.ts`: Quality score calculator.
- `src/core/knowledge_sources/vastu/VastuMasterKnowledgeRegistry.ts`: High-level library manager and RBAC filter.
- `src/components/knowledge/VastuKnowledgeLibraryWorkspace.tsx`: Interactive admin & user management workspace.
