# DOMAIN-002A: Conflict Detection Engine Report

## Conflict Resolution Philosophy

Knowledge contradictions frequently exist between classical shastras (*Mayamatam* vs *Manasara* vs *Brihat Samhita*) or between traditional scripts and modern biofield research.

In accordance with URJAFLUX OS architecture guidelines:
* **Knowledge is NEVER deleted or overwritten**.
* Both conflicting claims are preserved in full.
* A conflict record is created in the `Conflict Resolution Queue`.
* Routed to Acharya SME review for reconciliation.

---

## Conflict Structure

```typescript
export interface IIngestionConflict {
  id: string;
  topic: string;
  sourceA: { id: string; title: string; claim: string; page: number };
  sourceB: { id: string; title: string; claim: string; page: number };
  conflictType: 'Contradictory Claim' | 'Scriptural Variance' | 'Clinical Difference';
  reviewStatus: 'Pending' | 'Approved' | 'Needs Revision' | 'Resolved';
  reviewerNotes?: string;
  reviewer?: string;
  resolvedAt?: string;
}
```

## RBAC Visibility

* **Admin Role**: Complete visibility into logged conflicts, claim texts, source citations, and reviewer discussion notes.
* **End User Role**: Internal conflict queue, discussions, and unresolved claims are strictly hidden/redacted.
