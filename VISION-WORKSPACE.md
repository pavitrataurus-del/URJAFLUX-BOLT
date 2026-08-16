# URJAFLUX AI OS — DOMAIN-012 Vision Workspace
## Interactive Visual Inspection Center

### 1. Workspace Layout & Panels
The interactive Vision Workspace provides a responsive, single-pane layout tailored for professional inspection and human-in-the-loop audit:

* **Left Panel — Ingestion & Queue:**
  - File uploader supporting PNG, JPG, BMP, TIFF, WebP, PDF.
  - Fast ingestion preset buttons.
  - Project meta detail and batch processing queue.
* **Center Panel — Interactive Stage:**
  - High-precision rendering viewport.
  - Overlays: Original image vs Detections, OCR text boxes, Confidence Heatmap weights, and Vector paths.
  - Manual Annotation Draw Tool (click and drag to define new boundaries).
* **Right Panel — Review & Validation Control Center:**
  - Symbol filters and confidence cut-offs.
  - Photo Observation severity index.
  - Bounding box inspector with Accept, Reject, Split, Merge, and Override controls.
* **Bottom Panel — Downstream Ingress Log:**
  - Forwarding triggers that translate and export verified detections directly to DOMAIN-011 Spatial CAD Workspace.

---

### 2. Multi-Role RBAC Compliance
* **ADMIN / PROJECT_MANAGER:** Fully authorized to accept, reject, edit, merge, split, and transfer approved objects.
* **FIELD_ENGINEER:** Authorized to ingest photographs, draw custom annotations, and request review.
* **END_USER:** Restricted view-only access. Actions and approval pipelines are hidden.
