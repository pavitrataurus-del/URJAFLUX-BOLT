# DOMAIN-005 — Astrology Source Management & Ingestion Specification

## 1. Classical Literature Management
The Astrology Intelligence Library ingests, indexes, and traceably links knowledge extracted from primary classical Sanskrit and vernacular astrology texts.

## 2. Approved Classical Sources

### 2.1 Major Classical Shastras (Tier 1 Authority)
1. **Brihat Parashara Hora Shastra (BPHS)** — Maharishi Parashara
   - Ingestion Standard: Critical Edition Sanskrit text with English/Hindi commentaries.
   - Authority Level: Primary Canonical Baseline (Weight: 0.99).
2. **Phaladeepika** — Mantreswara
   - Focus: Yogas, Bhavas, and Dasha fruition rules.
   - Authority Level: Primary Canonical (Weight: 0.98).
3. **Saravali** — Kalyana Varma
   - Focus: Detailed planetary states, Rajayogas, and planetary strengths.
   - Authority Level: Primary Canonical (Weight: 0.98).
4. **Brihat Samhita** — Varahamihira
   - Focus: Nakshatra complexes, mundanes, and atmospheric signs.
   - Authority Level: Primary Canonical (Weight: 0.97).

## 3. Ingestion & Traceability Requirements
For every entity ingested into the library, the system mandates:
1. **Source Book Title**: Exact title of the manuscript.
2. **Edition & Publisher**: Critical edition details, publication year, and editor name.
3. **Chapter & Shloka Number**: Exact chapter title, verse/shloka range, and page number.
4. **OCR Confidence Score**: Automated OCR quality evaluation (&ge;95% required for auto-approval).
5. **Import Batch ID**: Traceable batch identifier (e.g., `ASTRO-BATCH-2026-001`).

## 4. Conflict Engine Workflows
When classical texts offer differing parameters (e.g., exaltation degree point vs arc, Sri Pati vs Bhava Chalita house systems):
- The **AstrologyConflictEngine** registers the discrepancy with claims from both sources.
- **Admin Reviewers** can choose between:
  1. `RESOLVED_CANONICAL`: Designating one text as canonical baseline while archiving the alternative.
  2. `CONTEXTUAL_SPLIT`: Preserving both interpretations attached to their respective tradition tags.

---
*URJAFLUX AI OS Ingestion Standards Team — Approved Canonical Document*
