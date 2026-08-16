import { Point, VastuZone } from './types';
import { calculateRelativeAngle, normalizeAngle, distance } from './geometry';
import { VASTU_ZONES_16 } from './zones';
import { engineAdapter } from '../adapters/EngineAdapter';

export class ZoneEngine {
  private northRotation: number = 0;
  private origin: Point = { x: 300, y: 230 }; // Match the default canvas center
  private zones: VastuZone[] = VASTU_ZONES_16;

  constructor(northRotation: number = 0, origin?: Point) {
    this.northRotation = northRotation;
    if (origin) {
      this.origin = origin;
    }
  }

  public setNorth(rotation: number) {
    this.northRotation = normalizeAngle(rotation);
    try {
      const dirEngine = engineAdapter.getDirectionEngine();
      if (dirEngine) {
        dirEngine.setUserNorth(this.northRotation);
      }
    } catch {
      // ignore
    }
  }

  public setOrigin(origin: Point) {
    this.origin = origin;
  }

  public getZones(): VastuZone[] {
    return this.zones;
  }
  
  public getRelativeAngle(point: Point): number {
    try {
      const dirEngine = engineAdapter.getDirectionEngine();
      if (dirEngine) {
        return dirEngine.screenToBearing(point, this.origin);
      }
    } catch {
      // fallback
    }
    return calculateRelativeAngle(point, this.origin, this.northRotation);
  }

  public getZoneFromAngle(angle: number): VastuZone | null {
    const normalizedAngle = normalizeAngle(angle);
    for (const zone of this.zones) {
      if (zone.id === "Center") continue;
      
      if (zone.startAngle > zone.endAngle) {
        if (normalizedAngle >= zone.startAngle || normalizedAngle <= zone.endAngle) {
          return zone;
        }
      } else {
        if (normalizedAngle >= zone.startAngle && normalizedAngle <= zone.endAngle) {
          return zone;
        }
      }
    }
    return null;
  }

  public getZone(point: Point, centerRadius: number = 50): VastuZone {
    const dist = distance(point, this.origin);
    // Determine if it's the center
    if (dist <= centerRadius) {
      const centerZone = this.zones.find(z => z.id === "Center");
      if (centerZone) return centerZone;
    }

    const angle = this.getRelativeAngle(point);
    return this.getZoneFromAngle(angle) || this.zones[0];
  }

  public getAdjacentZones(zoneId: string): { left: VastuZone | null; right: VastuZone | null } {
    // Exclude Center for adjacency
    const workingZones = this.zones.filter(z => z.id !== "Center");
    
    const idx = workingZones.findIndex(z => z.id === zoneId);
    if (idx === -1) return { left: null, right: null };
    
    const leftIdx = (idx - 1 + workingZones.length) % workingZones.length;
    const rightIdx = (idx + 1) % workingZones.length;
    
    return {
      left: workingZones[leftIdx],
      right: workingZones[rightIdx]
    };
  }
}

// Default global instance for convenience
export const defaultZoneEngine = new ZoneEngine();
