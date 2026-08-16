# KNOWN LIMITATIONS
**URJAFLUX AI OS — Version BUILD-026I (RC-1)**

---

## 1. Missing Backend Service Services
As documented in `MISSING-REPORT-API-REPORT.md`, the backend services for report generation and export require completion by backend teams:
1. **ReportGenerationEngine**: Asynchronous background report compilation backend endpoint (`POST /api/reports/generate`).
2. **ReportExportService**: Server-side PDF/DOCX renderer service (`GET /api/reports/{id}/export`).
3. **ReportWorkflowEngine**: Database persistence service for approval states (`GET /api/reports?projectId={id}`).

## 2. Canvas & Rendering Limits
- **WebGL Context Limit**: Browsers restrict WebGL contexts to 16 active instances. Canvas views clean up context automatically on unmount.
- **Large Floorplan Memory Footprint**: DXF/CAD vector drawings with over 100,000 entities are auto-simplified during ingestion to maintain 60 FPS canvas performance.
