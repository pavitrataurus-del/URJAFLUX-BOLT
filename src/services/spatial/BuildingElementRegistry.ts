import { BuildingElement, BuildingElementType, RoomCategory } from "../../types/spatialIntelligence";
import { CadEntity } from "../../components/CadBlueprintWorkspace";

export type EntityCategory = "CATEGORY_A" | "CATEGORY_B" | "CATEGORY_C";

export type EntitySource = 
  | "GEOMETRY_ENGINE"       // Category A: Geometrically Derived
  | "OBJECT_DETECTOR"       // Category B: AI Detected
  | "OCR"                   // Category B: AI Detected
  | "POLYGON_RECOGNITION"   // Category B: AI Detected
  | "MULTIMODAL"            // Category B: AI Detected
  | "USER";                 // Category C: User Defined

/**
 * ============================================================================
 *               URJAFLUX AI OS — BUILDING ELEMENT REGISTRY
 * ============================================================================
 * 
 * Central registry for managing structural, spatial, architectural, and utility elements.
 * Maintains strong typing across all 14 element types: Rooms, Walls, Doors, Windows,
 * Columns, Beams, Staircases, Balconies, Open Spaces, Utility Areas, Parking,
 * Corridors, Terraces, Service Shafts, and Building Boundaries.
 * 
 * Enforces strict 3-Category Source Traceability Architecture:
 * - CATEGORY A: GEOMETRICALLY DERIVED (source = GEOMETRY_ENGINE, confidence = 100%)
 * - CATEGORY B: AI DETECTED (source = OBJECT_DETECTOR | OCR | POLYGON_RECOGNITION | MULTIMODAL)
 * - CATEGORY C: USER DEFINED (source = USER, confidence = 100%)
 */

export class BuildingElementRegistry {
  private elements: Map<string, BuildingElement> = new Map();
  private cadEntities: Map<string, CadEntity> = new Map();

  constructor(initialElements: BuildingElement[] = []) {
    initialElements.forEach((el) => this.registerElement(el));
  }

  public registerElement(element: BuildingElement): BuildingElement {
    this.elements.set(element.id, element);
    return element;
  }

  public syncCadEntities(cadEntities: CadEntity[]): void {
    if (!Array.isArray(cadEntities)) {
      if (cadEntities && typeof cadEntities === 'object') {
        cadEntities = Object.values(cadEntities);
      } else {
        return;
      }
    }
    this.cadEntities.clear();
    cadEntities.forEach((cad) => {
      this.cadEntities.set(cad.id, cad);
      
      const elType: BuildingElementType =
        cad.type === "Room" ? "ROOM" :
        cad.type === "Wall" ? "WALL" :
        cad.type === "Door" ? "DOOR" :
        cad.type === "Window" ? "WINDOW" :
        cad.type === "Column" ? "COLUMN" :
        cad.type === "Stair" ? "STAIRCASE" :
        cad.type === "Plot" ? "BUILDING_BOUNDARY" : "UTILITY";

      // Determine Category, Source & Confidence based on Founder Architecture
      let category: EntityCategory = cad.category || "CATEGORY_B";
      let source: EntitySource = cad.source || "OBJECT_DETECTOR";
      let confidence = cad.confidence ?? 0.95;
      let detectedByReason = cad.detectedByReason || "AI Spatial Object Recognition";

      if (cad.source === "GEOMETRY_ENGINE" || cad.type === "Plot" || cad.type === "Marker" || cad.type === "North" || cad.name.toLowerCase().includes("brahmasthan")) {
        category = "CATEGORY_A";
        source = "GEOMETRY_ENGINE";
        confidence = 1.0;
        detectedByReason = cad.detectedByReason || "Calculated from Chakra Center / Geometric Boundary Centroid";
      } else if (cad.source === "USER" || category === "CATEGORY_C") {
        category = "CATEGORY_C";
        source = "USER";
        confidence = 1.0;
        detectedByReason = cad.detectedByReason || "Manual User Defined Entity";
      }

      const element: BuildingElement = {
        id: cad.id,
        type: elType,
        name: cad.name || cad.type,
        origin: source === "USER" ? "User Confirmed" : "Detected",
        confidence,
        geometry: {
          center: { x: cad.x, y: cad.y },
          widthMeters: cad.width,
          heightMeters: cad.height,
        },
        properties: {
          material: cad.material,
          customTags: [cad.vastu, cad.energy, cad.layer, category, source, detectedByReason]
        },
        relationships: {
          connectedElementIds: [],
          adjacentRoomIds: [],
          containsElementIds: []
        },
        evidence: {
          id: `ev-${cad.id}`,
          sourceType: source === "GEOMETRY_ENGINE" ? "GEOMETRIC_INFERENCE" : source === "USER" ? "HUMAN_INPUT" : source === "OCR" ? "OCR_TEXT_LABEL" : "VISION_PREDICTION",
          description: detectedByReason,
          confidence,
          timestamp: new Date().toISOString()
        }
      };
      this.elements.set(element.id, element);
    });
  }

  public getCadEntities(): CadEntity[] {
    return Array.from(this.cadEntities.values());
  }

  public getElementById(id: string): BuildingElement | undefined {
    return this.elements.get(id);
  }

  public getAllElements(): BuildingElement[] {
    return Array.from(this.elements.values());
  }

  public getElementsByType(type: BuildingElementType): BuildingElement[] {
    return this.getAllElements().filter((el) => el.type === type);
  }

  public getElementsByCategory(category: RoomCategory): BuildingElement[] {
    return this.getAllElements().filter((el) => el.category === category);
  }

  public updateElement(id: string, updates: Partial<BuildingElement>): BuildingElement | undefined {
    const existing = this.elements.get(id);
    if (!existing) return undefined;

    const updated: BuildingElement = {
      ...existing,
      ...updates,
      properties: { ...existing.properties, ...updates.properties },
      relationships: { ...existing.relationships, ...updates.relationships },
      geometry: { ...existing.geometry, ...updates.geometry }
    };

    this.elements.set(id, updated);
    return updated;
  }

  public removeElement(id: string): boolean {
    return this.elements.delete(id);
  }

  public clear(): void {
    this.elements.clear();
    this.cadEntities.clear();
  }

  public getElementSummary() {
    const counts: Record<string, number> = {};
    this.elements.forEach((el) => {
      counts[el.type] = (counts[el.type] || 0) + 1;
    });

    return {
      totalElements: this.elements.size,
      counts
    };
  }
}

export const buildingElementRegistry = new BuildingElementRegistry();
