# Approval Workflow Specification — DOMAIN-007

## Multi-Level Sign-Off Hierarchy
1. **Field Engineer**: Submits completed task checklists and uploaded site evidence.
2. **Senior Consultant**: Verifies shastric alignment against original DOMAIN-006 recommendations.
3. **Project Manager**: Validates completion schedule and resource allocation.
4. **Administrator**: Final governance sign-off and project milestone lock.

## Digital Signature
Each approval generates a cryptographic hash (`digitalSignatureHash`) recording decision timestamp, approver role, and comments.
