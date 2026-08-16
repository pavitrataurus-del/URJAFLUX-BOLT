# URJAFLUX AI OS — DOMAIN-012 Architectural Symbol Recognition
## Symbol Detection and Spatial Mapping

### 1. Symbol Support Classes
The symbol detection models recognize critical objects from scanned drawing files:

* **DOOR / WINDOW:** Openings and frame limits.
* **WALL_SEGMENT:** Outer boundary and interior dividers.
* **STAIRCASE:** Step direction and bounds.
* **COLUMN / BEAM:** Structural support pillars and loads.
* **FURNITURE:** Beds, kitchen counters, toilet fixtures.
* **NORTH_ARROW:** Primary magnetic compass vector.

---

### 2. Detection Coordinates
Each symbol is output with:
* **Normalized Bounding Box:** Responsive coordinate box mapping the boundary.
* **Optional Polygon Mask:** Multi-point boundary points for precise outline approximation.
* **Confidence Weights:** Class and coordinate boundary confidence.

---

### 3. Non-Duplication Principle
Symbol detection results *never* generate real geometry objects in DOMAIN-012. They are merely detection proposals. Geometry object generation only happens inside DOMAIN-011 upon successful human review and approval.
