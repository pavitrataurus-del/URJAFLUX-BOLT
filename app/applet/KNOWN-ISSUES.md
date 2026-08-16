# KNOWN ISSUES & DEVIATIONS
**URJAFLUX AI OS — Version BUILD-026I (RC-1)**

---

## 1. Missing Backend Integration Endpoints
- **Report Generation API**: Frontend Report Builder relies on simulated workflow completion due to missing backend `ReportGenerationEngine` (`POST /api/reports/generate`). Documented in `MISSING-REPORT-API-REPORT.md`.
- **Report Export Service**: Server-side PDF/DOCX renderer service endpoint (`GET /api/reports/{id}/export`) pending implementation by backend team.

## 2. Non-Blocking Console Warnings
- **Vite Chunk Size Warning**: Production bundle chunk exceeds 500 kB (minified). Does not impact application load or execution in production containers.
