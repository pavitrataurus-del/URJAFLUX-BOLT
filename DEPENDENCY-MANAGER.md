# DOMAIN-019: Dependency Resolution Engine

The dependency manager resolves the entire plugin dependency graph before authorizing installations.

## 1. Resolution Rules
- **Version Bounds**: Parses version constraint operators (e.g. `>=1.0.0 <2.0.0`) against active packages to prevent code regressions.
- **Conflict Detection**: Blocks installations if multiple active plugins request contradictory sub-packages.
- **Circular Reference Prevention**: Employs a Depth-First Search (DFS) algorithm to scan the dependency tree before mounting hooks. If a cyclic path is identified, the validation check immediately throws an error and suspends installation.

## 2. DFS Cyclic Detection Path
```
   [Active Plugin A] ──(Requires)──► [Plugin B]
          ▲                              │
          │                           (Requires)
          │                              ▼
    Cyclic Error ◄──────(Requires)─── [Plugin C]
```
The dependency validation UI immediately outputs a trace of the circular path to help developers debug import chains.
