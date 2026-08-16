# BUILD-023 Event Architecture

All events utilize Kafka/Redpanda with exact-once semantics.

### `ProjectCreated`
- **Producer:** API Gateway
- **Consumer:** Project Manager, Audit Logger
- **Payload:** { projectId, tenantId, timestamp, metadata }
- **Failure:** Dead Letter Queue (DLQ).
- **Retry:** Exponential backoff.

### `UploadStarted` & `UploadCompleted`
- **Producer:** API Gateway
- **Consumer:** Worker Queue Manager
- **Payload:** { fileId, projectId, type (Knowledge/Spatial), size }
- **Failure:** Notify client, DLQ.
- **Retry:** 3 retries, then manual intervention.

### `OCRCompleted`
- **Producer:** VLM/OCR Worker
- **Consumer:** Text Normalization Engine
- **Payload:** { fileId, rawTextData, layoutData }
- **Failure:** DLQ, alert operations.
- **Retry:** Checkpoint resume.

### `PolygonDetected` & `RoomAssociated`
- **Producer:** Spatial Pipeline
- **Consumer:** Geometry Engine, Spatial Graph Engine
- **Payload:** { twinId, polygons[], roomTags[] }
- **Failure:** DLQ.
- **Retry:** Re-process specific spatial chunk.

### `KnowledgeIndexed` & `EmbeddingCreated`
- **Producer:** Knowledge Mapping Engine, Vectorization Worker
- **Consumer:** Knowledge Graph Engine, Search Indexer
- **Payload:** { unitId, vector[], ontologyNodes[], hash }
- **Failure:** DLQ.
- **Retry:** Rate-limit aware exponential backoff (for LLM API limits).

### `GraphUpdated`
- **Producer:** Graph Engine
- **Consumer:** Search Indexer
- **Payload:** { nodesAdded, edgesAdded, namespace }
- **Failure:** DLQ.
- **Retry:** Transactional replay.

### `ReasoningCompleted` & `ReportGenerated`
- **Producer:** Master Orchestrator, Grounded AI Engine
- **Consumer:** Report Engine, API Gateway (WebSocket to Client)
- **Payload:** { projectId, decisionTraceDag, finalOutput }
- **Failure:** StrictGroundednessEvaluator trigger regeneration.
- **Retry:** Regenerate up to 3 times before failing to user.

### `HumanReviewRequested`
- **Producer:** Knowledge Engine, Orchestrator
- **Consumer:** UI Dashboard / Admin Queue
- **Payload:** { entityType, entityId, confidenceScore, proposedAction }
- **Failure:** DLQ.
- **Retry:** Persistent until resolved by human.
