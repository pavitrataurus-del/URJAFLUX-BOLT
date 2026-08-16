# URJAFLUX Design System Specification (v1.0)

## 1. Introduction
The URJAFLUX Design System provides a cohesive, scalable, and highly professional visual language for building the URJAFLUX workspace environment. It establishes the foundations for a complex, desktop-class application architecture comparable to tools like Figma, Linear, and Framer, ensuring pristine layout, typography, and interaction fidelity.

## 2. Color System
The color system emphasizes an accessible, high-contrast, and focused interface where the user's content (the canvas/workspace) takes center stage, and UI chrome remains subtle and unobtrusive.

### Neutrals (Chrome & Backgrounds)
- **Neutral 50:** `#F9FAFB` (Light mode background)
- **Neutral 100:** `#F3F4F6` (Hover states, light accents)
- **Neutral 200:** `#E5E7EB` (Subtle borders, dividers)
- **Neutral 300:** `#D1D5DB` (Disabled states)
- **Neutral 400:** `#9CA3AF` (Muted text, secondary icons)
- **Neutral 500:** `#6B7280` (Secondary text)
- **Neutral 600:** `#4B5563` (Primary icons)
- **Neutral 700:** `#374151` (Primary text)
- **Neutral 800:** `#1F2937` (Dark mode elevated background)
- **Neutral 900:** `#111827` (Dark mode base background, Light mode high-contrast text)
- **Neutral 950:** `#030712` (Deepest dark mode accents)

### Primary (Accents & Interactive)
- **Primary 500:** `#2563EB` (Primary brand, active states, buttons)
- **Primary 600:** `#1D4ED8` (Primary hover)
- **Primary 100:** `#DBEAFE` (Subtle selection backgrounds)

### Semantic Colors
- **Success:** `#10B981` (Green)
- **Warning:** `#F59E0B` (Amber)
- **Danger:** `#EF4444` (Red)
- **Info:** `#3B82F6` (Blue)

## 3. Typography
Typography is structured for maximum readability and density in a professional tool context.

- **Primary Font Family (UI Chrome):** Inter, sans-serif (or system fonts like SF Pro, Segoe UI)
- **Monospace Font (Code/Data):** JetBrains Mono or Fira Code, monospace

### Scale (Base 16px)
- **Heading 1:** 24px (1.5rem), Semi-Bold, Line Height 32px
- **Heading 2:** 20px (1.25rem), Medium, Line Height 28px
- **Heading 3:** 16px (1rem), Medium, Line Height 24px
- **Body Large:** 14px (0.875rem), Regular, Line Height 20px (Default for UI controls)
- **Body Small:** 12px (0.75rem), Regular, Line Height 16px (Dense UI areas, properties panels)
- **Caption:** 11px (0.6875rem), Medium, Uppercase, Tracking 0.05em (Section headers, badges)

## 4. Spacing Scale
A strict 4px grid system ensures predictable rhythm.

- **2px (0.125rem):** Micro-adjustments
- **4px (0.25rem):** Inside components (e.g., icon to text)
- **8px (0.5rem):** Between adjacent components
- **12px (0.75rem):** Standard component padding
- **16px (1rem):** Container padding, section spacing
- **24px (1.5rem):** Major section spacing
- **32px (2rem):** Layout panel spacing

## 5. Elevation & Shadows
Elevation relies on subtle shadows and border contrast, avoiding heavy "glassmorphism" in favor of crisp, professional layering.

- **Level 0 (Flat):** No shadow. Canvas surface.
- **Level 1 (Subtle):** `0 1px 2px 0 rgba(0, 0, 0, 0.05)` (Buttons, cards)
- **Level 2 (Hover/Dropdown):** `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)` (Menus, tooltips)
- **Level 3 (Modal/Floating):** `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)` (Modals, context menus, floating panels)

## 6. Border Radius
Corners should be sharp enough to convey a precision tool, but rounded enough to feel modern.

- **Small (2px):** Checkboxes, tags, small inputs.
- **Medium (4px):** Standard buttons, text inputs, dropdown menus.
- **Large (8px):** Modals, floating panels, major cards.
- **Pill (9999px):** Badges, specific toggle switches.

