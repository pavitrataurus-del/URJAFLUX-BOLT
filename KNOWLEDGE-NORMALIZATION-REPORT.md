# DOMAIN-002A: Knowledge Normalization Engine Report

## Concept Normalization Mechanics

Different classical manuscripts, translations, and regional dialects use varied terms for identical concepts (e.g., "Ishan", "Ishanya", "NE", "North-East", "Eshanya Corner").

The **Knowledge Normalization Engine** (`KnowledgeNormalizationEngine.ts`) performs string distance and semantic embedding similarity scanning to map equivalent terms to a single **Canonical Entity**.

---

## Mandatory Rule: Admin Approval Required

* **No Automatic Destructive Merges**: The normalization engine **NEVER** automatically merges terms without review.
* **Candidate Queue**: Normalization candidates are placed in a dedicated `Pending` queue.
* **Single-Click Admin Merge**: Administrators review raw expressions, similarity scores (>0.85 threshold), and candidate synonyms before executing single-click approval.
* **Provenance Trail**: Approving a normalization records the approving administrator's identity, timestamp, and mapped synonyms.
