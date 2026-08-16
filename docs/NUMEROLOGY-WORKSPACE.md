# DOMAIN-004 — Enterprise Numerology Admin Workspace Specification

## Overview
This document specifies the user interface structure and sub-view capabilities of `NumerologyKnowledgeLibraryWorkspace.tsx` in DOMAIN-004.

---

## 1. Sub-View Modules
The workspace contains 11 dedicated functional sub-views:

1. **Overview**: Executive dashboard showing total entities, canonical compliance percentage (100%), active conflicts, graph edge counts, taxonomy distribution, and featured entity cards.
2. **Entity Browser**: Grid and list views of numbers, master numbers, compound numbers, and letter values with status tags and filter controls.
3. **Knowledge Explorer**: Semantic and full-text search interface across entity descriptions, tags, and source books.
4. **Source Manager**: Primary manuscript management showing author, edition, publication year, and authority scores.
5. **Conflict Resolution**: Active interface for resolving system discrepancies (e.g. Chaldean vs Pythagorean letter F values) or marking contextual system splits.
6. **Verification Queue**: Audit review queue for draft or imported entities.
7. **Canonical Rules**: List of verified high-confidence knowledge items accessible to end users.
8. **Knowledge Graph**: Graph edge explorer connecting Numerology entities with Lal Kitab Grahas, Vastu Directions, and Chakra Energy Centers.
9. **Duplicate Detection**: Candidate duplicate match reviewer showing similarity scores and matching attributes.
10. **Quality Dashboard**: 5-factor quality score breakdown (OCR Accuracy, Source Authority, Evidence Strength, SME Consensus, Ontological Completeness) with letter grades.
11. **Audit History**: Historical audit log recording entity updates, status changes, and reviewer timestamps.
