# KNOWLEDGE-GRAPH-UI
## URJAFLUX AI OS

### Overview
The Knowledge Graph UI visualizes the complex web of relationships extracted from documents and spatial data. It requires interactive, physics-based rendering.

### Anatomy of the Graph Viewer

#### 1. The Viewport (Graph Canvas)
- Force-directed or hierarchical layout rendering.
- Nodes represent Entities (e.g., "Kitchen", "North-East", "Fire Element").
- Edges represent Relationships (e.g., "LOCATED_IN", "CONFLICTS_WITH").
- Visual styling based on Ontology Type (e.g., Spatial nodes are blue, Abstract concepts are purple).

#### 2. Floating Search & Filter Bar
- **Semantic Search:** "Show me everything related to water placement".
- **Ontology Filters:** Checkboxes to hide/show specific node types to reduce visual noise.
- **Depth Slider:** Adjust how many hops/degrees of separation are visible from the selected node.

#### 3. Right Sidebar: Node Inspector
When a node is clicked:
- **Details:** Node ID, Label, Confidence Score.
- **Properties:** Key-value pairs of metadata.
- **Connections:** List of inbound and outbound relationships.
- **Evidence:** Crucial section linking back to the exact PDF page/text or spatial coordinate that generated this node.

#### 4. Interactive Features
- **Focus Mode:** Clicking a node dims all unconnected nodes.
- **Expand/Collapse:** Double-clicking a node fetches and displays its children.
- **Export:** Export current view to PNG for reports.
