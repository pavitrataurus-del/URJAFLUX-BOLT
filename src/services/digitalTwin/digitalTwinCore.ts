// Module 1: Digital Twin Core & Registry Service
import { 
  AnyDigitalTwin, 
  BuildingTwin, 
  FloorTwin, 
  RoomTwin, 
  WallTwin, 
  DoorTwin, 
  WindowTwin, 
  FurnitureTwin, 
  EquipmentTwin,
  TwinCategory,
  TwinStatus,
  TwinLifecycleStage
} from "../../types/digitalTwin";

export class DigitalTwinCoreRegistry {
  private static instance: DigitalTwinCoreRegistry;
  private twins: Map<string, AnyDigitalTwin> = new Map();
  private twinCache: Map<string, AnyDigitalTwin> = new Map();

  private constructor() {
    this.seedEnterpriseTwinModel();
  }

  public static getInstance(): DigitalTwinCoreRegistry {
    if (!DigitalTwinCoreRegistry.instance) {
      DigitalTwinCoreRegistry.instance = new DigitalTwinCoreRegistry();
    }
    return DigitalTwinCoreRegistry.instance;
  }

  /**
   * Seed a complete, realistic Enterprise Digital Twin Model:
   * "URJAFLUX Horizon Tower - Building A"
   */
  private seedEnterpriseTwinModel(): void {
    const timestamp = "2026-07-27T10:00:00.000Z";

    // 1. Building Twin
    const building: BuildingTwin = {
      id: "TWIN-BLD-001",
      code: "URJA-HQ-BLDA",
      name: "URJAFLUX Innovation Center - Tower A",
      category: "BUILDING",
      status: "OPERATIONAL",
      lifecycle: "OPERATIONAL",
      grossAreaSqM: 14500,
      floorsCount: 5,
      address: "Plot 42, Tech Corridor, Cyber City, Bangalore",
      yearBuilt: 2024,
      geometry: {
        bounds3D: { x: 0, y: 0, z: 12, dx: 50, dy: 40, dz: 24 },
        polygon2D: [{ x: -25, y: -20 }, { x: 25, y: -20 }, { x: 25, y: 20 }, { x: -25, y: 20 }],
        elevation: 0,
        rotationDeg: 12.5, // 12.5 deg East of North offset
        scale: [1, 1, 1]
      },
      properties: {
        totalCapExUSD: 18500000,
        energyStarRating: 94,
        leedCertification: "LEED Gold",
        vastuHarmonyScore: 92
      },
      materials: [
        { id: "MAT-CONC-01", name: "High-Strength Reinforced Concrete", densityKgM3: 2400, thermalRValue: 0.8, acousticAbsorptance: 0.15, colorHex: "#94a3b8" },
        { id: "MAT-GLZ-01", name: "Low-E Double Glazed Curtain Wall", densityKgM3: 2500, thermalRValue: 2.1, acousticAbsorptance: 0.45, colorHex: "#38bdf8" }
      ],
      labels: ["Headquarters", "Vastu-Optimized", "Net-Zero-Target"],
      tags: ["PrimaryAsset", "EnterpriseGrade"],
      ownership: {
        organizationId: "ORG-URJAFLUX-GLOBAL",
        tenantId: "TENANT-HQ-MAIN",
        department: "Enterprise Operations",
        custodian: "Chief Infrastructure Officer",
        ownerEmail: "facility.head@urjaflux.com"
      },
      version: "v2.1.0",
      versionHistory: [
        { version: "v1.0.0", timestamp: "2024-01-15T00:00:00Z", author: "BIM Lead", changeSummary: "As-Built IFC Ingestion", snapshotHash: "hash_bld_v1" },
        { version: "v2.1.0", timestamp: "2026-07-01T00:00:00Z", author: "Digital Twin Architect", changeSummary: "IoT Sensor Sensor Array Integrated", snapshotHash: "hash_bld_v2" }
      ],
      relationships: [
        { relType: "CONTAINS", targetTwinId: "TWIN-FLR-L01", targetCategory: "FLOOR" },
        { relType: "CONTAINS", targetTwinId: "TWIN-FLR-L02", targetCategory: "FLOOR" }
      ],
      dependencies: [],
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: timestamp,
      lastSyncedAt: timestamp
    };

    // 2. Floor Twin L01
    const floorL1: FloorTwin = {
      id: "TWIN-FLR-L01",
      code: "FLR-01-GROUND",
      name: "Level 01 - Executive & Innovation Hub",
      category: "FLOOR",
      buildingTwinId: "TWIN-BLD-001",
      floorLevelIndex: 1,
      elevationMeters: 0,
      grossFloorAreaSqM: 2900,
      status: "OPERATIONAL",
      lifecycle: "OPERATIONAL",
      geometry: {
        bounds3D: { x: 0, y: 0, z: 2.1, dx: 50, dy: 40, dz: 4.2 },
        polygon2D: [{ x: -25, y: -20 }, { x: 25, y: -20 }, { x: 25, y: 20 }, { x: -25, y: 20 }],
        elevation: 0,
        rotationDeg: 12.5,
        scale: [1, 1, 1]
      },
      properties: {
        cleanroomGrade: "Standard Commercial",
        fireCompartmentId: "FC-L1-A"
      },
      materials: [
        { id: "MAT-OAK-01", name: "Acoustic Natural Oak Flooring", densityKgM3: 750, thermalRValue: 1.2, acousticAbsorptance: 0.60, colorHex: "#d97706" }
      ],
      labels: ["ExecutiveZone", "PublicAccess", "NorthEastEntrance"],
      tags: ["GroundFloor"],
      ownership: building.ownership,
      version: "v2.1.0",
      versionHistory: [],
      relationships: [
        { relType: "PARENT_OF", targetTwinId: "TWIN-RM-101", targetCategory: "ROOM" },
        { relType: "PARENT_OF", targetTwinId: "TWIN-RM-102", targetCategory: "ROOM" },
        { relType: "PARENT_OF", targetTwinId: "TWIN-RM-103", targetCategory: "ROOM" }
      ],
      dependencies: [],
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: timestamp,
      lastSyncedAt: timestamp
    };

    // 3. Room Twins (NE, SE, NW, SW zones for Vastu relevance)
    const roomNE: RoomTwin = {
      id: "TWIN-RM-101",
      code: "RM-NE-101",
      name: "Ishan Corner - CEO & Meditation Suite",
      category: "ROOM",
      floorTwinId: "TWIN-FLR-L01",
      roomNumber: "101",
      useCategory: "EXECUTIVE",
      maxOccupancy: 8,
      usableAreaSqM: 120,
      vastuZone: "Ishan (North-East - Water Element)",
      status: "OPERATIONAL",
      lifecycle: "OPERATIONAL",
      geometry: {
        bounds3D: { x: 15, y: 12, z: 2.1, dx: 12, dy: 10, dz: 4.2 },
        polygon2D: [{ x: 9, y: 7 }, { x: 21, y: 7 }, { x: 21, y: 17 }, { x: 9, y: 17 }],
        elevation: 0,
        rotationDeg: 12.5,
        scale: [1, 1, 1]
      },
      properties: {
        lightingLuxTarget: 500,
        co2TargetPpm: 600,
        vastuComplianceScore: 98
      },
      materials: [],
      asset: {
        assetTag: "AST-RM-101",
        serialNumber: "SN-URJA-EX101",
        manufacturer: "URJAFLUX Interiors",
        modelNumber: "Executive Suite Standard",
        installationDate: "2024-02-01",
        warrantyExpiration: "2029-02-01",
        nextMaintenanceDate: "2026-11-15"
      },
      labels: ["NorthEast", "IshanZone", "Executive"],
      tags: ["HighPriority"],
      ownership: building.ownership,
      version: "v2.1.0",
      versionHistory: [],
      relationships: [
        { relType: "ADJACENT_TO", targetTwinId: "TWIN-RM-102", targetCategory: "ROOM" }
      ],
      dependencies: [
        { targetTwinId: "TWIN-EQP-AHU1", dependencyType: "HVAC_ZONE", isCritical: true }
      ],
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: timestamp,
      lastSyncedAt: timestamp
    };

    const roomSE: RoomTwin = {
      id: "TWIN-RM-102",
      code: "RM-SE-102",
      name: "Agni Corridor - Main Server & Power Transformer Vault",
      category: "ROOM",
      floorTwinId: "TWIN-FLR-L01",
      roomNumber: "102",
      useCategory: "UTILITY",
      maxOccupancy: 4,
      usableAreaSqM: 85,
      vastuZone: "Agni (South-East - Fire Element)",
      status: "OPERATIONAL",
      lifecycle: "OPERATIONAL",
      geometry: {
        bounds3D: { x: 15, y: -12, z: 2.1, dx: 10, dy: 8, dz: 4.2 },
        polygon2D: [{ x: 10, y: -16 }, { x: 20, y: -16 }, { x: 20, y: -8 }, { x: 10, y: -8 }],
        elevation: 0,
        rotationDeg: 12.5,
        scale: [1, 1, 1]
      },
      properties: {
        heatDissipationKw: 42,
        fireSuppressionType: "FM-200 Clean Agent",
        vastuComplianceScore: 100 // Ideal for fire/electrical equipment
      },
      materials: [],
      labels: ["SouthEast", "AgniZone", "PowerVault"],
      tags: ["CriticalInfrastructure"],
      ownership: building.ownership,
      version: "v2.1.0",
      versionHistory: [],
      relationships: [],
      dependencies: [],
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: timestamp,
      lastSyncedAt: timestamp
    };

    const roomNW: RoomTwin = {
      id: "TWIN-RM-103",
      code: "RM-NW-103",
      name: "Vayu Hub - Agile Workstations & Guest Lounge",
      category: "ROOM",
      floorTwinId: "TWIN-FLR-L01",
      roomNumber: "103",
      useCategory: "OFFICE",
      maxOccupancy: 36,
      usableAreaSqM: 320,
      vastuZone: "Vayu (North-West - Air/Movement Element)",
      status: "OPERATIONAL",
      lifecycle: "OPERATIONAL",
      geometry: {
        bounds3D: { x: -15, y: 12, z: 2.1, dx: 18, dy: 14, dz: 4.2 },
        polygon2D: [{ x: -24, y: 5 }, { x: -6, y: 5 }, { x: -6, y: 19 }, { x: -24, y: 19 }],
        elevation: 0,
        rotationDeg: 12.5,
        scale: [1, 1, 1]
      },
      properties: {
        desksCount: 30,
        averageOccupancyRatePercent: 78,
        vastuComplianceScore: 94
      },
      materials: [],
      labels: ["NorthWest", "VayuZone", "Collaborative"],
      tags: ["HighDensity"],
      ownership: building.ownership,
      version: "v2.1.0",
      versionHistory: [],
      relationships: [],
      dependencies: [],
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: timestamp,
      lastSyncedAt: timestamp
    };

    // 4. Equipment Twin
    const ahu1: EquipmentTwin = {
      id: "TWIN-EQP-AHU1",
      code: "EQP-AHU-L01-01",
      name: "Air Handling Unit #01 - Intelligent Climate Control",
      category: "EQUIPMENT",
      roomTwinId: "TWIN-RM-102",
      equipmentType: "HVAC_AHU",
      powerRatingKw: 28.5,
      operatingHours: 6420,
      status: "OPERATIONAL",
      lifecycle: "OPERATIONAL",
      geometry: {
        bounds3D: { x: 16, y: -10, z: 1.5, dx: 2.5, dy: 1.8, dz: 2.0 },
        polygon2D: [{ x: 14.75, y: -10.9 }, { x: 17.25, y: -10.9 }, { x: 17.25, y: -9.1 }, { x: 14.75, y: -9.1 }],
        elevation: 0.5,
        rotationDeg: 0,
        scale: [1, 1, 1]
      },
      properties: {
        airflowCfm: 12500,
        filterEffPercent: 99.97,
        refrigerantType: "R-410A"
      },
      materials: [],
      asset: {
        assetTag: "AST-AHU-2024-09",
        serialNumber: "Daikin-VRV-901182",
        manufacturer: "Daikin Global",
        modelNumber: "AHU-PRO-12500",
        installationDate: "2024-01-20",
        warrantyExpiration: "2029-01-20",
        nextMaintenanceDate: "2026-09-01"
      },
      labels: ["HVAC", "CentralChiller", "IoTMonitored"],
      tags: ["EssentialEquipment"],
      ownership: building.ownership,
      version: "v1.5.0",
      versionHistory: [],
      relationships: [
        { relType: "SERVICES", targetTwinId: "TWIN-RM-101", targetCategory: "ROOM" },
        { relType: "SERVICES", targetTwinId: "TWIN-RM-103", targetCategory: "ROOM" }
      ],
      dependencies: [
        { targetTwinId: "TWIN-RM-102", dependencyType: "POWER_SOURCE", isCritical: true }
      ],
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: timestamp,
      lastSyncedAt: timestamp
    };

    // Store in Map
    this.twins.set(building.id, building);
    this.twins.set(floorL1.id, floorL1);
    this.twins.set(roomNE.id, roomNE);
    this.twins.set(roomSE.id, roomSE);
    this.twins.set(roomNW.id, roomNW);
    this.twins.set(ahu1.id, ahu1);
  }

