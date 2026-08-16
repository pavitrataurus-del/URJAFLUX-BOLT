# DOMAIN-010 — Enterprise Report Architecture & Document Intelligence

## Overview
The **URJAFLUX Report Generation & Document Intelligence Engine** operates purely as a document synthesis and formatting layer. It does not maintain independent knowledge libraries or generate autonomous reasoning.

All data contained within generated reports is retrieved dynamically from verified upstream services:
```
Knowledge Libraries (DOMAIN-001..005)
          ↓
  Truth Engine (DOMAIN-002B)
          ↓
  Unified Reasoning (DOMAIN-006)
          ↓
  Project Execution (DOMAIN-007)
          ↓
  Digital Twin Monitoring (DOMAIN-008)
          ↓
  AI Consultation (DOMAIN-009)
          ↓
  Report Generation & Document Intelligence (DOMAIN-010)
```

## Core Entities (`/src/core/reports/ReportTypes.ts`)
- **Report**: Represents an immutable or draft report document instance.
- **Report Metadata**: Author, project, property, title, report type, language (`en` | `hi`).
- **Report Section**: Dynamic section containing markdown text, structured data, citations, and attachments.
- **Report Branding**: Company logos, client logos, primary/secondary color schemes, headers, footers, watermarks, typography.
- **Report Citation**: Linked canonical shloka and scripture reference with Truth Engine confidence score.
- **Report Attachment**: Linked photographic evidence, 3D spatial grid views, and IoT sensor telemetry charts.
- **Report Export Job**: Trackable export request for PDF, DOCX, HTML, Markdown, or JSON.
- **Report Audit Log**: Cryptographically logged trail of all actions, approvals, and status transitions.
