# COMPONENT-LIBRARY
## URJAFLUX AI OS

### Core UI Components

#### 1. Data Display
- **Enterprise Data Grid:** Virtualized rows, sortable/resizable columns, sticky headers, multi-select checkboxes, contextual row actions, inline editing.
- **Property Inspector:** Key-value pair list with expandable sections, supporting nested objects and raw JSON viewing.
- **Status Badge:** Pill-shaped indicator with dot. (e.g., `[🟢 Active]`, `[🟡 Processing]`, `[🔴 Failed]`).
- **Metric Card:** Title, large value, sparkline chart, delta indicator (e.g., `↑ 12%`).
- **Tree View:** Collapsible hierarchy for Ontologies and Folder structures, supporting drag-and-drop.

#### 2. Navigation & Layout
- **Split Pane:** Resizable horizontal or vertical divider between two panels.
- **Tabs:** Underlined style for contextual switching within a view.
- **Breadcrumbs:** Slate-400 text with `/` separators, last item Slate-50.

#### 3. Inputs & Actions
- **Primary Button:** Solid Sky-500 background, white text.
- **Secondary Button:** Transparent background, border Slate-700, hover background Slate-800.
- **Ghost Button:** No border, hover background Slate-800 (used for icon buttons).
- **Search Bar:** Input with leading magnifying glass, trailing `⌘K` keyboard shortcut hint.
- **Dropdown Menu:** Floating popover with list of actionable items.

#### 4. Complex / Domain-Specific
- **Canvas Viewport:** Hardware-accelerated container with zoom/pan controls, minimap, and overlay toolbars.
- **Node Graph:** Interactive force-directed graph component using D3/WebGL.
- **Log Viewer:** Monospaced, auto-scrolling terminal-like view for Decision Traces.
- **Timeline:** Vertical connected list of events (used for Audit Trails and Job Progress).

#### 5. Feedback
- **Toast Notification:** Slide-in from bottom right, auto-dismiss.
- **Skeleton Loader:** Pulsing Slate-800 rectangles mimicking content structure.
- **Empty State:** Centered icon, title, description, and primary call-to-action button.
