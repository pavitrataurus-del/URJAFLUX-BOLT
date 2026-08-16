# DOMAIN-005 — Astrology Knowledge Library Workspace UI Specification

## 1. Component Overview
The `AstrologyKnowledgeLibraryWorkspace.tsx` component provides an enterprise management interface for exploring, auditing, verifying, and curating astrological knowledge.

## 2. UI Layout & Navigation Tabs

### 2.1 Tab Structure
1. **Overview**: Executive dashboard summarizing registered entities, canonical counts, active conflicts, duplicate matches, and truth engine status.
2. **Entity Browser**: Multi-faceted filter grid supporting search queries across entity types, planets, rashis, nakshatras, bhavas, and approval statuses.
3. **Knowledge Explorer**: Detailed single-entity inspector displaying Sanskrit names, elemental attributes, source book citations, chapter/shloka verses, and OCR confidence.
4. **Source Manager**: Ingested classical book directory with author and edition tracking.
5. **Conflict Resolution**: Interactive panel for resolving classical discrepancies (e.g., exaltation degree point vs arc) as Canonical or Contextual Split.
6. **Verification Queue**: Audit workflow for reviewing draft imports.
7. **Canonical Rules**: Rules governing astrological entity taxonomy.
8. **Knowledge Graph**: Relationship synapse inspector visualizing cross-domain links to Vastu, Chakra, Lal Kitab, and Numerology.
9. **Duplicate Detection**: Entity deduplication suite with similarity percentage scores.
10. **Quality Dashboard**: 5-factor quality breakdown (OCR, Source Authority, Evidence, SME Consensus, Completeness) with letter grades.
11. **Audit History**: Historical audit log of status changes and reviewer notes.

## 3. Strict Scope Header & Disclaimer Banner
The workspace header features a prominent banner explicitly communicating:
> **Architectural Scope Mandate**: This workspace manages verified classical astrology literature and metadata only. It strictly DOES NOT perform Kundli calculations, planetary positioning, horoscope predictions, or remedy prescriptions.

---
*URJAFLUX AI OS Frontend Experience Team — Approved Canonical Document*
