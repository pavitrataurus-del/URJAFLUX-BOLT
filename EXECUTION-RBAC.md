# Role-Based Access Control (RBAC) Specification — DOMAIN-007

## Roles & Permissions Matrix

| Feature / Action | Admin (`ADMIN`) | Project Manager (`PROJECT_MANAGER`) | Field Engineer (`FIELD_ENGINEER`) | End User (`END_USER`) |
| :--- | :---: | :---: | :---: | :---: |
| Convert Recommendations to Project | ✅ | ✅ | ❌ | ❌ |
| Configure Workflows & Status Overrides | ✅ | ✅ | ❌ | ❌ |
| Assign Tasks & Timelines | ✅ | ✅ | ❌ | ❌ |
| Execute Tasks & Checklists | ✅ | ✅ | ✅ | ❌ |
| Upload Site Evidence | ✅ | ✅ | ✅ | ❌ |
| Record Site Inspections | ✅ | ✅ | ✅ | ❌ |
| Submit Approvals | ✅ | ✅ | ✅ (Tier 1) | ❌ |
| View Project Status & Deliverables | ✅ | ✅ | ✅ | ✅ |
| Modify Immutable Audit Logs | ❌ | ❌ | ❌ | ❌ |
