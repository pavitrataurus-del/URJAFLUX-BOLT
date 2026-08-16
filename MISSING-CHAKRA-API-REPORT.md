# DOMAIN-002: Missing Backend API Report for Chakra Intelligence Library

## Overview & Compliance Context

Per URJAFLUX OS **Backend-First Policy**, frontend integration must verify the availability of real server-side REST/gRPC endpoints. Where server-side backend services are not yet provisioned, we generate this formal missing API report without deploying permanent client-side mock backend proxies.

---

## Required Production Backend API Endpoints

### 1. GET `/api/v1/chakra/registry`
* **Purpose**: Fetch canonical Chakra entities with RBAC header inspection.
* **Request Headers**: `Authorization: Bearer <token>`, `X-URJAFLUX-Role: Admin | EndUser`
* **Response**: Returns full `IChakraOntologyEntity[]` for Admins or sanitized `IChakraEndUserEntity[]` for End Users.

### 2. POST `/api/v1/chakra/ocr/ingest`
* **Purpose**: Process scanned Tantric scripts / PDFs via Gemini-2.5-Pro OCR and extract 40+ ontology attributes.
* **Payload**: `{ base64Data: string, mimeType: string, documentCategory: string }`
* **Response**: `{ documentId: string, extractedEntities: IChakraOntologyEntity[], ocrQualityScore: number }`

### 3. POST `/api/v1/chakra/conflicts/resolve`
* **Purpose**: Persist expert reconciliation for scriptural conflicts.
* **Payload**: `{ conflictId: string, reviewStatus: 'Approved' | 'Rejected' | 'Needs Revision', reviewer: string, notes: string }`
* **Response**: `{ status: 'success', updatedConflict: IChakraKnowledgeConflict }`

### 4. POST `/api/v1/chakra/graph/sync`
* **Purpose**: Synchronize Chakra graph nodes with Spanner / Firestore knowledge graph database.
* **Payload**: `{ entityId: string, crossDomainLinks: object, relationships: IChakraRelationship[] }`
* **Response**: `{ status: 'synced', nodeCount: number, edgeCount: number }`

---

## Action Plan for Backend Engineering Team

1. Provision Express / Cloud Run API handlers for `/api/v1/chakra/*` endpoints in `server.ts`.
2. Connect endpoints to Firestore (`remixed-firestore-database-id`) and Gemini-2.5-Pro embedding pipelines.
3. Replace local in-memory catalog singleton in `ChakraMasterKnowledgeRegistry.ts` with direct `fetch()` calls to these endpoints.
