# BUILD-023 Final Data Model

All core entities defined.

### Project
- **Purpose:** Root organizational unit for a client engagement.
- **Ownership:** Tenant/User.
- **Relationships:** Contains `FloorPlan`s, `UserReview`s.
- **Lifecycle:** Created -> Active -> Archived -> Deleted.

### FloorPlan
- **Purpose:** Represents a specific architectural drawing/layout.
- **Ownership:** Project.
- **Relationships:** Has many `Page`s, results in one `DigitalBuildingTwin`.
- **Lifecycle:** Uploaded -> Processing -> Analyzed -> Approved.

### Page
- **Purpose:** A single sheet/image of a `FloorPlan` or a page in a `KnowledgeSource`.
- **Ownership:** FloorPlan / KnowledgeSource.
- **Relationships:** Has many `Polygon`s, `SpatialObject`s, or `KnowledgeUnit`s.
- **Lifecycle:** Extracted -> Processed -> Embedded.

### Room
- **Purpose:** Semantically defined enclosed space.
- **Ownership:** DigitalBuildingTwin.
- **Relationships:** Defined by `Polygon`, bounded by `Wall`s, accessed by `Door`s.
- **Lifecycle:** Detected -> Classified -> Analyzed.

### Wall, Door, Window
- **Purpose:** Architectural boundaries and apertures.
- **Ownership:** DigitalBuildingTwin.
- **Relationships:** Connects `Room`s. `Wall` has `Material` and `Thickness`.
- **Lifecycle:** Detected -> Verified.

### Polygon & Geometry
- **Purpose:** Mathematical representation of shapes.
- **Ownership:** Spatial Engines.
- **Relationships:** Defines `Room`, `Furniture`. Uses 3D bounds (x,y,z).
- **Lifecycle:** Calculated -> Stored.

### SpatialObject & Furniture
- **Purpose:** Distinct items within spaces (Beds, Stoves, Toilets).
- **Ownership:** DigitalBuildingTwin / Room.
- **Relationships:** Located inside `Room`, interacting with `Direction`.
- **Lifecycle:** Detected -> Mapped.

### Direction
- **Purpose:** 8/16/32 zones based on compass and Brahmasthan.
- **Ownership:** DigitalBuildingTwin.
- **Relationships:** Intersects `Room` and `SpatialObject`.
- **Lifecycle:** Calculated.

### KnowledgeSource & KnowledgeUnit
- **Purpose:** Source books (Source) and their chunked content (Unit).
- **Ownership:** Tenant / Domain Namespace.
- **Relationships:** Source has many Units. Unit mapped to `OntologyNode`.
- **Lifecycle:** Uploaded -> Chunked -> Embedded -> Approved -> Immutable.

### OntologyNode
- **Purpose:** Canonical RDF/OWL representation of concepts.
- **Ownership:** Universal Ontology Engine.
- **Relationships:** Links via `owl:sameAs` to domain-specific variants.
- **Lifecycle:** Defined -> Mapped.

### GraphNode & GraphEdge
- **Purpose:** Elements of the Graph-RAG database.
- **Ownership:** Knowledge Graph Engine / Spatial Graph Engine.
- **Relationships:** Connects entities (Line of sight, Semantic linkage).
- **Lifecycle:** Generated -> Traversed.

### Evidence & Rule
- **Purpose:** Grounded facts and logical constraints.
- **Ownership:** Domain Namespace.
- **Relationships:** `Evidence` supports `Rule`. Used by `ExpertOpinion`.
- **Lifecycle:** Extracted -> Validated.

### Recommendation, ExpertOpinion, DecisionTrace
- **Purpose:** Output generation and explainability.
- **Ownership:** Project / MoE.
- **Relationships:** `ExpertOpinion` creates `Recommendation`. Bound together by `DecisionTrace` (W3C PROV DAG).
- **Lifecycle:** Synthesized -> Traced -> Evaluated -> Reported.

### UserReview & ConfidenceScore
- **Purpose:** Quality control and probability.
- **Ownership:** Project / Global.
- **Relationships:** Attaches to `Recommendation` or `KnowledgeUnit`.
- **Lifecycle:** Assigned -> Adjusted via feedback.
