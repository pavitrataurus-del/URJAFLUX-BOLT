# Firestore Schema & Data Persistence

This document describes the design of the NoSQL database schemas, document structures, relationship mappings, and offline synchronization patterns within **URJAFLUX AI OS**.

---

## Architecture of Data Sync

URJAFLUX AI OS utilizes a resilient **Durable Offline-First Synchronization Pattern**. Rather than failing or blocking actions when network connectivity drops or when Firestore is unconfigured:
1. **Network Detection**: Services monitor Firebase states via the `isFirebaseConfigured` flag.
2. **Local Dual-Write**: Every write operation is written to the Firestore collection (if available) and simultaneously cached inside a structured local storage model (`localStorage`).
3. **Graceful Reading**: If Firebase is disconnected or offline, lists and records are loaded from the local fallback keys, allowing uninterrupted onsite consultations.

---

## Firestore Collection Schemas

Below are the schemas for each active database collection.

### 1. `clients`
* **Purpose**: Records details of corporate agencies, institutes, and individual property owners.
* **Structure**:
```json
{
  "id": "string (Matches document ID exactly)",
  "name": "string",
  "email": "string",
  "phone": "string",
  "company": "string",
  "status": "string ('Active' | 'Pending' | 'Inactive')",
  "joinedDate": "string (YYYY-MM-DD)",
  "address": "string",
  "avatarUrl": "string"
}
```

### 2. `properties`
* **Purpose**: Stores spatial characteristics of physical properties under analysis.
* **Structure**:
```json
{
  "id": "string (Matches document ID exactly)",
  "name": "string",
  "ownerId": "string (Pointer to clients.id)",
  "ownerName": "string",
  "address": "string",
  "plotSize": "string",
  "floors": "number",
  "constructionStatus": "string ('Planned' | 'Under Construction' | 'Completed')",
  "consultationStatus": "string ('Pending' | 'In Progress' | 'Remedied' | 'Verified')",
  "energyRating": "number",
  "floorplanUrl": "string",
  "directionsOffset": "number"
}
```

### 3. `projects`
* **Purpose**: Manages active consultant projects, coordinating properties and clients.
* **Structure**:
```json
{
  "id": "string (Matches document ID exactly)",
  "name": "string",
  "code": "string",
  "propertyId": "string (Pointer to properties.id)",
  "propertyName": "string",
  "clientId": "string (Pointer to clients.id)",
  "clientName": "string",
  "projectType": "string",
  "status": "string ('Active' | 'Completed' | 'Pending')",
  "priority": "string ('High' | 'Medium' | 'Low')",
  "createdDate": "string",
  "lastUpdated": "string",
  "assignedConsultant": "string"
}
```

### 4. `workspaces`
* **Purpose**: Houses highly dynamic coordinate layouts, canvas scales, annotations, object pins, and Vastu mandala rotations.
* **Structure**:
```json
{
  "id": "string (Matches projects.id exactly)",
  "projectId": "string",
  "floorPlanImage": "object { url: string, name: string }",
  "northAngle": "number",
  "scale": "string",
  "canvasZoom": "number",
  "canvasOffset": "object { x: number, y: number }",
  "layers": "object { grid: boolean, Purusha: boolean, ... }",
  "objects": "array [ { id: string, name: string, type: string, x: number, y: number, ... } ]",
  "measurements": "array",
  "photos": "array",
  "notes": "string",
  "lastUpdated": "string",
  "annotations": "array [ { id: string, text: string, x: number, y: number } ]",
  "annotationLayers": "object",
  "annotationZoom": "number",
  "annotationPan": "object",
  "annotationMeasurePoints": "array"
}
```

### 5. `reports`
* **Purpose**: Compiles structural audits, diagnostic findings, recommended remedies, and scores.
* **Structure**:
```json
{
  "id": "string (Matches document ID exactly)",
  "title": "string",
  "propertyId": "string (Pointer to properties.id)",
  "propertyName": "string",
  "clientId": "string (Pointer to clients.id)",
  "clientName": "string",
  "dateCreated": "string (YYYY-MM-DD)",
  "remedies": "array [ { id: string, room: string, defect: string, prescription: string } ]",
  "summaryRating": "number (0-100 score)",
  "consultantNotes": "string",
  "status": "string ('Draft' | 'Approved' | 'Sent')"
}
```

### 6. `workspace_digital_twins`
* **Purpose**: Tracks layout revisions and multi-user drawing iterations.
* **Structure**:
```json
{
  "id": "string (Matches workspaces.id exactly)",
  "workspaceId": "string",
  "drawings": "array [ { id: string, name: string, timestamp: string, shapes: array } ]"
}
```

### 7. `ingested_books`
* **Purpose**: Metadata of digitized Vedic texts.
* **Structure**: Matches the `IngestedBook` interface.

### 8. `extracted_rules`
* **Purpose**: Store granular rules extracted from books.
* **Structure**: Matches the `ExtractedRule` interface.

### 9. `extracted_formulas`
* **Purpose**: Mathematical formulas extracted from classical sources.
* **Structure**: Matches the `ExtractedFormula` interface.

### 10. `enterprise_sources`
* **Purpose**: Stores lists of active canonical books used during Vedic search lookups.
* **Structure**:
```json
{
  "id": "string (Matches bookId exactly)",
  "uuid": "string",
  "title": "string",
  "author": "string",
  "publisher": "string",
  "edition": "string",
  "language": "string",
  "category": "string",
  "status": "string ('active' | 'draft')",
  "version": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### 11. `rule_execution_logs`
* **Purpose**: Complete historical execution logs containing latency metrics, rule match results, and applied conflict overrides.
* **Structure**:
```json
{
  "id": "string (Auto-generated Firestore document ID)",
  "projectId": "string",
  "totalRulesEvaluated": "number",
  "totalRulesMatched": "number",
  "executionLatencyMs": "number",
  "outcomes": "array [ { conflict: object, winnerRuleId: string, ... } ]",
  "timestamp": "string"
}
```

### 12. `ai_vision_analyses`
* **Purpose**: Results of machine vision layout detections.
* **Structure**:
```json
{
  "id": "string (Matches project/workspace ID)",
  "projectId": "string",
  "analyzedAt": "string (ISO Date String)",
  "status": "string ('pending' | 'processing' | 'success' | 'failed' | 'placeholder')",
  "analysisState": "string ('placeholder' | 'processing' | 'completed' | 'failed')",
  "rooms": "array [ { id: string, name: string, confidence: number, polygon: array, areaMeters: number } ]",
  "walls": "array [ { id: string, type: string, confidence: number, startPoint: object, endPoint: object, thicknessPx: number } ]",
  "doors": "array [ { id: string, confidence: number, center: object, widthPx: number, angle: number, isOpen: boolean } ]",
  "windows": "array [ { id: string, confidence: number, center: object, widthPx: number, angle: number } ]",
  "compass": "object { confidence: number, center: object, northAngle: number } | null",
  "scale": "object { confidence: number, scaleBarBoundingBox: object, detectedLengthMeters: number, pixelsPerUnit: number } | null",
  "ocrLabels": "array [ { id: string, text: string, confidence: number, boundingBox: object } ]",
  "rawOutput": "string"
}
```

---

## Relationship Diagram

```text
  [clients] 1 ---- * [properties] 1 ---- * [projects]
                                              | 1
                                              |
                                            1 |
                                         [workspaces] (1-to-1)
                                              | 1
                                              |
                                            1 |
                                   [workspace_digital_twins] (1-to-1)
```
- **Referential Integrity**: Managed completely at the application service level to maximize NoSQL performance and avoid database lock contention.
