# URJAFLUX AI OS — ARCHITECTURE FREEZE v1.0

This document marks the official and complete architectural freeze of URJAFLUX AI OS at version **1.0.0**. It sets the permanent reference layout, public boundaries, and integration contracts for all 19 enterprise domains, securing backward compatibility for future extension.

---

## 1. Architectural Philosophy & Context
URJAFLUX AI OS is a unified modular system designed to combine deep metaphysical knowledge bases (such as Vastu, Chakra, Lal Kitab, Numerology, and Vedic Astrology) with modern full-stack workflows, digital twin spatial coordinate mappings, computer vision inspection filters, and enterprise security boundaries.

Version 1.0 represents the mature, production-ready baseline. To maintain system reliability while enabling rapid community innovation, we enforce a strict **Sandbox by Default** and **Public API Only** architecture.

---

## 2. Key Objectives of the Freeze
- **Public Contract Invariance**: Lock all public services, REST endpoints, UI routing channels, and TypeScript declarations.
- **Strict Decoupling**: Isolate each of the 19 domains so that their internals can evolve independently while maintaining identical interfaces.
- **Plugin Sandbox Confinement**: Force third-party modifications to run exclusively inside secure process wrappers using `PluginSDK` version 1.0.
- **Fail-safe Stability**: Guard core operations from plugin exceptions, memory leaks, and circular dependency chains.

---

## 3. Scope of Invariance (The Immutable Core)
The following directories and domains are frozen at version 1.0:

1. **Vastu & Chakra Libraries** (`DOMAIN-001`, `DOMAIN-002`, `DOMAIN-002A`, `DOMAIN-002B`)
2. **Astrology & Numerology Engines** (`DOMAIN-003`, `DOMAIN-004`, `DOMAIN-005`, `DOMAIN-006`)
3. **Execution, Monitoring & Consultation** (`DOMAIN-007`, `DOMAIN-008`, `DOMAIN-009`, `DOMAIN-010`)
4. **Spatial, CAD & Vision Pipelines** (`DOMAIN-011`, `DOMAIN-012`, `DOMAIN-013`)
5. **Collaboration, Integration, Analytics & Security** (`DOMAIN-014`, `DOMAIN-015`, `DOMAIN-016`, `DOMAIN-017`)
6. **AI Governance & Prompts** (`DOMAIN-018`)
7. **Extensibility & Marketplace** (`DOMAIN-019`)

---

## 4. Post-Freeze Modification Policy
Any future expansion must follow these constraints:
- **No Core File Alterations**: Modifying frozen source code is prohibited.
- **Extension-Driven Development**: Introduce new features exclusively through the registered Marketplace as standard `manifest.json` plugins.
- **Interface Inheritance**: In the event of mandatory core changes, declare new interfaces with minor version numbering (e.g. `IPluginSDK_v1_1`) extending original interfaces to prevent regressions.
