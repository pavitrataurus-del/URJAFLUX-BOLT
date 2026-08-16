# GraphQL Gateway (GRAPHQL-GATEWAY.md)

## 1. Description
The GraphQL Gateway aggregates relational schemas across multiple modules of URJAFLUX AI OS into a single, unified queryable graph schema.

## 2. Unified Schema Layout
- **Query Types:**
  - `consultationThreads`: Accesses DOMAIN-009 session indexes.
  - `spatialPins`: Accesses DOMAIN-011 floor-plan correction records.
  - `integrationHealth`: Real-time platform status.
- **Mutation Types:**
  - `createWebhookSubscription`: Configures outbound event triggers.
  - `triggerConnectorSync`: Triggers external ERP/CRM synchronizer jobs.
- **Subscription Interface:** Live events for real-time defect detections or checklist completions.

## 3. Field-Level Authorization Hooks
Queries traverse metadata credentials. Field-level resolvers evaluate credentials against specified security domains, pruning disallowed attributes (e.g. restricting client-identifiable data for non-admin client accounts) without throwing full query exceptions.
