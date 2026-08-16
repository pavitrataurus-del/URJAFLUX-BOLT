# DIGITAL-TWIN-UI
## URJAFLUX AI OS

### Overview
The Digital Twin UI is the most complex graphical component. It requires a high-performance rendering canvas and sophisticated surrounding toolbars, akin to modern CAD or design software (e.g., AutoCAD, Figma).

### Anatomy of the Twin Viewer

#### 1. The Viewport (Canvas)
- Infinite panning and smooth zooming.
- Grid overlay (toggled via hotkey).
- Rendering of vectors (walls, boundaries), polygons (zones, rooms), and nodes (objects, entrances).
- Selection bounding boxes with resize/rotate handles.

#### 2. Left Sidebar: Hierarchy & Layers
- **Scene Graph:** Tree view of the building structure (Site -> Building -> Floor -> Room -> Object).
- **Layer Manager:** Toggles for visibility and lock status.
  - Base Plan (Image/PDF)
  - Structural Geometry (Lines)
  - Vastu Zones (Colored Polygons)
  - AI Annotations (Text/Badges)

#### 3. Right Sidebar: Property Inspector
Dynamically updates based on selection.
- **If a Room is selected:** Shows Area, Perimeter, Assigned Zone, and contained objects.
- **If a Vastu Zone is selected:** Shows geometric coordinates, associated elements (Fire, Water), and active defects.
- **If nothing is selected:** Shows global Twin metadata and coordinate system settings.

#### 4. Top Toolbar: Tools & Modes
- **Interaction Modes:** [Select (V)] [Pan (Space)] [Measure (M)]
- **Drawing Tools:** [Wall] [Zone] [Point]
- **View Controls:** [Reset Zoom] [Fit to Screen] [Toggle 3D/2D]

#### 5. Bottom Overlay: Minimap & Status
- Small minimap in the corner for orientation when zoomed in.
- Cursor coordinates (X, Y) relative to real-world origin.
