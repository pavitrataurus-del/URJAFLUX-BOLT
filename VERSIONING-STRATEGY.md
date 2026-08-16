# VERSIONING-STRATEGY.md

This document outlines the official Semantic Versioning strategy for URJAFLUX AI OS.

---

## 1. Core SemVer System (X.Y.Z)

All core modules, platform services, and extensions utilize the Semantic Versioning 2.0.0 standard.

```
       Platform Version = 1.0.0
                          │ │ └─ PATCH (Bug fixes, internal optimizations)
                          │ └─── MINOR (Backward-compatible feature additions)
                          └───── MAJOR (Breaking API or interface changes)
```

---

## 2. Frozen Version Registrations

| Component | Target Version | Release Policy |
| :--- | :--- | :--- |
| **Platform Release** | `1.0.0` | Production baseline. Stable, fully validated build. |
| **Public API Contracts** | `1.0` | Frozen interfaces. Breaking modifications require starting a new contract version. |
| **Plugin SDK** | `1.0` | Standard public interface for external extensions. |
| **Plugin Manifest Schema** | `1.0` | Locked layout for `manifest.json`. |
| **Event Schemas** | `1.0` | Immutable payloads for centralized pub-sub events. |

---

## 3. Version Compatibility Matrix
- **Core Backward Compatibility**: The platform guarantees that any plugin designed for Plugin SDK `1.x` will run seamlessly on any subsequent minor releases of the platform.
- **Dependency Upgrades**: In the event of minor upgrades to core libraries, all deprecated methods are retained as annotated symbols to prevent breaking existing plugin implementations.
