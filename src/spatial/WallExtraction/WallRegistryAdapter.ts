import { BuildingElement } from "../../types/spatialIntelligence";
import { CadEntity } from "../../components/CadBlueprintWorkspace";
import { WallEntity } from "./types";

/**
 * ============================================================================
 * WALL REGISTRY ADAPTER
 * ============================================================================
 * Pure conversion adapter between WallEntity models and BuildingElement / CadEntity representations.
 * 
 * ARCHITECTURAL RULE:
 * This module contains ONLY transformation mappings.
 * It DOES NOT execute runtime writes or synchronization into BuildingElementRegistry.
 */
export class WallRegistryAdapter {
  /**
   * Converts a normalized WallEntity into a BuildingElement structure.
   */
  public static toBuildingElement(wall: WallEntity): BuildingElement {
    return {
      id: wall.id,
      type: "WALL",
      name: `Wall ${wall.id.slice(-6)}`,
      origin: "Detected",
      confidence: wall.confidence,
      geometry: {
        center: { x: wall.geometry.center.x, y: wall.geometry.center.y },
        widthMeters: wall.geometry.thicknessMeters,
        heightMeters: wall.geometry.lengthMeters,
        thicknessMeters: wall.geometry.thicknessMeters
      },
      properties: {
        material: wall.wallType === "LOAD_BEARING" ? "CONCRETE" : "BRICK",
        isLoadBearing: wall.wallType === "LOAD_BEARING",
        isExterior: wall.wallType === "EXTERIOR",
        customTags: [wall.wallType, `blueprint:${wall.blueprintId}`]
      },
      relationships: {
        connectedElementIds: [],
        adjacentRoomIds: [],
        containsElementIds: []
      },
      evidence: {
        id: `ev-wall-${wall.id}`,
        sourceType: "VECTOR_CAD_LINE",
        description: `Wall extraction pipeline result (${wall.wallType})`,
        confidence: wall.confidence,
        timestamp: wall.createdAtISO
      }
    };
  }

  /**
   * Converts an array of WallEntity objects into BuildingElement structures.
   */
  public static toBuildingElements(walls: readonly WallEntity[]): BuildingElement[] {
    return walls.map((w) => this.toBuildingElement(w));
  }

  /**
   * Converts a normalized WallEntity into a CAD Workspace CadEntity structure.
   */
  public static toCadEntity(wall: WallEntity): CadEntity {
    return {
      id: wall.id,
      name: `Wall ${wall.id.slice(-6)}`,
      type: "Wall",
      layer: "WALLS",
      x: wall.geometry.center.x,
      y: wall.geometry.center.y,
      z: 0,
      width: wall.geometry.thicknessMeters,
      height: wall.geometry.lengthMeters,
      rotation: wall.geometry.angleDegrees,
      material: wall.wallType === "LOAD_BEARING" ? "Concrete" : "Brick",
      vastu: wall.wallType,
      energy: "Neutral",
      status: "Verified",
      points: [
        { x: wall.geometry.start.x, y: wall.geometry.start.y, label: "Start" },
        { x: wall.geometry.end.x, y: wall.geometry.end.y, label: "End" }
      ]
    };
  }
}
