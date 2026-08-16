export enum ModuleStatus {
  INITIALIZING = "INITIALIZING",
  READY = "READY",
  DEGRADED = "DEGRADED",
  ERROR = "ERROR",
  STOPPED = "STOPPED",
}

export interface IModuleDefinition {
  id: string;
  name: string;
  version: string;
  dependencies?: string[];
  capabilities?: string[];
}

export interface IModule {
  definition: IModuleDefinition;
  status: ModuleStatus;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  checkHealth(): Promise<boolean>;
}
