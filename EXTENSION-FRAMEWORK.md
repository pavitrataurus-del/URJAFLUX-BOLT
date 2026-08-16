# DOMAIN-019: Extension Framework Specification

The URJAFLUX extension point framework relies on declarative hooks specified in `manifest.json`.

## 1. Supported Extension Points
- **DASHBOARD_WIDGET**: Mounts panels inside DOMAIN-016 business dashboard.
- **WORKFLOW_STEP**: Inserts automated tasks into DOMAIN-013 execution pipelines.
- **CONSULTATION_TOOL**: Integrates with live audio or chat rooms in DOMAIN-009.
- **SPATIAL_TOOL**: Extends floor plan vector calculations in DOMAIN-011.
- **VISION_PIPELINE**: Passes video feeds into image segmentation filters in DOMAIN-012.

## 2. Configuration Example
When declaring an extension point, the plugin specifies the target configuration, which is loaded dynamically when the hook triggers:

```json
{
  "extensionPoints": [
    {
      "pointType": "SPATIAL_TOOL",
      "pointId": "ep-spatial-tool",
      "config": {
        "viewportMode": "AR_RENDERER",
        "defaultOpacity": 0.75
      }
    }
  ]
}
```
All extension points are managed and registered under `PluginRegistry`.
