import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc, 
  query, 
  where 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, isFirebaseConfigured } from "../firebase";
import { WorkspaceDigitalTwin, WorkspaceDigitalTwinDrawing } from "../types/app";
import { getWorkspace as getExistingWorkspace, Workspace } from "./workspaceService";

const COLLECTION_NAME = "workspace_digital_twins";
const LOCAL_STORAGE_KEY = "urjaflux_digital_twins_fallback";

// Local storage fallback helper
function getLocalFallbackTwins(): WorkspaceDigitalTwin[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("[URJAFLUX AI OS] Error parsing local storage fallback twins:", e);
    }
  }
  return [];
}

function saveLocalFallbackTwins(twins: WorkspaceDigitalTwin[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(twins));
}

/**
 * Adapter layer mapping Workspace to WorkspaceDigitalTwin
 */
export function mapWorkspaceToDigitalTwin(ws: Workspace, existingDrawings: WorkspaceDigitalTwinDrawing[] = []): WorkspaceDigitalTwin {
  const targetId = ws.projectId || ws.id;
  return {
    id: targetId,
    workspaceId: ws.id,
    projectId: targetId,
    projectName: ws.projectName || "",
    clientId: ws.clientId || "",
    clientName: ws.clientName || "",
    propertyId: ws.propertyId || "",
    propertyName: ws.propertyName || "",
    
    // Floor Plan
    floorPlanImage: ws.floorPlanImage,

    // Drawings
    drawings: existingDrawings,

    // Space Engineering Layers & State
    northAngle: ws.northAngle ?? 0,
    scale: ws.scale ?? "",
    canvasZoom: ws.canvasZoom ?? 1,
    canvasOffset: ws.canvasOffset ?? { x: 0, y: 0 },
    layers: ws.layers ?? {
      original: true,
      reference: true,
      compass: true,
      grid: true,
      rooms: true,
      objects: true,
      notes: true,
      futureAi: false,
    },
    objects: ws.objects ?? [],
    measurements: ws.measurements ?? [],
    photos: ws.photos ?? [],
    notes: ws.notes ?? "",
    lastUpdated: ws.lastUpdated || new Date().toISOString(),

    // Sprint 5 Annotations
    annotations: ws.annotations ?? [],
    annotationLayers: ws.annotationLayers,
    annotationZoom: ws.annotationZoom,
    annotationPan: ws.annotationPan,
    annotationMeasurePoints: ws.annotationMeasurePoints,

    // Calibration parameters
    calibrationStep: ws.calibrationStep,
    northType: ws.northType,
    magneticDeviation: ws.magneticDeviation,
    isScaleLocked: ws.isScaleLocked,
    scalePoints: ws.scalePoints,
    scaleDistance: ws.scaleDistance,
    scaleUnit: ws.scaleUnit,
    pixelScaleRatio: ws.pixelScaleRatio,
    isPropertyLocked: ws.isPropertyLocked,
    propertyVertices: ws.propertyVertices,
    isBuildingLocked: ws.isBuildingLocked,
    buildingVertices: ws.buildingVertices,
    propertyObservations: ws.propertyObservations,
    pendingQuestions: ws.pendingQuestions,

    createdAt: ws.createdAt || new Date().toISOString(),
    updatedAt: ws.updatedAt || new Date().toISOString(),
  };
}

/**
 * Fetch a WorkspaceDigitalTwin for a given projectId.
 * Implements backward compatibility: If no WorkspaceDigitalTwin document exists,
 * it looks up the legacy Workspace document and transforms it using the Adapter.
 */
