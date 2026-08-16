# Change Detection Specification — DOMAIN-008

## Overview
`ChangeDetectionEngine.ts` compares property snapshots (`IPropertySnapshot`) deterministically to detect unauthorized or physical alterations on site.

## Detected Deviation Categories
1. **Added Objects**: Identifies newly introduced furniture or electrical equipment in sensitive zone boundaries.
2. **Removed Objects**: Detects missing or displaced corrective remedies.
3. **Relocated Objects**: Tracks coordinate shifts `(X, Y)` for heavy furnishings or water features.
4. **Direction Alignment Changes**: Flags compass angle drift or structural axis modifications.
5. **Layout Modifications**: Tracks room partition or wall updates in CAD floor plan versions.
6. **Sensor Threshold Variances**: Detects magnetic field (`µT`), acoustic frequency (`Hz`), or light lux shifts exceeding baseline thresholds.
