# MASTER-ACCESSIBILITY-STANDARD-v1
## URJAFLUX AI OS - UI ARCHITECTURE FREEZE v1.0

### 1. Keyboard Navigation
- **Command Palette (Cmd+K):** The primary accessible navigation method, bypassing complex menus.
- **Workspace Traversal:** Explicit tab-traversal orders defined for the Workspace panels.
- **Canvas Interaction:** The Canvas must support arrow-key panning, and `Tab` should cycle through selectable spatial objects.

### 2. Color & Contrast
- **WCAG AA Compliance:** Semantic accents (e.g., Violet 500) must be checked against background surfaces (Slate 900 or White) to ensure a minimum 4.5:1 contrast ratio. Text on colored badges uses pure white or black based on contrast math.
- **Shape + Color:** Status indicators never rely solely on color. (e.g., Triangle icon for warning + Amber color, Circle for success + Emerald color).
- **Light Theme Availability:** Mandatory for high-contrast needs and daylight environments.

### 3. Screen Reader Support (ARIA)
- **Live Regions:** Terminal-style streams use `aria-live="polite"`, with user controls to pause auto-scrolling to prevent screen reader overload.
- **Hidden Elements:** Use `aria-hidden="true"` on decorative icons and the visual-only Canvas minimap.

### 4. Reduced Motion
- **Media Query Compliance:** The application must respect `prefers-reduced-motion`. If true, all Framer Motion spring physics are disabled; panels snap instantly without transition animations.
