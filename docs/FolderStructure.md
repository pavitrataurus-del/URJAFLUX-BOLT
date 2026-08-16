# Folder Structure Reference

This document outlines the organization of the **URJAFLUX AI OS** project, specifying the purpose, responsibilities, and dependencies of each directory.

---

## Workspace Root Directory Layout

```text
/
├── assets/                    # Standard static graphics and media
├── docs/                      # Enterprise Technical Documentation System
├── firebase-blueprint.json    # Initial database layouts and schemas
├── firestore.rules            # Firestore security and validation rules
├── package.json               # Package configuration and script definitions
├── tsconfig.json              # TypeScript engine configurations
├── vite.config.ts             # Vite server bindings and asset setups
└── src/                       # Main source tree
```

---

## Directory Specifications & Responsibilities

### `src/components/`
* **Purpose**: Host all React visual views, workspace canvases, simulation overlays, and interactive pages.
* **Responsibilities**:
  * Render modular, desktop-first responsive dashboards (e.g., `DashboardPage`, `WorkspacePage`).
  * Enforce high-contrast accessibility and coordinate canvas overlays (`SpatialAnnotationEngine`).
  * Model specific operational mockups and mock state simulations (`AIPipelineSimulator`, `ArchitectureOverview`).
* **Dependencies**:
  * Depends on `src/services/` for business transactions.
  * Depends on `src/types/` for structural bindings.
  * Direct imports from `lucide-react` for iconography.
  * Direct imports from `motion/react` for structural layout transitions.

### `src/services/`
* **Purpose**: Orchestrate clean, stateless business logic operations.
* **Responsibilities**:
  * Act as transaction boundaries between UI triggers and backends.
  * Implement connection checks and route storage writes to safe offline local fallbacks (`localStorage` adapters).
  * Wrap and invoke complex engines (e.g., `workspaceService` coordinates spatial calculations with storage saves).
* **Dependencies**:
  * Depends on `src/repositories/` for physical data queries.
  * Depends on `src/engines/` for calculations and math formulas.
  * Depends on `src/types/` for structural bindings.

### `src/engines/`
* **Purpose**: Mathematical computation, declarative AST rule evaluation, and document compilation.
* **Responsibilities**:
  * `engines/ruleEngine/`: Compile core Rule engines, parse rule conditional nodes, and handle AST evaluations.
  * `engines/pdf/`: Compile and pack custom client dossiers, outputting styled layout documents.
  * `engines/report/`: Parse diagnostic recommendations into compliant structural audit templates.
* **Dependencies**:
  * Strictly decoupled from presentation hooks or database adapters.
  * Depends on `src/types/` for evaluation context parameters.

### `src/repositories/`
* **Purpose**: Abstract physical data access interfaces.
* **Responsibilities**:
  * Decouple Firestore collections from services (e.g., `workspaceRepository` wraps query builders).
  * Expose simple methods like `getById`, `save`, and `delete`.
* **Dependencies**:
  * Depends on `src/types/` for interface definitions.
  * Depends on `src/firebase` for core Firestore instance declarations.

### `src/spatial/`
* **Purpose**: Compute physical floor plans, vector rotations, coordinate mappings, and geometric grids.
* **Responsibilities**:
  * `spatial/engine/`: Transform raw image grids into aligned coordinate maps (`spatialEngine`, `coordinateNormalizer`).
  * `spatial/geometry/`: Calculate intersections, shapes, boundaries, and spatial angles.
* **Dependencies**:
  * Independent geometry library. Depends on `src/types/` for structural coordinate models.

### `src/vastu/`
* **Purpose**: Vedic spatial alignment guidelines, deities, and traditional guidelines.
* **Responsibilities**:
  * Define Vastu Purusha Mandala deities, directional energy ratings, and orientation tolerances.
  * Host rules mapping specific room types (e.g., kitchen, bedroom) to quadrant coordinates.
* **Dependencies**:
  * Depends on `src/types/` and `src/engines/ruleEngine/` for matching Vastu equations.

### `src/knowledge/`
* **Purpose**: Scriptural book parsing, knowledge pack indexing, and Vedic RAG structure.
* **Responsibilities**:
  * `knowledge/packs/`: Static scriptural packs (e.g., `coreKnowledgePack`) containing verified shlokas and translations.
  * `knowledge/repository/`: Local directory searching, keyword lookups, and citation tracking.
  * `knowledge/validators/`: Validate consistency of extracted rules, avoiding broken citations or duplicate rule definitions.
* **Dependencies**:
  * Depends on `src/types/` for book structural parameters.

### `src/types/`
* **Purpose**: Centralized TypeScript interface files to prevent circular import loops.
* **Responsibilities**:
  * Define core models for Rule Engine (`ruleEngine.ts`), Spatial Canvas (`sig.ts`), CoE Astrological parameters (`coe.ts`), and App Configurations (`app.ts`).
* **Dependencies**:
  * Root dependency leaf. Cannot import from other folders; other folders must import from here.

### `docs/`
* **Purpose**: Maintain the complete enterprise documentation system.
* **Responsibilities**:
  * Provide developer guidelines, architecture maps, database layouts, and execution flow diagrams for long-term project viability.
