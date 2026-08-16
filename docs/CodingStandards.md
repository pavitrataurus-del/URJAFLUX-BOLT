# Engineering Coding Standards

This document establishes the architecture conventions, TypeScript structures, and clean coding guidelines required for developing and maintaining the **URJAFLUX AI OS** platform.

---

## 1. Architectural Patterns

### The Repository Pattern
To maintain a modular codebase and decouple storage engines from core domain logic:
* **Rule**: All direct database queries (Firestore, LocalStorage, etc.) must reside exclusively inside repository files (e.g., `/src/repositories/`).
* **Enforcement**: Services are strictly forbidden from directly calling Firestore methods like `collection()`, `getDoc()`, or `setDoc()`. Services must interact with data only by calling repository methods.

### The Service Pattern
Services coordinate business logic and transaction boundaries:
* **Rule**: Services must be completely stateless, accepting all active parameters (such as `RuleContext`) as method arguments.
* **Responsibilities**:
  * Implement connection checks and local fallbacks.
  * Delegate math, geometry calculations, and AST evaluations to dedicated engines.

---

## 2. Naming Conventions

### Directory Naming
* **Rule**: All directories in the repository must use `camelCase` or `kebab-case` (e.g., `src/engines/ruleEngine/`, `src/vastu/`). Do not use spaces or capital letters in directory names.

### File Naming
* **React Components**: Must use `PascalCase` matching the default component export (e.g., `SpatialAnnotationEngine.tsx`).
* **TypeScript Files & Utilities**: Must use `camelCase` (e.g., `coordinateNormalizer.ts`, `isLogicalCondition.ts`).
* **Interfaces & Constants**: Must match their target domain module in `camelCase` (e.g., `ruleEngine.ts`).

---

## 3. TypeScript Standards

### Enforce Strict Typing
* **Rule**: Explicit `any` is strictly prohibited. Avoid utilizing `any` or casting with `as any`.
* **Strategy**: If a shape is unknown or highly extensible, use `Record<string, unknown>` or generic parameters (`<T>`) rather than fallback any types.

### Enums vs. Types
* **Rule**: Use standard `enum` declarations for state flags or status types (e.g., `SourceStatus`), and use standard `type` or `interface` for data schemas. Never use `const enum`.

### Import and Export Discipline
* **Rule**:
  * Place all imports at the top level of the file.
  * Use **named imports** exclusively. Object destructuring from module packages is forbidden to allow treeshaking.
  * Avoid `import type` when importing standard `enum` values to prevent build-time strip errors.

---

## 4. Robust Error Handling & Logging

### Offline Resiliency
* When writing data, always wrap database transactions in try-catch-finally blocks.
* If a remote database call fails (due to network disruption or unconfigured credentials), catch the error, log a clear warning, and fall back to local offline operations seamlessly.

### Structured Logs
* Avoid raw `console.log` statements in core engines. Use namespace tags to make log streams scannable in developers' consoles:
  * `[URJAFLUX Engine]`: For core calculation updates.
  * `[URJAFLUX Repository]`: For query state logs.
  * `[URJAFLUX Sync]`: For database offline sync warnings.
* Log execution latencies using `performance.now()` for all complex mathematical calculations.
