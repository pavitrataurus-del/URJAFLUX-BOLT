# PLATFORM-ARCHITECTURE-INDEX.md

This document serves as the central directory index for all architectural freeze specifications and platform-wide contracts of URJAFLUX AI OS Version 1.0.

---

## 1. Core Architecture Specifications

- **[/ARCHITECTURE-FREEZE.md](/ARCHITECTURE-FREEZE.md)**: Establishes the core goals, scope of invariance, and post-freeze expansion policies.
- **[/DOMAIN-BOUNDARY-AUDIT.md](/DOMAIN-BOUNDARY-AUDIT.md)**: Comprehensive responsibility audit for all 19 system domains.
- **[/DEPENDENCY-MAP.md](/DEPENDENCY-MAP.md)**: Visualizes the import hierarchy and downwards dependency direction rule.

---

## 2. Public Contracts & Extensibility

- **[/PUBLIC-API-FREEZE.md](/PUBLIC-API-FREEZE.md)**: Houses public service declarations, DTOs, and interface contracts.
- **[/EVENT-ARCHITECTURE.md](/EVENT-ARCHITECTURE.md)**: Details the pub-sub naming registry, payload schemas, and loop prevention mechanisms.
- **[/PLUGIN-COMPATIBILITY.md](/PLUGIN-COMPATIBILITY.md)**: Frozen specification for PluginSDK Version 1.0, manifest structures, and extension points.

---

## 3. Governance, Security & Performance

- **[/SECURITY-BOUNDARY-AUDIT.md](/SECURITY-BOUNDARY-AUDIT.md)**: Verifies authorization limits, secrets isolation, and security logs.
- **[/AI-GOVERNANCE-AUDIT.md](/AI-GOVERNANCE-AUDIT.md)**: Verifies AI Gateway usage, prompt structures, and cost control metrics.
- **[/PERFORMANCE-REVIEW.md](/PERFORMANCE-REVIEW.md)**: Reviews lazy initialization, debouncing rules, and memory limits.
- **[/CODE-QUALITY-REPORT.md](/CODE-QUALITY-REPORT.md)**: Summary of TypeScript checks, directory hygiene, and error boundaries.

---

## 4. Release Strategy & Readiness

- **[/VERSIONING-STRATEGY.md](/VERSIONING-STRATEGY.md)**: Outlines Semantic Versioning rules and frozen module numbers.
- **[/PLATFORM-READINESS.md](/PLATFORM-READINESS.md)**: Production build status and pre-deployment checklists.
- **[/FREEZE-COMPLETION-REPORT.md](/FREEZE-COMPLETION-REPORT.md)**: Final verification outcomes and formal sign-off.
