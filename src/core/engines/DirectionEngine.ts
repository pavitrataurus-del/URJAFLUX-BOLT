import { BaseEngine } from '../types/BaseEngine';
import { EventEngine } from '../events/EventEngine';
import { Logger } from '../utils/logger';
import { Point2D } from '../spatial/math';

export interface DirectionVector {
  x: number;
  y: number;
  angle: number;
}

export interface SectorDefinition {
  id: string;
  name: string;
  startAngle: number;
  endAngle: number;
  centerAngle: number;
  element?: string;
  devta?: string;
}

export interface DirectionMatrix {
  userNorth: number;
  trueNorth: number;
  bearing: number;
  rotationMatrix: number[][];
  cardinalVectors: Record<string, DirectionVector>;
  sectors16: SectorDefinition[];
  entrances32: SectorDefinition[];
  devtas45: SectorDefinition[];
  panchatattva: SectorDefinition[];
}

/**
 * DirectionEngine - Sole authoritative owner of:
 * - True North
 * - User North
 * - Bearing
 * - Rotation Matrix
 * - Direction Matrix
 * 
 * Centralizes all angular and direction calculations across the USOM architecture.
 */
export class DirectionEngine implements BaseEngine {
  public readonly name = 'DirectionEngine';
  private initialized = false;

  private trueNorth: number = 0; // Degrees (0° = True Canonical North)
  private userNorth: number = 0; // Degrees user rotation offset

