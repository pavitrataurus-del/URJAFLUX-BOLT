import { BaseEngine } from '../types/BaseEngine';
import { GeometryEngine } from '../geometry/GeometryEngine';
import { EventEngine } from '../events/EventEngine';
import { Point2D } from '../geometry/types';
import { VastuZone } from '../spatial/types';
import { VASTU_ZONES_16 } from '../spatial/zones';
import { RoomObject, WallObject, DoorObject, WindowObject } from '../sme/types';
import { Logger } from '../utils/logger';
import {
  EntranceSector32,
  DevtaCell45,
  PanchatattvaRegion,
  SpatialMappingResult,
  SpatialMappingConfig,
  SpatialMappingEventType,
  SpatialMappedPayload,
  SpatialConfigUpdatedPayload
} from './types';
import {
  PANCHATATTVA_REGIONS,
  ENTRANCE_SECTORS_32,
  DEVTA_CELLS_45
} from './constants';

/**
 * SpatialMappingEngine
 * Maps semantic building elements (Rooms, Walls, Doors, Windows) and arbitrary 2D points
 * into spatial reference information (Bearing, Direction, 16 Zone, 32 Entrance Sector,
 * 45 Devta Cell, Panchatattva Region, Distance from Brahmasthan).
 *
 * Does NOT create or mutate Rooms, Walls, Doors, or Windows.
 * Does NOT duplicate SpatialModelEngine.
 */
export class SpatialMappingEngine implements BaseEngine {
  public readonly name = 'SpatialMappingEngine';
  private initialized = false;

  private config: SpatialMappingConfig = {
    brahmasthan: { x: 0, y: 0 },
    northOrientationDegrees: 0,
    brahmasthanRadius: 50
  };

