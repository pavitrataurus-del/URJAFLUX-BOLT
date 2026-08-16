import { Point2D } from '../spatial/math';
import { ChakraGeometry } from './MasterChakraObject';

export enum HandleType {
  ROTATE = 'ROTATE',
  SCALE = 'SCALE'
}

export interface Handle {
  type: HandleType;
  position: Point2D;
}

export class HandleCalculator {
  public static calculateChakraHandles(geometry: ChakraGeometry): Handle[] {
    return [
      {
        type: HandleType.ROTATE,
        position: { x: 0, y: geometry.radius + 12 } 
      },
      {
        type: HandleType.SCALE,
        position: { x: geometry.radius + 38, y: 0 } 
      }
    ];
  }
}
