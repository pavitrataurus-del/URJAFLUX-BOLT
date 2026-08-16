import { IDigitalTwin, ITwinObject, TwinLifecycleState, ITwinRelationship, TwinRelationshipType } from "../models/TwinModels";
import { ISpatialObject, SpatialRelationshipType } from "../../spatial";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { TwinEventType, createTwinEvent } from "../events/TwinEvents";

export class TwinGenerator {
  private static instance: TwinGenerator;

  private constructor() {}

  public static getInstance(): TwinGenerator {
    if (!TwinGenerator.instance) {
      TwinGenerator.instance = new TwinGenerator();
    }
    return TwinGenerator.instance;
  }

  public generateTwin(projectId: string, floorId: string, spatialObjects: ISpatialObject[], author: string): IDigitalTwin {
    const twinObjects: ITwinObject[] = spatialObjects.map(so => {
      
      const relationships: ITwinRelationship[] = so.relationships.map(r => ({
        id: `trel_${r.id}`,
        sourceId: r.sourceObjectId,
        targetId: r.targetObjectId,
        type: this.mapRelationshipType(r.relationshipType),
        confidence: r.confidence,
        metadata: r.metadata
      }));

      return {
        id: so.id,
        canonicalType: so.canonicalType,
        ontologyReference: so.ontologyReference,
        geometry: so.geometry,
        confidence: so.confidence,
        namespaceId: so.namespaceId,
        lifecycleState: TwinLifecycleState.ACTIVE,
        metadata: so.metadata,
        relationships
      };
    });

    const twinId = `twin_${projectId}_${floorId}`;
    const twin: IDigitalTwin = {
      id: twinId,
      projectId,
      floorId,
      name: `Twin Floor ${floorId}`,
      version: {
        versionId: `v_1.0_${Date.now()}`,
        revision: 1,
        timestamp: Date.now(),
        author,
        changeSummary: "Initial Twin Generation"
      },
      objects: twinObjects,
      metadata: {}
    };

    EventBus.getInstance().publish(createTwinEvent(TwinEventType.TWIN_CREATED, { twinId: twin.id, projectId }));

    return twin;
  }
  
  private mapRelationshipType(spatialRelType: SpatialRelationshipType | string): TwinRelationshipType {
    switch(spatialRelType) {
      case "CONTAINS": return TwinRelationshipType.CONTAINS;
      case "ADJACENT": return TwinRelationshipType.ADJACENT_TO;
      case "CONNECTED": return TwinRelationshipType.CONNECTED_TO;
      case "OVERLAPS": return TwinRelationshipType.OVERLAPS;
      case "INSIDE": return TwinRelationshipType.INSIDE;
      case "OUTSIDE": return TwinRelationshipType.NEAR; 
      case "NEAR": return TwinRelationshipType.NEAR;
      case "INTERSECTS": return TwinRelationshipType.INTERSECTS;
      default: return TwinRelationshipType.NEAR;
    }
  }
}
