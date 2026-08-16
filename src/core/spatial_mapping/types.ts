import { Point2D } from '../geometry/types';
import { VastuZone } from '../spatial/types';
import { RoomObject, WallObject, DoorObject, WindowObject } from '../sme/types';

export interface EntranceSector32 {
  readonly id: string; // e.g. 'N1' .. 'N8', 'E1' .. 'E8', 'S1' .. 'S8', 'W1' .. 'W8'
  readonly name: string;
  readonly devtaName: string;
  readonly startAngle: number;
  readonly endAngle: number;
  readonly cardinalGroup: 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';
  readonly quality: 'FAVORABLE' | 'NEUTRAL' | 'UNFAVORABLE';
  readonly effect: string;
}

export interface DevtaCell45 {
  readonly id: string;
  readonly name: string;
  readonly devtaType: string;
  readonly ring: 'BRAHMA' | 'INNER' | 'MIDDLE' | 'OUTER';
  readonly angularSector: string;
  readonly attributes: string;
}

export interface PanchatattvaRegion {
  readonly element: 'Water' | 'Air' | 'Fire' | 'Earth' | 'Space';
  readonly nameHindi: string;
  readonly nameEnglish: string;
  readonly directionCode: string;
  readonly displayColor: string;
  readonly description: string;
}

export interface SpatialMappingResult {
  readonly objectId?: string;
  readonly objectType?: string;
  readonly objectName?: string;
  readonly position: Point2D;
  readonly bearingDegrees: number; // Normalized angle 0..360° relative to North orientation
  readonly distanceFromBrahmasthan: number; // Euclidean distance from Brahmasthan center
  readonly directionName: string;
  readonly isBrahmasthanZone: boolean;
  readonly zone16: VastuZone;
  readonly entranceSector32: EntranceSector32;
  readonly devtaCell45: DevtaCell45;
  readonly panchatattvaRegion: PanchatattvaRegion;
}

export interface SpatialMappingConfig {
  brahmasthan: Point2D;
  northOrientationDegrees: number; // Offset angle in degrees relative to standard top=North (0)
  brahmasthanRadius: number; // Radius threshold defining central Brahmasthan region
}

export enum SpatialMappingEventType {
  SPATIAL_MAPPED = 'spatial_mapping:mapped',
  CONFIG_UPDATED = 'spatial_mapping:config_updated'
}

export interface SpatialMappedPayload {
  result: SpatialMappingResult;
}

export interface SpatialConfigUpdatedPayload {
  config: SpatialMappingConfig;
}
