# BUILD-023 API Specifications
Internal API contracts.

### Global Constraints
- **Versioning:** Semantic versioning via URL (`/api/v1/...`) and GraphQL schemas.
- **Authentication:** JWT via API Gateway.
- **Authorization:** Tenant-scoped RBAC evaluated at the Gateway and propagated via headers (`X-Tenant-ID`, `X-User-Role`).
- **Validation:** Strict Zod/JSON-schema validation on all requests.

---

### `IKnowledgeIngestor`
- **Operation:** `process`
- **Request:** `Multipart/form-data` { file: Blob, config: IngestConfig }
- **Response:** `202 Accepted` { jobId: string, statusUrl: string }
- **Errors:** `400 Bad Request` (Invalid file type), `413 Payload Too Large`.

### `ISpatialAnalyzer`
- **Operation:** `analyze`
- **Request:** { imageId: string, constraints: SpatialConstraints }
- **Response:** `200 OK` { twinId: string, graph: SpatialGraphData }
- **Errors:** `422 Unprocessable Entity` (Image too noisy for extraction).

### `IMasterOrchestrator`
- **Operation:** `evaluate`
- **Request:** { twinId: string, clientContext: ClientContext, requestedDomains: string[] }
- **Response:** `200 OK` { reportId: string, trace: DecisionTraceDAG }
- **Errors:** `503 Service Unavailable` (Expert engine timeout).

### `IExpert` (Vastu, LalKitab, Numerology)
- **Operation:** `reason`
- **Request:** { subQuery: Query, twinId: string, context: ClientContext }
- **Response:** `200 OK` { findings: ExpertFinding[] }
- **Errors:** `400 Bad Request` (Invalid context parameters).

### `IConflictResolutionArbiter`
- **Operation:** `resolve`
- **Request:** { conflictingFindings: ExpertFinding[], precedenceRules: RuleSet }
- **Response:** `200 OK` { resolvedFinding: ExpertFinding, resolutionLog: string }

### `IStrictGroundednessEvaluator`
- **Operation:** `validate`
- **Request:** { generatedText: string, sourceTrace: DecisionTraceDAG }
- **Response:** `200 OK` { isValid: boolean, failingClaims: string[] }
