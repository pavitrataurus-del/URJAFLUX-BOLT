# RBAC & ABAC Policy Configuration (RBAC-ABAC.md)

## 1. Role-Based Access (RBAC) Permissions
Permissions are assigned at atomic domain levels across URJAFLUX AI OS:
- `reasoning:read` / `reasoning:write` / `reasoning:execute`
- `monitoring:read` / `monitoring:write`
- `spatial:read` / `spatial:write`
- `workflow:read` / `workflow:execute`
- `integration:read` / `integration:admin`
- `security:read` / `security:write` / `security:admin`

## 2. Attribute-Based Access (ABAC) Attributes
- **User Attributes:** `user.roles`, `user.clearance` (Level-1 to Level-5), `user.department`.
- **Resource Attributes:** `resource.pattern` (e.g., `domain:011:floorplan/*`), `resource.classification`.
- **Environment Attributes:** `env.timeOfDay` (enforces 06:00 to 22:00 working hour edits), `env.ipAddress` (requires trusted corporate networks for high-clearance actions).
