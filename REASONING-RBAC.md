# Role-Based Access Control (RBAC) Specification — DOMAIN-006

## Roles
DOMAIN-006 enforces strict role separation between **Admin Knowledge Engineer** (`ADMIN`) and **End-User Client** (`END_USER`).

## Permission Matrix

| Feature / Data View | Admin (`ADMIN`) | End-User (`END_USER`) |
| :--- | :---: | :---: |
| Full Reasoning Graph Explorer | ✅ Access | ❌ Restricted |
| Approved Recommendations View | ✅ Access | ✅ Access |
| Draft / Rejected Recommendations | ✅ Access | ❌ Hidden |
| Full Evidence & Shloka Citations | ✅ Access | ✅ Access |
| Raw Quality Scores & OCR Confidence | ✅ Access | ❌ Sanitized |
| Conflict Resolution & Admin Overrides | ✅ Access | ❌ Restricted |
| Rejected Evidence Logs | ✅ Access | ❌ Restricted |
| System Audit Trail Logs | ✅ Access | ❌ Restricted |

## Sanitization Function
The `CrossDomainReasoningEngine.sanitizeForEndUser()` method filters out unapproved recommendations, internal confidence breakdown metrics, and administrative conflict override logs before rendering end-user views.
