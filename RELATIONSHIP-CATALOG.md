# RELATIONSHIP CATALOG
## URJAFLUX AI OS — DOMAIN-001

DOCUMENT VERSION: 1.0  
DATE: 2026-07-26  
GRAPH STATUS: Graph API Linked & Verified  

---

### KNOWLEDGE GRAPH RELATIONSHIP SCHEME

The Vastu Knowledge Graph links entities using 10 formal relationship types to power explainable AI analysis and spatial reasoning.

---

### FORMAL RELATIONSHIP TYPES

1. `LOCATED_IN`: Indicates ideal directional or zonal placement (e.g., Kitchen -> South-East).
2. `ASSOCIATED_WITH`: Links elements, colors, and planets (e.g., Water Element -> North-East).
3. `CAUSES`: Identifies causal defects (e.g., Toilet in NE -> Health Disruption).
4. `AFFECTS`: Denotes directional influence on life aspects (e.g., SE Defect -> Cash Flow).
5. `BALANCES`: Describes elemental equilibrium (e.g., Sri Yantra -> NE Energy).
6. `REMEDIES`: Specifies energetic corrections (e.g., Copper Helix -> SE Fire Defect).
7. `RULES`: Denotes deity or planetary governance (e.g., Kubera -> North Direction).
8. `GOVERNS`: Specifies zone control (e.g., Water Element -> Financial Liquidity).
9. `SUPPORTS`: Identifies complementary elements (e.g., Air Element supports Fire Element).
10. `CONFLICTS_WITH`: Identifies elemental oppositions (e.g., Water Element conflicts with Fire Element).

---

### CANONICAL RELATIONSHIP CATALOG

| Rel. ID | Source Entity | Relationship Type | Target Entity | Weight | Approval Status |
|:---|:---|:---|:---|:---|:---|
| `rel-1` | Kitchen (`ent-r-1`) | `LOCATED_IN` | Fire Element (`ent-e-2`) | 1.00 | Approved |
| `rel-2` | Puja Room (`ent-r-3`) | `LOCATED_IN` | Water Element (`ent-e-1`) | 1.00 | Approved |
| `rel-3` | Sri Yantra (`ent-rem-1`) | `BALANCES` | Water Element (`ent-e-1`) | 0.95 | Approved |
| `rel-4` | Copper Helix (`ent-rem-4`) | `REMEDIES` | Fire Element (`ent-e-2`) | 0.95 | Approved |
| `rel-5` | Kubera (`ent-d-5`) | `GOVERNS` | Water Element (`ent-e-1`) | 0.98 | Approved |
