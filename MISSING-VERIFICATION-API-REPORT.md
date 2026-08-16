# Missing Verification API Report & Backend-First Documentation

## Verification Status
Under the Backend-First Policy, frontend verification modules integrate seamlessly with TypeScript in-memory verification engines (`/src/core/knowledge/verification/`).

When production backend microservices are deployed, the following REST/gRPC endpoints must be exposed:

## Required Backend API Specification

### 1. Truth State Management
- `GET /api/v1/verification/rules`: Fetch rules filtered by status and role.
- `POST /api/v1/verification/rules/:id/state`: Transition knowledge state (`CANONICAL`, `DISPUTED`, `DEPRECATED`).

### 2. Evidence & Source Reliability
- `POST /api/v1/verification/evidence`: Attach primary/supporting evidence to a rule.
- `GET /api/v1/verification/sources/:id/reliability`: Retrieve source authority and reliability metrics.

### 3. Expert Consensus
- `POST /api/v1/verification/consensus/action`: Record SME expert vote or approval.
- `GET /api/v1/verification/consensus/:ruleId`: Fetch consensus sign-off ledger.

### 4. Contradiction Resolution
- `POST /api/v1/verification/contradictions`: Log new shastric contradiction.
- `PUT /api/v1/verification/contradictions/:id/resolve`: Resolve contradiction with context note.

### 5. Truth Graph & AI Explainability
- `GET /api/v1/verification/truth-graph/:ruleId`: Fetch extended truth topology nodes and edges.
- `GET /api/v1/verification/explainability/:ruleId`: Retrieve AI explainability reasoning package.
