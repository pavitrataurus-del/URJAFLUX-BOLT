# DOMAIN-002A: Knowledge Quality Engine Report

## Quality Scoring Mathematical Formula

The **Knowledge Quality Engine** (`IngestionQualityEngine.ts`) evaluates every imported package on a 0–100 numerical scale across 7 sub-metrics:

```
Overall Quality Score = 
  [ (OCR Quality + Metadata Completeness + Ontology Completeness +
     Relationship Completeness + Evidence Completeness) / 5 ]
  - Duplicate Deductions (-5 per pending duplicate)
  - Conflict Deductions (-5 per pending conflict)
```

---

## 7 Quality Sub-Metrics

1. **OCR Quality Score** (0–100%): Average Gemini OCR confidence.
2. **Metadata Completeness Score** (0–100%): Evaluates presence of Title, Author, Publisher, Edition, Year, Language, and ISBN.
3. **Ontology Completeness Score** (0–100%): Evaluates entity density and attribute coverage.
4. **Relationship Completeness Score** (0–100%): Evaluates edge density per entity.
5. **Evidence Completeness Score** (0–100%): Evaluates shastra verse citations and page/paragraph coordinates.
6. **Duplicate Deduction**: -5 points per unresolved pending duplicate.
7. **Conflict Deduction**: -5 points per unresolved pending scriptural conflict.

---

## Grade Thresholds

* **A+**: 95–100 (Full scriptural verification, SME sign-off, zero pending conflicts)
* **A**: 85–94 (High confidence, minor missing non-essential metadata)
* **B**: 70–84 (Moderate evidence, pending SME final review)
* **C**: 55–69 (Incomplete ontology or active unresolved conflicts)
* **F**: <55 (Unverified draft or severe missing fields)
