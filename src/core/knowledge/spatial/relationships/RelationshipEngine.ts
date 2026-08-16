import { ISpatialObject, ISpatialRelationship, SpatialRelationshipType, ISpatialGeometry } from "../models/SpatialModels";
import { GeometryEngine } from "../geometry/GeometryEngine";

export class RelationshipEngine {
  private static instance: RelationshipEngine;

  private constructor() {}

  public static getInstance(): RelationshipEngine {
    if (!RelationshipEngine.instance) {
      RelationshipEngine.instance = new RelationshipEngine();
    }
    return RelationshipEngine.instance;
  }

  public buildRelationships(objects: ISpatialObject[]): void {
    const geometryEngine = GeometryEngine.getInstance();
    
    // Very basic N^2 relationship building for MVP
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const obj1 = objects[i];
        const obj2 = objects[j];

        if (geometryEngine.doIntersect(obj1.geometry, obj2.geometry)) {
          this.addRelationship(obj1, obj2, SpatialRelationshipType.INTERSECTS, 0.8);
          this.addRelationship(obj2, obj1, SpatialRelationshipType.INTERSECTS, 0.8);
        }
        
        // Example check for proximity
        if (obj1.geometry.centroid && obj2.geometry.centroid) {
           const dist = geometryEngine.calculateDistance(obj1.geometry.centroid, obj2.geometry.centroid);
           const threshold = (obj1.geometry.dimensions?.width || 100) * 2; // naive threshold
           
           if (dist < threshold) {
              this.addRelationship(obj1, obj2, SpatialRelationshipType.NEAR, 0.7);
              this.addRelationship(obj2, obj1, SpatialRelationshipType.NEAR, 0.7);
           }
        }
      }
    }
  }

  private addRelationship(source: ISpatialObject, target: ISpatialObject, type: SpatialRelationshipType, confidence: number) {
    // Check if relationship already exists
    const exists = source.relationships.some(r => r.targetObjectId === target.id && r.relationshipType === type);
    if (!exists) {
      source.relationships.push({
        id: `rel_${source.id}_${target.id}_${type}`,
        sourceObjectId: source.id,
        targetObjectId: target.id,
        relationshipType: type,
        confidence,
        metadata: {}
      });
    }
  }
}
