# DOMAIN-002A: Missing Backend API Report for Universal Knowledge Ingestion Pipeline

## Compliance Context & Policy

Per URJAFLUX OS **Backend-First Policy**, frontend integration must verify the availability of real server-side REST/gRPC endpoints. 

While server-side Gemini AI calls (`/api/gemini/parse-document`, `/api/gemini/generate`, `/api/gemini/embed`) are active in `server.ts`, dedicated persistent backend queue and database synchronization microservices (`/api/v1/ingestion/*`) are not yet provisioned on a dedicated backend server.

We document these missing endpoints here without deploying permanent client-side mock backend proxies.

---

## Required Production Ingestion Backend Endpoints

### 1. POST `/api/v1/ingestion/upload`
* **Purpose**: Stream large files (PDF, DOCX, EPUB) directly to cloud storage and initiate asynchronous background OCR pipeline.
* **Payload**: `multipart/form-data` with `file`, `domain`, `importer`
* **Response**: `{ packageId: string, status: 'QUEUED', uploadUrl: string }`

### 2. GET `/api/v1/ingestion/packages`
* **Purpose**: Fetch ingestion packages with server-side RBAC header inspection.
* **Request Headers**: `Authorization: Bearer <token>`, `X-URJAFLUX-Role: Admin | EndUser`
* **Response**: Returns full packages for Admins; returns sanitized, approved-only packages for End Users.

### 3. POST `/api/v1/ingestion/normalize/approve`
* **Purpose**: Persist canonical concept normalization approval.
* **Payload**: `{ packageId: string, normId: string, reviewer: string }`
* **Response**: `{ status: 'success', updatedNorm: INormalizationCandidate }`

### 4. POST `/api/v1/ingestion/graph/sync`
* **Purpose**: Synchronize approved pipeline entities and edges directly into Spanner / Firestore Knowledge Graph.
* **Payload**: `{ packageId: string, entityIds: string[], edgeIds: string[] }`
* **Response**: `{ status: 'synced', nodeCount: number, edgeCount: number }`

---

## Action Plan for Backend Engineering Team

1. Provision Express / Cloud Run API handlers for `/api/v1/ingestion/*` endpoints in `server.ts`.
2. Connect endpoints to Firestore (`remixed-firestore-database-id`) for package metadata and Spanner for graph sync.
3. Replace local storage state in `UniversalIngestionEngine.ts` with direct `fetch()` calls to these endpoints.
