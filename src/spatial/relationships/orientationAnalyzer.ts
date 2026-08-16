import { Point2D } from "../../types/aiVision";
import { RoomNode, SpatialModel } from "../types/spatialModel";
import { EngineeringZone, SpatialRelationship, ZoneMapping } from "./relationshipTypes";

/**
 * Normalizes an angle to [0, 360) range
 */
export function normalizeAngle(angle: number): number {
  let norm = angle % 360;
  if (norm < 0) norm += 360;
  return norm;
}

/**
 * Converts an angle (degrees relative to North=0, clockwise) into an engineering cardinal/ordinal string
 */
export function angleToDirection(angle: number): string {
  const normalized = normalizeAngle(angle);
  if (normalized >= 337.5 || normalized < 22.5) return "North";
  if (normalized >= 22.5 && normalized < 67.5) return "Northeast";
  if (normalized >= 67.5 && normalized < 112.5) return "East";
  if (normalized >= 112.5 && normalized < 157.5) return "Southeast";
  if (normalized >= 157.5 && normalized < 202.5) return "South";
  if (normalized >= 202.5 && normalized < 247.5) return "Southwest";
  if (normalized >= 247.5 && normalized < 292.5) return "West";
  return "Northwest";
}

/**
 * Helper to calculate bounding box of all rooms
 */
