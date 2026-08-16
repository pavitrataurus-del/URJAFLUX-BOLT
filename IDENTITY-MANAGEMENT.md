# Identity Management Profile (IDENTITY-MANAGEMENT.md)

## 1. Unified Identity Relations Schema
All security identities map to atomic schema structures extending the standard `BaseSecurityEntity` layout:

```
 [Tenant] ── (1:N) ── [Organization] ── (1:N) ── [Group]
    │                                              │
  (1:N)                                          (N:M)
    │                                              │
    └─────────────────── [User] ───────────────────┘
                           │
                         (1:N)
                           │
                       [Session]
```

## 2. Directory Entities
- **Tenant:** Logical multi-tenant cloud workspace partition (e.g. standard enterprise or government level). Contains global feature whitelists and structural ip networks boundaries.
- **Organization:** Regional division or commercial legal entity (e.g. Urjaflux India Operations Ltd).
- **Group:** Shared organizational collection (e.g. Field Surveyors Circle, HQ Security Circle).
- **User:** Primary identity representing an employee or administrative officer with specific clearance credentials and device signatures.
- **ApiIdentity & ServiceAccount:** Autonomous tokens and service credentials representing machine-to-machine integration connections.
