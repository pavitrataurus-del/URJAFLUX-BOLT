# Spatial CAD Workspace UI Specifications (`SPATIAL-WORKSPACE.md`)

## 1. Interactive CAD Canvas (`CadCanvasViewer.tsx`)
- **SVG Vector Rendering**: Renders architectural layers (`WALLS`, `ROOMS`, `DOORS`, `WINDOWS`, `STAIRS`, `GRID`) with high performance.
- **Pan & Zoom Controls**: Mouse drag panning and zoom scaling ($40\%$ to $300\%$).
- **Interactive North Compass**: Visual compass dial that rotates dynamically based on calibrated true North angle.
- **Point-to-Point Measurement**: Click-to-measure Euclidean distances between any two coordinates in real time.

## 2. Workspace Sub-Components
- **Layer Manager (`LayerManagerPanel.tsx`)**: Toggles layer visibility (`Eye`), lock state (`Lock`), and custom layer color accents.
- **Property Inspector (`PropertyInspectorPanel.tsx`)**: Inspects entity ID, room area, wall thickness, centroid, cardinal direction, owner, and audit trail.
- **Spatial Object Tree (`SpatialObjectTree.tsx`)**: Hierarchical tree explorer categorizing rooms, walls, doors, windows, and structural components.
- **CAD Import Modal (`CadImportModal.tsx`)**: Modal dialog for ingesting DXF, DWG, SVG, PDF, PNG/JPG, and IFC drawings.
- **Geometry Validator Modal (`GeometryValidatorModal.tsx`)**: Diagnostic modal detailing geometry check results and wall connection warnings.
- **Registry & Topology Explorer (`SpatialRegistryExplorer.tsx`)**: Searchable table of permanent spatial IDs and pure topological network graph.
