import { GeometryEngine } from '../../geometry/GeometryEngine';
import { ObjectEngine } from '../../engines/ObjectEngine';
import { CommandEngine } from '../../commands/CommandEngine';
import { USOMBaseObject } from '../../usom/types';
import { Point2D, LineSegment, Rectangle, Circle, Polygon } from '../../geometry/types';

export type ConstructionType = 'point' | 'line' | 'rectangle' | 'circle' | 'polygon' | 'diagonal';

export interface ConstructionToolContext {
  geometry: GeometryEngine;
  objects: ObjectEngine;
  commands: CommandEngine;
}

export interface ConstructionPointerEvent {
  x: number;
  y: number;
  originalEvent?: any;
}

export interface ConstructionObjectPayload {
  constructionType: ConstructionType;
  name: string;
  data: {
    point?: Point2D;
    segment?: LineSegment;
    rectangle?: Rectangle;
    circle?: Circle;
    polygon?: Polygon;
    [key: string]: any;
  };
  object: USOMBaseObject;
}
