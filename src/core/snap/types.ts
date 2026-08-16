import { Point2D } from '../geometry/types';

export enum SnapMode {
  ENDPOINT = 'ENDPOINT',
  MIDPOINT = 'MIDPOINT',
  CENTER = 'CENTER',
  INTERSECTION = 'INTERSECTION',
  GRID = 'GRID'
}

export interface SnapConfig {
  tolerance: number;
  gridSpacing: number;
  enabledModes: Record<SnapMode, boolean>;
  modePriorities: Record<SnapMode, number>;
}

export interface SnapOptions {
  customTolerance?: number;
  customGridSpacing?: number;
  enabledModes?: Partial<Record<SnapMode, boolean>>;
  excludedObjectIds?: string[];
}

export interface SnapCandidate {
  point: Point2D;
  mode: SnapMode;
  distance: number;
  priority: number;
  targetObjectId?: string;
  targetObject2Id?: string;
  description?: string;
}

export interface SnapResult {
  snapped: boolean;
  point: Point2D;
  mode: SnapMode | null;
  distance: number;
  candidate?: SnapCandidate;
}
