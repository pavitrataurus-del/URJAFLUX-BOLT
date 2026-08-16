# MASTER-COMPONENT-LIBRARY-v1
## URJAFLUX AI OS - UI ARCHITECTURE FREEZE v1.0

### Core UI Components

#### 1. Data Display & Grids
- **Enterprise Data Grid:** Virtualized rows, sortable/resizable columns, sticky headers, multi-select checkboxes, contextual row actions, inline editing, CSV/JSON export.
- **Virtualized List:** Single-column streams for high-frequency updates (e.g., Reasoning Console log stream).
- **Property Inspector:** Key-value pair list with expandable sections, supporting nested objects and raw JSON viewing.
- **Status Badge:** Pill-shaped indicator with dot and semantic colors.
- **Metric Card:** Title, large tabular value, sparkline chart, delta indicator.
- **Tree View:** Unified component for Layer Manager and Ontology Explorer; collapsible hierarchy supporting drag-and-drop.

#### 2. Navigation & Layout
- **Docking Manager:** Robust panel management (e.g., GoldenLayout/rc-dock) for tearing off, nesting, and resizing panels.
- **Tabs:** Underlined style for contextual switching within a view.
- **Breadcrumbs:** Interactive dropdowns for quick navigation jumps.

#### 3. Inputs & Forms
- **Form Engine:** Multi-select comboboxes with async search, Date/Time range pickers, inline validation wrappers.
- **Primary Button:** Solid Sky-500 background, dynamic text color based on theme.
- **Secondary Button:** Transparent background, border Slate-700.
- **Ghost Button:** No border (used for icon buttons).
- **Search Bar:** Input with leading magnifying glass, trailing `⌘K` keyboard shortcut hint.

#### 4. Complex / Domain-Specific
- **WebGL Canvas Viewport:** Hardware-accelerated container (PixiJS/Three.js) with zoom/pan controls and overlay toolbars.
- **Minimap:** Reusable component accepting a viewport context (for 2D Spatial Canvas and Node Graph).
- **Node Graph:** Interactive force-directed graph component (WebGL accelerated).
- **Log Viewer:** Monospaced, auto-scrolling terminal-like view for Decision Traces (using Virtualized List).
- **Timeline:** Vertical connected list of events (Audit Trails, Job Progress).

#### 5. Feedback & States
- **Toast Notification:** Slide-in from bottom right, auto-dismiss.
- **Skeleton Loader:** Pulsing rectangles mimicking content structure.
- **Empty State:** Centered icon, title, description, and primary call-to-action button.
- **Conflict Resolution Dialog:** Dedicated modal for resolving multi-expert disagreements.
- **Session Timeout/Lock Screen:** Enterprise security state preserving canvas state.
