# DOMAIN-003 — Lal Kitab Relationship Model Specification

## Overview
The **Lal Kitab Relationship Model** maps directional, structural, and elemental dependencies connecting planets, houses, remedies, metals, and spatial zones into the URJAFLUX Knowledge Graph.

## Supported Relationship Types
1. **`RULES`**: Defines house governorship (e.g. `Surya` RULES `Bhav 1`).
2. **`LOCATED_IN`**: Connects physical artifacts or remedies to spatial directions (e.g. `Solid Silver` LOCATED_IN `North-West`).
3. **`ENHANCES`**: Indicates positive elemental amplification (e.g. `Solid Silver in Water` ENHANCES `Chandra`).
4. **`WEAKENS`**: Indicates dampening of malefic vibrations.
5. **`AVOIDS`**: Highlights contraindicated materials or placements.
6. **`CONTRADICTS`**: Maps scriptural oppositions (e.g. `Shani` CONTRADICTS `Surya`).
7. **`DEPENDS_ON`**: Conditional dependencies (e.g. `Remedy` DEPENDS_ON `Active Water Drain`).
8. **`REQUIRES`**: Material prerequisites (e.g. `Remedy` REQUIRES `Pure 999 Silver`).
9. **`AFFECTS`**: Inter-planetary or spatial zone impacts.
10. **`ASSOCIATED_WITH`**: General semantic correlation.
11. **`REFERENCES`**: Book and chapter citation links.
12. **`RELATED_TO`**: Cross-domain links to Vastu zones or Chakra nodes.

## Knowledge Graph Topology Integration
All Lal Kitab relationships export as node-edge tuples into the central Knowledge Graph, enabling cross-domain graph traversal between Vastu zones (DOMAIN-001), Chakra nodes (DOMAIN-002), Ingested Documents (DOMAIN-002A), and Truth Graph lineages (DOMAIN-002B).
