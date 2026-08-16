# CONFIGURATION GUIDE
**URJAFLUX AI OS — Version BUILD-026I (RC-1)**

---

## 1. Environment Settings
Configuration settings are managed through environment declarations and runtime feature flags.

```env
# Port Configuration (Platform Ingress Hardcoded)
PORT=3000

# Node Environment
NODE_ENV=production

# Feature Toggles
ENABLE_DIGITAL_TWIN_3D=true
ENABLE_EXPLAINABILITY_TRACE=true
ENABLE_HYBRID_KNOWLEDGE_SEARCH=true
```

## 2. Spatial Reference Defaults
- **Default Master Chakra Divisions**: 16 sectors (configurable to 8 or 32).
- **Default North Alignment Angle**: 0.0° (modifiable per spatial reference matrix).
- **Coordinate Precision**: 4 decimal places (mm precision).
