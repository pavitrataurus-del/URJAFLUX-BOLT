import { 
  BuildingElement, 
  SpatialIntelligenceAnalysis, 
  NorthSourceType,
  SystemCapabilityDeclaration
} from "../../types/spatialIntelligence";
import { SpatialGeometryEngine } from "./SpatialGeometryEngine";
import { BuildingElementRegistry } from "./BuildingElementRegistry";
import { SpatialRelationshipEngine } from "./SpatialRelationshipEngine";
import { DirectionEngine } from "./DirectionEngine";
import { SpatialReasoningEngine } from "./SpatialReasoningEngine";
import { SpatialValidationEngine } from "./SpatialValidationEngine";

/**
 * ============================================================================
 *               URJAFLUX AI OS — SPATIAL INTELLIGENCE ENGINE
 * ============================================================================
 * 
 * Master Orchestrator for Sprint #30.
 * Combines Spatial Analysis Pipeline, Geometry Pipeline, Object Pipeline,
 * Reasoning Pipeline, Validation Pipeline, Evidence Pipeline, and Explainable Decision Pipeline.
 */

export class SpatialIntelligenceEngine {

  /**
   * System Capability Declarations classifying all Sprint #30 capabilities
   */
  public static getSystemCapabilities(): SystemCapabilityDeclaration[] {
    return [
      {
        id: "CAP-01",
        moduleName: "Spatial Intelligence Core",
        capabilityName: "Spatial & Geometry Pipeline",
        description: "Shoelace area formula, vector perimeter, ray-casting point-in-polygon, polygon centroids.",
        status: "Implemented",
        validationMethod: "Unit Math Computation & Benchmark Verification"
      },
      {
        id: "CAP-02",
        moduleName: "Building Element Registry",
        capabilityName: "14 Building Element Types Ontology",
        description: "Rooms, Walls, Doors, Windows, Columns, Beams, Staircases, Balconies, Open Spaces, Utility Areas, Parking, Corridors, Terraces, Service Shafts, Building Boundaries.",
        status: "Implemented",
        validationMethod: "Strongly Typed Object Registry"
      },
      {
        id: "CAP-03",
        moduleName: "Spatial Relationship Engine",
        capabilityName: "Topological Adjacency & BFS Travel Paths",
        description: "Shared wall contact calculation, door graph connectivity, travel path distance, and accessibility check.",
        status: "Implemented",
        validationMethod: "Graph Edge Adjacency & Shortest Path Traversal"
      },
      {
        id: "CAP-04",
        moduleName: "Direction Engine",
        capabilityName: "16-Point Cardinal Zone Mapping & Rotation",
        description: "Translates rotation angles into 16 cardinal zones (N, NNE, NE, etc.), origin rotation, coordinate transform.",
        status: "Implemented",
        validationMethod: "Trigonometric Bearing Vector Computation"
      },
      {
        id: "CAP-05",
        moduleName: "Spatial Reasoning Engine",
        capabilityName: "Explainable AI Decision Traces",
        description: "Generates explicit evidence chains and explanations for room classification, connectivity, wall detection, and boundary inference.",
        status: "Implemented",
        validationMethod: "Auditable Explainable AI Trace Chain"
      },
      {
        id: "CAP-06",
        moduleName: "Spatial Validation Engine",
        capabilityName: "Topological Integrity Scoring",
        description: "Closed polygon check, disconnected wall detection, landlocked enclosures, overlapping room interiors, 0-100 integrity score.",
        status: "Implemented",
        validationMethod: "Topological Integrity Rule Engine"
      },
      {
        id: "CAP-07",
        moduleName: "AI Model Abstraction",
        capabilityName: "Pluggable Vision Provider Interface",
        description: "Abstract contracts for Gemini Vision, OpenAI Vision, OpenCV, YOLO v11, and SAM 2 segmenters.",
        status: "Implemented",
        validationMethod: "Abstract Adapter Specification"
      },
      {
        id: "CAP-08",
        moduleName: "Floor Plan Vision Recognition",
        capabilityName: "Automated Image Raster Bounding Box Extraction",
        description: "Requires external multimodal Vision model (Gemini 2.5 Flash / OpenAI GPT-4o) or OpenCV edge server.",
        status: "Requires External Vision Model",
        externalDependency: "Gemini 2.5 Flash Vision API / OpenCV Edge Server",
        validationMethod: "External Multimodal API Processing"
      },
      {
        id: "CAP-09",
        moduleName: "Human Review System",
        capabilityName: "Architect Corrections Audit Trail",
        description: "Interactive human-in-the-loop room renaming, detection acceptance/rejection, and audit logging.",
        status: "Implemented",
        validationMethod: "Immutable Human Action History Log"
      },
      {
        id: "CAP-10",
        moduleName: "Performance Optimization",
        capabilityName: "Geometry Cache & Incremental Re-analysis",
        description: "Memoized polygon geometry computations and lazy overlay rendering.",
        status: "Prototype",
        validationMethod: "In-Memory Geometry Caching"
      }
    ];
  }

