# EVENT-ARCHITECTURE.md

This specification freezes the centralized event-driven architecture of URJAFLUX AI OS.

---

## 1. Global Event Bus & Contracts
The system utilizes a pub-sub model to coordinate cross-domain reactions without direct compile-time coupling.

### Event Names and Ownership Registry

To prevent event overlap or redundant message loops, every event name is strictly namespace-prefixed with the originating Domain ID.

| Event Name | Originating Domain | Purpose | Payload Schema |
| :--- | :--- | :--- | :--- |
| `client:created` | DOMAIN-008 | Fired when a client profile is added. | `{ clientId: string, name: string }` |
| `astrology:calculated` | DOMAIN-003 | Triggers when horoscope computations finish. | `{ clientId: string, birthChartId: string }` |
| `vastu:zoning_updated` | DOMAIN-011 | Fired when CAD floor plan coordinates shift. | `{ floorplanId: string, zones: any[] }` |
| `workflow:step_completed` | DOMAIN-013 | Triggers when an automated stage finishes. | `{ workflowId: string, stepId: string }` |
| `security:infraction` | DOMAIN-017 | Triggered on sandbox policy breaches. | `{ pluginId: string, infractionType: string }` |
| `plugin:installed` | DOMAIN-019 | Fired when a plugin passes signature checks. | `{ pluginId: string, version: string }` |

---

## 2. Event Routing & Loop Prevention
The URJAFLUX core enforces a strictly **acyclic** dependency propagation graph for events:

```
  [CAD floorplan change]
            │
            ▼ (vastu:zoning_updated)
    [Remedy Optimizer]
            │
            ▼ (remedy:optimized)
   [Workflow Orchestrator]
```

### Loop Prevention Audit
- **Subscriber Isolation**: Subscribers are prohibited from synchronously firing events that resolve back to their own triggers.
- **Max Hop Depth**: The central Event Bus caps recursive event propagation chains at **5 hops** to prevent runtime thread starvation.
- **Asynchronous Execution**: High-cost subscriber processes must run inside micro-tasks (async/await or promises) so that the core UI remains responsive.