  // Registry Operations
  public getAllTwins(): AnyDigitalTwin[] {
    return Array.from(this.twins.values());
  }

  public getTwinById(id: string): AnyDigitalTwin | undefined {
    if (this.twinCache.has(id)) {
      return this.twinCache.get(id);
    }
    const twin = this.twins.get(id);
    if (twin) {
      this.twinCache.set(id, twin);
    }
    return twin;
  }

  public getTwinsByCategory(category: TwinCategory): AnyDigitalTwin[] {
    return this.getAllTwins().filter(t => t.category === category);
  }

  public registerOrUpdateTwin(twin: AnyDigitalTwin): AnyDigitalTwin {
    twin.updatedAt = new Date().toISOString();
    this.twins.set(twin.id, twin);
    this.twinCache.set(twin.id, twin); // invalidate / refresh LRU cache
    return twin;
  }

  public deleteTwin(id: string): boolean {
    this.twinCache.delete(id);
    return this.twins.delete(id);
  }

  // Spatial Index / Hierarchy Lookup
  public getChildTwins(parentTwinId: string): AnyDigitalTwin[] {
    return this.getAllTwins().filter(twin => {
      if (twin.category === "FLOOR" && (twin as FloorTwin).buildingTwinId === parentTwinId) return true;
      if (twin.category === "ROOM" && (twin as RoomTwin).floorTwinId === parentTwinId) return true;
      if (twin.category === "EQUIPMENT" && (twin as EquipmentTwin).roomTwinId === parentTwinId) return true;
      if (twin.category === "FURNITURE" && (twin as FurnitureTwin).roomTwinId === parentTwinId) return true;
      return false;
    });
  }
}

export const digitalTwinCore = DigitalTwinCoreRegistry.getInstance();
