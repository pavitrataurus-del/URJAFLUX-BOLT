# DOMAIN-002: Knowledge Quality Engine Report

## Executive Summary

The **Chakra Knowledge Quality Engine** (`ChakraQualityEngine.ts`) evaluates each registered Chakra entity on a strict 0–100 numerical scale across 7 mathematical sub-metrics:

1. **Source Quality Score** (Max 20 pts)
2. **Evidence Count Score** (Max 15 pts)
3. **Expert Approval Score** (Max 20 pts)
4. **Ontology Completeness Score** (Max 25 pts)
5. **Relationship Completeness Score** (Max 20 pts)
6. **Conflict Deductions** (-5 pts per unresolved conflict)
7. **Duplicate Deductions** (-4 pts per unresolved duplicate)

---

## Entity Quality Scores & Grades Summary

| Entity ID | Chakra Name | Overall Score | Grade | Source Quality | Evidence Count | Expert Approval | Ontology Comp. | Relationship Comp. |
|---|---|---|---|---|---|---|---|---|
| `chk-001` | Muladhara | **98 / 100** | **A+** | 20 / 20 | 15 / 15 | 20 / 20 | 25 / 25 | 18 / 20 |
| `chk-002` | Svadhisthana | **96 / 100** | **A+** | 20 / 20 | 15 / 15 | 20 / 20 | 24 / 25 | 17 / 20 |
| `chk-003` | Manipura | **98 / 100** | **A+** | 20 / 20 | 15 / 15 | 20 / 20 | 25 / 25 | 18 / 20 |
| `chk-004` | Anahata | **98 / 100** | **A+** | 20 / 20 | 15 / 15 | 20 / 20 | 25 / 25 | 18 / 20 |
| `chk-005` | Vishuddha | **98 / 100** | **A+** | 20 / 20 | 15 / 15 | 20 / 20 | 25 / 25 | 18 / 20 |
| `chk-006` | Ajna | **98 / 100** | **A+** | 20 / 20 | 15 / 15 | 20 / 20 | 25 / 25 | 18 / 20 |
| `chk-007` | Sahasrara | **99 / 100** | **A+** | 20 / 20 | 15 / 15 | 20 / 20 | 25 / 25 | 19 / 20 |

---

## Quality Grade Thresholds

* **A+**: 95–100 (Full scriptural verification, SME sign-off, >20 attributes, relationship density >15)
* **A**: 85–94 (High confidence, minor missing supplemental fields)
* **B**: 70–84 (Moderate evidence, pending SME final review)
* **C**: 55–69 (Incomplete ontology or active unresolved conflicts)
* **F**: <55 (Unverified draft or severe unresolvable contradictions)

All 7 primary Chakras in DOMAIN-002 currently hold **Grade A+** verification.
