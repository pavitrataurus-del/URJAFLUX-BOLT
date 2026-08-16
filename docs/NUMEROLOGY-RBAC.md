# DOMAIN-004 — Enterprise Role-Based Access Control (RBAC) Specification

## Overview
This document specifies the Role-Based Access Control (RBAC) rules enforced across DOMAIN-004 to maintain data integrity and prevent exposure of unverified or draft knowledge to end users.

---

## 1. Role Capabilities Matrix
| System Capability | Admin | Expert Reviewer | End User |
| :--- | :--- | :--- | :--- |
| **View Canonical Entities (`getEndUserEntities`)** | ✅ Yes | ✅ Yes | ✅ Yes |
| **View Draft / Disputed Entities** | ✅ Yes | ✅ Yes | ❌ Blocked |
| **View Raw Source Traceability & OCR Logs** | ✅ Yes | ✅ Yes | ❌ Blocked |
| **Resolve System Conflicts** | ✅ Yes | ✅ Yes | ❌ Blocked |
| **Promote Entity Status to Canonical** | ✅ Yes | ❌ Pending Approval | ❌ Blocked |
| **Modify Quality Weights & Algorithms** | ✅ Yes | ❌ Blocked | ❌ Blocked |

---

## 2. Programmatic Enforcement in Registry
In `NumerologyMasterKnowledgeRegistry.ts`, access is strictly filtered by method signatures:

```typescript
// END USER VIEW — Sanitized, CANONICAL status only
public getEndUserEntities(): INumerologyEndUserEntity[] {
  return Array.from(this.entities.values())
    .filter(e => e.status === 'CANONICAL')
    .map(e => ({ ...sanitizedProperties }));
}

// ADMIN VIEW — Full unredacted data
public getAdminEntities(): INumerologyOntologyEntity[] {
  return Array.from(this.entities.values());
}
```
