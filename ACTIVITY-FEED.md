# Unified Platform Activity Feed (ACTIVITY-FEED.md)

## 1. Description
The Activity Feed logs user actions, system notifications, and domain-specific operations into a unified queryable ledger.

## 2. Event Aggregation Structure
Events logged in the feed map to:
- **Comments/Threads:** Thread launches, comment replies, attachments, emoji reactions.
- **CAD/Remediation (DOMAIN-011):** Layout adjustments, geometry updates.
- **Vision (DOMAIN-012):** Defect detections, inspection updates.
- **Workflows (DOMAIN-013):** SLA triggers, task approvals.

## 3. Filters & Queries
- Query parameters: `domain` (filter by source engine), `type` (filter by operation category), `userId` (filter by action author), and full-text keyword matching on descriptions.
