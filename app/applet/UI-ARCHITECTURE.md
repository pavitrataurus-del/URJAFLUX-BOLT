# UI-ARCHITECTURE
## URJAFLUX AI OS

### 1. Architectural Principles
- **Data-Dense but Breathable:** High information density suited for professionals, utilizing typography and layout to avoid clutter.
- **Contextual Awareness:** Information should adapt to context, showing detailed properties only when relevant items are selected.
- **Deterministic Workflows:** Clear, repeatable paths for common tasks with explicit states (e.g., Ingestion -> Analysis -> Review).
- **Graceful Degradation:** Features scale down from multi-monitor desktop setups to single-screen laptops and tablets.
- **Non-blocking Operations:** Background processes (e.g., OCR, embedding) should never block the user interface.

### 2. Global Layout Structure
The primary application shell consists of:
- **Global Top Navigation (Header):** Search, Breadcrumbs, Notifications, User Profile, Environment Context.
- **Primary Sidebar (Left, Collapsible):** App-wide navigation (Dashboard, Projects, Knowledge, Settings).
- **Secondary Sidebar (Left, Contextual):** Specific to the current module (e.g., Layer Manager in Digital Twin).
- **Main Workspace (Center):** The primary interactive area (Canvas, Data Grid, Dashboard).
- **Inspector Panel (Right, Collapsible):** Deep dive into selected objects, relationships, or nodes.
- **Command & Status Bar (Bottom):** Keyboard shortcut hints, background task statuses, zoom levels.
- **Command Palette (Overlay, Cmd/Ctrl+K):** Omni-search and quick actions.

### 3. State Management & Data Flow
- **Optimistic UI Updates:** Instant visual feedback for user actions, with background reconciliation.
- **Event-Driven UI:** UI components subscribe to the centralized EventBus to react to pipeline updates (e.g., `OCR_COMPLETED`).
- **Unified Selection Model:** Selecting an entity in one view (e.g., a node in the Knowledge Graph) updates the Inspector globally.

### 4. Layout Types
- **Dashboard Layout:** Bento-box style grid of metric cards and summary charts.
- **Workspace Layout:** Edge-to-edge canvas with floating or docked toolbars (used for Spatial and Digital Twin modules).
- **Data Grid Layout:** Full-height, highly functional data tables with robust filtering and sorting.
- **Split-Pane Layout:** Resizable panes for viewing documents alongside extracted knowledge or decisions.

### 5. Multi-Monitor Strategy
- Support tearing off tabs or panels (e.g., opening the Knowledge Graph in a new window while keeping the Digital Twin in the main window) via synchronized local storage state or WebSockets.
