# Asset Annotation Engine (ANNOTATION-ENGINE.md)

## 1. Contextual Overlay Mechanics
The Annotation Engine allows professional inspectors, Vastu auditors, and CAD engineers to attach coordinates-based feedback pins onto original visual files:
- **Spatial CAD Diagrams (DOMAIN-011):** Annotates 3D coordinates on 2D layouts.
- **Vision AI Photos (DOMAIN-012):** Pins coordinates over identified concrete defect rectangles.
- **Report Proofing (DOMAIN-010):** Flags page-level text revisions on PDF reports.

## 2. Geometry Schema
Annotations map onto a coordinate grid system using a standardized JSON schema:
```json
{
  "type": "POINT" | "RECTANGLE",
  "coordinates": [[x, y], [w, h]]
}
```
Pins can be flagged as "Resolved" when remediation is successfully executed.
