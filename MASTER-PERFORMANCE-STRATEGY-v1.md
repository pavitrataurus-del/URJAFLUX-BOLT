# MASTER-PERFORMANCE-STRATEGY-v1
## URJAFLUX AI OS - UI ARCHITECTURE FREEZE v1.0

### 1. Canvas & Graphics Rendering (Strict Requirement)
- **WebGL Mandate:** The Digital Twin (2D/3D) and Knowledge Graph canvases MUST use WebGL (e.g., PixiJS, Three.js, Deck.gl). Standard SVG or HTML Canvas rendering for spatial vectors is strictly prohibited to guarantee 60fps zooming and panning.
- **DOM Isolation:** Surrounding UI (toolbars, inspectors) remains React/DOM, communicating with the WebGL context via events.

### 2. Multi-Threading & Offloading
- **Web Workers:** Complex layout calculations (like force-directed physics for the Knowledge Graph) and client-side geometry processing MUST be offloaded to Web Workers. The main thread must remain free for UI interactions.

### 3. Data Grids & Lists
- **Virtualization:** All lists exceeding 50 items (Enterprise Data Grids, AI Reasoning Terminal Streams) MUST use virtualization (windowing).
- **Throttled Reactivity:** The AI Reasoning Console receives high-frequency streaming events. Updates must be batched/throttled (e.g., every 100ms) or managed outside of standard React state reconciliation to prevent UI freezing.

### 4. Background Processing & Caching
- **Server-Side State:** The frontend relies heavily on the backend for job state. Closing the tab does not interrupt ingestion or generation.
- **Incremental Rendering & Pagination:** Large documents in the Knowledge Library use cursor-based pagination. Large floor plans load low-resolution bounding boxes first, incrementally rendering details based on camera zoom level (LOD - Level of Detail).
