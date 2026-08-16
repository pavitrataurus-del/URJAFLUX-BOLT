# Architecture Decision Records (ADR)
## BUILD-023

### ADR-001: Namespace Isolation
**Decision:** Implement Git-like content-addressable hashing (Merkle Trees) with TenantID for multi-tenant SaaS isolation.
**Context:** Need to prevent knowledge contamination between domains (Vastu vs Feng Shui) and clients.
**Alternatives Considered:** Simple metadata tagging.
**Reason for Selection:** Metadata tagging does not guarantee immutability or version control for classical texts. Hashing ensures data integrity.
**Trade-offs:** Higher storage overhead and complexity in updating records.
**Long-term Impact:** Zero risk of cross-contamination and enterprise compliance for B2B multi-tenancy.

### ADR-002: Digital Building Twin
**Decision:** Natively support 3D coordinate systems (x, y, z) and include Material/Thickness properties, even for 2D floor plans (z=0). Include SpatialBoundingBox.
**Context:** Future expansion requires BIM, CAD, LiDAR, and AR/VR support.
**Alternatives Considered:** Strictly 2D polygons.
**Reason for Selection:** A 2D-only model would require a complete rewrite when 3D requirements materialize.
**Trade-offs:** Slightly more complex data model for initial 2D usage.
**Long-term Impact:** Future-proofs the system for a decade of Spatial Intelligence evolutions.

### ADR-003: Spatial Graph
**Decision:** Implement a Multi-Layered Spatial Graph encompassing Adjacency, Visual Line of Sight, Movement Paths, and Containment.
**Context:** Basic adjacency cannot answer complex spatial queries like "Is the stove visible from the entrance?"
**Alternatives Considered:** Simple adjacency matrix.
**Reason for Selection:** Deep semantic understanding requires varied relationship types.
**Trade-offs:** Exponential increase in graph edges; requires optimized graph database queries.
**Long-term Impact:** Enables highly advanced spatial simulations and AI reasoning.

### ADR-004: Universal Ontology
**Decision:** Adopt RDF/OWL standards with Contextual Equivalence graphs (`owl:sameAs`) rather than universally merging conflicting domain concepts.
**Context:** Vastu and Lal Kitab may define elements or planets differently.
**Alternatives Considered:** Unified canonical model merging all domains into one truth.
**Reason for Selection:** Preserves the purity of each domain without forcing artificial consensus.
**Trade-offs:** Queries across domains are more complex.
**Long-term Impact:** Allows seamless addition of new domains (Ayurveda, Feng Shui) without breaking existing ontological rules.

### ADR-005: Mixture of Experts
**Decision:** Expand the MoE topology to include an Ontology Alignment Expert, Spatial Validation Expert, and a Conflict Resolution Arbiter alongside domain experts.
**Context:** Master Orchestrator was overloaded with responsibilities.
**Alternatives Considered:** Fat Master Orchestrator handling all routing and conflict logic.
**Reason for Selection:** Single Responsibility Principle applied to AI agents.
**Trade-offs:** Increased latency due to multiple agent hops.
**Long-term Impact:** Highly modular AI pipeline where individual experts can be upgraded independently.

### ADR-006: Master AI Orchestrator
**Decision:** Implement GraphQL Federation where the Master AI Orchestrator queries distributed domain endpoints.
**Context:** Need a scalable way to fetch data from different expert systems.
**Alternatives Considered:** Monolithic REST API gateway.
**Reason for Selection:** Federation allows independent schema evolution for different domains.
**Trade-offs:** Increased operational complexity for schema registries.
**Long-term Impact:** Highly decentralized development for future domains.

### ADR-007: Decision Trace Engine
**Decision:** Adopt W3C PROV (Provenance) data model generating Directed Acyclic Graphs (DAGs) for inference paths.
**Context:** Need absolute explainability for AI decisions.
**Alternatives Considered:** Flat JSON arrays of rule citations.
**Reason for Selection:** Complex deductions require hierarchical visual tracing to prove zero hallucination.
**Trade-offs:** Heavier payload and requires a DAG visualizer on the frontend.
**Long-term Impact:** Enterprise trust; full explainability for audits.

### ADR-008: Human Review Workflow
**Decision:** Only authorized users (RBAC) can approve newly ingested knowledge rules into the production Namespace via Human-in-the-loop workflows.
**Context:** AI extracted rules from classical texts may be misinterpreted.
**Alternatives Considered:** Auto-approval based on high confidence scores.
**Reason for Selection:** Grounded AI requires absolute truth at the foundation.
**Trade-offs:** Slower time-to-value for new books.
**Long-term Impact:** Zero garbage-in-garbage-out; high quality knowledge base.

### ADR-009: Grounded AI Policy
**Decision:** Implement a deterministic `StrictGroundednessEvaluator` gate that blocks any report lacking direct citation pointers.
**Context:** Risk of LLM hallucination during final report synthesis.
**Alternatives Considered:** Relying on low-temperature generation.
**Reason for Selection:** Low temperature reduces but does not eliminate hallucinations. A deterministic evaluator guarantees compliance.
**Trade-offs:** Potential for regeneration loops if synthesis consistently fails grounding checks.
**Long-term Impact:** Absolute guarantee of zero hallucination.

### ADR-010: Large Document Processing
**Decision:** Implement Overlapping Semantic Chunking and a dedicated architectural Vision-Language Model (VLM) for layer separation prior to OCR.
**Context:** Processing 1GB+ blueprints/PDFs causes semantic boundary loss and garbage OCR from mixed line/text data.
**Alternatives Considered:** Standard recursive character chunking and generic OCR.
**Reason for Selection:** Resolves OOM issues and significantly increases extraction accuracy on blueprints.
**Trade-offs:** High GPU compute cost for VLM preprocessing.
**Long-term Impact:** Ability to process the most complex CAD blueprints and massive encyclopedias flawlessly.
