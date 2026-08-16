# Reasoning Workspace UI Specification — DOMAIN-006

## Component Overview
`UnifiedReasoningWorkspace.tsx` is an interactive, enterprise-grade React workspace embedded directly into `KnowledgePage.tsx`.

## Key Workspace Views
1. **Header & Role Switcher**: Instant toggle between `ADMIN` and `END_USER` modes.
2. **Overview Dashboard**: High-level metrics for active sessions, total loaded entities, average confidence score, active cross-domain conflicts, and domain coverage breakdown.
3. **Session Creator Form**: Input property type, room/zone, element, planet, chakra, rashi, and problem statement to initiate an on-demand reasoning run.
4. **Context Graph Explorer**: Inspect graph nodes and edges across Vastu, Chakra, Lal Kitab, Numerology, Astrology, and User Context.
5. **Recommendation Explorer**: Search and filter recommendations by priority, category, and status. Features inline Admin controls for status overrides (Approve / Draft / Reject).
6. **Evidence Browser**: Displays canonical source book citations, authors, and verse references for every recommendation.
7. **Conflict Resolver Panel**: Highlights cross-domain friction with side-by-side claim comparisons and Admin override modal dialogs.
8. **Explainable Chains**: Renders step-by-step logic traces, rule hierarchies, and rejected evidence logs.
9. **Audit History Log**: Terminal-style timestamped event log for security auditing.
