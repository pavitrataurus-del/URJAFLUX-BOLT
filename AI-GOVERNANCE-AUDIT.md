# AI-GOVERNANCE-AUDIT.md

This audit verifies the governance and policy enforcement of DOMAIN-018 across all AI-driven modules of URJAFLUX AI OS.

---

## 1. Decentralized AI Gateway & Abstraction

To ensure standard compliance and security, direct calls from individual domains to external AI providers (such as Gemini, OpenAI, or local weights) are strictly prohibited. All requests must route through the central AI Gateway.

```
       [Domain-012: Vision]   [Domain-007: Optimizer]
                 │                     │
                 └──────────┬──────────┘
                            │ (Request)
                            ▼
               ┌──────────────────────────┐
               │    DOMAIN-018 Gateway    │
               │ (Prompt, Audit, Controls)│
               └────────────┬─────────────┘
                            │ (Dispatched API Call)
                            ▼
               ┌──────────────────────────┐
               │     External Provider    │
               └──────────────────────────┘
```

---

## 2. Centralized Prompt Registry

- **Version Control**: Every system-wide LLM or Vision prompt is declared in the `PromptRegistry` and version-controlled.
- **Payload Validation**: The gateway checks and sanitizes inputs before passing them to external models. This prevents prompt injection attacks and ensures consistent outputs.
- **No Inline Prompts**: No developer may embed raw, unstructured inline prompt strings in individual domain files.

---

## 3. Cost Control & Telemetry Audits

The AI Gateway logs diagnostic metrics for every dispatched model call:

- **Token Consumption**: Logs both prompt and completion token counts.
- **Provider Cost Analysis**: Converts token usage to operational cost values based on live rates.
- **Call Latency**: Tracks response times to identify latency anomalies.
- **AI Audit Trail**: Compiles aggregated reports for administrators, enabling detailed tracking of AI-related expenses across different domains.
