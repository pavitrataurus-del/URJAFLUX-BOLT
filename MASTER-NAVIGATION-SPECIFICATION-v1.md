# MASTER-NAVIGATION-SPECIFICATION-v1
## URJAFLUX AI OS - UI ARCHITECTURE FREEZE v1.0

### 1. Global Navigation (App Level)
Located in the collapsible Left Sidebar (accessible outside the Workspace):
- **⌂ Global Dashboard:** Aggregated metrics, system health, recent cross-project activities.
- **📁 Projects:** Enterprise Data Grid of all projects.
- **🏢 Organization Settings:** Tenant configuration (Admin).
- **⚙️ Administration:** Users & Roles, System Health, Logs, Expert Registry (Super Admin).

### 2. Project Navigation (Inside a Project)
When inside a project, the sidebar switches to Project Context:
- **Overview:** Project dashboard and metrics.
- **Knowledge Base:** Ingestion Center (unified upload and processing monitor), Document Library.
- **Workspace:** The unified spatial/semantic interface (Digital Twin + Graph + Reasoning).
- **Review & Reports:** Bulk Triage view, Report Builder, Generated Reports.
- **Project Settings:** Permissions, specific expert configurations.

### 3. Utility Navigation (Top Header)
Always visible globally:
- **Tenant Switcher:** Clearly displays active Organization with a fast-switcher dropdown.
- **Interactive Breadcrumbs:** `Projects / [Alpha Tower v] / Workspace`. The dropdown allows jumping to other projects without returning to the main list.
- **Command Palette Trigger (Cmd+K):** Omni-search for navigating to screens, running specific experts, or finding global items.
- **Global Jobs Queue:** Spinner/Progress icon opening a popover of background tasks.
- **Notifications:** Bell icon with unread badge.
- **User Profile:** Avatar, Theme Toggle (Light/Dark/Compact), Logout.

### 4. Command Palette (Cmd+K)
The primary method for power users to navigate and act:
- "Go to Project Beta"
- "Search all structural defects"
- "Run Vastu Expert on Floor 2"
- "Export PDF Report"
