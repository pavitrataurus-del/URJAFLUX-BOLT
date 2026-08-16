# URJAFLUX AI OS — DOMAIN-013 Business Rules Engine
## Declarative Orchestration Logic

### 1. Conceptual Framework
The Rules Engine provides conditional evaluators that parse system-wide event payloads and take orchestration actions without introducing heavy direct dependencies.

---

### 2. Supported Rule Classes
1. **Threshold Rules:** Numeric checks (e.g., alert if Vastu deviation exceeds `25%`).
2. **Status Rules:** Execute logic when a project shifts statuses.
3. **Role & Priority Rules:** Direct urgent safety issues to specialized queues based on severity scores.

---

### 3. Execution Pipeline
* **Trigger:** An event is registered on the Event Bus.
* **Evaluation:** Evaluates conditions (AND/OR conjunctions) against payload metadata.
* **Orchestration Action:** Triggers a state machine, dispatches an alert, or assigns an operational checklist task.
