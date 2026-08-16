# PERFORMANCE-REVIEW.md

This document reviews the performance architecture and caching guidelines of URJAFLUX AI OS.

---

## 1. Service Lifecycle & Singleton Management

All critical system services implement the Singleton design pattern. This prevents redundant resource allocations and coordinates access to global states.

- **Lazy Initialization**: Services (such as the `AstroService` and `SpatialService`) are initialized lazily on their first usage, rather than at system boot time. This keeps application start-up times minimal.
- **Event Bus Decoupling**: High-frequency communication between components is routed through the central Event Bus. This prevents tight coupling and ensures smooth event delivery.

---

## 2. Resource Management & Memory Limits

- **Memory Pools**: The Plugin Sandbox allocates simulated RAM pools for each third-party process. If a plugin exceeds its allocated memory ceiling, the sandbox suspends the process to protect the core application.
- **Debounced Updates**: Calculations that run frequently (such as CAD plan measurements or real-time spatial zoning calculations) are debounced. This prevents rendering stutter and keeps the main UI responsive.

---

## 3. Caching Strategy
- **Static Knowledge Caches**: Planetary transit databases, Vastu directional tables, and zodiac matrices are stored in read-only memory caches to avoid repetitive calculation overhead.
- **Query Caching**: Complex queries on birth charts or client profiles are cached locally, ensuring instant retrieval during active user sessions.
