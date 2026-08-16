# AI-REASONING-CONSOLE
## URJAFLUX AI OS

### Overview
The AI Reasoning Console provides transparency into the "black box" of AI. It allows experts to watch the system think, trace its logic, and audit its decisions.

### Layout & Components

#### 1. Header: Orchestrator Status
- Global status of the Multi-Expert Orchestrator (Idle, Analyzing, Resolving Conflicts).
- Badges showing active Expert Engines (e.g., `[VastuExpert]`, `[SafetyExpert]`).

#### 2. Main Split View
**Left Pane: Live Execution Stream (Terminal Style)**
- Real-time scrolling list of events emitted by the engines.
- Formatted like structured logs:
  - `[INFO] [VastuExpert] Evaluating Zone: NE`
  - `[WARN] [VastuExpert] Conflict detected: Kitchen in NE`
  - `[ACTION] [Orchestrator] Requesting resolution from Senior Logic Engine`
- Filters to show/hide specific log levels or specific experts.

**Right Pane: Decision Trace Detail**
When a specific log entry or final recommendation is clicked in the stream, this pane shows the immutable trace.
- **Decision ID:** Unique hash.
- **Trigger Rule:** The exact logic rule that fired.
- **Input Context:** The exact state of the Digital Twin / Knowledge Graph at the moment of evaluation.
- **Output:** The resulting recommendation.

#### 3. Bottom Panel: Metrics & Diagnostics
- Engine execution times (e.g., "Vastu Evaluation took 450ms").
- Memory usage of reasoning agents.
- Conflict resolution rate.

### UX Goal
Make the user feel like they are overseeing a team of junior analysts. The system shows its work, explains its reasoning, and allows the human to audit the trail.
