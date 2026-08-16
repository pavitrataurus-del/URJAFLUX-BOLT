import { Point2D, DoorDetection, WindowDetection } from "../../types/aiVision";
import { DoorGraph, DoorNode, RoomNode, WallGraph, WallSegment, WindowGraph, WindowNode } from "../types/spatialModel";
import { pointToSegmentDistance } from "../geometry/wallGraph";

/**
 * Finds the nearest wall ID for a given point (e.g., center of door or window)
 */
export function findNearestWall(
  point: Point2D,
  wallGraph: WallGraph,
  maxDistancePx: number = 35
): string | undefined {
  let nearestWallId: string | undefined = undefined;
  let minDistance = Infinity;

  for (const wall of wallGraph.walls) {
    const dist = pointToSegmentDistance(point, wall.startPoint, wall.endPoint);
    if (dist < minDistance && dist <= maxDistancePx) {
      minDistance = dist;
      nearestWallId = wall.id;
    }
  }

  return nearestWallId;
}

/**
 * Heuristically determines which rooms are linked by a door
 */
export function findDoorConnectedRooms(
  doorCenter: Point2D,
  rooms: RoomNode[],
  nearestWall: WallSegment | undefined,
  maxDistancePx: number = 40
): string[] {
  // If we have a nearest wall, we should prefer rooms adjacent to that wall
  const candidateRooms = nearestWall && nearestWall.connectedRooms.length > 0 
    ? rooms.filter((r) => nearestWall.connectedRooms.includes(r.id)) 
    : rooms;

  const connected: string[] = [];
  
  for (const room of candidateRooms) {
    // Check if door is within threshold distance of any point on room boundary
    let isClose = false;
    for (const vert of room.polygon) {
      const dx = vert.x - doorCenter.x;
      const dy = vert.y - doorCenter.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= maxDistancePx) {
        isClose = true;
        break;
      }
    }

    // Check distance to room centroid as well
    if (!isClose) {
      const dx = room.centroid.x - doorCenter.x;
      const dy = room.centroid.y - doorCenter.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= maxDistancePx * 2) {
        isClose = true;
      }
    }

    if (isClose) {
      connected.push(room.id);
    }
  }

  // If no rooms matched through point proximity, fall back to the wall's connected rooms
  if (connected.length === 0 && nearestWall) {
    return nearestWall.connectedRooms;
  }

  return connected;
}

/**
 * Builds the door graph by mapping door detections to wall references and connected rooms
 */
export function buildDoorGraph(
  detections: DoorDetection[],
  wallGraph: WallGraph,
  rooms: RoomNode[]
): DoorGraph {
  const doors: DoorNode[] = detections.map((det) => {
    const nearestWallId = findNearestWall(det.center, wallGraph);
    const nearestWall = nearestWallId 
      ? wallGraph.walls.find((w) => w.id === nearestWallId) 
      : undefined;
      
    const roomConnections = findDoorConnectedRooms(det.center, rooms, nearestWall);
    
    // Categorize swing direction based on door angle detection
    const swingDirection = det.angle > 45 && det.angle < 135 
      ? "inward-left" 
      : det.angle >= 135 && det.angle < 225 
        ? "inward-right" 
        : "outward-left";

    return {
      id: det.id,
      wallReferenceId: nearestWallId,
      roomConnections,
      center: det.center,
      width: det.widthPx,
      swingDirection,
      isOpen: det.isOpen
    };
  });

  return {
    doors
  };
}

/**
 * Builds the window graph by mapping window detections to wall references
 */
export function buildWindowGraph(
  detections: WindowDetection[],
  wallGraph: WallGraph
): WindowGraph {
  const windows: WindowNode[] = detections.map((det) => {
    const nearestWallId = findNearestWall(det.center, wallGraph);

    return {
      id: det.id,
      wallReferenceId: nearestWallId,
      center: det.center,
      width: det.widthPx,
      orientation: det.angle
    };
  });

  return {
    windows
  };
}
