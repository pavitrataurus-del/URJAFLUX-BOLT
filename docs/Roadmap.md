# Platform Roadmap

This document outlines the milestones, current operational status, and future vision of **URJAFLUX AI OS**.

---

## 1. Project Milestones & Progress

```text
       Milestone 1: Core Spatial Geometry (Vastu Grid)
                             ↓
       Milestone 2: Deterministic Rule AST Evaluator
                             ↓
       Milestone 3: Astrological & Numerology Engine
                             ↓
       Milestone 4: Vedic Scripture Parser & RAG
                             ↓
       Milestone 5: Enterprise Arch & Offline-First Sync
                             ↓
       Milestone 5.5: Enterprise Documentation System [CURRENT]
```

---

## 2. Completed Milestones

### Milestone 1 & 2: Spatial & Geometric Canvas (Vastu Grid)
* **Status**: Complete.
* **Achievements**: Implemented real-time canvas overlays, compass offset alignment, and 9x9 Pada grid generation. Designed coordinates normalization functions mapping floor plans directly to Vastu quadrants.

### Milestone 3: Deterministic Rule AST Evaluator
* **Status**: Complete.
* **Achievements**: Designed an AST-based Condition Evaluator checking complex nested boolean rules. Integrated the Formula Registry and Conflict Resolver to handle Vastu vs. Astro-Vastu planetary overrides.

### Milestone 4: Vedic Scripture Parser & RAG
* **Status**: Complete.
* **Achievements**: Added modular Knowledge Registries loading canonical books (Mayamatam, Manasara) down to individual chapter, page, and shloka citations (evidence nodes).

### Milestone 5: Enterprise Architecture & Offline-First Sync
* **Status**: Complete.
* **Achievements**: Normalized folders structure and decoupled modules. Designed dual-write adapters to save workspace revisions simultaneously to remote Firestore collections and safe local storage buffers, enabling seamless offline operations.

### Milestone 5.5: Enterprise Documentation System
* **Status**: Complete (Current).
* **Achievements**: Authored 10 core documents detailing schemas, pipelines, architectures, and standards.

---

## 3. Upcoming Milestones (Future Features)

### Milestone 6: High-Fidelity Sanskrit OCR & Parsing (RAG Extension)
* **Goal**: Enable direct PDF scripture drag-and-drops.
* **Scope**: Build server-side OCR pipeline parsers extracting devanagari verses, matching translations, and compiling new AST rule structures.

### Milestone 7: Professional CAD File Vector Parsing
* **Goal**: Support direct loading of industrial blueprints.
* **Scope**: Parse `.dxf` or `.dwg` vector paths, identifying room coordinates and orientation tags automatically without manual canvas re-drawing.

### Milestone 8: Immersive Vastu Digital Twin AR Walkthrough & Simulations
* **Goal**: Virtual walkthrough evaluations.
* **Scope**: Render Vastu Purusha alignments, magnetic field overlays, and remedy installations using WebGL and mobile AR engines.

---

## 4. Long-Term Vision

URJAFLUX AI OS aims to become the definitive operating system for sustainable, Vedic-aligned civil architecture. By merging traditional knowledge bases with cutting-edge spatial geometry and computer-vision pipelines, the platform scales ancient wisdom into a standardized, certified engineering discipline. Future modules will target historical building preservation, eco-sustainable material planning, and city-scale Vastu alignment planning.
