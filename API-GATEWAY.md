# REST API Gateway (API-GATEWAY.md)

## 1. Description
The REST API Gateway routes external inbound requests to versioned, validated, and optimized endpoints.

## 2. Technical Contracts
- **Resource Routing:** Maps REST verbs to resource handlers.
- **Versioned Endpoints:** Endpoints are strictly mapped under `/api/v1` or `/api/v2`.
- **Request & Response Validation:** Standardized JSON-Schema matching verifies formats before executing underlying domain engines.
- **Pagination & Filtering:** Supported using query-string parameters (`limit`, `offset`, `sortBy`, `filter`).
- **Error Standardization:** All failures return compliant JSON structure:
  ```json
  {
    "error": {
      "code": "BAD_REQUEST" | "UNAUTHORIZED" | "RATE_LIMIT_EXCEEDED" | "INTERNAL_ERROR",
      "message": "Detailed description of the failure cause.",
      "timestamp": "ISO_TIMESTAMP"
    }
  }
  ```
- **OpenAPI Specification:** Dynamically generated spec file detailing routing paths.
