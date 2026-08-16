# Workflow Engine Specification — DOMAIN-007

## Supported Workflow Statuses
The Workflow Engine supports 12 standardized statuses:
1. `DRAFT`: Initial preparation
2. `PLANNED`: Scheduled and structured in project plan
3. `APPROVED`: Formally approved for execution
4. `ASSIGNED`: Allocated to field engineer
5. `IN_PROGRESS`: Currently under field implementation
6. `WAITING`: Paused pending client input or material delivery
7. `BLOCKED`: Halted due to an unresolved site issue or conflict
8. `INSPECTION_PENDING`: Execution complete, awaiting site audit
9. `VERIFICATION_PENDING`: Audit complete, awaiting senior sign-off
10. `COMPLETED`: Fully verified and signed off
11. `REJECTED`: Declined during inspection or sign-off
12. `ARCHIVED`: Historical record archived

## State Transition Matrix
Transitions are enforced by `WorkflowEngineService.canTransition()` based on user role (`ADMIN`, `PROJECT_MANAGER`, `FIELD_ENGINEER`, `END_USER`). `END_USER` role cannot initiate workflow transitions.
