# PLUGIN-COMPATIBILITY.md

This specification freezes the plugin extensibility compatibility matrix and the public contract of **PluginSDK Version 1.0**.

---

## 1. SDK Registration Contract & Version Control

All external extensions must load the public proxy singleton and strictly declare their version expectations in their `manifest.json`.

```typescript
export interface IPluginManifest {
  manifestVersion: "1.0";
  pluginId: string;
  name: string;
  version: string;
  publisher: string;
  permissions: string[];
  extensionPoints: {
    pointId: string;
    pointType: "DASHBOARD_WIDGET" | "WORKFLOW_STEP" | "CONSULTATION_TOOL" | "SPATIAL_TOOL" | "VISION_PIPELINE";
    config: Record<string, any>;
  }[];
}
```

---

## 2. Frozen Extension Point Layout

Each extension point has a locked mounting location and a designated data interface, preventing custom plugin registrations from affecting the stability of the core React UI.

```
                   ┌───────────────────────┐
                   │   PluginSDK Registry  │
                   └───────────┬───────────┘
                               │ (Dynamic Mount)
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
       ▼                       ▼                       ▼
[Dashboard Widget]     [CAD Overlay Layer]    [Workflow Task Activity]
Mounts inside core     Zoning calculations    Automated triggers in
Analytics Dashboard    in CAD canvas          orchestration queues
```

---

## 3. Dependency Compatibility & Resolution Rules
- **Cycle Prevention**: The Dependency Manager runs a Depth-First Search (DFS) check to identify and reject any installations containing circular references.
- **Version Bounds**: Version requirements are analyzed dynamically (e.g., `>=1.0.0 <2.0.0`) to avoid regressions.
- **Conflict Management**: Installs are blocked if two plugins request contradictory dependency packages.