  constructor(
    private readonly geometryEngine?: GeometryEngine,
    private readonly eventEngine?: EventEngine
  ) {}

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    Logger.info(`[${this.name}] Initialized.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    this.initialized = false;
    Logger.info(`[${this.name}] Shutdown.`);
  }

  // --- CONFIGURATION MANAGEMENT ---

  public setBrahmasthan(center: Point2D, radius?: number): void {
    this.ensureInitialized();
    this.config.brahmasthan = { x: center.x, y: center.y };
    if (radius !== undefined && radius > 0) {
      this.config.brahmasthanRadius = radius;
    }
    this.publishConfigUpdated();
  }

  public getBrahmasthan(): Point2D {
    return { ...this.config.brahmasthan };
  }

  public setNorthOrientation(degrees: number): void {
    this.ensureInitialized();
    // Normalize to 0 - 360°
    const normalized = ((degrees % 360) + 360) % 360;
    this.config.northOrientationDegrees = normalized;
    this.publishConfigUpdated();
  }

  public getNorthOrientation(): number {
    return this.config.northOrientationDegrees;
  }

  public setBrahmasthanRadius(radius: number): void {
    this.ensureInitialized();
    if (radius <= 0) {
      throw new Error(`Invalid Brahmasthan radius: ${radius}. Radius must be positive.`);
    }
    this.config.brahmasthanRadius = radius;
    this.publishConfigUpdated();
  }

  public getBrahmasthanRadius(): number {
    return this.config.brahmasthanRadius;
  }

  public updateConfig(newConfig: Partial<SpatialMappingConfig>): void {
    this.ensureInitialized();
    if (newConfig.brahmasthan) {
      this.config.brahmasthan = { ...newConfig.brahmasthan };
    }
    if (newConfig.northOrientationDegrees !== undefined) {
      this.config.northOrientationDegrees = ((newConfig.northOrientationDegrees % 360) + 360) % 360;
    }
    if (newConfig.brahmasthanRadius !== undefined && newConfig.brahmasthanRadius > 0) {
      this.config.brahmasthanRadius = newConfig.brahmasthanRadius;
    }
    this.publishConfigUpdated();
  }

  // --- CORE MAPPING METHODS ---

  public mapPoint(
    point: Point2D,
    metadata?: { objectId?: string; objectType?: string; objectName?: string }
  ): SpatialMappingResult {
    this.ensureInitialized();

    const distanceFromBrahmasthan = this.calculateDistance(point);
    const isBrahmasthanZone = distanceFromBrahmasthan <= this.config.brahmasthanRadius;
    const bearingDegrees = this.calculateBearing(point);

    const zone16 = this.get16ZoneForBearing(bearingDegrees, isBrahmasthanZone);
    const entranceSector32 = this.get32EntranceSectorForBearing(bearingDegrees);
    const devtaCell45 = this.get45DevtaCell(bearingDegrees, distanceFromBrahmasthan, isBrahmasthanZone);
    const panchatattvaRegion = this.getPanchatattvaRegion(bearingDegrees, isBrahmasthanZone);

    const result: SpatialMappingResult = {
      objectId: metadata?.objectId,
      objectType: metadata?.objectType,
      objectName: metadata?.objectName,
      position: { x: point.x, y: point.y },
      bearingDegrees,
      distanceFromBrahmasthan,
      directionName: isBrahmasthanZone ? 'Center (Brahmasthan)' : zone16.name,
      isBrahmasthanZone,
      zone16,
      entranceSector32,
      devtaCell45,
      panchatattvaRegion
    };

    this.publishEvent<SpatialMappedPayload>(SpatialMappingEventType.SPATIAL_MAPPED, { result });
    return result;
  }

  public mapRoom(room: RoomObject): SpatialMappingResult {
    const center = room.center || {
      x: (room.boundingBox.min.x + room.boundingBox.max.x) / 2,
      y: (room.boundingBox.min.y + room.boundingBox.max.y) / 2
    };

    return this.mapPoint(center, {
      objectId: room.id,
      objectType: 'ROOM',
      objectName: room.name
    });
  }

  public mapWall(wall: WallObject): SpatialMappingResult {
    const midPoint: Point2D = {
      x: (wall.startPoint.x + wall.endPoint.x) / 2,
      y: (wall.startPoint.y + wall.endPoint.y) / 2
    };

    return this.mapPoint(midPoint, {
      objectId: wall.id,
      objectType: 'WALL',
      objectName: wall.name
    });
  }

  public mapDoor(door: DoorObject): SpatialMappingResult {
    return this.mapPoint(door.position, {
      objectId: door.id,
      objectType: 'DOOR',
      objectName: door.name
    });
  }

  public mapWindow(windowObj: WindowObject): SpatialMappingResult {
    return this.mapPoint(windowObj.position, {
      objectId: windowObj.id,
      objectType: 'WINDOW',
      objectName: windowObj.name
    });
  }

  public mapObjects(
    objects: Array<RoomObject | WallObject | DoorObject | WindowObject>
  ): SpatialMappingResult[] {
    this.ensureInitialized();
    return objects.map((obj) => {
      if ('polygon' in obj) {
        return this.mapRoom(obj as RoomObject);
      } else if ('startPoint' in obj && 'endPoint' in obj) {
        return this.mapWall(obj as WallObject);
      } else if ('swingDirection' in obj) {
        return this.mapDoor(obj as DoorObject);
      } else {
        return this.mapWindow(obj as WindowObject);
      }
    });
  }

  // --- CALCULATION HELPERS ---

  public calculateBearing(point: Point2D): number {
    const dx = point.x - this.config.brahmasthan.x;
    // In standard screen 2D coordinates, Y increases downwards.
    // For compass bearing: North is along negative Y axis.
    // dx = x - x0, dy = y - y0
    const dy = point.y - this.config.brahmasthan.y;

    // Angle clockwise from North (-Y direction):
    // Math.atan2(dx, -dy) gives 0 rad along North (-Y), +PI/2 rad along East (+X), +PI along South (+Y), -PI/2 rad along West (-X).
    const rad = Math.atan2(dx, -dy);
    let degrees = (rad * 180) / Math.PI;

    // Adjust for north orientation offset
    degrees = degrees - this.config.northOrientationDegrees;

    // Normalize to [0, 360)
    return ((degrees % 360) + 360) % 360;
  }

  public calculateDistance(point: Point2D): number {
    if (this.geometryEngine) {
      return this.geometryEngine.distancePointToPoint(this.config.brahmasthan, point);
    }
    const dx = point.x - this.config.brahmasthan.x;
    const dy = point.y - this.config.brahmasthan.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public get16ZoneForBearing(bearingDegrees: number, isBrahmasthan = false): VastuZone {
    if (isBrahmasthan) {
      const centerZone = VASTU_ZONES_16.find((z) => z.id === 'Center');
      if (centerZone) return centerZone;
    }

    const norm = ((bearingDegrees % 360) + 360) % 360;

    for (const zone of VASTU_ZONES_16) {
      if (zone.id === 'Center') continue;

      if (zone.startAngle > zone.endAngle) {
        // Spans across 0° / 360° boundary (e.g., North: 348.75° to 11.25°)
        if (norm >= zone.startAngle || norm < zone.endAngle) {
          return zone;
        }
      } else {
        if (norm >= zone.startAngle && norm < zone.endAngle) {
          return zone;
        }
      }
    }

    // Default fallback to North
    return VASTU_ZONES_16[0];
  }

  public get32EntranceSectorForBearing(bearingDegrees: number): EntranceSector32 {
    const norm = ((bearingDegrees % 360) + 360) % 360;

    for (const sector of ENTRANCE_SECTORS_32) {
      if (sector.startAngle > sector.endAngle) {
        if (norm >= sector.startAngle || norm < sector.endAngle) {
          return sector;
        }
      } else {
        if (norm >= sector.startAngle && norm < sector.endAngle) {
          return sector;
        }
      }
    }

    return ENTRANCE_SECTORS_32[2]; // N3 default fallback
  }

  public get45DevtaCell(
    bearingDegrees: number,
    distance: number,
    isBrahmasthan = false
  ): DevtaCell45 {
    if (isBrahmasthan) {
      return DEVTA_CELLS_45[0]; // Brahma
    }

    const norm = ((bearingDegrees % 360) + 360) % 360;

    // Inner ring vs Outer ring based on distance relative to Brahmasthan radius
    const isInnerRing = distance <= this.config.brahmasthanRadius * 2.5;

    if (isInnerRing) {
      if (norm >= 337.5 || norm < 22.5) return DEVTA_CELLS_45[1]; // Bhudhar (North)
      if (norm >= 22.5 && norm < 67.5) return DEVTA_CELLS_45[5]; // Aap / Aapavatsa (NE)
      if (norm >= 67.5 && norm < 112.5) return DEVTA_CELLS_45[2]; // Aryama (East)
      if (norm >= 112.5 && norm < 157.5) return DEVTA_CELLS_45[7]; // Savita / Savitra (SE)
      if (norm >= 157.5 && norm < 202.5) return DEVTA_CELLS_45[3]; // Vivasvan (South)
      if (norm >= 202.5 && norm < 247.5) return DEVTA_CELLS_45[9]; // Jaya / Indra (SW)
      if (norm >= 247.5 && norm < 292.5) return DEVTA_CELLS_45[4]; // Mitra (West)
      return DEVTA_CELLS_45[11]; // Rudra / Rajayakshma (NW)
    }

    // Outer Ring: map directly from 32 entrance sectors / peripheral devtas
    const entranceSector = this.get32EntranceSectorForBearing(norm);
    const outerDevta = DEVTA_CELLS_45.find(
      (d) => d.ring === 'OUTER' && d.name.toLowerCase().includes(entranceSector.devtaName.toLowerCase())
    );

    if (outerDevta) {
      return outerDevta;
    }

    // Fallback outer devta by sector index offset
    const indexIn32 = ENTRANCE_SECTORS_32.findIndex((s) => s.id === entranceSector.id);
    const devtaIndex = 13 + (indexIn32 >= 0 ? indexIn32 : 0);
    return DEVTA_CELLS_45[Math.min(devtaIndex, DEVTA_CELLS_45.length - 1)];
  }

  public getPanchatattvaRegion(bearingDegrees: number, isBrahmasthan = false): PanchatattvaRegion {
    if (isBrahmasthan) {
      return PANCHATATTVA_REGIONS.SPACE;
    }

    const norm = ((bearingDegrees % 360) + 360) % 360;

    // Water (Jal): North to North-East (326.25° to 56.25°)
    if (norm >= 326.25 || norm < 56.25) {
      return PANCHATATTVA_REGIONS.WATER;
    }
    // Air (Vayu): East-North-East to East (56.25° to 101.25°)
    if (norm >= 56.25 && norm < 101.25) {
      return PANCHATATTVA_REGIONS.AIR;
    }
    // Fire (Agni): East-South-East to South-South-East (101.25° to 168.75°)
    if (norm >= 101.25 && norm < 168.75) {
      return PANCHATATTVA_REGIONS.FIRE;
    }
    // Earth (Prithvi): South to South-West (168.75° to 247.5°)
    if (norm >= 168.75 && norm < 247.5) {
      return PANCHATATTVA_REGIONS.EARTH;
    }
    // Space (Akash): West-South-West to North-West (247.5° to 326.25°)
    return PANCHATATTVA_REGIONS.SPACE;
  }

  // --- PRIVATE HELPER METHODS ---

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(`[${this.name}] Engine must be initialized before operation.`);
    }
  }

  private publishConfigUpdated(): void {
    this.publishEvent<SpatialConfigUpdatedPayload>(SpatialMappingEventType.CONFIG_UPDATED, {
      config: { ...this.config }
    });
  }

  private publishEvent<T>(type: SpatialMappingEventType, payload: T): void {
    if (this.eventEngine) {
      this.eventEngine.publish({
        type,
        payload,
        timestamp: Date.now(),
        source: this.name
      });
    }
  }
}
