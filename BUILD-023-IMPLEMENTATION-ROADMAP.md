# BUILD-023 Implementation Roadmap
**Approved Sprint Roadmap**

*Note: Sprints have been re-sequenced based on BUILD-023R to prioritize Security and Infrastructure.*

### **BUILD-023A: Enterprise Foundation & Security**
- **Focus:** Infrastructure, RBAC, Multi-tenancy, Event Bus (Kafka/Redpanda).
- **Deliverables:** API Gateway setup, Security Layer, Tenant isolation models.
- **Acceptance:** Systems authenticate, events stream with exact-once delivery, tenant data is strictly isolated.

### **BUILD-023B: Universal Ontology & Knowledge Namespaces**
- **Focus:** RDF/OWL models, Contextual Equivalence, Git-like Merkle tree hashing.
- **Deliverables:** Ontology Engine, Namespace Engine.
- **Acceptance:** Concepts mapped safely without cross-domain contamination; versioned knowledge.

### **BUILD-023C: Large Document Processing & VLM**
- **Focus:** 1GB+ PDF handling, Overlapping Semantic Chunking, Architectural VLM.
- **Deliverables:** Worker Queues, Checkpoint Recovery, Preprocessing Engine.
- **Acceptance:** System ingests 1GB PDF, separates text from geometry, and chunks semantically without OOM.

### **BUILD-023D: Core 3D Spatial Pipeline**
- **Focus:** Geometry, Polygons, 3D Bounding Boxes (x, y, z), Wall detection.
- **Deliverables:** Digital Building Twin Engine (Base), Geometry Engine.
- **Acceptance:** Raw blueprint converted to 3D-ready spatial state with accurate polygons and centroids.

### **BUILD-023E: Advanced Spatial Pipeline & Multi-Layered Graph**
- **Focus:** Adjacency, NavMesh, Visual Line of Sight, Directions.
- **Deliverables:** Spatial Graph Engine, Direction Intelligence Engine.
- **Acceptance:** Graph accurately resolves queries like "Is stove visible from door?" and defines Brahmasthan.

### **BUILD-023F: Expert Engines**
- **Focus:** Domain specific constraints (Vastu, Lal Kitab, Numerology).
- **Deliverables:** Domain Expert Instances.
- **Acceptance:** Experts independently query their namespaces and return valid constraints.

### **BUILD-023G: Master AI Orchestrator & MoE Arbitration**
- **Focus:** Routing, Context Building, Conflict Resolution Arbiter.
- **Deliverables:** MoE Engine, Master Orchestrator, Conflict Engine.
- **Acceptance:** Orchestrator accurately delegates queries and Arbiter resolves cross-domain contradictions.

### **BUILD-023H: Decision Trace Engine & Groundedness Evaluator**
- **Focus:** W3C PROV DAGs, Deterministic Hallucination blocking.
- **Deliverables:** Decision Trace Engine, StrictGroundednessEvaluator.
- **Acceptance:** Every recommendation traces back to source; ungrounded outputs trigger automatic regeneration.

### **BUILD-023I: Multilingual & Semantic Reporting**
- **Focus:** Translation layers, report assembly.
- **Deliverables:** Report Generation Engine.
- **Acceptance:** Unified semantic report generated dynamically in multiple languages.

### **BUILD-023J: Human Review & Polish**
- **Focus:** Human-in-the-loop workflows, UI integration hooks, Telemetry.
- **Deliverables:** Human Review Engine, Monitoring Layer.
- **Acceptance:** Authorized users can approve/reject knowledge units; system ready for production.