  /**
   * Run full Spatial Intelligence Analysis on a set of building elements or CAD drawing vectors
   */
  public static analyzeSpatialModel(
    projectId: string,
    floorId: string,
    rawElements: BuildingElement[],
    northAngle = 0,
    northSource: NorthSourceType = "Manual North"
  ): SpatialIntelligenceAnalysis {
    const startTime = performance.now();

    // 1. Register Elements
    const registry = new BuildingElementRegistry(rawElements);
    const elements = registry.getAllElements();

    // 2. Geometry Pipeline: Recalculate areas and perimeters
    elements.forEach(el => {
      if (el.geometry.polygon) {
        const vertices = el.geometry.polygon.vertices;
        el.geometry.polygon.area = SpatialGeometryEngine.calculatePolygonArea(vertices);
        el.geometry.polygon.perimeter = SpatialGeometryEngine.calculatePolygonPerimeter(vertices);
        el.geometry.polygon.centroid = SpatialGeometryEngine.calculateCentroid(vertices);
        el.geometry.polygon.isClosed = SpatialGeometryEngine.isPolygonClosed(vertices);
        el.properties.areaMeters = el.geometry.polygon.area;
        el.properties.perimeterMeters = el.geometry.polygon.perimeter;
      }
    });

    // 3. Direction Engine: Analyze Orientation
    const orientation = DirectionEngine.analyzeOrientation(elements, northAngle, northSource);

    // 4. Spatial Relationship Engine: Build Topology Graph
    const spatialGraph = SpatialRelationshipEngine.buildSpatialGraph(elements);

    // 5. Reasoning Pipeline: Explain room classifications and connectivities
    const reasoningTraces = elements
      .filter(e => e.type === "ROOM" || e.type === "CORRIDOR")
      .map(r => SpatialReasoningEngine.explainRoomClassification(r, elements));

    // 6. Validation Pipeline: Execute integrity checks
    const validationReport = SpatialValidationEngine.validateSpatialModel(elements);

    // 7. Calculate Aggregated Statistics
    const rooms = elements.filter(e => e.type === "ROOM" || e.type === "CORRIDOR" || e.type === "BALCONY");
    const totalArea = rooms.reduce((sum, r) => sum + (r.properties.areaMeters || 0), 0);
    const totalPerimeter = rooms.reduce((sum, r) => sum + (r.properties.perimeterMeters || 0), 0);
    const avgConfidence = elements.length > 0
      ? elements.reduce((sum, e) => sum + (e.confidence || 0), 0) / elements.length
      : 0;

    const endTime = performance.now();

    return {
      id: `spat_anal_${Date.now()}`,
      projectId,
      floorId,
      analyzedAt: new Date().toISOString(),
      executionTimeMs: Math.round(endTime - startTime),
      elements,
      orientation,
      spatialGraph,
      reasoningTraces,
      validationReport,
      correctionsHistory: [],
      statistics: {
        totalBuildingAreaM2: Number(totalArea.toFixed(2)),
        totalPerimeterMeters: Number(totalPerimeter.toFixed(2)),
        roomCount: rooms.length,
        wallCount: elements.filter(e => e.type === "WALL").length,
        doorCount: elements.filter(e => e.type === "DOOR").length,
        windowCount: elements.filter(e => e.type === "WINDOW").length,
        columnCount: elements.filter(e => e.type === "COLUMN").length,
        unknownElementCount: elements.filter(e => e.confidence < 0.5).length,
        overallConfidenceScore: Number(avgConfidence.toFixed(2))
      }
    };
  }

