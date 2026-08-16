# DOMAIN-002A: Duplicate Detection Engine Report

## Scope of Duplicate Scanning

The **Duplicate Detection Engine** performs multi-entity fingerprinting and similarity analysis across 6 asset types:

1. **Duplicate Documents**: Title and chapter layout similarity (>0.85).
2. **Duplicate Rules**: Rule condition & prescription semantic match.
3. **Duplicate Remedies**: Remedy material, placement, and frequency match.
4. **Duplicate Mantras**: Devanagari acoustic text match.
5. **Duplicate Entities**: Canonical name & attribute overlap.
6. **Duplicate Relationships**: Matching source, target, and edge types.

---

## Non-Destructive Action Policy

When a duplicate candidate is detected:
* Both records are preserved intact.
* A duplicate candidate entry is flagged in the `Duplicate Queue`.
* Admins can choose to **Merge Records** (transferring all relationship edges to the primary canonical entity) or **Dismiss Candidate**.
* Every merge action is logged in the package audit trail.
