import { KnowledgePack } from "../types/knowledgeTypes";

export const coreKnowledgePack: KnowledgePack = {
  id: "pack_core_placeholder_01",
  name: "Core Infrastructure Knowledge Pack",
  description: "A foundational placeholder pack containing architectural structure templates and schemas.",
  version: "1.0.0",
  author: "URJAFLUX System",
  category: "infrastructure",
  enabled: true,
  items: [
    {
      id: "item_placeholder_geometric_01",
      category: "infrastructure",
      title: "Geometric Coordinate Proximity Reference",
      content: "A standard structural definition for testing spatial queries and polygon alignments.",
      references: [
        {
          sourceId: "source_infrastructure_spec_2026",
          section: "Section 4.2 - Coordinate Offsets",
          citationText: "Adjacent boundary values must align on standard Cartesian intervals."
        }
      ],
      metadata: {
        tags: ["spatial", "geometry", "placeholder"],
        createdAt: "2026-07-17T03:00:00Z",
        updatedAt: "2026-07-17T03:00:00Z",
        version: "1.0.0"
      },
      properties: {
        gridAlignment: "orthogonal",
        maxTolerance: 0.15
      }
    },
    {
      id: "item_placeholder_energy_01",
      category: "infrastructure",
      title: "Flow Vector Boundary Guidelines",
      content: "Defines generic energy vectors for spatial flow optimization simulations.",
      references: [
        {
          sourceId: "source_infrastructure_spec_2026",
          section: "Section 9.1 - Fluid Paths",
          citationText: "Optimal flow maps avoid intersecting perpendicular structural partitions."
        }
      ],
      metadata: {
        tags: ["flow", "energy", "placeholder"],
        createdAt: "2026-07-17T03:00:00Z",
        updatedAt: "2026-07-17T03:00:00Z",
        version: "1.0.0"
      },
      properties: {
        idealAngle: 90,
        flowCoef: 1.0
      }
    }
  ]
};
