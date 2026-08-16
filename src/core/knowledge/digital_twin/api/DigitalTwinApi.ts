import { IDigitalTwin, ITwinObject, ITwinRelationship } from "../models/TwinModels";
import { TwinRepositoryFactory } from "../repository/TwinRepositoryFactory";
import { TwinGenerator } from "../generator/TwinGenerator";
import { TwinValidator } from "../validation/TwinValidator";
import { TwinSerializer } from "../serialization/TwinSerializer";
import { ISpatialObject } from "../../spatial";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { TwinEventType, createTwinEvent } from "../events/TwinEvents";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class DigitalTwinApi {
  private static instance: DigitalTwinApi;

  private constructor() {}

  public static getInstance(): DigitalTwinApi {
    if (!DigitalTwinApi.instance) {
      DigitalTwinApi.instance = new DigitalTwinApi();
    }
    return DigitalTwinApi.instance;
  }

  public async createTwinFromSpatialObjects(projectId: string, floorId: string, spatialObjects: ISpatialObject[], author: string): Promise<IDigitalTwin> {
    const twin = TwinGenerator.getInstance().generateTwin(projectId, floorId, spatialObjects, author);
    TwinValidator.getInstance().validateTwin(twin);
    const repo = TwinRepositoryFactory.getInstance().getRepository();
    await repo.createTwin(twin);
    return twin;
  }

  public async getTwin(twinId: string): Promise<IDigitalTwin | null> {
    const repo = TwinRepositoryFactory.getInstance().getRepository();
    const twin = await repo.getTwin(twinId);
    if (twin) {
       EventBus.getInstance().publish(createTwinEvent(TwinEventType.TWIN_LOADED, { twinId }));
    }
    return twin;
  }

  public async updateTwin(twin: IDigitalTwin, author: string, changeSummary: string): Promise<IDigitalTwin> {
    TwinValidator.getInstance().validateTwin(twin);
    
    // Create new version
    twin.version = {
      versionId: `v_${twin.version.revision + 1}_${Date.now()}`,
      revision: twin.version.revision + 1,
      timestamp: Date.now(),
      author,
      changeSummary,
      rollbackMetadata: { previousVersionId: twin.version.versionId }
    };
    
    const repo = TwinRepositoryFactory.getInstance().getRepository();
    await repo.updateTwin(twin);
    EventBus.getInstance().publish(createTwinEvent(TwinEventType.TWIN_UPDATED, { twinId: twin.id }));
    EventBus.getInstance().publish(createTwinEvent(TwinEventType.TWIN_VERSION_CREATED, { twinId: twin.id, version: twin.version.versionId }));
    return twin;
  }

  public async saveTwin(twin: IDigitalTwin): Promise<void> {
    TwinValidator.getInstance().validateTwin(twin);
    const repo = TwinRepositoryFactory.getInstance().getRepository();
    await repo.saveTwin(twin);
    EventBus.getInstance().publish(createTwinEvent(TwinEventType.TWIN_SAVED, { twinId: twin.id }));
  }

  public async cloneTwin(twinId: string, newProjectId: string, author: string): Promise<IDigitalTwin> {
    const repo = TwinRepositoryFactory.getInstance().getRepository();
    const sourceTwin = await repo.getTwin(twinId);
    if (!sourceTwin) {
      throw new EnterpriseError(`Twin not found: ${twinId}`, { category: ErrorCategory.NOT_FOUND });
    }
    
    const clonedTwin: IDigitalTwin = JSON.parse(JSON.stringify(sourceTwin)); // deep copy
    clonedTwin.id = `twin_${newProjectId}_${clonedTwin.floorId}_clone_${Date.now()}`;
    clonedTwin.projectId = newProjectId;
    clonedTwin.version = {
      versionId: `v_1.0_${Date.now()}`,
      revision: 1,
      timestamp: Date.now(),
      author,
      changeSummary: `Cloned from ${twinId}`
    };
    
    await repo.createTwin(clonedTwin);
    return clonedTwin;
  }
  
  public validateTwin(twin: IDigitalTwin): boolean {
    try {
      const isValid = TwinValidator.getInstance().validateTwin(twin);
      if (isValid) {
         EventBus.getInstance().publish(createTwinEvent(TwinEventType.TWIN_VALIDATED, { twinId: twin.id }));
      }
      return isValid;
    } catch (e: any) {
      EventBus.getInstance().publish(createTwinEvent(TwinEventType.TWIN_VALIDATION_FAILED, { twinId: twin.id, error: e.message }));
      throw e;
    }
  }

  public serializeTwin(twin: IDigitalTwin): string {
    return TwinSerializer.getInstance().serialize(twin);
  }
  
  public deserializeTwin(data: string): IDigitalTwin {
    return TwinSerializer.getInstance().deserialize(data);
  }

  public listObjects(twin: IDigitalTwin): ITwinObject[] {
    return twin.objects;
  }

  public listRelationships(twin: IDigitalTwin): ITwinRelationship[] {
    return twin.objects.flatMap(obj => obj.relationships);
  }
}
