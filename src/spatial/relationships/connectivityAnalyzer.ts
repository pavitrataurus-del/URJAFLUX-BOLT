import { SpatialModel } from "../types/spatialModel";
import { SpatialRelationship } from "./relationshipTypes";

/**
 * Analyzes architectural portals (doors, openings) to establish topological pathways.
 */
export function analyzeConnectivity(spatialModel: SpatialModel): SpatialRelationship[] {
  const relationships: SpatialRelationship[] = [];
  const { doorGraph } = spatialModel;

  for (const door of doorGraph.doors) {
    if (door.roomConnections && door.roomConnections.length >= 2) {
      const roomA = door.roomConnections[0];
      const roomB = door.roomConnections[1];

      // 1. door_connects relationship
      relationships.push({
        id: `rel_door_conn_${door.id}_${roomA}_${roomB}`,
        type: "door_connects",
        sourceId: roomA,
        targetId: roomB,
        confidence: 1.0,
        meta: {
          doorId: door.id,
          swingDirection: door.swingDirection,
          isOpen: door.isOpen
        }
      });

      relationships.push({
        id: `rel_door_conn_${door.id}_${roomB}_${roomA}`,
        type: "door_connects",
        sourceId: roomB,
        targetId: roomA,
        confidence: 1.0,
        meta: {
          doorId: door.id,
          swingDirection: door.swingDirection,
          isOpen: door.isOpen
        }
      });

      // 2. general connected_to relationship
      relationships.push({
        id: `rel_connected_${roomA}_${roomB}`,
        type: "connected_to",
        sourceId: roomA,
        targetId: roomB,
        confidence: 1.0,
        meta: {
          connectorId: door.id,
          connectorType: "door"
        }
      });

      relationships.push({
        id: `rel_connected_${roomB}_${roomA}`,
        type: "connected_to",
        sourceId: roomB,
        targetId: roomA,
        confidence: 1.0,
        meta: {
          connectorId: door.id,
          connectorType: "door"
        }
      });
    }
  }

  return relationships;
}
