# MASTER-WORKSPACE-SPECIFICATION-v1
## URJAFLUX AI OS - UI ARCHITECTURE FREEZE v1.0

### 1. The Unified Workspace Concept
The Workspace replaces page-centric navigation. It is the core environment where Engineers and Consultants interact with the Digital Twin, Knowledge Graph, and AI Experts simultaneously.

### 2. Dockable Panel Architecture
Powered by a robust Docking Manager, the workspace consists of:
- **Central Canvas (Main Viewport):** Anchored in the center. Renders the 2D Spatial Intelligence or Knowledge Graph via WebGL.
- **Left Dock Area (Hierarchy & Data):**
  - **Scene Graph / Layer Manager:** Toggle visibility, lock vectors, select objects.
  - **Ontology Explorer:** Tree view of the knowledge concepts.
- **Right Dock Area (Inspection & Logic):**
  - **Property Inspector:** Displays selected object metadata, coordinates, and associated knowledge.
  - **AI Reasoning Console:** Real-time stream of expert engine logs.
  - **Review Center:** Split-view for accepting/rejecting AI recommendations.
- **Bottom Dock Area (Time & Status):**
  - **Timeline / Audit Log:** Visual history of changes and decisions.

### 3. Workspace Memory & Presets
- **Saved Layouts:** Users can save their panel arrangements (e.g., "Consultant View" vs. "Reviewer View").
- **Workspace Memory:** Tearing off the Property Inspector to a second monitor persists across reloads via local storage sync.

### 4. Central Canvas (Digital Twin Viewer)
- **Viewport:** Infinite panning, smooth zooming, hardware-accelerated.
- **Floating Contextual Toolbar:** Appears near the cursor for drawing (Wall, Zone, Point) and interaction (Select, Measure, Snap).
- **Global View Controls:** Reset Zoom, Fit to Screen, Toggle 2D/3D (Placeholder) located at the top.
- **Minimap:** Bottom corner overlay for orientation.

### 5. Knowledge Graph View
- When toggled, the Central Canvas transitions from spatial layout to a WebGL force-directed graph.
- **Floating Search & Filter:** Semantic search, ontology filters, depth slider to manage visual noise.
- **Node Inspector:** Selecting a node populates the Right Dock Property Inspector with connections and evidence links.

### 6. AI Reasoning Console (Docked)
- **Execution Stream:** Virtualized terminal-style log. Includes a "Semantic Summary" toggle to translate raw logs into human-readable events.
- **Decision Trace Detail:** Clicking an event opens the immutable trace (Trigger Rule, Input Context, Output) in the Property Inspector panel.
