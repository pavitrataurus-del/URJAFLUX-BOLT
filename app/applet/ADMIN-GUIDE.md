# ENTERPRISE ADMINISTRATOR GUIDE
**URJAFLUX AI OS — Version BUILD-026I (RC-1)**

---

## 1. Role Capabilities
As an **ADMIN**, you have full operational visibility across URJAFLUX AI OS, including:
- Access to raw Decision Traces and AI Reasoning Chain logs.
- Full inspection of OCR, Knowledge Graph, and MasterChakraEngine calculations.
- Approval workflow management (Draft -> Pending Review -> Approved -> Published).
- Access to confidential metadata, source document references, and confidence scores.

## 2. Key Administrator Workspaces

### Vastu & Spatial Workspace
- Toggle between 8-Sector, 16-Sector, and 32-Sector Master Chakra overlays.
- Adjust Spatial Reference Matrix rotation angle and centroid offsets.
- Run rule evaluation on spatial objects and inspect severe/moderate non-compliance violations.

### Knowledge & Ontology Workspace
- Ingest documents (PDF, CAD, DXF, images) into dedicated namespaces.
- Monitor chunking, embedding generation, and source provenance.
- Manage domain ontology rules and entity relations.

### Report Center & Approval Center
- Generate Executive, Technical, Compliance, Explainability, and Audit reports.
- Review pending drafts from consultants and approve or reject submissions.
- Inspect full decision trace metadata prior to publishing client deliverables.

## 3. Security & Data Protection Rules
- Never expose internal system prompts or confidence scores outside the Admin view.
- Ensure report exports generated for external clients are rendered in "Client Mode" to redact system metadata.
