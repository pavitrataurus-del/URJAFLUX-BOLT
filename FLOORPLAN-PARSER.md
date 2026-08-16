# Floor Plan Parsing & Boundary Detection Engine (`FLOORPLAN-PARSER.md`)

## 1. Computational Geometry Parsing
The `FloorPlanParserEngine` performs algorithmic boundary extraction and wall network parsing:
- **Outer Perimeter Detection**: Finds the convex hull and outer closed boundary polygon encompassing the entire structure.
- **Wall Network Intersection Graph**: Extracts all wall start/end coordinates and identifies vertex junctions and T-intersections.
- **Closed Polygon Room Candidates**: Cycle-detection on planar graph edges to identify closed room loops.
- **Shoelace Polygon Area Formula**:
  $$\text{Area} = \frac{1}{2} \left| \sum_{i=1}^{n} (x_i y_{i+1} - x_{i+1} y_i) \right|$$
- **Geometric Centroid Calculation**:
  $$C_x = \frac{1}{n} \sum_{i=1}^{n} x_i, \quad C_y = \frac{1}{n} \sum_{i=1}^{n} y_i$$
