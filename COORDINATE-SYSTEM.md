# Coordinate System & North Alignment Engine (`COORDINATE-SYSTEM.md`)

## 1. World Coordinate System (WCS)
- **Cartesian Space**: 2D/3D orthogonal grid ($X, Y, Z$) with origin $(0,0,0)$ located at the southwest corner of the building footprint.
- **Unit Conversions**: Bi-directional conversion utilities supporting `mm`, `cm`, `m`, `ft`, and `inch`.
- **Architectural Grid & Snapping**: Configurable major (e.g. 5.0m) and minor (e.g. 1.0m) grid spacing with toggleable snap-to-grid controls.

## 2. North Orientation & Direction Calibration
- **True North Angle ($\theta_N$)**: Clockwise rotation angle in degrees ($0^{\circ}$ to $359^{\circ}$) relative to top vertical axis ($+Y$).
- **Magnetic Declination ($\delta_M$)**: Local magnetic variance offset.
- **8-Zone Cardinal Mapping**: Point evaluation relative to plan center and North orientation angle:
  - **North (N)**: $337.5^{\circ} - 22.5^{\circ}$
  - **Northeast (NE)**: $22.5^{\circ} - 67.5^{\circ}$
  - **East (E)**: $67.5^{\circ} - 112.5^{\circ}$
  - **Southeast (SE)**: $112.5^{\circ} - 157.5^{\circ}$
  - **South (S)**: $157.5^{\circ} - 202.5^{\circ}$
  - **Southwest (SW)**: $202.5^{\circ} - 247.5^{\circ}$
  - **West (W)**: $247.5^{\circ} - 292.5^{\circ}$
  - **Northwest (NW)**: $292.5^{\circ} - 337.5^{\circ}$
  - **Brahmasthan**: Central 3x3 region out of a 9x9 grid bounding box.
