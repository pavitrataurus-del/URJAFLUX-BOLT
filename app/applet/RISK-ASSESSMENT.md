# RISK ASSESSMENT & MITIGATION
**URJAFLUX AI OS — Version BUILD-026I (RC-1)**

---

## Risk Matrix

| Risk Factor | Severity | Probability | Impact | Mitigation Strategy |
| :--- | :---: | :---: | :--- | :--- |
| **Missing Report Service Backend** | Medium | High | PDF downloads fail | Client-side visual preview fallback provided; clear user messaging; missing API documented in `MISSING-REPORT-API-REPORT.md`. |
| **Memory Pressure on 3D Twin** | Low | Low | Canvas lag | WebGL context cleanup and viewport culling in place. |
| **RBAC Leakage** | Critical | Low | Metadata exposed | Strict RBAC props (`isAdmin`) enforced across ReportPreview and Admin workspaces. |