  constructor(private events?: EventEngine) {}

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    Logger.info(`[${this.name}] Initialized as sole direction authority.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    this.initialized = false;
    Logger.info(`[${this.name}] Shutdown.`);
  }

  // --- PUBLIC API ---

  /**
   * Returns True North in degrees [0, 360)
   */
  public getTrueNorth(): number {
    return this.trueNorth;
  }

  /**
   * Returns User North in degrees [0, 360)
   */
  public getUserNorth(): number {
    return this.userNorth;
  }

  /**
   * Returns calculated Bearing angle relative to True North
   */
  public getBearing(): number {
    return ((this.userNorth - this.trueNorth) % 360 + 360) % 360;
  }

  /**
   * Sets True North angle and triggers DIRECTION_CHANGED
   */
  public setTrueNorth(angle: number): void {
    const normalized = ((angle % 360) + 360) % 360;
    if (this.trueNorth !== normalized) {
      this.trueNorth = normalized;
      this.publishDirectionChanged();
    }
  }

  /**
   * Sets User North angle and triggers DIRECTION_CHANGED
   */
  public setUserNorth(angle: number): void {
    const normalized = ((angle % 360) + 360) % 360;
    if (this.userNorth !== normalized) {
      this.userNorth = normalized;
      this.publishDirectionChanged();
    }
  }

  /**
   * Rotates User North by delta degrees or sets absolute angle
   */
  public rotateNorth(deltaOrAngle: number, relative: boolean = false): number {
    const newAngle = relative ? this.userNorth + deltaOrAngle : deltaOrAngle;
    this.setUserNorth(newAngle);
    return this.userNorth;
  }

  /**
   * Returns 2x2 rotation matrix for current User North angle
   */
  public getRotationMatrix(): number[][] {
    const rad = (this.userNorth * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [
      [cos, -sin],
      [sin, cos]
    ];
  }

  /**
   * Generates master Direction Matrix containing rotation, vectors, and sector matrices
   */
  public getDirectionMatrix(): DirectionMatrix {
    const userNorth = this.userNorth;
    const trueNorth = this.trueNorth;
    const bearing = this.getBearing();
    const rotationMatrix = this.getRotationMatrix();

    // Standard 8 Cardinal/Ordinal Vectors
    const cardinalAngles: Record<string, number> = {
      N: 0,
      NE: 45,
      E: 90,
      SE: 135,
      S: 180,
      SW: 225,
      W: 270,
      NW: 315
    };

    const cardinalVectors: Record<string, DirectionVector> = {};
    for (const [key, baseAngle] of Object.entries(cardinalAngles)) {
      const effectiveAngle = ((baseAngle + userNorth) % 360 + 360) % 360;
      const rad = (effectiveAngle * Math.PI) / 180;
      cardinalVectors[key] = {
        angle: effectiveAngle,
        x: Math.sin(rad),
        y: -Math.cos(rad) // -Y is North in screen space
      };
    }

    return {
      userNorth,
      trueNorth,
      bearing,
      rotationMatrix,
      cardinalVectors,
      sectors16: this.generateSectors(16, userNorth),
      entrances32: this.generateSectors(32, userNorth),
      devtas45: this.generateSectors(45, userNorth),
      panchatattva: this.generateSectors(5, userNorth)
    };
  }

  /**
   * Converts a screen coordinate relative to center point into a normalized bearing [0, 360)
   */
  public screenToBearing(point: Point2D, center: Point2D): number {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    // atan2 in screen space (-Y is up)
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI;
    // Convert to bearing where North (-Y) is 0°
    let bearing = (angleDeg + 90 - this.userNorth) % 360;
    if (bearing < 0) bearing += 360;
    return bearing;
  }

  /**
   * Converts bearing angle into a 0-indexed sector
   */
  public bearingToSector(bearing: number, sectorCount: number): number {
    const normalized = ((bearing % 360) + 360) % 360;
    const step = 360 / sectorCount;
    const halfStep = step / 2;
    const sector = Math.floor(((normalized + halfStep) % 360) / step);
    return sector;
  }

  /**
   * Returns the center angle in degrees for a given sector index
   */
  public getSectorAngle(index: number, sectorCount: number): number {
    const step = 360 / sectorCount;
    return ((index * step + this.userNorth) % 360 + 360) % 360;
  }

  /**
   * Rotates a 2D point around center by angleDeg
   */
  public rotatePoint(point: Point2D, center: Point2D, angleDeg: number): Point2D {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return {
      x: center.x + (dx * cos - dy * sin),
      y: center.y + (dx * sin + dy * cos)
    };
  }

  /**
   * Resolves text name for a direction bearing
   */
  public getDirectionName(bearing: number, system: '8' | '16' | '32' | '45' = '16'): string {
    const names16 = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    if (system === '8') {
      const names8 = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const idx = this.bearingToSector(bearing, 8);
      return names8[idx] || 'N';
    }
    const idx = this.bearingToSector(bearing, 16);
    return names16[idx] || 'N';
  }

  // --- PRIVATE HELPERS ---

  private generateSectors(count: number, offsetAngle: number): SectorDefinition[] {
    const step = 360 / count;
    const halfStep = step / 2;
    const sectors: SectorDefinition[] = [];

    const names16 = [
      'North', 'North-North-East', 'North-East', 'East-North-East',
      'East', 'East-South-East', 'South-East', 'South-South-East',
      'South', 'South-South-West', 'South-West', 'West-South-West',
      'West', 'West-North-West', 'North-West', 'North-North-West'
    ];

    for (let i = 0; i < count; i++) {
      const centerAngle = ((i * step + offsetAngle) % 360 + 360) % 360;
      const startAngle = ((centerAngle - halfStep) % 360 + 360) % 360;
      const endAngle = ((centerAngle + halfStep) % 360 + 360) % 360;
      const name = count === 16 ? names16[i] : `Sector ${i + 1}`;

      sectors.push({
        id: `sec_${count}_${i}`,
        name,
        startAngle,
        endAngle,
        centerAngle
      });
    }

    return sectors;
  }

  private publishDirectionChanged(): void {
    if (this.events) {
      this.events.publish({
        type: 'DIRECTION_CHANGED',
        timestamp: Date.now(),
        payload: {
          userNorth: this.userNorth,
          trueNorth: this.trueNorth,
          bearing: this.getBearing(),
          rotationMatrix: this.getRotationMatrix(),
          directionMatrix: this.getDirectionMatrix()
        },
        source: this.name
      });
    }
  }
}