export async function getWorkspaceDigitalTwin(projectId: string): Promise<WorkspaceDigitalTwin | null> {

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {

        return docSnap.data() as WorkspaceDigitalTwin;
      }

      // Backward compatibility hook: Load legacy Workspace document if it exists

      const legacyWorkspace = await getExistingWorkspace(projectId);
      if (legacyWorkspace) {

        const mappedTwin = mapWorkspaceToDigitalTwin(legacyWorkspace);
        // Persist the mapped digital twin for future calls
        await saveWorkspaceDigitalTwin(mappedTwin);
        return mappedTwin;
      }
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error fetching workspace digital twin from Firestore:", error);
    }
  }

  // Fallback to local storage
  const twins = getLocalFallbackTwins();
  const found = twins.find((t) => t.projectId === projectId || t.id === projectId);
  if (found) {
    return found;
  }

  // Check legacy local storage fallback
  const legacyWorkspacesJson = localStorage.getItem("urjaflux_workspaces_fallback");
  if (legacyWorkspacesJson) {
    try {
      const legacyWorkspaces: Workspace[] = JSON.parse(legacyWorkspacesJson);
      const legacyWS = legacyWorkspaces.find(w => w.projectId === projectId || w.id === projectId);
      if (legacyWS) {

        const mappedTwin = mapWorkspaceToDigitalTwin(legacyWS);
        const allTwins = getLocalFallbackTwins().filter(t => t.id !== projectId);
        allTwins.push(mappedTwin);
        saveLocalFallbackTwins(allTwins);
        return mappedTwin;
      }
    } catch (e) {
      console.error("[URJAFLUX AI OS] Error parsing legacy workspaces fallback local storage:", e);
    }
  }

  return null;
}

/**
 * Save / Create / Update a WorkspaceDigitalTwin document.
 */
export async function saveWorkspaceDigitalTwin(twin: WorkspaceDigitalTwin): Promise<WorkspaceDigitalTwin> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, twin.id);
      await setDoc(docRef, twin, { merge: true });

      return twin;
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error saving WorkspaceDigitalTwin to Firestore:", error);
    }
  }

  // Local storage fallback
  const twins = getLocalFallbackTwins();
  const filtered = twins.filter((t) => t.id !== twin.id);
  filtered.push(twin);
  saveLocalFallbackTwins(filtered);

  return twin;
}

/**
 * Add a new drawing metadata record to a WorkspaceDigitalTwin.
 */
export async function saveDrawingMetadata(
  workspaceId: string, 
  drawing: WorkspaceDigitalTwinDrawing
): Promise<WorkspaceDigitalTwin> {
  let twin = await getWorkspaceDigitalTwin(workspaceId);
  if (!twin) {
    twin = {
      id: workspaceId,
      workspaceId: workspaceId,
      projectId: workspaceId,
      projectName: "",
      clientId: "",
      clientName: "",
      propertyId: "",
      propertyName: "",
      floorPlanImage: null,
      drawings: [],
      northAngle: 0,
      scale: "",
      canvasZoom: 1,
      canvasOffset: { x: 0, y: 0 },
      layers: {
        original: true,
        reference: true,
        compass: true,
        grid: true,
        rooms: true,
        objects: true,
        notes: true,
        futureAi: false,
      },
      objects: [],
      measurements: [],
      photos: [],
      notes: "",
      lastUpdated: new Date().toISOString(),
    };
  }
  
  // Prevent duplicate additions by ID
  const existingIndex = twin.drawings.findIndex((d) => d.id === drawing.id);
  if (existingIndex > -1) {
    twin.drawings[existingIndex] = drawing;
  } else {
    twin.drawings.push(drawing);
  }

  return saveWorkspaceDigitalTwin(twin);
}

/**
 * Upload drawing binary file to Firebase Storage and get downloadURL
 */
export async function uploadDrawingFile(
  projectId: string,
  versionId: string,
  file: File
): Promise<{ storagePath: string; downloadURL: string }> {
  if (isFirebaseConfigured && storage) {
    try {
      const fileId = `drw_${Date.now()}`;
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const storagePath = `projects/${projectId}/versions/${versionId}/${fileId}_${sanitizedName}`;
      const storageRef = ref(storage, storagePath);
      
      // Upload binary bytes
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { storagePath, downloadURL };
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error uploading drawing file to Firebase Storage. Falling back to local Object URL:", error);
    }
  }

  // Fallback if Storage is unavailable or if upload fails
  console.warn("[URJAFLUX AI OS] Firebase Storage not active or failed. Creating localized Object URL preview.");
  const downloadURL = URL.createObjectURL(file);
  return {
    storagePath: `fallback_local_storage/projects/${projectId}/versions/${versionId}/${file.name}`,
    downloadURL,
  };
}

export const workspaceDigitalTwinService = {
  getWorkspaceDigitalTwin,
  saveWorkspaceDigitalTwin,
  saveDrawingMetadata,
  uploadDrawingFile,
  mapWorkspaceToDigitalTwin,
};
