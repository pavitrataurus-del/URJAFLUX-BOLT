# BUILD-023S: Enterprise System Specification (ESS) v2.0
**Spatial Semantic Understanding Engine (SSUE)**

## 1. PRIMARY PRODUCT VISION
The Spatial Semantic Understanding Engine (SSUE) acts as a highly specialized cognitive system that understands floor plans and domain-specific knowledge at the level of an experienced Architect, Civil Engineer, and Domain Consultant (Vastu, Lal Kitab, Numerology). It converts visual layouts and massive multi-format documents (up to 1GB) into semantic digital representations consumed by a highly grounded, zero-hallucination AI reasoning system.

## 2. ARCHITECTURE PRINCIPLES
- **Enterprise Scalability:** Asynchronous processing, worker queues, and microservice/background-task ready.
- **Modular Architecture:** Pluggable engines and strictly isolated domain namespaces.
- **Explainable AI & Zero Hallucination:** Every deduction traces back to a specific rule and source document.
- **Grounded AI Only:** Reasoning operates exclusively on the verified Knowledge Graph and Digital Twin.
- **Plugin Architecture:** Future-ready for CAD/BIM, Feng Shui, Astrology, etc.
- **Offline-Capable Local Processing:** WebWorkers, WASM, and IndexedDB support for local edge processing where appropriate.

## 3. OVERALL SYSTEM ARCHITECTURE & DATA FLOW
### 3.1 High-Level Architecture
```text
+-----------------------------------------------------------------------------------+
|                              CLIENT TIER (Web/Mobile)                             |
+-----------------------------------------------------------------------------------+
                                         | (REST / GraphQL / WebSocket)
+-----------------------------------------------------------------------------------+
|                               API GATEWAY & SECURITY                              |
+-----------------------------------------------------------------------------------+
       |                                 |                                 |
+-------------+                   +-------------+                   +-------------+
| KNOWLEDGE   |                   | SPATIAL     |                   | REASONING   |
| INGESTION   |                   | ENGINE      |                   | ENGINE (MoE)|
+-------------+                   +-------------+                   +-------------+
| - 1GB+ PDF  |                   | - Floorplan |                   | - Master AI |
| - OCR/Vision|                   | - CAD/BIM   |                   | - Vastu     |
| - Chunking  |                   | - OCR/Sym   |                   | - Lal Kitab |
| - Embeddings|                   | - Geometry  |                   | - Numerology|
+-------------+                   +-------------+                   +-------------+
       |                                 |                                 |
+-----------------------------------------------------------------------------------+
|                              CORE DATA & EVENT BUS                                |
+-----------------------------------------------------------------------------------+
       |                                 |                                 |
+-------------+                   +-------------+                   +-------------+
| VECTOR DB   |                   | GRAPH DB    |                   | RELATIONAL DB
+-------------+                   +-------------+                   +-------------+
```

### 3.2 Data Flow
1. **Upload:** User uploads a floorplan (Spatial) or 1GB+ Document (Knowledge).
2. **Ingestion (Async):** Background workers chunk, OCR, extract concepts, and embed the document safely avoiding OOM.
3. **Spatial Processing:** Vision models detect walls, doors, rooms; Geometry Engine constructs the Spatial Graph.
4. **Knowledge Mapping:** Extracted knowledge is mapped to the Universal Ontology and stored in Vector/Graph DBs within strict Namespaces.
5. **Query:** User inputs client details, astrological charts, or problems.
6. **Master Orchestrator:** Routes the query to specific Experts (Vastu, Lal Kitab, Numerology).
7. **Reasoning:** Experts query Vector/Graph DBs, apply their Rule Engines, and return grounded findings.
8. **Resolution:** Master Orchestrator merges outputs, resolves conflicts (e.g., Vastu vs. Lal Kitab), and generates traceable reports.

## 4. FOLDER STRUCTURE
```text
src/
├── core/
│   ├── engine/           # Master Orchestrator, Rule Engine, MoE
│   ├── spatial/          # Geometry, Direction, Polygon, Graph Engines
│   ├── knowledge/        # Ingestion, Extraction, Ontology, Vector Sync
│   ├── security/         # RBAC, Encryption, Secrets
│   └── event-bus/        # Pub/Sub event dispatcher
├── domains/
│   ├── vastu/            # Vastu Expert rules, constraints, ontology extensions
│   ├── lalkitab/         # Lal Kitab Expert rules
│   └── numerology/       # Numerology Expert rules
├── models/               # Global Object Models, DB Schemas, Validators
├── workers/              # WebWorkers/Queues for 1GB+ processing
├── api/                  # Internal & External API contracts
└── shared/               # Utils, Constants, Error Handling
```

