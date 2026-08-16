# Authorization Engine Specification (AUTHORIZATION.md)

## 1. Centralized Evaluator Flow
The authorization engine processes user access requests by combining static Role-Based Access Controls (RBAC) and dynamic Attribute-Based Access Controls (ABAC):

```
 User Request (Subject, Resource, Action, Context)
                       ↓
         [RBAC Permission Cache Lookup]
  Does user possess atomic permission role mapping?
                       ↓ (Yes)
       [ABAC Policies Evaluator Pipeline]
  Check environment subnet, location, and clock rules
                       ↓ (No violations)
                 Access Allowed
```

## 2. Decision Logic
- **RBAC:** Inherits permissions via nested role definitions (e.g. `Lead Vastu Designer` inherits `Operator` bounds).
- **ABAC:** Restricts actions based on live attributes (e.g. blocks CAD edits during night hours, or blocks secrets reads from untrusted IP ranges).
- **Centralized Evaluation:** Decisions are evaluated in-memory and cached for high scalability and rapid response.
