# Execution Workspace Specification — DOMAIN-007

## Workspace UI
`ProjectExecutionWorkspace.tsx` is an interactive React workspace integrated into `KnowledgePage.tsx`.

## Key Views
1. **Header & Role Switcher**: Interactive RBAC role switcher (`ADMIN`, `PROJECT_MANAGER`, `FIELD_ENGINEER`, `END_USER`).
2. **Overview & KPI Dashboard**: Real-time completion progress, task status counters, evidence coverage %, and phase roadmaps.
3. **Recommendation Execution Converter**: Dialog to convert approved DOMAIN-006 recommendations into structured execution projects.
4. **Task Execution Board**: Filterable task list with workflow status transition buttons (`In Progress`, `Inspection`, `Complete`).
5. **Checklist & Site Audits**: Interactive checklist checkboxes and recorded site inspection reports.
6. **Digital Evidence Vault**: Media gallery displaying uploader role, GPS tags, measurement values, and SHA256 checksums.
7. **Approval Center**: Multi-tier sign-off log with digital signature hashes.
8. **Issues & Risks Register**: Site issues and risk mitigation matrix.
9. **Audit Log**: Terminal-style timestamped immutable activity trail.
