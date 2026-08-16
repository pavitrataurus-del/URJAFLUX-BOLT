# DESIGN-SYSTEM
## URJAFLUX AI OS

### 1. Typography
- **Primary Font:** `Inter` (UI elements, data grids, dense information).
- **Secondary Font:** `JetBrains Mono` (Code snippets, IDs, execution traces, raw data).
- **Hierarchy:**
  - Display: 30px, SemiBold, Tight Tracking.
  - H1 (Page Title): 24px, SemiBold.
  - H2 (Section): 18px, Medium.
  - Body: 14px, Regular.
  - Small / Metadata: 12px, Medium.
  - Tiny / Badges: 10px, Bold, Uppercase.

### 2. Color Palette (Dark Theme Default)
- **Backgrounds:**
  - Base: `#020617` (Slate 950 - App Background)
  - Surface: `#0F172A` (Slate 900 - Cards, Panels)
  - Elevated: `#1E293B` (Slate 800 - Modals, Popovers)
- **Text:**
  - Primary: `#F8FAFC` (Slate 50)
  - Secondary: `#94A3B8` (Slate 400)
  - Muted: `#475569` (Slate 600)
- **Accents (Semantic):**
  - Primary / Brand: `#0EA5E9` (Sky 500)
  - Success / Done: `#10B981` (Emerald 500)
  - Warning / Alert: `#F59E0B` (Amber 500)
  - Danger / Error: `#EF4444` (Red 500)
  - AI / Magic: `#8B5CF6` (Violet 500)
- **Borders:** `#334155` (Slate 700)

### 3. Spacing & Grid
- **Base Unit:** 4px
- **Standard Padding:** 16px (p-4)
- **Container Padding:** 24px (p-6)
- **Grid:** 12-column fluid grid, max-width 1920px.

### 4. Borders & Radius
- **Style:** 1px solid borders for definition. No soft drop-shadows in dark mode.
- **Radius:**
  - Buttons / Inputs: 6px (rounded-md)
  - Cards / Panels: 12px (rounded-xl)
  - Badges: 9999px (rounded-full)

### 5. Animation
- **Transitions:** Fast and snappy (150ms ease-in-out) for hovers and state changes.
- **Layout Shifts:** Framer Motion spring physics for panel resizing and lists (stiffness 300, damping 30).

### 6. Accessibility
- Minimum contrast ratio of 4.5:1 for all text.
- Visible focus rings (`ring-2 ring-sky-500 ring-offset-2 ring-offset-slate-950`) on all interactive elements.
