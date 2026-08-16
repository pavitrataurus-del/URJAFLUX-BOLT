# Expert Consensus Workflow Report

## Overview
The **Expert Consensus Engine** manages voting workflows for human Subject Matter Experts (SMEs), Acharyas, and domain reviewers.

## Action Types
- `APPROVE`: Cast positive vote toward canonical status.
- `REJECT`: Cast negative vote against rule promotion.
- `REQUEST_REVISION`: Flag rule statement for text refinement or additional source citations.
- `CREATE_CONSENSUS`: Admin override to finalize consensus state.

## Thresholds
- **Approved Canonical**: Requires at least 2 positive expert approvals and positive net votes.
- **Rejected**: Requires majority negative expert votes (≥2).
- **Revision Requested**: Triggered when any expert flags required revisions.
