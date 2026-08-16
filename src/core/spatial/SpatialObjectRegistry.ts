import {
  FloorPlan,
  SpatialObject,
  Room,
  Wall,
  Door,
  Window,
  Stair,
  Column,
  Beam,
  FurniturePlaceholder,
  Coordinate,
  Direction8Zone
} from './SpatialTypes';

export class QuadTreeNode {
  public bounds: { minX: number; minY: number; maxX: number; maxY: number };
  public capacity: number;
  public objects: SpatialObject[];
  public divided: boolean;
  public nw?: QuadTreeNode;
  public ne?: QuadTreeNode;
  public sw?: QuadTreeNode;
  public se?: QuadTreeNode;

  constructor(bounds: { minX: number; minY: number; maxX: number; maxY: number }, capacity = 4) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.objects = [];
    this.divided = false;
  }

  public insert(obj: SpatialObject): boolean {
    if (
      obj.coordinate.x < this.bounds.minX ||
      obj.coordinate.x > this.bounds.maxX ||
      obj.coordinate.y < this.bounds.minY ||
      obj.coordinate.y > this.bounds.maxY
    ) {
      return false;
    }

    if (this.objects.length < this.capacity && !this.divided) {
      this.objects.push(obj);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      (this.nw && this.nw.insert(obj)) ||
      (this.ne && this.ne.insert(obj)) ||
      (this.sw && this.sw.insert(obj)) ||
      (this.se && this.se.insert(obj)) ||
      false
    );
  }

  private subdivide() {
    const { minX, minY, maxX, maxY } = this.bounds;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    this.nw = new QuadTreeNode({ minX, minY: midY, maxX: midX, maxY }, this.capacity);
    this.ne = new QuadTreeNode({ minX: midX, minY: midY, maxX, maxY }, this.capacity);
    this.sw = new QuadTreeNode({ minX, minY, maxX: midX, maxY: midY }, this.capacity);
    this.se = new QuadTreeNode({ minX: midX, minY, maxX, maxY: midY }, this.capacity);

    this.divided = true;

    // Re-insert existing objects into subnodes
    const currentObjs = [...this.objects];
    this.objects = [];
    currentObjs.forEach((o) => {
      this.nw?.insert(o);
      this.ne?.insert(o);
      this.sw?.insert(o);
      this.se?.insert(o);
    });
  }

  public queryRange(
    range: { minX: number; minY: number; maxX: number; maxY: number },
    found: SpatialObject[] = []
  ): SpatialObject[] {
    if (
      this.bounds.maxX < range.minX ||
      this.bounds.minX > range.maxX ||
      this.bounds.maxY < range.minY ||
      this.bounds.minY > range.maxY
    ) {
      return found;
    }

    for (const obj of this.objects) {
      if (
        obj.coordinate.x >= range.minX &&
        obj.coordinate.x <= range.maxX &&
        obj.coordinate.y >= range.minY &&
        obj.coordinate.y <= range.maxY
      ) {
        found.push(obj);
      }
    }

    if (this.divided) {
      this.nw?.queryRange(range, found);
      this.ne?.queryRange(range, found);
      this.sw?.queryRange(range, found);
      this.se?.queryRange(range, found);
    }

    return found;
  }
}

export class SpatialObjectRegistry {
  private static instance: SpatialObjectRegistry;
  private registryMap: Map<string, SpatialObject> = new Map();
  private quadTree?: QuadTreeNode;

  private constructor() {}

  public static getInstance(): SpatialObjectRegistry {
    if (!SpatialObjectRegistry.instance) {
      SpatialObjectRegistry.instance = new SpatialObjectRegistry();
    }
    return SpatialObjectRegistry.instance;
  }

  /**
   * Populate and index floor plan objects into permanent registry and QuadTree
   */
  public registerFloorPlanObjects(floorPlan: FloorPlan): SpatialObject[] {
    this.registryMap.clear();

    const bbox = floorPlan.outerBoundary.boundingBox;
    this.quadTree = new QuadTreeNode(bbox, 4);

    const registered: SpatialObject[] = [];

    // Register Rooms
    floorPlan.rooms.forEach((r) => {
      const obj: SpatialObject = {
        id: `SPATIAL-${r.id}`,
        type: 'ROOM',
        entityId: r.id,
        name: r.name,
        layerType: 'ROOMS',
        coordinate: r.centroid,
        cardinalDirection: r.cardinalDirection
      };
      this.registryMap.set(obj.id, obj);
      this.quadTree?.insert(obj);
      registered.push(obj);
    });

    // Register Walls
    floorPlan.walls.forEach((w) => {
      const midPoint = {
        x: (w.startPoint.x + w.endPoint.x) / 2,
        y: (w.startPoint.y + w.endPoint.y) / 2
      };
      const obj: SpatialObject = {
        id: `SPATIAL-${w.id}`,
        type: 'WALL',
        entityId: w.id,
        name: w.name,
        layerType: 'WALLS',
        coordinate: midPoint,
        cardinalDirection: w.cardinalDirection
      };
      this.registryMap.set(obj.id, obj);
      this.quadTree?.insert(obj);
      registered.push(obj);
    });

    // Register Doors
    floorPlan.doors.forEach((d) => {
      const obj: SpatialObject = {
        id: `SPATIAL-${d.id}`,
        type: 'DOOR',
        entityId: d.id,
        name: d.name,
        layerType: 'DOORS',
        coordinate: d.location,
        cardinalDirection: d.cardinalDirection
      };
      this.registryMap.set(obj.id, obj);
      this.quadTree?.insert(obj);
      registered.push(obj);
    });

    // Register Windows
    floorPlan.windows.forEach((win) => {
      const obj: SpatialObject = {
        id: `SPATIAL-${win.id}`,
        type: 'WINDOW',
        entityId: win.id,
        name: win.name,
        layerType: 'WINDOWS',
        coordinate: win.location,
        cardinalDirection: win.cardinalDirection
      };
      this.registryMap.set(obj.id, obj);
      this.quadTree?.insert(obj);
      registered.push(obj);
    });

    // Register Stairs
    floorPlan.stairs.forEach((st) => {
      const obj: SpatialObject = {
        id: `SPATIAL-${st.id}`,
        type: 'STAIR',
        entityId: st.id,
        name: st.name,
        layerType: 'STAIRS',
        coordinate: {
          x: (st.boundary.boundingBox.minX + st.boundary.boundingBox.maxX) / 2,
          y: (st.boundary.boundingBox.minY + st.boundary.boundingBox.maxY) / 2
        },
        cardinalDirection: st.directionUp
      };
      this.registryMap.set(obj.id, obj);
      this.quadTree?.insert(obj);
      registered.push(obj);
    });

    return registered;
  }

  public getAllObjects(): SpatialObject[] {
    return Array.from(this.registryMap.values());
  }

  public getObjectById(id: string): SpatialObject | undefined {
    return this.registryMap.get(id);
  }

  /**
   * Fast spatial query by bounding box using QuadTree
   */
  public querySpatialRegion(range: { minX: number; minY: number; maxX: number; maxY: number }): SpatialObject[] {
    if (!this.quadTree) return [];
    return this.quadTree.queryRange(range);
  }
}
