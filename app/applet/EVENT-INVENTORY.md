# EVENT-INVENTORY
## URJAFLUX AI OS

### Event System Inventory
- **Total Events:** ~45 Event Types
- **Event Names:** `DOCUMENT_UPLOADED`, `OCR_COMPLETED`, `EMBEDDING_GENERATED`, `SPATIAL_INDEXED`, `TWIN_UPDATED`, `GRAPH_MUTATED`, `EXPERT_EXECUTED`, `DECISION_RECORDED`, `RECOMMENDATION_ISSUED`
- **Publishers:** `IngestionApi`, `OcrApi`, `EmbeddingApi`, `SpatialApi`, `DigitalTwinApi`, `GraphApi`, `ReasoningApi`
- **Subscribers:** Multi-Expert Orchestrator, Analytics Engine, Audit Logger, Knowledge Hydration Service
- **Unused Events:** `LEGACY_TWIN_MIGRATION` (deprecated)
- **Event Dependencies:** Relies on internal EventEmitter/Observable patterns. Spatial events depend on OCR events; Recommendation events depend on Expert Executed events.
