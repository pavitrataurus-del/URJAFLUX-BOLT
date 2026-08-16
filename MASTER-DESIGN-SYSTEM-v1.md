# MASTER-DESIGN-SYSTEM-v1
## URJAFLUX AI OS - UI ARCHITECTURE FREEZE v1.0

### 1. Themes
- **Dark Theme (Default):** Tailored for CAD work and low-light environments.
- **Light Theme:** Mandatory for government users, PDF report generation, and daylight field consulting.

### 2. Typography
- **Primary Font:** `Inter` (UI elements, dense information).
- **Secondary Font:** `JetBrains Mono` (Code snippets, IDs, execution traces, raw data).
- **Enforcement:** Explicitly enforce `font-variant-numeric: tabular-nums;` on all metric cards, data grids, and reasoning logs.
- **Hierarchy:**
  - Display: 30px, SemiBold, Tight Tracking.
  - H1 (Page Title): 24px, SemiBold.
  - H2 (Section): 18px, Medium.
  - Body: 14px, Regular.
  - Small / Metadata: 12px, Medium.
  - Tiny / Badges: 10px, Bold, Uppercase.

### 3. Color Palette
- **Backgrounds (Dark/Light):**
  - Base: Slate 950 / Slate 50
  - Surface: Slate 900 / White
  - Elevated: Slate 800 / Slate 100
- **Text (Dark/Light):**
  - Primary: Slate 50 / Slate 900
  - Secondary: Slate 400 / Slate 500
  - Muted: Slate 600 / Slate 400
- **Accents (Semantic) [WCAG AA Compliant Variants]:**
  - Primary / Brand: Sky 500
  - Success / Done: Emerald 500
  - Warning / Alert: Amber 500
  - Danger / Error: Red 500
  - AI / Magic: Violet 500
- **Borders:** Slate 700 / Slate 200

### 4. Spacing & Density
- **Base Unit:** 4px
- **Standard Padding:** 16px (p-4)
- **Compact Mode:** A toggle for expert users that reduces standard padding to 8px and body font size to 13px to maximize data density.
- **Grid:** 12-column fluid grid, max-width 1920px.

### 5. Borders & Radius
- **Style:** 1px solid borders for definition. No soft drop-shadows in dark mode.
- **Radius (Utilitarian Architectural Feel):**
  - Buttons / Inputs: 6px (rounded-md)
  - Cards / Panels: 6px or 8px (rounded-md or rounded-lg)
  - Badges: 9999px (rounded-full)

### 6. Animation
- **Transitions:** Fast and snappy (150ms ease-in-out) for hovers and state changes.
- **Layout Shifts:** Disabled on data-heavy views (Data Grids, Terminal streams) to preserve CPU/GPU cycles. Restricted to modals, popovers, and navigation transitions. Respects `prefers-reduced-motion`.
