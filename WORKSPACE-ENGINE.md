# Team Workspace Engine (WORKSPACE-ENGINE.md)

## 1. Description
The Team Workspace Engine coordinates multiple active projects, client directories, and isolated team structures. It manages administrative settings and user roles within workspaces.

## 2. Technical Contracts
- **Workspace Roles:** `ADMIN` (full control), `PROJECT_MANAGER` (runs teams and workflows), `ENGINEER` (reads plans and posts comments), `END_USER` (reads final reports and comments).
- **Settings Scopes:** Toggles for external member permissions, mandatory upload verification, and default roles.
- **Isolation Boundaries:** Workspace members can only read or comment on resources within their assigned Workspace ID, preventing leakage of sensitive corporate plans.
