# Expert Consensus Engine Report

## Workflow Actions
Allows SME Acharyas to execute 9 consensus operations:
- `APPROVE`
- `REJECT`
- `FLAG`
- `COMMENT`
- `VOTE`
- `REQUEST_REVISION`
- `MERGE`
- `SPLIT`
- `CREATE_CONSENSUS`

## Consensus States
- `APPROVED_CANONICAL`: Requires at least 2 positive expert votes and zero unaddressed blocking flags.
- `PENDING_REVIEW`: Awaiting SME panel evaluation.
- `REJECTED`: Declined due to unverified claims.
- `REVISION_REQUESTED`: Sent back for re-extraction or additional scriptural citation.
