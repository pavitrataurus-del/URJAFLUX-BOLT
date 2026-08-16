# CAD Import & Ingestion Engine Architecture (`CAD-IMPORT-ENGINE.md`)

## 1. Multi-Format Ingestion Capabilities
The `CadImportEngine` normalizes incoming architectural file formats into the standard `FloorPlan` entity model:
- **DXF / DWG (AutoCAD)**: Vector entity extraction (LINE, LWPOLYLINE, INSERT, TEXT, MTEXT, CIRCLE, ARC).
- **SVG (Scalable Vector Graphics)**: XML polyline and path node parsing into vector boundaries.
- **IFC (Industry Foundation Classes / BIM)**: 3D BIM structural element extraction (IfcWall, IfcSpace, IfcDoor, IfcWindow, IfcColumn, IfcBeam, IfcStair).
- **PDF Vector / Raster Drawings**: Vector contour extraction and scale calibration.
- **PNG / JPG Raster Images**: Image boundary overlay with manual and auto scale calibration (pixels per meter).

## 2. Ingestion Workflow
1. **File Upload & Validation**: Validates file integrity, extension, and user role authorization.
2. **Layer Extraction**: Categorizes drawing primitives into architectural layers (`WALLS`, `ROOMS`, `DOORS`, `WINDOWS`, `STAIRS`, `GRID`, `DIMENSIONS`).
3. **Scale Calibration**: Applies scale ratio (e.g., 1:100 where 100 px = 1.0 m) and sets primary measurement unit (`m`).
4. **Entity Normalization**: Populates normalized `FloorPlan` instance with permanent spatial IDs and metadata logs.
