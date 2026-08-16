# DOMAIN-003 — Lal Kitab RBAC Security Policy

## Overview
The **Lal Kitab RBAC Subsystem** enforces strict role-based access control, preventing unauthorized access to internal verification queues, unverified manuscript OCR drafts, and conflict logs.

## Permission Matrix

| Capability / View Component | `ADMIN` Role | `END_USER` Role | Escalation Shield Action |
| :--- | :--- | :--- | :--- |
| **Approved Canonical Lal Kitab Rules** | Full View | Full View | Publicly Accessible |
| **Entity Browser (Canonical Only)** | Full View | Filtered View | Unapproved Drafts Hidden |
| **Full-text & Semantic Search** | Full Search | Canonical Search | Drafts Excluded |
| **Raw Manuscript OCR & Page Scans** | Full Access | **ACCESS DENIED** | Tab Stripped / Redacted |
| **Conflict Resolution Panel** | Active Resolution | **ACCESS DENIED** | Hidden / Redacted |
| **Verification Queue & SME Votes** | Full Access | **ACCESS DENIED** | Hidden / Redacted |
| **Quality Breakdown & OCR Confidence**| Visible | **ACCESS DENIED** | Internal Metrics Redacted |
| **Entity Editing & Status Promotion** | Active Controls | Read-Only | Controls Hidden |

## Verification & Denial Testing
Calling `getEndUserEntities()` in `LalKitabMasterKnowledgeRegistry` automatically strips all draft entities, raw OCR confidence percentages, internal reviewer notes, and unresolved conflict queues, serving only verified `CANONICAL` records.
