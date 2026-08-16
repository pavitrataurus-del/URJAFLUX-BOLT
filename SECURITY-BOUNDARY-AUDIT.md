# SECURITY-BOUNDARY-AUDIT.md

This document audits the security boundaries and validation interfaces of URJAFLUX AI OS, managed in integration with DOMAIN-017.

---

## 1. Authentication & Authorization Boundaries

All public endpoints, workspace actions, and sandbox executions are protected by standard verification filters.

```
                  Unauthenticated Request
                            │
                            ▼
               ┌──────────────────────────┐
               │    DOMAIN-017 Gateway    │
               └────────────┬─────────────┘
                            │ (Token Validation)
                            ▼
               ┌──────────────────────────┐
               │   Verified User Session  │
               └────────────┬─────────────┘
                            │ (Role-Based Access)
                            ▼
    ┌───────────────────────┼───────────────────────┐
    │                       │                       │
    ▼                       ▼                       ▼
Admin Console           Consultant Room         Standard Workspace
(All scopes)            (Room Scopes)           (Read-Only Scopes)
```

---

## 2. Platform Secrets Isolation

To maintain highest security, raw keys and internal tokens are never exposed.

- **Storage**: Secrets are stored in server-side configurations. No secret keys or credentials may be packaged in frontend client-side bundles or client memory structures.
- **Access Routing**:
  - The Gemini API key is utilized strictly on the server-side via `process.env.GEMINI_API_KEY` through the AI Gateway.
  - Workspace integration tokens are managed and validated on the backend.
  - Plugins never receive direct database keys or API credentials. All external calls are proxy-routed through `PluginSDK` under strict rate-limiting.

---

## 3. Sandboxing & Infraction Detection

The DOMAIN-019 Plugin Sandbox strictly enforces safe execution policies.

- **Sandbox Confinement**: Third-party plugins execute in an isolated environment. Attempted policy violations (e.g., unauthorized network requests or local storage manipulation) are blocked by the sandbox layer.
- **Audit Logging**: Any blocked request is flagged as a security infraction. The sandbox automatically logs the infraction details to the central audit trail and suspends the offending plugin.
- **Verification Logs**: All authentication and permission changes are recorded in the central audit registry, ensuring comprehensive traceability.
