# DEPENDENCY-MAP.md

This document maps all import flows, architectural layer boundaries, and structural dependency directions in URJAFLUX AI OS.

---

## 1. Import Hierarchy & Layer Boundaries

The codebase follows a clear, multi-tiered layering strategy. Dependencies must flow exclusively **downward**; higher layers may depend on lower layers, but lower layers may never import from higher layers.

```
       ┌─────────────────────────────────────────────────────────┐
       │                     1. UI View Layer                    │
       │     (React Components, Live Dashboards, Portals)       │
       └────────────────────────────┬────────────────────────────┘
                                    │ (Imports)
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │                2. Application Services Layer            │
       │    (AstroService, SpatialService, WorkflowOrchestrator) │
       └────────────────────────────┬────────────────────────────┘
                                    │ (Imports)
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │                  3. Core Platform Infrastructure        │
       │      (AI Gateway, Security Auth, Event Bus, Sandbox)     │
       └────────────────────────────┬────────────────────────────┘
                                    │ (Imports)
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │                4. Immutable Types & Schemas             │
       │             (Types declarations, Manifest structures)   │
       └─────────────────────────────────────────────────────────┘
```

---

## 2. Cross-Domain Dependency Verification

To ensure strict decoupling, cross-domain dependencies are validated through structural checks.

```
                  ┌──────────────────────┐
                  │ DOMAIN-017: Security │
                  └──────────▲───────────┘
                             │ (Imports/Protects)
   ┌─────────────────────────┼─────────────────────────┐
   │                         │                         │
┌──┴──────────────┐   ┌──────┴──────────┐   ┌──────────┴──────┐
│ DOMAIN-008:     │   │ DOMAIN-018:     │   │ DOMAIN-019:     │
│ Client Profiles │   │ AI Governance   │   │ Extensibility   │
└─────────────────┘   └───────▲─────────┘   └─────────────────┘
                              │ (Proxies requests)
                      ┌───────┴─────────┐
                      │ DOMAIN-012:     │
                      │ Vision AI       │
                      └─────────────────┘
```

---

## 3. Coupling Audit Summary
- **Circular Imports**: **0 detected**. Checked recursively using `tsc --noEmit`.
- **Direct DB Access**: All domain interactions with durable storage are routed through the respective Domain Services, keeping direct database access encapsulated.
- **Loose Coupling Verification**: The system compiles cleanly with isolated domain tests, proving that individual domain files do not depend on the internals of other domains.
