# DOMAIN-002: Chakra Duplicate Detection & Merge Report

## Engine Mechanism

The **Chakra Duplicate Engine** (`ChakraDuplicateEngine.ts`) performs string distance and semantic vector similarity scanning across titles, Sanskrit aliases, Bija mantras, symbols, and remedies. Matches exceeding a 0.85 similarity threshold are flagged for expert approval before merging.

---

## Detected Duplicate Candidates & Merge Actions

| Source Node | Matched Canonical Node | Similarity Score | Match Type | Recommendation | Action Status |
|---|---|---|---|---|---|
| "Root Energy Center (Base Chakra)" | `chk-001` (Muladhara) | **0.94** | Duplicate Chakra Entity | Reject & Merge | Ready for Merge |
| "Terracotta Earth Vessel Remedy" | `rem-earth-001` (Terracotta Clay Pot) | **0.88** | Duplicate Remedy | Flag for Expert Review | Pending SME Review |
| "LAM Seed Acoustics" | `mantra-lam-001` (LAM Bija Mantra) | **0.96** | Duplicate Mantra | Reject & Merge | Ready for Merge |
| "Yellow Prithvi Square Symbol" | `symbol-sq-001` (Prithvi Square) | **0.91** | Duplicate Symbol | Flag for Expert Review | Pending SME Review |

---

## Expert Merge Protocol Rules

1. **No Automatic Destructive Merges**: The engine never auto-deletes candidate nodes.
2. **Merge Workflow**: Clicking "Merge Nodes" in `ChakraKnowledgeLibraryWorkspace` redirects all incoming relationship edges to the primary canonical entity before archiving the duplicate node.
3. **Audit Trail**: Every merge operation creates a `IRevisionHistory` entry tracking the merging administrator, date, and merged node IDs.
