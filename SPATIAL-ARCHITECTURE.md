# DOMAIN-011: Enterprise CAD, Floor Plan Intelligence & Spatial Analysis Engine
## System Architecture Specification

### 1. Executive Summary
DOMAIN-011 is the foundational geometry and spatial intelligence provider of the **URJAFLUX AI OS**. It is strictly responsible for understanding building geometry, floor plans, spatial relationships, directional alignment, measurements, and structural objects.

### 2. Architectural Boundaries & Non-Negotiable Directives
- **Zero Business Logic & Zero Vastu Reasoning:** DOMAIN-011 operates purely as a geometric engine. It NEVER evaluates Vastu rules, energy scores, Lal Kitab remedies, or astrological configurations.
- **Single Source of Spatial Truth:** Exposes verified geometric entities (Rooms, Walls, Openings, Columns, Beams, Boundaries, Orientation, Centroids) to downstream services (`DOMAIN-006` through `DOMAIN-010`).
- **No Reverse Dependencies:** Downstream domains consume DOMAIN-011 services via strict interface contracts (`SpatialIntegrationService`). DOMAIN-011 does not import or depend on any higher-level reasoning or reporting engines.

### 3. Layered Geometry Architecture
1. **Multi-Format Ingestion Layer (`CadImportEngine`)**: Standardizes DXF, DWG, SVG, PDF, PNG/JPG, and IFC drawings into normalized 2D/3D geometry mesh models.
2. **Spatial Parsing Layer (`FloorPlanParserEngine`)**: Detects outer perimeter boundaries, wall intersections, and closed polygon candidates using pure computational geometry algorithms.
3. **Coordinate & Scale Layer (`CoordinateSystemEngine`)**: Transforms Cartesian space, handles origin alignment, unit conversion (mm, cm, m, ft, inch), grid snapping, and screen pixel-to-meter scaling.
4. **North Orientation Layer (`NorthOrientationEngine`)**: Manages true North angles, magnetic declination, grid rotation, and calculates cardinal 8-zone orientations for all spatial entities.
5. **Measurement & Calculation Layer (`MeasurementEngine`)**: Computes exact Euclidean distances, polygon areas (Shoelace formula), perimeters, room dimensions, and centroids.
6. **Spatial Object Registry & Index (`SpatialObjectRegistry`)**: Indexes entities using a QuadTree spatial structure and assigns permanent spatial IDs (`ROOM-xxx`, `WALL-xxx`, `DOOR-xxx`, `WIN-xxx`, `COL-xxx`, `STAIR-xxx`).
7. **Topology & Relationship Layer (`SpatialRelationshipEngine`)**: Generates pure graph topology networks (nodes, edges, adjacency, door connectivity, containment).
8. **Geometry Validation Layer (`GeometryValidationEngine`)**: Audits floor plans for unclosed room polygons, dangling wall endpoints, zero-area objects, and broken scale definitions.
9. **Spatial Workspace UI (`SpatialCadWorkspace`)**: Provides an interactive CAD viewer with layer toggles, property inspector, spatial entity tree, measurement tool, and role-based permissions.
10. **Downstream Integration Layer (`SpatialIntegrationService`)**: Exposes sanitized geometric models to Reasoning, Execution, Digital Twin, Consultation, and Reporting domains.
