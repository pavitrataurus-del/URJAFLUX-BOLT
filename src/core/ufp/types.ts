import { USOMBaseObject } from '../usom/types';

/**
 * URJAFLUX Project Format (UFP)
 * Represents the entire state of a project for persistence.
 */
export interface UFPProject {
  /**
   * Format version, used for migration and validation.
   */
  version: string;
  
  /**
   * Project metadata (name, author, creation date, etc.)
   */
  metadata: UFPProjectMetadata;
  
  /**
   * Persistent Spatial Geometry.
   * Only geometry is saved. Analysis is NOT cached here; it is regenerated on load.
   */
  geometry: UFPSpatialGeometry;
  
  /**
   * Track the versions of knowledge packs used to create this project.
   * This ensures that when the project is loaded, it either uses the exact same knowledge,
   * or prompts the user for a knowledge upgrade.
   */
  knowledgeDependencies: UFPKnowledgeDependency[];
  
  /**
   * Viewport and camera state to restore the user's view.
   */
  viewport: UFPViewportState;
}

export interface UFPProjectMetadata {
  id: string;
  name: string;
  author: string;
  createdAt: number;
  updatedAt: number;
}

export interface UFPSpatialGeometry {
  /**
   * The list of all spatial objects in the project.
   */
  objects: USOMBaseObject[];
}

export interface UFPKnowledgeDependency {
  packId: string;
  version: string;
}

export interface UFPViewportState {
  x: number;
  y: number;
  zoom: number;
}
