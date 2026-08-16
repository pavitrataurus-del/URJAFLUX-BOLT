// ============================================================================
// URJAFLUX AI OS - BLUEPRINT MATHEMATICAL UNDERSTANDING ENGINE (BMUE v1.0)
// Production Grade Canonical Architectural Mathematical Intelligence Orchestrator
// Converts raw SRE v3 vision model into mathematically verified architectural intelligence
// ============================================================================

import { 
  IBlueprintMathematicalModel,
  IBmueFutureReservedHooks 
} from "./types/bmue.types";

import { ISpatialContextModelV3 } from "../spatial_recognition/types/sre.v3.types";

import { wallGraphEngine } from "./engines/WallGraphEngine";
import { vertexEngine } from "./engines/VertexEngine";
import { closedPolygonSolver } from "./engines/ClosedPolygonSolver";
import { roomMathematicalEngine } from "./engines/RoomMathematicalEngine";
import { doorConnectivityEngine } from "./engines/DoorConnectivityEngine";
import { windowGraphEngine } from "./engines/WindowGraphEngine";
import { objectContainmentEngine } from "./engines/ObjectContainmentEngine";
import { boundaryValidationEngine } from "./engines/BoundaryValidationEngine";
import { geometricConsistencyEngine } from "./engines/GeometricConsistencyEngine";
import { blueprintHealthEngine } from "./engines/BlueprintHealthEngine";
import { mathematicalProofEngine } from "./engines/MathematicalProofEngine";

export class BlueprintMathematicalUnderstandingEngine {
  private static instance: BlueprintMathematicalUnderstandingEngine;

  private constructor() {}

  public static getInstance(): BlueprintMathematicalUnderstandingEngine {
    if (!BlueprintMathematicalUnderstandingEngine.instance) {
      BlueprintMathematicalUnderstandingEngine.instance = new BlueprintMathematicalUnderstandingEngine();
    }
    return BlueprintMathematicalUnderstandingEngine.instance;
  }

  /**
   * Main BMUE Pipeline Execution
   * Converts ISpatialContextModelV3 into canonical IBlueprintMathematicalModel
   */
  public processMathematicalUnderstanding(
    sreModelV3: ISpatialContextModelV3
  ): IBlueprintMathematicalModel {
    // ------------------------------------------------------------------------
    // STEP 1: Wall Graph Engine
    // Convert detected walls into vectors, repair gaps, merge overlaps, split intersections
    // ------------------------------------------------------------------------
    const wallGraph = wallGraphEngine.buildWallGraph(sreModelV3);

    // ------------------------------------------------------------------------
    // STEP 2: Vertex Engine
    // Calculate wall intersections, corner points, dead ends, T & cross junctions
    // ------------------------------------------------------------------------
    const vertexGraph = vertexEngine.buildVertexGraph(wallGraph);

    // ------------------------------------------------------------------------
    // STEP 3: Closed Polygon Solver
    // Automatically detect closed loops, nested polygons, centroid, area, orientation
    // ------------------------------------------------------------------------
    const polygonGraph = closedPolygonSolver.solveClosedPolygons(sreModelV3, wallGraph, vertexGraph);

    // ------------------------------------------------------------------------
    // STEP 4: Room Mathematical Engine
    // FOUNDER LOCK: Geometry defines rooms FIRST. OCR confirms SECOND.
    // ------------------------------------------------------------------------
    const roomGraph = roomMathematicalEngine.computeRoomMathematics(sreModelV3, polygonGraph);

    // ------------------------------------------------------------------------
    // STEP 5: Door Connectivity Engine
    // Doors create navigation: Room A -> Door -> Room B, circulation paths, dead ends
    // ------------------------------------------------------------------------
    const { doorGraph, connectivityGraph } = doorConnectivityEngine.buildDoorAndConnectivityGraph(
      sreModelV3, 
      roomGraph, 
      polygonGraph
    );

    // ------------------------------------------------------------------------
    // STEP 6: Window Graph Engine
    // Natural ventilation graph, external vs internal windows, cross ventilation
    // ------------------------------------------------------------------------
    const windowGraph = windowGraphEngine.buildWindowGraph(sreModelV3, roomGraph, wallGraph);

    // ------------------------------------------------------------------------
    // STEP 7: Object Containment Engine
    // FOUNDER LOCK: Objects mapped THIRD. Every object belongs to exactly ONE polygon.
    // ------------------------------------------------------------------------
    const containmentGraph = objectContainmentEngine.solveObjectContainment(sreModelV3, polygonGraph, roomGraph);

    // ------------------------------------------------------------------------
    // STEP 8: Boundary Validation Engine
    // Outer boundary, building footprint, compound wall, extensions, courtyards
    // ------------------------------------------------------------------------
    const boundaryValidation = boundaryValidationEngine.validateBoundary(sreModelV3, polygonGraph, wallGraph);

    // ------------------------------------------------------------------------
    // STEP 9: Geometric Consistency Engine
    // Mathematical validation: closed boundaries, connectivity, positive areas, centroids
    // ------------------------------------------------------------------------
    const geometricConsistency = geometricConsistencyEngine.validateConsistency(
      polygonGraph, 
      roomGraph, 
      wallGraph, 
      connectivityGraph
    );

    // ------------------------------------------------------------------------
    // STEP 10: Blueprint Health Score
    // Geometry, Wall, OCR, Polygon, Connectivity, Recognition breakdown & deduction explanations
    // ------------------------------------------------------------------------
    const blueprintHealth = blueprintHealthEngine.computeHealthScore(
      sreModelV3, 
      wallGraph, 
      polygonGraph, 
      roomGraph, 
      connectivityGraph, 
      geometricConsistency
    );

    // ------------------------------------------------------------------------
    // STEP 11: Mathematical Proof Package
    // Verifiable machine-readable proof package of complete spatial understanding
    // ------------------------------------------------------------------------
    const mathematicalProof = mathematicalProofEngine.generateProofPackage(
      wallGraph,
      vertexGraph,
      polygonGraph,
      roomGraph,
      doorGraph,
      windowGraph,
      connectivityGraph,
      containmentGraph,
      geometricConsistency,
      blueprintHealth
    );

    // Future Reserved Hooks (OpenCV, SAM2, YOLO, Detectron, DWG, DXF, IFC, BIM, 3D Mesh, LiDAR)
    const futureHooks: IBmueFutureReservedHooks = {
      dwgDxfVectorLayers: sreModelV3.futureHooks?.cadDwgDxfLayers,
      ifcBimMetadata: sreModelV3.futureHooks?.bimIfcMetadata,
      mesh3DRef: sreModelV3.futureHooks?.model3DRef,
      lidarScanRef: sreModelV3.futureHooks?.lidarScanData
    };

    return {
      propertyId: sreModelV3.propertyId,
      propertyName: sreModelV3.propertyName,
      version: '1.0.0-BMUE-MATHEMATICAL-CANONICAL',
      timestamp: new Date().toISOString(),
      wallGraph,
      vertexGraph,
      polygonGraph,
      roomGraph,
      doorGraph,
      windowGraph,
      connectivityGraph,
      containmentGraph,
      boundaryValidation,
      geometricConsistency,
      blueprintHealth,
      mathematicalProof,
      futureHooks
    };
  }
}

export const blueprintMathematicalUnderstandingEngine = BlueprintMathematicalUnderstandingEngine.getInstance();
