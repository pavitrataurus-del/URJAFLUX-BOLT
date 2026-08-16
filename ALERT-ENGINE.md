# Alert Engine Specification — DOMAIN-008

## Overview
`AlertEngineService.ts` evaluates property health metrics, inspection schedules, and change events to generate active alerts.

## Supported Alert Categories
- `OVERDUE_INSPECTION`: Inspection schedule target date exceeded without submitted audit.
- `MISSING_EVIDENCE`: Task completed without required photo/video proof in Evidence Vault.
- `COMPLIANCE_FAILURE`: Shastric or Pancha Tattva element alignment score drops below threshold.
- `PROJECT_DELAY`: DOMAIN-007 execution task remains blocked or delayed beyond SLA.
- `MAINTENANCE_DUE`: Remedy re-calibration or cleaning date reached.
- `HIGH_RISK`: Critical elemental conflict detected in primary zone (e.g. Water in Agni zone).
- `DIGITAL_TWIN_MISMATCH`: Physical layout diff reveals unauthorized object placement.
- `SENSOR_THRESHOLD_BREACH`: Live telemetry readings deviate from baseline limits.

## Lifecycle States
`ACTIVE` ──► `ACKNOWLEDGED` ──► `RESOLVED` (or `DISMISSED`)
All state transitions are recorded in the immutable timeline log.
