# Spatial Object Registry & Spatial Indexing Specification (`SPATIAL-OBJECT-REGISTRY.md`)

## 1. Permanent Spatial Object Identification
Every physical entity parsed or generated within DOMAIN-011 receives a unique, immutable permanent spatial ID:
- **Rooms**: `ROOM-NE`, `ROOM-NW`, `ROOM-SE`, `ROOM-SW`, etc.
- **Walls**: `WALL-001` (North External), `WALL-002` (East External), etc.
- **Doors**: `DOOR-001` (Main Entry), `DOOR-002`, etc.
- **Windows**: `WIN-001`, `WIN-002`, etc.
- **Structural**: `COL-001` (Column), `BEAM-001` (Beam), `STAIR-001` (Staircase).

## 2. QuadTree Spatial Indexing
To support real-time sub-millisecond bounding box queries across complex multi-story structures, the `SpatialObjectRegistry` uses a 2D QuadTree index (`QuadTreeNode`):
- **Node Capacity**: 4 spatial objects per quadrant before subdivision.
- **Recursive Quadrants**: North-West (`NW`), North-East (`NE`), South-West (`SW`), South-East (`SE`).
- **Range Queries**: $O(\log N)$ spatial lookup given bounding box $\{minX, minY, maxX, maxY\}$.
