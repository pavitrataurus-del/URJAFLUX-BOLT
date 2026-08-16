# DOMAIN-002A: Relationship Extraction Engine Report

## 13 Canonical Relationship Types

The **Relationship Extraction Engine** detects semantic links between entities to generate knowledge graph edges:

| Relationship Type | Description | Example Edge |
|---|---|---|
| `SUPPORTS` | Source entity strengthens target entity | Muladhara -> Svadhisthana |
| `BALANCES` | Source entity harmonizes target entity | Muladhara -> Sahasrara |
| `BLOCKS` | Source entity restricts flow in target | Concrete Overhead Load -> Ishan Water Zone |
| `AFFECTS` | Operational influence | Agni Fire Quadrant -> Digestion / Pancreas |
| `LOCATED_IN` | Spatial placement mapping | Water Reservoir -> North-East Ishan Zone |
| `ASSOCIATED_WITH` | Symbolic correspondence | Crimson Red -> Root Chakra |
| `CONNECTED_TO` | Structural linkage | Heart Chakra -> Throat Chakra |
| `CONFLICTS_WITH` | Contradictory placement | Toilet -> North-East Ishan Zone |
| `INTERACTS_WITH` | Reciprocal interplay | Sacral Chakra -> Solar Plexus Chakra |
| `DEPENDS_ON` | Prerequisite dependency | Sahasrara -> Ajna Chakra |
| `REMEDIED_BY` | Rectification mapping | SE Zone Fire Defect -> Copper Helix Rectifier |
| `INFLUENCES` | Downstream impact | Throat Chakra -> Truthful Speech |
| `RELATED_TO` | General association | Vetiver Herb -> Earth Element |

---

## Edge Metadata & Candidate Approval

Every extracted relationship edge stores:
* Source Entity ID & Name
* Target Entity ID & Name
* Relationship Type
* Weight (0.00 to 1.00)
* Evidence Text Snippet
* Page & Paragraph References
* Approval Status (`Candidate` | `Approved` | `Rejected`)