export function calculateRoomsBoundingBox(rooms: RoomNode[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (!rooms || rooms.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const r of rooms) {
    for (const pt of r.polygon) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Performs engineering classification of coordinates into 9 distinct zones
 */
export function getEngineeringZone(u: number, v: number): EngineeringZone {
  // Center is middle-third of both dimensions
  if (u >= 0.35 && u <= 0.65 && v >= 0.35 && v <= 0.65) {
    return "Center";
  }

  if (v < 0.35) {
    // Top Row (North in traditional 2D layout where v=0 is Top)
    if (u < 0.35) return "Northwest";
    if (u > 0.65) return "Northeast";
    return "North";
  } else if (v > 0.65) {
    // Bottom Row (South in traditional 2D layout where v=1 is Bottom)
    if (u < 0.35) return "Southwest";
    if (u > 0.65) return "Southeast";
    return "South";
  } else {
    // Middle Row
    if (u < 0.35) return "West";
    return "East";
  }
}

/**
 * Analyzes compass-oriented spatial relationships and zone configurations.
 */
export function analyzeOrientations(spatialModel: SpatialModel): {
  relationships: SpatialRelationship[];
  zoneMappings: ZoneMapping[];
  globalCentroid: Point2D;
} {
  const relationships: SpatialRelationship[] = [];
  const { roomGraph, windowGraph, compassGeometry } = spatialModel;

  // 1. Calculate overall global centroid (center of gravity of all rooms)
  let sumX = 0;
  let sumY = 0;
  const totalRooms = roomGraph.rooms.length;
  
  for (const r of roomGraph.rooms) {
    sumX += r.centroid.x;
    sumY += r.centroid.y;
  }
  
  const globalCentroid = totalRooms > 0 
    ? { x: sumX / totalRooms, y: sumY / totalRooms } 
    : { x: 0, y: 0 };

  // 2. Map rooms to 9 Engineering Zones
  const bounds = calculateRoomsBoundingBox(roomGraph.rooms);
  const width = bounds.maxX - bounds.minX || 1;
  const height = bounds.maxY - bounds.minY || 1;

  const zoneMappings: ZoneMapping[] = roomGraph.rooms.map((room) => {
    // Normalize coordinates to [0, 1] range relative to bounding box
    const u = (room.centroid.x - bounds.minX) / width;
    const v = (room.centroid.y - bounds.minY) / height;
    
    const zone = getEngineeringZone(u, v);

    return {
      roomId: room.id,
      normalizedCentroid: { x: u, y: v },
      zone
    };
  });

  // 3. Generate orientation relationships (north_of, south_of, etc.)
  // Compare every room with every other room
  for (let i = 0; i < roomGraph.rooms.length; i++) {
    const rA = roomGraph.rooms[i];
    for (let j = 0; j < roomGraph.rooms.length; j++) {
      if (i === j) continue;
      const rB = roomGraph.rooms[j];

      // Vector from B to A
      const dx = rA.centroid.x - rB.centroid.x;
      const dy = rA.centroid.y - rB.centroid.y;

      // In canvas coordinates, y-axis is inverted (down is positive)
      // So dy < 0 means A is above B (North of B)
      // dy > 0 means A is below B (South of B)
      // dx > 0 means A is right of B (East of B)
      // dx < 0 means A is left of B (West of B)

      if (Math.abs(dy) > Math.abs(dx)) {
        if (dy < 0) {
          relationships.push({
            id: `rel_orient_north_${rA.id}_${rB.id}`,
            type: "north_of",
            sourceId: rA.id,
            targetId: rB.id,
            confidence: 1.0,
            meta: { dx, dy }
          });
        } else {
          relationships.push({
            id: `rel_orient_south_${rA.id}_${rB.id}`,
            type: "south_of",
            sourceId: rA.id,
            targetId: rB.id,
            confidence: 1.0,
            meta: { dx, dy }
          });
        }
      } else {
        if (dx > 0) {
          relationships.push({
            id: `rel_orient_east_${rA.id}_${rB.id}`,
            type: "east_of",
            sourceId: rA.id,
            targetId: rB.id,
            confidence: 1.0,
            meta: { dx, dy }
          });
        } else {
          relationships.push({
            id: `rel_orient_west_${rA.id}_${rB.id}`,
            type: "west_of",
            sourceId: rA.id,
            targetId: rB.id,
            confidence: 1.0,
            meta: { dx, dy }
          });
        }
      }

      // Detailed relative position vector metadata
      relationships.push({
        id: `rel_pos_${rA.id}_${rB.id}`,
        type: "relative_position",
        sourceId: rA.id,
        targetId: rB.id,
        confidence: 1.0,
        meta: {
          directionVector: { x: dx, y: dy },
          distance: Math.sqrt(dx * dx + dy * dy)
        }
      });
    }
  }

  // 4. Analyze Window Orientations
  for (const win of windowGraph.windows) {
    // orientation relative to northAngle
    const relativeAngle = win.orientation + compassGeometry.northAngle;
    const direction = angleToDirection(relativeAngle);

    relationships.push({
      id: `rel_win_face_${win.id}`,
      type: "window_faces",
      sourceId: win.id,
      targetId: direction,
      confidence: 1.0,
      meta: {
        rawAngle: win.orientation,
        relativeAngle,
        wallReferenceId: win.wallReferenceId
      }
    });
  }

  // 5. Analyze Entrance Direction (Main Entrance facing)
  // Let's identify external/exterior doors
  const { doorGraph, wallGraph } = spatialModel;
  const exteriorDoors = doorGraph.doors.filter((d) => {
    if (!d.wallReferenceId) return d.roomConnections.length <= 1;
    const wall = wallGraph.walls.find((w) => w.id === d.wallReferenceId);
    return wall?.type === "exterior" || d.roomConnections.length <= 1;
  });

  // If there is an exterior door, treat the first one as the main entrance (developer mock fallback model)
  if (exteriorDoors.length > 0) {
    const mainEntrance = exteriorDoors[0];
    const rawAngle = mainEntrance.swingDirection.includes("outward") ? 180 : 0; // facing direction heuristic
    const entranceFacingAngle = rawAngle + compassGeometry.northAngle;
    const facingDirection = angleToDirection(entranceFacingAngle);

    relationships.push({
      id: `rel_entrance_face_${mainEntrance.id}`,
      type: "main_entrance_faces",
      sourceId: mainEntrance.id,
      targetId: facingDirection,
      confidence: 1.0,
      meta: {
        doorId: mainEntrance.id,
        facingDirection,
        isExterior: true
      }
    });
  }

  return {
    relationships,
    zoneMappings,
    globalCentroid
  };
}
