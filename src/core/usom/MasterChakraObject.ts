import { USOMBaseObject, USOMObjectType, Transform, BoundingBox } from './types';
import { Point2D, SpatialMath, Sector2D } from '../spatial/math';

export interface ChakraGeometry {
  radius: number;
  sectors: Sector2D[];
}

export class MasterChakraObject implements USOMBaseObject {
  public id: string;
  public type: USOMObjectType = USOMObjectType.CHAKRA;
  public name: string;
  public transform: Transform;
  public metadata: Record<string, any>;
  public isVisible: boolean;
  public isLocked: boolean;
  public zIndex: number;
  public isSelected: boolean = false;
  
  private _geometry!: ChakraGeometry;
  private _boundingBox!: BoundingBox;
  private _baseRadius: number;

  constructor(
    id: string, 
    name: string, 
    transform: Transform, 
    baseRadius: number = 100,
    numberOfSectors: number = 32
  ) {
    this.id = id;
    this.name = name;
    this.transform = transform; 
    this.metadata = { numberOfSectors };
    this.isVisible = true;
    this.isLocked = false;
    this.zIndex = 100;
    this._baseRadius = baseRadius;
    
    this.recalculate();
  }

  public updateTransform(newTransform: Partial<Transform>): void {
    if (newTransform.position) this.transform.position = newTransform.position;
    if (newTransform.rotation !== undefined) this.transform.rotation = newTransform.rotation;
    if (newTransform.scale) this.transform.scale = newTransform.scale;
    
    this.recalculate();
  }

  public recalculate(): void {
    const effectiveRadius = this._baseRadius * this.transform.scale.x;
    
    this._geometry = {
      radius: effectiveRadius,
      sectors: SpatialMath.generateEqualSectors({x: 0, y: 0}, this.metadata.numberOfSectors || 32, 0, effectiveRadius)
    };
    
    this._boundingBox = {
      x: -effectiveRadius,
      y: -effectiveRadius,
      width: effectiveRadius * 2,
      height: effectiveRadius * 2
    };
  }

  public get geometry(): ChakraGeometry {
    return this._geometry;
  }

  public get boundingBox(): BoundingBox {
    return this._boundingBox;
  }
}