  /**
   * Sample Floor Plan Benchmark Generator for demonstration and verification
   */
  public static createSampleArchitecturalFloorPlan(projectId = "PRJ-DEMO-01"): BuildingElement[] {
    return [
      // ROOMS
      {
        id: "rm_living_01",
        type: "ROOM",
        name: "Living Room & Lounge",
        category: "LIVING",
        origin: "Detected",
        confidence: 0.94,
        geometry: {
          polygon: SpatialGeometryEngine.createPolygon2D([
            { x: 0, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 6 }, { x: 0, y: 6 }
          ])
        },
        properties: { areaMeters: 48, perimeterMeters: 28 },
        relationships: { parentBoundaryId: "bldg_bound_01", connectedElementIds: ["dr_main_01", "dr_kit_01"], adjacentRoomIds: ["rm_kitchen_01", "rm_master_01"], containsElementIds: [] },
        evidence: { id: "ev_01", sourceType: "OCR_TEXT_LABEL", description: "OCR text label 'LIVING ROOM' found at center (4,3)", confidence: 0.94, timestamp: new Date().toISOString() }
      },
      {
        id: "rm_kitchen_01",
        type: "ROOM",
        name: "Modular Kitchen & Pantry",
        category: "KITCHEN",
        origin: "Detected",
        confidence: 0.91,
        geometry: {
          polygon: SpatialGeometryEngine.createPolygon2D([
            { x: 8, y: 0 }, { x: 13, y: 0 }, { x: 13, y: 4 }, { x: 8, y: 4 }
          ])
        },
        properties: { areaMeters: 20, perimeterMeters: 18 },
        relationships: { parentBoundaryId: "bldg_bound_01", connectedElementIds: ["dr_kit_01"], adjacentRoomIds: ["rm_living_01", "rm_dining_01"], containsElementIds: [] },
        evidence: { id: "ev_02", sourceType: "OCR_TEXT_LABEL", description: "OCR label 'KITCHEN' + plumbing fixture vector detected", confidence: 0.91, timestamp: new Date().toISOString() }
      },
      {
        id: "rm_master_01",
        type: "ROOM",
        name: "Master Suite",
        category: "BEDROOM",
        origin: "Detected",
        confidence: 0.96,
        geometry: {
          polygon: SpatialGeometryEngine.createPolygon2D([
            { x: 0, y: 6 }, { x: 6, y: 6 }, { x: 6, y: 11 }, { x: 0, y: 11 }
          ])
        },
        properties: { areaMeters: 30, perimeterMeters: 22 },
        relationships: { parentBoundaryId: "bldg_bound_01", connectedElementIds: ["dr_mstr_01", "dr_bath_01"], adjacentRoomIds: ["rm_living_01", "rm_bath_01"], containsElementIds: [] },
        evidence: { id: "ev_03", sourceType: "OCR_TEXT_LABEL", description: "OCR text 'MASTER BEDROOM' + enclosed closet boundary", confidence: 0.96, timestamp: new Date().toISOString() }
      },
      {
        id: "rm_bath_01",
        type: "ROOM",
        name: "Ensuite Bathroom",
        category: "SANITATION",
        origin: "Detected",
        confidence: 0.89,
        geometry: {
          polygon: SpatialGeometryEngine.createPolygon2D([
            { x: 6, y: 6 }, { x: 9, y: 6 }, { x: 9, y: 11 }, { x: 6, y: 11 }
          ])
        },
        properties: { areaMeters: 15, perimeterMeters: 16 },
        relationships: { parentBoundaryId: "bldg_bound_01", connectedElementIds: ["dr_bath_01"], adjacentRoomIds: ["rm_master_01"], containsElementIds: [] },
        evidence: { id: "ev_04", sourceType: "OCR_TEXT_LABEL", description: "OCR text 'BATH' + sanitary fixture symbols", confidence: 0.89, timestamp: new Date().toISOString() }
      },
      
      // WALLS
      {
        id: "w_ext_north",
        type: "WALL",
        name: "North Exterior Wall",
        origin: "Detected",
        confidence: 0.95,
        geometry: { line: { id: "l_ext_n", start: { x: 0, y: 0 }, end: { x: 13, y: 0 }, length: 13, angleDegrees: 0 }, thicknessMeters: 0.23 },
        properties: { isExterior: true, isLoadBearing: true },
        relationships: { parentBoundaryId: "bldg_bound_01", connectedElementIds: ["w_ext_east", "w_ext_west"], adjacentRoomIds: ["rm_living_01", "rm_kitchen_01"], containsElementIds: [] },
        evidence: { id: "ev_w1", sourceType: "VECTOR_CAD_LINE", description: "Double parallel CAD line, 230mm thickness", confidence: 0.95, timestamp: new Date().toISOString() }
      },

      // DOORS
      {
        id: "dr_main_01",
        type: "DOOR",
        name: "Main Entrance Door",
        origin: "Detected",
        confidence: 0.93,
        geometry: { center: { x: 4, y: 0 }, widthMeters: 1.0 },
        properties: { isOpen: true, widthMeters: 1.0 },
        relationships: { connectedElementIds: ["rm_living_01"], adjacentRoomIds: ["rm_living_01"], containsElementIds: [] },
        evidence: { id: "ev_d1", sourceType: "VECTOR_CAD_LINE", description: "90-degree swing arc vector geometry", confidence: 0.93, timestamp: new Date().toISOString() }
      },
      {
        id: "dr_kit_01",
        type: "DOOR",
        name: "Kitchen Passage Door",
        origin: "Detected",
        confidence: 0.88,
        geometry: { center: { x: 8, y: 2 }, widthMeters: 0.9 },
        properties: { isOpen: true, widthMeters: 0.9 },
        relationships: { connectedElementIds: ["rm_living_01", "rm_kitchen_01"], adjacentRoomIds: ["rm_living_01", "rm_kitchen_01"], containsElementIds: [] },
        evidence: { id: "ev_d2", sourceType: "VECTOR_CAD_LINE", description: "Door opening in interior partition wall W-INT-02", confidence: 0.88, timestamp: new Date().toISOString() }
      },

      // COLUMNS
      {
        id: "col_c1",
        type: "COLUMN",
        name: "Structural Column C1",
        origin: "Detected",
        confidence: 0.98,
        geometry: { center: { x: 0, y: 0 }, widthMeters: 0.4, heightMeters: 0.4 },
        properties: { isLoadBearing: true, material: "Reinforced Concrete M30" },
        relationships: { connectedElementIds: ["w_ext_north"], adjacentRoomIds: ["rm_living_01"], containsElementIds: [] },
        evidence: { id: "ev_c1", sourceType: "VECTOR_CAD_LINE", description: "Hatched 400x400mm square vector at grid node A1", confidence: 0.98, timestamp: new Date().toISOString() }
      }
    ];
  }
}
