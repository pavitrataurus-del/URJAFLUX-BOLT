import { FloorPlan, Room, Wall, TopologyGraph, GeometryValidationResult } from './SpatialTypes';
import { SpatialObjectRegistry } from './SpatialObjectRegistry';
import { SpatialRelationshipEngine } from './SpatialRelationshipEngine';
import { MeasurementEngine } from './MeasurementEngine';
import { GeometryValidationEngine } from './GeometryValidationEngine';

export interface SpatialSummaryForReasoning {
  floorPlanId: string;
  totalAreaSqMeters: number;
  orientationAngleDegrees: number;
  rooms: {
    id: string;
    name: string;
    type: string;
    areaSqMeters: number;
    centroid: { x: number; y: number };
    cardinalDirection: string;
  }[];
  topology: TopologyGraph;
}

export interface SpatialSpecsForExecution {
  floorPlanId: string;
  totalWallLengthMeters: number;
  openingsCount: { doors: number; windows: number };
  externalWallCount: number;
  loadBearingWallsCount: number;
  materialsEstimated: {
    brickVolumeCuMeters: number;
    plasterSqMeters: number;
  };
}

export interface SpatialMeshForDigitalTwin {
  floorPlanId: string;
  outerBoundaryPoints: { x: number; y: number }[];
  gridSpacingMeters: number;
  spatialNodesCount: number;
  quadTreeIndexed: boolean;
}

export class SpatialIntegrationService {
  private static instance: SpatialIntegrationService;

  private constructor() {}

  public static getInstance(): SpatialIntegrationService {
    if (!SpatialIntegrationService.instance) {
      SpatialIntegrationService.instance = new SpatialIntegrationService();
    }
    return SpatialIntegrationService.instance;
  }

  /**
   * Provide verified geometric summary for Reasoning Engine (DOMAIN-006)
   */
  public getSpatialSummaryForReasoning(floorPlan: FloorPlan): SpatialSummaryForReasoning {
    const topology = SpatialRelationshipEngine.getInstance().buildTopologyGraph(floorPlan);

    return {
      floorPlanId: floorPlan.id,
      totalAreaSqMeters: floorPlan.totalAreaSqMeters,
      orientationAngleDegrees: floorPlan.orientation.northAngleDegrees,
      rooms: floorPlan.rooms.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.roomType,
        areaSqMeters: r.areaSqMeters,
        centroid: r.centroid,
        cardinalDirection: r.cardinalDirection
      })),
      topology
    };
  }

  /**
   * Provide physical structural specs for Execution Engine (DOMAIN-007)
   */
  public getSpatialSpecsForExecution(floorPlan: FloorPlan): SpatialSpecsForExecution {
    const totalWallLength = floorPlan.walls.reduce((acc, w) => acc + w.lengthMeters, 0);
    const loadBearingWallsCount = floorPlan.walls.filter((w) => w.isLoadBearing).length;
    const externalWallCount = floorPlan.walls.filter((w) => w.isExternal).length;

    // Estimate structural wall volumes (approx. 0.23m avg thickness * 3m height)
    const wallArea = totalWallLength * 3.0;
    const brickVolumeCuMeters = Math.round(wallArea * 0.23 * 100) / 100;
    const plasterSqMeters = Math.round(wallArea * 2 * 100) / 100;

    return {
      floorPlanId: floorPlan.id,
      totalWallLengthMeters: Math.round(totalWallLength * 100) / 100,
      openingsCount: {
        doors: floorPlan.doors.length,
        windows: floorPlan.windows.length
      },
      externalWallCount,
      loadBearingWallsCount,
      materialsEstimated: {
        brickVolumeCuMeters,
        plasterSqMeters
      }
    };
  }

  /**
   * Provide 2D/3D spatial mesh for Digital Twin Monitoring Engine (DOMAIN-008)
   */
  public getSpatialMeshForDigitalTwin(floorPlan: FloorPlan): SpatialMeshForDigitalTwin {
    const registry = SpatialObjectRegistry.getInstance();
    const objects = registry.registerFloorPlanObjects(floorPlan);

    return {
      floorPlanId: floorPlan.id,
      outerBoundaryPoints: floorPlan.outerBoundary.points,
      gridSpacingMeters: floorPlan.grid.minorSpacingMeters,
      spatialNodesCount: objects.length,
      quadTreeIndexed: true
    };
  }

  /**
   * Provide validation metrics for Report Engine (DOMAIN-010)
   */
  public getSpatialValidationReport(floorPlan: FloorPlan): GeometryValidationResult {
    return GeometryValidationEngine.getInstance().validateFloorPlan(floorPlan);
  }
}
