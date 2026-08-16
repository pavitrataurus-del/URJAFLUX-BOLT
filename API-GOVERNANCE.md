# API Governance Policy (API-GOVERNANCE.md)

## 1. API Versioning Policy
All public APIs strictly adhere to Semantic Versioning (SemVer) with URL paths matching major versions (e.g. `/api/v1`).

## 2. Deprecation & Retirement Policy
- **DEPRECATED Status:** Endpoints flagged as deprecated remain functional but trigger warning headers (`X-Urjaflux-Warning: Deprecated`) in API gateway responses.
- **RETIRED Status:** Retired routes are deleted or return `410 Gone`. Deprecation timelines span at least 6 months before retirement transitions are executed.

## 3. Rate Limiting
- **Standard Tier:** Max 50 requests per minute.
- **Premium Tier:** Max 50 requests per minute with higher concurrency allowances.
- **Enterprise Tier:** Max 100 requests per minute with custom priority thread pooling.

## 4. Request Signing & Auditing
All write operations (`POST`, `PUT`, `DELETE`) require HMAC request signing. Every transaction is appended to the immutable Audit Ledger in DOMAIN-015 to prevent non-repudiation.
