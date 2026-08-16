import { IDigitalTwin } from "../models/TwinModels";

export interface ITwinRepository {
  createTwin(twin: IDigitalTwin): Promise<IDigitalTwin>;
  updateTwin(twin: IDigitalTwin): Promise<IDigitalTwin>;
  deleteTwin(twinId: string): Promise<void>;
  getTwin(twinId: string): Promise<IDigitalTwin | null>;
  listTwinsByProject(projectId: string): Promise<IDigitalTwin[]>;
  saveTwin(twin: IDigitalTwin): Promise<void>;
}
