# DOMAIN-003 — Enterprise Lal Kitab Data Model Specification

## Overview
The **Lal Kitab Data Model** defines TypeScript interfaces, attributes, and data structures governing knowledge storage, source traceability, quality scoring, and truth engine integration.

## Interfaces Summary

### `ILalKitabOntologyEntity`
Represents an individual entity in the Lal Kitab repository.
- `id`: string
- `canonicalName`: string
- `hindiName`: string
- `englishName`: string
- `urduName`: string (optional)
- `entityType`: `LalKitabEntityType`
- `description`: string
- `category`: string
- `tags`: string[]
- `metadata`: Record<string, any>
- `status`: `'CANONICAL' | 'DRAFT' | 'DISPUTED' | 'DEPRECATED'`
- `sourceTraceability`: `ISourceTraceability`
- `truthEngineMetrics`: `ITruthEngineMetrics`

### `ISourceTraceability`
Mandatory traceability attributes guaranteeing manuscript provenance:
- `sourceBook`: string (e.g. "Lal Kitab 1952 Farman")
- `edition`: string
- `publicationYear`: number
- `publisher`: string
- `language`: `'Urdu' | 'Hindi' | 'English' | 'Sanskrit'`
- `chapter`: string
- `pageNumber`: number
- `paragraph`: string
- `ocrConfidence`: number (0.0 to 1.0)
- `importBatch`: string
- `importTimestamp`: string
- `verificationStatus`: `KnowledgeStatus`

### `ITruthEngineMetrics`
Integrates directly with DOMAIN-002B Verification Engine:
- `sourceReliability`: number (0 to 100)
- `evidenceStrength`: number (0 to 100)
- `knowledgeWeight`: number (0.0 to 1.0)
- `confidenceScore`: number (0 to 100)
- `confidenceGrade`: `'A+' | 'A' | 'B' | 'C' | 'F'`
- `expertConsensusStatus`: `'Pending' | 'Reviewed' | 'Approved' | 'Rejected'`
- `hasActiveConflict`: boolean
- `isCanonical`: boolean
