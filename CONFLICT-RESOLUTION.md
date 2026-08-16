# Conflict Resolution Specification — DOMAIN-006

## Purpose
In a multi-domain shastric system, claims from different knowledge domains may occasionally diverge (e.g., Vastu water element in Northeast vs. Lal Kitab planetary house requirement for Sun in 1st house).

The `ConflictResolver` ensures that:
1. **No Viewpoint is Suppressed**: Conflicting claims are recorded, preserved, and displayed.
2. **Deterministic Priority Arbitration**: Classical Shastra texts take precedence over secondary commentaries (`RESOLVED_PRIORITY`).
3. **Contextual Splitting**: Remedies are split into primary spatial boundary and secondary non-interfering physical remedy (`CONTEXTUAL_SPLIT`).
4. **Admin Manual Overrides**: Knowledge Engineers can manually review and override conflict resolutions (`ADMIN_OVERRIDDEN`).

## Resolution Statuses
- `UNRESOLVED`: Flagged for review.
- `RESOLVED_PRIORITY`: Resolved by classical shastra priority ranking.
- `CONTEXTUAL_SPLIT`: Dual strategy applied across spatial/temporal boundaries.
- `ADMIN_OVERRIDDEN`: Explicitly overridden with custom admin audit notes.