## 7. Iconography
- **Library:** Lucide React
- **Size:** 16px (default UI), 20px (toolbar actions)
- **Stroke Width:** 1.5px (clean, light appearance) or 2px (standard)

## 8. Interaction States
- **Default:** Standard appearance.
- **Hover:** Background shift (e.g., Neutral 100 in Light mode) or subtle opacity increase.
- **Active/Pressed:** Background shift (e.g., Neutral 200 in Light mode) + scale down (0.97).
- **Focus:** 2px outline in Primary 500 with a 2px offset (e.g., `ring-2 ring-offset-2 ring-blue-500`).
- **Disabled:** Opacity 50%, unclickable (`cursor-not-allowed`), grayscale.
- **Selected/Active (Toggle):** Background in Primary 100, text in Primary 600.

## 9. Motion Principles & Animation Timings
Animations should be functional, not decorative. They must feel instant, crisp, and fluid.

- **Duration - Fast (75ms - 100ms):** Hover states, micro-interactions, color transitions.
- **Duration - Standard (150ms - 200ms):** Dropdown opening, panel sliding, modal appearance.
- **Duration - Slow (300ms):** Major layout shifts (avoid if possible).
- **Easing - Standard:** `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind `ease-in-out`).
- **Easing - Snappy (Spring-like):** `cubic-bezier(0.175, 0.885, 0.32, 1.275)` (For scale bounces on click).

## 10. Light/Dark Themes
URJAFLUX supports a flawless system-level Light and Dark mode.
- **Light Mode:** Canvas is white (`#FFFFFF`) or very light gray (`#F9FAFB`). Toolbars are slightly separated by 1px Neutral 200 borders.
- **Dark Mode:** Canvas is very dark gray (`#111827`). Toolbars are `#1F2937` with 1px Neutral 700 borders. Shadows are darker and more pronounced to create depth without relying purely on brightness.

## 11. Accessibility Guidelines
- **Contrast:** All text must meet WCAG AA (4.5:1 for normal text, 3:1 for large text).
- **Keyboard Navigation:** Full support for `Tab` indexing, arrow keys in lists/canvases, and `Enter/Space` to activate. Visible focus rings are mandatory.
- **ARIA:** Proper `aria-labels` for icon-only buttons, `aria-expanded` for dropdowns, and `role` definitions for custom components.

## 12. Workspace Layout Proposal
The application layout follows a classic, high-density professional tool structure (e.g., Figma/Linear).

### 12.1 Layout Architecture
The viewport is divided into distinct, non-overlapping regions (App Shell):
- **Top Bar (Toolbar):** 48px height. Contains global controls (Menu, Project Name, View Options, Export, Profile).
- **Left Sidebar (Explorer/Outliner):** 240px width (collapsible). Contains the object hierarchy, layers, pages, and project assets.
- **Center Area (Canvas/Viewport):** The infinite canvas region where the Master Chakra engine renders the spatial environment. Takes up all remaining space.
- **Right Sidebar (Properties Inspector):** 280px width (collapsible). Context-sensitive panel that displays properties and settings for the currently selected object(s).
- **Bottom Bar (Status/Breadcrumbs) - Optional:** 24px height. For zoom level, grid toggle, and quick status indicators.

### 12.2 Structural Implementation
- Use CSS Grid or Flexbox for the root `100vh` layout to ensure exact panel sizing.
- The Canvas area must have `overflow: hidden` and absolute positioning for its WebGL/Canvas2D surface.
- Sidebars use solid backgrounds and 1px borders (e.g., `border-r`, `border-l`) to separate from the canvas, not floating panels (unless in a specific "zen" mode).

### 12.3 Responsive Behavior
- **Desktop (1024px+):** Full multi-panel layout as described above.
- **Tablet (768px - 1023px):** Properties inspector becomes an overlay drawer or collapsible overlay. Left sidebar may auto-collapse.
- **Mobile (< 768px):** Strict workspace tools are generally not meant for mobile phones, but a read-only or highly simplified responsive view should exist. Toolbars collapse into hamburger menus; canvas becomes touch-pannable.

---
*End of Specification. Implementation of UI based on this document will proceed in the next phase.*
