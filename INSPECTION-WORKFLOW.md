# URJAFLUX AI OS — DOMAIN-012 Inspection & Human Review Workflow
## Defect Classification, Confidence Scoring, and Manual Override

### 1. Site Inspection AI
Analyzes site photographs to observe structural conditions.
* **Support Classes:** Wall Cracks, Dampness & Seepage, Water Leakage, Exposed Rebars, Safety Hazards, Material Misplacement.
* **Raw Observations Only:** Outputs physical descriptions and severities (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`). Never generates remedies or design recommendations (to avoid duplication with DOMAIN-006 Reasoning).

---

### 2. Confidence Scoring Engine
Detections and observations are scored on three tiers:
1. **Class Confidence:** Model probability of correct classification.
2. **Box Confidence:** Geometric alignment accuracy.
3. **Overall Confidence:** Average percentage.

* **Low Confidence Threshold (< 80%):** Detections with overall confidence under 80% are visually flagged and locked. They cannot be transferred to DOMAIN-011 without manual human review and approval.

---

### 3. Human-in-the-Loop Workflow
Authorized roles (ADMIN, PROJECT_MANAGER, FIELD_ENGINEER) can manipulate detections:
* **Accept / Reject:** Approves or discards a detection.
* **Manual Edit / Annotation:** Modify bounding boxes or draw completely new ones.
* **Merge / Split:** Combine adjacent symbols or split compound objects into separate records.
* **Audit Logs:** Every action appends to a permanent, immutable change log with timestamps and reviewer IDs.
