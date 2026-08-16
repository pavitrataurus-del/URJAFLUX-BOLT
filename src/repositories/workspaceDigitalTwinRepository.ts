import { 
  getWorkspaceDigitalTwin as serviceGetTwin,
  saveWorkspaceDigitalTwin as serviceSaveTwin,
  saveDrawingMetadata as serviceSaveDrawing,
  uploadDrawingFile as serviceUploadFile,
  mapWorkspaceToDigitalTwin as serviceMapWorkspace
} from "../services/workspaceDigitalTwinService";
import { WorkspaceDigitalTwin, WorkspaceDigitalTwinDrawing } from "../types/app";
import { Workspace } from "../services/workspaceService";

/**
 * Repository layer for managing WorkspaceDigitalTwin.
 */
export async function getWorkspaceDigitalTwin(projectId: string): Promise<WorkspaceDigitalTwin | null> {
  return serviceGetTwin(projectId);
}

/**
 * Save or update a WorkspaceDigitalTwin.
 */
export async function saveWorkspaceDigitalTwin(twin: WorkspaceDigitalTwin): Promise<WorkspaceDigitalTwin> {
  return serviceSaveTwin(twin);
}

/**
 * Save drawing metadata into a WorkspaceDigitalTwin.
 */
export async function saveDrawingMetadata(
  workspaceId: string, 
  drawing: WorkspaceDigitalTwinDrawing
): Promise<WorkspaceDigitalTwin> {
  return serviceSaveDrawing(workspaceId, drawing);
}

/**
 * Upload drawing binary file to Firebase Storage.
 */
export async function uploadDrawingFile(
  projectId: string,
  versionId: string,
  file: File
): Promise<{ storagePath: string; downloadURL: string }> {
  return serviceUploadFile(projectId, versionId, file);
}

/**
 * Convert legacy Workspace document to WorkspaceDigitalTwin
 */
export function mapWorkspaceToDigitalTwin(ws: Workspace, existingDrawings: WorkspaceDigitalTwinDrawing[] = []): WorkspaceDigitalTwin {
  return serviceMapWorkspace(ws, existingDrawings);
}

export const WorkspaceDigitalTwinRepository = {
  getWorkspaceDigitalTwin,
  saveWorkspaceDigitalTwin,
  saveDrawingMetadata,
  uploadDrawingFile,
  mapWorkspaceToDigitalTwin,
};
