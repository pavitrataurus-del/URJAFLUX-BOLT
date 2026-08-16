import { 
  getWorkspace as serviceGetWorkspace, 
  createWorkspace as serviceCreateWorkspace, 
  updateWorkspace as serviceUpdateWorkspace, 
  deleteWorkspace as serviceDeleteWorkspace, 
  Workspace 
} from "../services/workspaceService";
import { getProjects } from "../services/projectService";
import { getProperties } from "../services/propertyService";
import { getClients } from "../services/clientService";
import { WorkspaceKnowledgeModel } from "../types/workspaceKnowledgeModel";

/**
 * Fetch a Workspace for a given projectId.
 * Internally delegates to workspaceService.
 */
export async function getWorkspace(projectId: string): Promise<Workspace | null> {
  return serviceGetWorkspace(projectId);
}

/**
 * Create a new Workspace.
 * Internally delegates to workspaceService.
 */
export async function createWorkspace(workspace: Omit<Workspace, "id"> & { id?: string }): Promise<Workspace> {
  return serviceCreateWorkspace(workspace);
}

/**
 * Update an existing Workspace.
 * Internally delegates to workspaceService.
 */
export async function updateWorkspace(workspace: Workspace): Promise<Workspace> {
  return serviceUpdateWorkspace(workspace);
}

/**
 * Delete a Workspace by its ID.
 * Internally delegates to workspaceService.
 */
export async function deleteWorkspace(workspaceId: string): Promise<void> {
  return serviceDeleteWorkspace(workspaceId);
}

/**
 * Fetches and aggregates the unified WorkspaceKnowledgeModel for a project.
 * Combines data from client, property, project, and workspace domains into a single entity.
 */
export async function getWorkspaceKnowledgeModel(projectId: string): Promise<WorkspaceKnowledgeModel> {
  const workspace = await serviceGetWorkspace(projectId);

  // Fetch lists in parallel to optimize retrieval times
  const [projects, properties, clients] = await Promise.all([
    getProjects(),
    getProperties(),
    getClients()
  ]);

  const project = projects.find(p => p.id === projectId) || null;

  // Resolve property and client IDs from either the project metadata or workspace overrides
  const propertyId = project?.propertyId || workspace?.propertyId;
  const property = properties.find(p => p.id === propertyId) || null;

  const clientId = project?.clientId || workspace?.clientId;
  const client = clients.find(c => c.id === clientId) || null;

  return {
    client,
    property,
    project,
    workspace,
    objects: workspace?.objects || [],
    annotations: workspace?.annotations || [],
    measurements: workspace?.measurements || [],
    compass: {
      northAngle: workspace?.northAngle ?? 0,
      northType: workspace?.northType,
      magneticDeviation: workspace?.magneticDeviation
    },
    scale: {
      scale: workspace?.scale || "",
      isScaleLocked: workspace?.isScaleLocked,
      scalePoints: workspace?.scalePoints,
      scaleDistance: workspace?.scaleDistance,
      scaleUnit: workspace?.scaleUnit,
      pixelScaleRatio: workspace?.pixelScaleRatio
    },
    notes: workspace?.notes || "",
    photos: workspace?.photos || []
  };
}

// Single consolidated exported repository object matching the requested public contract
export const WorkspaceRepository = {
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceKnowledgeModel
};
