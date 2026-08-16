# Monitoring Workspace Specification — DOMAIN-008

## Overview
`MonitoringWorkspace.tsx` is an interactive React workspace integrated directly into `KnowledgePage.tsx`.

## Key Views
1. **Header & Interactive RBAC Role Switcher**: Switch between `ADMIN`, `PROJECT_MANAGER`, `FIELD_ENGINEER`, and `END_USER`.
2. **Property Health KPI Banner**: Displays Health Score (0-100), Compliance Rating (%), Active Alerts counter, Maintenance Priority, and Active Snapshot version.
3. **Digital Twin & Layout Explorer**: Displays active property metadata, floor plans, room zones (Northeast Ishan, Southeast Agneya, Southwest Nairrutya, etc.), installed remedies, placed objects with coordinates, and live sensor telemetry (`µT`, `Lux`, `Hz`). Includes "Capture New Property Snapshot" action modal.
4. **Change Detection Viewer**: Lists snapshot diffs highlighting added, removed, relocated objects, direction changes, layout changes, and sensor variance with severity badges.
5. **Alert Center**: Displays category, severity, message, and status for active alerts with Acknowledge/Resolve actions.
6. **Compliance Dashboard**: Bar visualizers for Recommendation, Execution, Inspection, Documentation, and Evidence Freshness compliance.
7. **Maintenance Calendar**: List of preventive/corrective maintenance records with schedule dates, assignee, completion status, and "Schedule Maintenance" form dialog.
8. **Timeline Replay Engine**: Chronological stream of project events across Reasoning → Execution → Monitoring.
