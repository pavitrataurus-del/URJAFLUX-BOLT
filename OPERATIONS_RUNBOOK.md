# URJAFLUX Enterprise AI OS - SRE Operations Runbook & Deployment Guide
**Release Version:** 1.0.0-RC1  
**Environment:** Cloud Run / Containerized Linux Architecture  
**Author:** Principal SRE & Cloud Infrastructure Engineering Team  

---

## 1. Deployment Architecture & Infrastructure Overview

The URJAFLUX AI OS platform is deployed as a single, multi-stage Node.js container image running behind an NGINX reverse proxy on port 3000. 

### Key Runtime Specs
- **Port:** 3000 (Hardcoded Cloud Run ingress port)
- **Node Runtime:** Node.js v20 LTS Alpine
- **Database Backend:** Firebase Firestore (`remixed-firestore-database-id`)
- **AI Engine:** Gemini 3.6 Flash & Gemini 2.5 Pro via Server-Side `/api/gemini/*` proxies
- **Security:** CSRF Validation, HttpOnly Cookies, SameSite Lax, HSTS, CSP, JWT Bearer Access Tokens (15 min expiry) + Refresh Tokens (7 day expiry)

---

## 2. Health & Liveness Endpoints

The application exposes standard Kubernetes / Cloud Run health probes:

| Endpoint | Method | Purpose | Success Code |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | Full telemetry payload (Memory RSS/Heap, Uptime, Integrations) | `200 OK` |
| `/ready` | `GET` | Readiness probe (Verifies Gemini & Database readiness) | `200 OK` (or `503 Service Unavailable`) |
| `/live` | `GET` | Container liveness ping | `200 OK` |

### Sample `/health` Response
```json
{
  "status": "HEALTHY",
  "service": "URJAFLUX AI OS Enterprise Engine",
  "version": "1.0.0-RC1",
  "timestamp": "2026-07-27T13:30:00.000Z",
  "uptimeSeconds": 3600,
  "system": {
    "memory": { "rssMb": 85, "heapTotalMb": 60, "heapUsedMb": 42 },
    "nodeVersion": "v20.11.0",
    "platform": "linux"
  },
  "integrations": {
    "firestore": "ONLINE",
    "geminiAi": "CONFIGURED",
    "authentication": "ACTIVE"
  }
}
```

---

## 3. Incident Response & Disaster Recovery

### Standard Operating Procedures (SOP)

#### Incident 1: High Memory Usage (> 85% JS Heap)
1. Navigate to **SRE Pilot Dashboard** -> **Performance Telemetry**.
2. Inspect `memoryHeapUsedMb` vs `memoryHeapTotalMb`.
3. Force a container restart via Cloud Run console if JS Heap exceeds 1800 MB.
4. Auto-recovery mechanism will flush transient canvas buffers without data loss (project state is persisted in Firestore).

#### Incident 2: Gemini API Outage / Rate Limit
1. `/ready` probe will return `503 Service Unavailable`.
2. `RetryManager` automatically executes exponential backoff with jitter up to 3 attempts.
3. If API limits persist, UI falls back gracefully to offline spatial calculations and cached Vastu rule logic.

#### Incident 3: Network Disconnect / Offline Mode
1. `OfflineRecoveryService` intercepts lost network connections.
2. User actions (drawings, Vastu edits) are queued in local browser state.
3. Upon reconnection, queued offline actions automatically flush and sync to Firestore.

---

## 4. Rollback Strategy

1. **Blue/Green Cloud Run Deployment:**
   ```bash
   # Revert to previous container image tag
   gcloud run services update-traffic urjaflux-ai-os \
     --to-revisions=urjaflux-ai-os-00041-v1=100
   ```
2. **Database Rollback:**
   - Firestore security rules are versioned in `firestore.rules`.
   - Restore Firestore snapshot via standard GCP backup restore workflow if state corruption occurs.

---

## 5. Security & Compliance Checklist

- [x] All Gemini API keys held strictly server-side in `process.env.GEMINI_API_KEY`
- [x] Security headers enforced (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `HSTS`, `CSP`)
- [x] CSRF Tokens validated on all mutation endpoints (`PUT`, `POST`, `DELETE`)
- [x] Audit logs recorded for all authentication and security events (`/api/auth/audit-logs`)
- [x] Multi-stage slim Docker image free of dev dependencies in final runner layer
