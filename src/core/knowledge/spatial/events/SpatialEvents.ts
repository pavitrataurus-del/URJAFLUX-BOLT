import { IEvent, EventPriority } from "../../../../infrastructure/events/EventTypes";

export enum SpatialEventType {
  SPATIAL_PIPELINE_STARTED = "SPATIAL_PIPELINE_STARTED",
  ONTOLOGY_RESOLVED = "ONTOLOGY_RESOLVED",
  SPATIAL_OBJECT_CREATED = "SPATIAL_OBJECT_CREATED",
  GEOMETRY_ASSOCIATED = "GEOMETRY_ASSOCIATED",
  RELATIONSHIP_CREATED = "RELATIONSHIP_CREATED",
  CONFIDENCE_CALCULATED = "CONFIDENCE_CALCULATED",
  SPATIAL_PIPELINE_COMPLETED = "SPATIAL_PIPELINE_COMPLETED",
  SPATIAL_PIPELINE_FAILED = "SPATIAL_PIPELINE_FAILED"
}

export const createSpatialEvent = <T>(type: SpatialEventType, payload: T, tenantId?: string): IEvent<T> => ({
  id: Math.random().toString(36).substring(2, 9),
  type,
  payload,
  timestamp: Date.now(),
  tenantId,
  priority: EventPriority.NORMAL
});
