# Timeline Engine Specification — DOMAIN-008

## Overview
`TimelineEngineService.ts` aggregates historical events into a unified chronological replay stream.

## Tracked Event Types
- `RECOMMENDATION`: DOMAIN-006 synthesized recommendation approval.
- `EXECUTION`: DOMAIN-007 task generation, phase movement, or sign-off.
- `INSPECTION`: Field inspector audit report submission.
- `EVIDENCE`: Media upload or SHA256 checksum verification.
- `MAINTENANCE`: Maintenance task scheduling or completion.
- `ALERT`: Alert creation, acknowledgement, or resolution.
- `CHANGE`: Property snapshot differential detection.
- `COMPLIANCE`: Compliance metric evaluation update.