## 5. INTERNAL APIs & EVENT BUS
### 5.1 Internal APIs (Interfaces)
- `IKnowledgeIngestor.process(file: Blob, config: IngestConfig): JobId`
- `ISpatialAnalyzer.analyze(image: Blob): DigitalTwin`
- `IMasterOrchestrator.evaluate(twin: DigitalTwin, context: ClientContext): Report`
- `IExpert.reason(subQuery: Query, twin: DigitalTwin): ExpertFinding[]`

### 5.2 Event Bus
Pub/Sub system for decoupling modules.
- `DocumentUploadStartedEvent` / `DocumentChunkProcessedEvent`
- `KnowledgeExtractedEvent`
- `SpatialGraphConstructedEvent`
- `ConflictDetectedEvent`
- `RecommendationGeneratedEvent`

## 6. DATABASE SCHEMA & OBJECT MODELS
### 6.1 Database Schema (Relational/Document + Vector)
- **Sources/Books:** `id`, `title`, `author`, `domain`, `metadata`, `status`
- **KnowledgeUnits (Vector DB):** `id`, `sourceId`, `namespace`, `content`, `embedding`, `ontologyNodes`
- **SpatialTwins:** `id`, `clientId`, `geometryData`, `graphData`, `version`
- **AuditLogs:** `id`, `action`, `userId`, `timestamp`, `details`

### 6.2 Object Model & Spatial Object Model
- **DigitalBuildingTwin:** Root object containing `Floor[]`, `GlobalMetadata`.
- **Floor:** `Room[]`, `Wall[]`, `Door[]`, `Window[]`, `CenterOfGravity`.
- **Room:** `id`, `type`, `polygon`, `associatedDirections[]`, `semanticTags[]`.
- **SpatialGraph:** Nodes = Rooms/Spaces, Edges = Doors/Connectivity/Adjacency.

## 7. SPATIAL SEMANTIC PIPELINE
- **11. OCR Pipeline:** Extracts text from blueprints (room labels, dimensions).
- **12. Symbol Detection Pipeline:** Identifies doors, windows, beds, stoves, toilets.
- **13. Wall Detection:** Identifies load-bearing and partition walls via line/contour detection.
- **14. Polygon Detection:** Closes wall loops to define spatial boundaries (rooms).
- **15. Room Association:** Maps room labels (from OCR) and symbols to polygons.
- **16. Geometry Engine:** Calculates areas, centroids, perimeters, and aspect ratios.
- **17. Spatial Graph:** Builds adjacency matrices (e.g., Kitchen is next to Living Room, connected by Door 1).
- **18. Direction Engine:** Calculates the center of gravity (Brahmasthan) and projects 8/16/32 directional zones over the polygons.

## 8. ENTERPRISE MODULES & AI ENGINE
### A. Mixture of Experts (MoE) Architecture
- **Master AI Orchestrator:** Receives the unified client context. Routes to:
  - *Vastu Expert:* Analyzes spatial twin.
  - *Lal Kitab Expert:* Analyzes astrological/karmic context.
  - *Numerology Expert:* Analyzes name/DOB vibrations.
- **Conflict Resolution:** If Vastu suggests a water feature in North, but Lal Kitab forbids it for the client, the Orchestrator uses precedence rules to resolve and log the contradiction.

### B. Knowledge Namespace Architecture
Knowledge is heavily partitioned.
Metadata schema for every vector/node:
`{ domain: "VASTU", book: "Vishwakarma Prakash", chapter: "2", authority: "CLASSIC", confidence: 0.98, status: "APPROVED" }`
Prevents numerology concepts from bleeding into spatial geometry rules unless explicitly bridged.

