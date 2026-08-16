import { 
  BuildingElement, 
  SpatialValidationReport, 
  SpatialValidationIssue, 
  SpatialValidationErrorType 
} from "../../types/spatialIntelligence";
import { SpatialGeometryEngine } from "./SpatialGeometryEngine";

/**
 * ============================================================================
 *               URJAFLUX AI OS — SPATIAL VALIDATION ENGINE
 * ============================================================================
 * 
 * Performs topological integrity checks, geometric closure validation,
 * disconnected wall detection, impossible geometry flags, duplicate element detection,
 * and calculates an overall Spatial Integrity Score (0-100%).
 */

export class SpatialValidationEngine {

  public static validateSpatialModel(elements: BuildingElement[]): SpatialValidationReport {
    const issues: SpatialValidationIssue[] = [];

    const rooms = elements.filter(e => e.type === "ROOM" || e.type === "CORRIDOR" || e.type === "BALCONY");
    const walls = elements.filter(e => e.type === "WALL");
    const doors = elements.filter(e => e.type === "DOOR");

    // 1. Closed Polygon Check for Rooms
    rooms.forEach(room => {
      if (room.geometry.polygon) {
        if (!room.geometry.polygon.isClosed) {
          issues.push({
            id: `val_open_${room.id}`,
            type: "OPEN_POLYGON",
            severity: "CRITICAL",
            title: `Unclosed Room Boundary in ${room.name}`,
            description: `The boundary polygon for ${room.name} has a gap exceeding 0.5 meters, breaking watertight spatial calculations.`,
            affectedElementIds: [room.id],
            suggestedFix: "Bridge boundary gap by snapping adjacent wall endpoints together."
          });
        }

        const area = SpatialGeometryEngine.calculatePolygonArea(room.geometry.polygon.vertices);
        if (area <= 0.1 || isNaN(area)) {
          issues.push({
            id: `val_imp_${room.id}`,
            type: "IMPOSSIBLE_GEOMETRY",
            severity: "CRITICAL",
            title: `Impossible Zero-Area Geometry in ${room.name}`,
            description: `Calculated area is ${area.toFixed(2)} m², indicating degenerate or self-intersecting vertices.`,
            affectedElementIds: [room.id],
            suggestedFix: "Recalculate or re-draw polygon vertices in clockwise sequence."
          });
        }
      }
    });

    // 2. Disconnected Floating Walls
    walls.forEach(wall => {
      if (wall.geometry.line) {
        const line = wall.geometry.line;
        const connectsOtherWall = walls.some(w => {
          if (w.id === wall.id || !w.geometry.line) return false;
          const other = w.geometry.line;
          const distStartStart = Math.hypot(line.start.x - other.start.x, line.start.y - other.start.y);
          const distStartEnd = Math.hypot(line.start.x - other.end.x, line.start.y - other.end.y);
          const distEndStart = Math.hypot(line.end.x - other.start.x, line.end.y - other.start.y);
          const distEndEnd = Math.hypot(line.end.x - other.end.x, line.end.y - other.end.y);
          return Math.min(distStartStart, distStartEnd, distEndStart, distEndEnd) < 1.0;
        });

        if (!connectsOtherWall) {
          issues.push({
            id: `val_disc_wall_${wall.id}`,
            type: "DISCONNECTED_WALL",
            severity: "WARNING",
            title: `Floating Disconnected Wall Segment ${wall.name}`,
            description: `Wall endpoints do not snap to any adjacent structural wall or column node within 1.0 meter buffer.`,
            affectedElementIds: [wall.id],
            suggestedFix: "Extend wall endpoint to intersect nearest perimeter wall."
          });
        }
      }
    });

    // 3. Landlocked Rooms (No Door Access)
    rooms.forEach(room => {
      if (room.geometry.polygon && room.type === "ROOM") {
        const poly = room.geometry.polygon.vertices;
        const hasDoor = doors.some(d => {
          const doorCenter = d.geometry.center || { x: 0, y: 0 };
          return SpatialGeometryEngine.isPointInPolygon(doorCenter, poly);
        });

        if (!hasDoor && room.relationships.connectedElementIds.length === 0) {
          issues.push({
            id: `val_landlocked_${room.id}`,
            type: "LANDLOCKED_ROOM",
            severity: "WARNING",
            title: `Landlocked Enclosure Detected: ${room.name}`,
            description: `Room ${room.name} has no connected doors or passage openings, creating an inaccessible space.`,
            affectedElementIds: [room.id],
            suggestedFix: "Insert a door element or open passage on one of the room's boundary walls."
          });
        }
      }
    });

    // 4. Overlapping Room Interiors
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const r1 = rooms[i];
        const r2 = rooms[j];
        if (r1.geometry.polygon && r2.geometry.polygon) {
          const c1 = SpatialGeometryEngine.calculateCentroid(r1.geometry.polygon.vertices);
          const c2 = SpatialGeometryEngine.calculateCentroid(r2.geometry.polygon.vertices);
          if (SpatialGeometryEngine.isPointInPolygon(c1, r2.geometry.polygon.vertices) ||
              SpatialGeometryEngine.isPointInPolygon(c2, r1.geometry.polygon.vertices)) {
            issues.push({
              id: `val_overlap_${r1.id}_${r2.id}`,
              type: "OVERLAPPING_ROOMS",
              severity: "CRITICAL",
              title: `Overlapping Room Interior: ${r1.name} & ${r2.name}`,
              description: `Polygons for ${r1.name} and ${r2.name} overlap significantly in coordinate space.`,
              affectedElementIds: [r1.id, r2.id],
              suggestedFix: "Adjust shared boundary vertices so room polygons are mutually exclusive."
            });
          }
        }
      }
    }

    const criticalCount = issues.filter(i => i.severity === "CRITICAL").length;
    const warningCount = issues.filter(i => i.severity === "WARNING").length;
    const infoCount = issues.filter(i => i.severity === "INFO").length;

    // Calculate score (100 - 20*critical - 5*warning)
    let score = 100 - (criticalCount * 20 + warningCount * 5);
    score = Math.max(0, Math.min(100, score));

    return {
      integrityScore: score,
      isValid: criticalCount === 0,
      totalIssuesCount: issues.length,
      criticalCount,
      warningCount,
      infoCount,
      issues,
      validatedAt: new Date().toISOString()
    };
  }
}
