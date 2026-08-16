# BUILD-023FZ: Final Frozen Architecture
**Spatial Semantic Understanding Engine (SSUE)**

## 1. PRIMARY PRODUCT VISION
The Spatial Semantic Understanding Engine (SSUE) acts as a highly specialized cognitive system that understands floor plans and domain-specific knowledge at the level of an experienced Architect, Civil Engineer, and Domain Consultant. It converts visual layouts and massive multi-format documents into semantic digital representations consumed by a highly grounded, zero-hallucination AI reasoning system.

## 2. CORE ARCHITECTURE PRINCIPLES
- **Enterprise Scalability:** Distributed Streaming Platform (Kafka/Redpanda) with exact-once processing semantics for the Event Bus.
- **Modular Architecture:** GraphQL Federation for API Gateway. Pluggable engines and strictly isolated domain namespaces with TenantID for multi-tenancy.
- **Explainable AI & Zero Hallucination:** W3C PROV compliant Directed Acyclic Graphs (DAGs) for Decision Tracing. StrictGroundednessEvaluator acts as the final gate.
- **Grounded AI Only:** Reasoning operates exclusively on the verified Knowledge Graph and Digital Twin via a unified Graph-RAG architecture.
- **Plugin Architecture:** Future-ready for BIM/CAD with foundational 3D support (x, y, z).
- **Offline-Capable Local Processing:** Support for edge workers where applicable.

## 3. FROZEN ENGINE MODULES
Every module has ONE strict responsibility.

### Spatial & Vision Pipeline
1. **Image Preprocessing Engine:** Cleans and normalizes scans, blueprints, and PDFs.
2. **Layer Separation Vision Engine (VLM):** Separates text layers from geometric layers (hatching, dimensions) to prevent OCR garbage.
3. **OCR Intelligence Engine:** Extracts text from architectural constraints using context.
4. **Text Normalization Engine:** Cleans extracted text.
5. **Symbol Detection Engine:** Detects doors, windows, beds, stoves, toilets.
6. **Wall Detection Engine:** Identifies load-bearing and partition walls.
7. **Polygon Detection Engine:** Closes wall loops to define spatial boundaries.
8. **Room Association Engine:** Maps symbols and labels to polygons.
9. **Geometry Engine:** Calculates centroids, perimeters, 3D volumetric bounds, and aspect ratios.
10. **Spatial Graph Engine:** Generates Multi-Layered Spatial Graphs (Adjacency, Visual Line of Sight, Movement Path, Containment).
11. **Digital Building Twin Engine:** Assembles and manages the 3D-ready spatial state.
12. **Direction Intelligence Engine:** Calculates Brahmasthan and 8/16/32 directional zones over the 3D model.

### Knowledge & Graph Pipeline
13. **Knowledge Namespace Engine:** Manages domain isolation using Git-like content-addressable hashing and multi-tenant scoping.
14. **Universal Ontology Engine:** Manages RDF/OWL standard canonical mappings with Contextual Equivalence to preserve domain purity.
15. **Knowledge Graph Engine:** Manages Graph-RAG data structures linking concepts, rooms, rules, and remedies.
16. **Knowledge Mapping Engine:** Uses Overlapping Semantic Chunking to map extracted data to the Ontology.

### Reasoning & AI Pipeline
17. **Mixture of Experts Engine (MoE):** Houses isolated domain experts (Vastu, Lal Kitab, Numerology).
18. **Master AI Orchestrator:** Routes queries and builds unified contexts.
19. **Conflict Resolution Engine (Arbiter):** Resolves expert contradictions using strict precedence matrices.
20. **Decision Trace Engine:** Logs W3C PROV compliant inference DAGs.
21. **Rule Engine:** Executes deterministic spatial and semantic logic.
22. **Grounded AI Engine:** Synthesizes outputs; protected by the `StrictGroundednessEvaluator` gate.

### Operations & Output
23. **Human Review Engine:** Human-in-the-loop validation workflows.
24. **Report Generation Engine:** Multilingual, semantic report assembly.
25. **Enterprise Security Layer:** RBAC, Multi-tenancy, LLM Firewalls.
26. **Worker Queue Layer:** Distributed queuing for large (1GB+) document ingestion.
27. **Telemetry & Monitoring Layer:** Observability across all microservices.

## 4. ARCHITECTURE DECISION
This architecture is permanently frozen. No modifications are permitted without an official Architecture Change Request (ACR).