### C. Knowledge Graph & D. Universal Ontology
- **Nodes:** Concept, RoomType, Direction, Planet, Element, Remedy.
- **Edges:** `IS_RULE_FOR`, `LOCATED_IN`, `ENHANCES`, `DEPLETES`, `RULE_SOURCE`.
- **Universal Ontology Example:**
  `MASTER BEDROOM` -> `Sleeping` -> `Rest` -> `Moon (Planet)` -> `Mental Peace` -> `South-West (Direction)` -> `Earth (Element)`.

### E. Decision Trace Engine
Every final output must return a `DecisionTrace` object:
```json
{
  "finding": "Avoid water feature in South-West",
  "sourceExpert": "VastuExpert",
  "evidenceChain": [
    { "ruleId": "V-SW-01", "sourceText": "Water in SW causes instability...", "book": "BookName, Pg 45" }
  ],
  "confidenceScore": 0.99
}
```

### F. Large Document Processing (1GB+)
- **Queue System:** Distributed task queues (WebWorkers / Cloud Tasks).
- **Chunk Scheduler:** Splits 1GB PDF into 5-10MB manageable batches.
- **Workers:** Pipeline of OCR Workers -> Text Cleansing -> Embedding Workers.
- **Fault Tolerance:** Checkpoint saving. If crash occurs at page 400, resumes at 400. Retry mechanisms for API limits.

### G. Multilingual Architecture
- Internal reasoning operates in a canonical semantic language (English/Abstract concepts).
- Ingestion supports Hindi/Sanskrit/Mixed via specialized LLM prompts and vector representations.
- Report Engine translates final traces into user-selected language dynamically at render time.

### H. Enterprise Security
- **RBAC:** Roles (Admin, Architect, Vastu Consultant, Client).
- **Data Isolation:** Client A cannot see Client B's floor plans or reports.
- **Audit Logging:** Every modification to the Knowledge Graph is logged.

## 9. IMPLEMENTATION ROADMAP (BUILD-023A to BUILD-023J)

- **BUILD-023A: Infrastructure & Foundation**
  - Implement base Folder Structure, Event Bus, Base Interfaces, and API Contracts.
  - *Acceptance:* Core engines can register and emit basic events securely.

- **BUILD-023B: Large Document Processing Pipeline**
  - Implement Chunk Scheduler, OCR Workers, Checkpoint Recovery for 1GB+ files.
  - *Acceptance:* System successfully ingests a large document chunk-by-chunk without OOM crashes and stores raw text.

- **BUILD-023C: Knowledge Namespace & Universal Ontology**
  - Implement Universal Ontology data models, Graph schema, and Namespace isolation.
  - *Acceptance:* Text chunks are categorized into Vastu, LalKitab, or Numerology namespaces accurately.

- **BUILD-023D: Core Spatial Pipeline (Geometry & Polygon)**
  - Implement Wall Detection, Polygon closing, and Geometry calculations.
  - *Acceptance:* Given a raw line-drawing, system returns closed Room polygons and calculates centers.

- **BUILD-023E: Advanced Spatial Pipeline (Directions & Graph)**
  - Implement Direction Engine (16 zones), Spatial Graph generation, and Symbol Association.
  - *Acceptance:* Digital Twin accurately reflects semantic connectivity (e.g., "Kitchen is in South-East, connected to Living Room").

- **BUILD-023F: Expert Engines (Vastu, Lal Kitab, Numerology)**
  - Implement the isolated Expert instances and their specific querying logic.
  - *Acceptance:* Experts can independently query their respective namespaces and return findings.

- **BUILD-023G: Master AI Orchestrator & Mixture of Experts**
  - Implement routing, merging, and conflict resolution logic.
  - *Acceptance:* Master Orchestrator accurately resolves a deliberate contradiction between Vastu and Lal Kitab.

- **BUILD-023H: Decision Trace Engine**
  - Implement the evidence tracing wrapper around all expert rules.
  - *Acceptance:* Every generated report includes a 100% complete trace back to the original source text.

- **BUILD-023I: Multilingual & Semantic Reporting Engine**
  - Implement translation layers and report assembly algorithms.
  - *Acceptance:* Reports can be dynamically generated in Hindi or English from the identical underlying semantic data.

- **BUILD-023J: Enterprise Security, Human Review & Polish**
  - Implement RBAC, Audit Logging, Confidence Scoring, and Human-in-the-loop review screens.
  - *Acceptance:* Only authorized users can approve/reject newly ingested knowledge rules. System ready for production deployment.
