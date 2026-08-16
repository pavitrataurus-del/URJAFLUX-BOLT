# Monitoring Data Model Specification — DOMAIN-008

## Overview
All entities in DOMAIN-008 inherit standard enterprise audit metadata:
`id` (UUID), `version`, `status`, `owner`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`.

## Core Entities
1. **`IDigitalTwin`**:
   - `propertyId`, `propertyCode`, `propertyName`, `siteAddress`
   - `relatedProjectId` (links directly to DOMAIN-007)
   - `activeSnapshotId`, `snapshotsHistory`
   - `overallHealthScore`, `complianceScore`, `maintenancePriority`
   - `lastInspectedAt`, `nextScheduledInspectionAt`

2. **`IPropertySnapshot`**:
   - `snapshotNumber`, `snapshotLabel`, `floorPlanVersion`
   - `roomZones`: List of `IDigitalTwinRoomZone` (Northeast Ishan, Southeast Agneya, Southwest Nairrutya, etc.)
   - `overallHealthScore`, `totalRemediesInstalled`

3. **`IChangeEvent`**:
   - `previousSnapshotId`, `newSnapshotId`
   - `changeType`: `OBJECT_ADDED` | `OBJECT_REMOVED` | `OBJECT_RELOCATED` | `DIRECTION_CHANGED` | `LAYOUT_CHANGED` | `EVIDENCE_UPDATED` | `MEASUREMENT_CHANGED`
   - `zoneId`, `description`, `severity`

4. **`IMonitoringAlert`**:
   - `alertCategory`: `OVERDUE_INSPECTION` | `MISSING_EVIDENCE` | `COMPLIANCE_FAILURE` | `PROJECT_DELAY` | `MAINTENANCE_DUE` | `HIGH_RISK` | `DIGITAL_TWIN_MISMATCH` | `SENSOR_THRESHOLD_BREACH` | `WORKFLOW_FAILURE`
   - `severity`: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW` | `INFO`
   - `alertStatus`: `ACTIVE` | `ACKNOWLEDGED` | `RESOLVED` | `DISMISSED`

5. **`IMaintenanceRecord`**:
   - `remedyId`, `title`, `maintenanceType` (`PREVENTIVE` | `CORRECTIVE` | `ROUTINE` | `SCHEDULED`)
   - `scheduledDate`, `completedDate`, `assignedTo`, `estimatedCostPlaceholder`, `notes`

6. **`IComplianceRecord`**:
   - `recommendationCompliancePercentage`, `executionCompliancePercentage`, `inspectionCompliancePercentage`, `documentationCompletenessPercentage`, `evidenceFreshnessPercentage`, `overallComplianceScore`

7. **`ITimelineEvent`**:
   - `eventType`: `RECOMMENDATION` | `EXECUTION` | `INSPECTION` | `EVIDENCE` | `MAINTENANCE` | `ALERT` | `CHANGE` | `COMPLIANCE`
   - `title`, `description`, `timestamp`, `actor`, `actorRole`
