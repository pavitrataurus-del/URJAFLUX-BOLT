# DOMAIN-005 — Astrology Intelligence Library Role-Based Access Control (RBAC)

## 1. Overview
DOMAIN-005 enforces strict data security boundaries between **Admin/SME Reviewers** and **End-User Application Consumers**.

## 2. Role Permissions Matrix

| Operations & Fields | Admin / SME Reviewer | Expert Reviewer | End User / Consumer |
|---|---|---|---|
| **View Canonical Entities (`status === 'CANONICAL'`)** | Full Access | Full Access | Full Access |
| **View Non-Canonical Entities (`DRAFT`, `UNDER_REVIEW`)** | Full Access | Full Access | **Access Denied** |
| **View Internal OCR Confidence & Batch Metadata** | Full Access | Full Access | **Access Denied** |
| **View Unresolved Classical Conflicts** | Full Access | Read-Only | **Access Denied** |
| **Execute Status Changes (Draft -> Canonical)** | Permitted | Recommended Only | **Access Denied** |
| **Resolve Classical Conflicts** | Permitted | Recommended Only | **Access Denied** |
| **Execute Duplicate Entity Merges** | Permitted | **Access Denied** | **Access Denied** |

## 3. End-User Data Sanitization Protocol
When an End User queries the registry via `getEndUserEntities()` or `getEndUserEntityById()`:
1. Non-canonical items (`DRAFT`, `UNDER_REVIEW`, `DEPRECATED`) are filtered out automatically.
2. Internal administration fields (`sourceTraceability.importBatch`, `revisionNotes`, `lastUpdatedBy`, `hasActiveConflict`) are stripped from the response payload.
3. Only clean, verified, public-safe fields (`IAstrologyEndUserEntity`) are delivered to the UI or downstream recommendation services.

---
*URJAFLUX AI OS Security & Compliance Team — Approved Canonical Document*
