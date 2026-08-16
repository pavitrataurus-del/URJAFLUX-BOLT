import { SpatialModel } from "../types/spatialModel";
import { SpatialRelationship } from "./relationshipTypes";

/**
 * Analyzes adjacencies and shared walls in the SpatialModel.
 */
export function analyzeAdjacencies(spatialModel: SpatialModel): SpatialRelationship[] {
  const relationships: SpatialRelationship[] = [];
  const { roomGraph, wallGraph } = spatialModel;

  // 1. Establish room-to-room graph adjacencies
  for (const room of roomGraph.rooms) {
    for (const adjId of room.adjacencies) {
      // Avoid duplicate undirected pairs by ordering IDs alphabetically or simply outputting both directions for full accessibility
      relationships.push({
        id: `rel_adj_${room.id}_${adjId}`,
        type: "adjacent_to",
        sourceId: room.id,
        targetId: adjId,
        confidence: 1.0,
        meta: {
          reason: "Graph proximity detection"
        }
      });
    }
  }

  // 2. Establish "shares_wall_with" relationships from Wall Graph
  for (const wall of wallGraph.walls) {
    if (wall.connectedRooms && wall.connectedRooms.length >= 2) {
      for (let i = 0; i < wall.connectedRooms.length; i++) {
        for (let j = i + 1; j < wall.connectedRooms.length; j++) {
          const rA = wall.connectedRooms[i];
          const rB = wall.connectedRooms[j];

          relationships.push({
            id: `rel_wall_share_${rA}_${rB}_via_${wall.id}`,
            type: "shares_wall_with",
            sourceId: rA,
            targetId: rB,
            confidence: 1.0,
            meta: {
              wallId: wall.id,
              wallType: wall.type
            }
          });

          // Bidirectional
          relationships.push({
            id: `rel_wall_share_${rB}_${rA}_via_${wall.id}`,
            type: "shares_wall_with",
            sourceId: rB,
            targetId: rA,
            confidence: 1.0,
            meta: {
              wallId: wall.id,
              wallType: wall.type
            }
          });
        }
      }
    }
  }

  return relationships;
}
