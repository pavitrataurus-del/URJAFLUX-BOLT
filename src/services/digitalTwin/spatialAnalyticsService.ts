// Module 7: Spatial Analytics Service (Room Metrics, Area Analytics, Adjacency Analysis, Circulation & Occupancy Estimation)
import { 
  RoomMetrics, 
  AreaAnalytics, 
  AdjacencyMatrixItem, 
  DensityMetric,
  RoomTwin
} from "../../types/digitalTwin";
import { digitalTwinCore } from "./digitalTwinCore";

export class SpatialAnalyticsService {
  private static instance: SpatialAnalyticsService;

  private constructor() {}

  public static getInstance(): SpatialAnalyticsService {
    if (!SpatialAnalyticsService.instance) {
      SpatialAnalyticsService.instance = new SpatialAnalyticsService();
    }
    return SpatialAnalyticsService.instance;
  }

  public getRoomMetrics(roomId: string): RoomMetrics | null {
    const twin = digitalTwinCore.getTwinById(roomId) as RoomTwin;
    if (!twin || twin.category !== "ROOM") return null;

    const gross = twin.usableAreaSqM * 1.15;
    return {
      roomId: twin.id,
      roomName: twin.name,
      grossAreaSqM: Math.round(gross * 10) / 10,
      usableAreaSqM: twin.usableAreaSqM,
      perimeterM: Math.round(Math.sqrt(twin.usableAreaSqM) * 4 * 10) / 10,
      ceilingHeightM: 4.2,
      volumeCuM: Math.round(twin.usableAreaSqM * 4.2),
      maxOccupants: twin.maxOccupancy
    };
  }

  public getBuildingAreaAnalytics(): AreaAnalytics {
    const rooms = digitalTwinCore.getTwinsByCategory("ROOM") as RoomTwin[];
    const usableTotal = rooms.reduce((acc, r) => acc + (r.usableAreaSqM || 0), 0);
    const circulationTotal = Math.round(usableTotal * 0.22);
    const utilityTotal = Math.round(usableTotal * 0.12);
    const gross = usableTotal + circulationTotal + utilityTotal;

    return {
      usableAreaTotalSqM: usableTotal,
      circulationAreaTotalSqM: circulationTotal,
      utilityAreaTotalSqM: utilityTotal,
      efficiencyRatioPercent: Math.round((usableTotal / gross) * 100)
    };
  }

  public getAdjacencyMatrix(): AdjacencyMatrixItem[] {
    return [
      {
        roomAId: "TWIN-RM-101",
        roomAName: "Ishan Corner - Executive Suite",
        roomBId: "TWIN-RM-102",
        roomBName: "Agni Corridor - Power Vault",
        adjacencyType: "DIRECT_WALL",
        distanceMeters: 4.5
      },
      {
        roomAId: "TWIN-RM-101",
        roomAName: "Ishan Corner - Executive Suite",
        roomBId: "TWIN-RM-103",
        roomBName: "Vayu Hub - Agile Workstations",
        adjacencyType: "CORRIDOR_LINKED",
        distanceMeters: 18.2
      },
      {
        roomAId: "TWIN-RM-102",
        roomAName: "Agni Corridor - Power Vault",
        roomBId: "TWIN-RM-103",
        roomBName: "Vayu Hub - Agile Workstations",
        adjacencyType: "FAR",
        distanceMeters: 32.0
      }
    ];
  }

  public getDensityMetrics(): DensityMetric[] {
    const rooms = digitalTwinCore.getTwinsByCategory("ROOM") as RoomTwin[];
    return rooms.map(r => {
      const liveOccupancy = r.id === "TWIN-RM-103" ? 28 : (r.id === "TWIN-RM-101" ? 4 : 1);
      const density = Math.round((liveOccupancy / r.usableAreaSqM) * 100) / 100;
      let status: "NORMAL" | "HIGH" | "OVERCROWDED" = "NORMAL";
      if (density > 0.15) status = "OVERCROWDED";
      else if (density > 0.08) status = "HIGH";

      return {
        roomId: r.id,
        areaSqM: r.usableAreaSqM,
        currentOccupancy: liveOccupancy,
        densityPeoplePerSqM: density,
        status
      };
    });
  }
}

export const spatialAnalyticsService = SpatialAnalyticsService.getInstance();
