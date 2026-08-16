import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc, 
  deleteDoc, 
  query,
  where
} from "firebase/firestore";
import { db, isFirebaseConfigured, firebaseConfig, databaseId } from "../firebase";

const COLLECTION_NAME = "workspaces";
const LOCAL_STORAGE_KEY = "urjaflux_workspaces_fallback";

export interface Workspace {
  id: string;
  projectId: string;
  floorPlanImage: {
    name: string;
    size: string;
    url: string;
  } | null;
  northAngle: number;
  scale: string; // e.g., "4.8 Meters (25px/unit)"
  canvasZoom: number;
  canvasOffset: { x: number; y: number };
  layers: {
    original: boolean;
    reference: boolean;
    compass: boolean;
    grid: boolean;
    rooms: boolean;
    objects: boolean;
    notes: boolean;
    futureAi: boolean;
  };
  objects: any[];
  measurements: any[];
  photos: any[];
  notes: string;
  lastUpdated: string;

  // Sprint 5 Annotation structures for full state preservation
  annotations?: any[];
  annotationLayers?: {
    blueprint: boolean;
    grid: boolean;
    rooms: boolean;
    symbols: boolean;
    compassOverlay: boolean;
    vastuZones: boolean;
    measurements: boolean;
  };
  annotationZoom?: number;
  annotationPan?: { x: number; y: number };
  annotationMeasurePoints?: { x: number; y: number }[];

  // Additional calibration parameters to ensure full state preservation
  calibrationStep?: number;
  northType?: "True" | "Magnetic";
  magneticDeviation?: number;
  isScaleLocked?: boolean;
  scalePoints?: { x: number; y: number }[];
  scaleDistance?: string;
  scaleUnit?: "Meters" | "Feet" | "Millimeters";
  pixelScaleRatio?: number;
  isPropertyLocked?: boolean;
  propertyVertices?: { x: number; y: number }[];
  isBuildingLocked?: boolean;
  buildingVertices?: { x: number; y: number }[];
  propertyObservations?: string;
  pendingQuestions?: string;

  // Business metadata
  workspaceName?: string;
  clientId?: string;
  clientName?: string;
  propertyId?: string;
  propertyName?: string;
  projectName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Initialize fallback local storage if needed
function getLocalFallbackWorkspaces(): Workspace[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("[URJAFLUX AI OS] Error parsing local storage fallback workspaces:", e);
    }
  }
  return [];
}

function saveLocalFallbackWorkspaces(workspaces: Workspace[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workspaces));
}

/**
 * Fetch a Workspace for a given projectId.
 * If Firebase is active, queries Firestore. Otherwise, reads from local storage fallback.
 */
export async function getWorkspace(projectId: string): Promise<Workspace | null> {







  if (!projectId) {






    return null;
  }



  if (isFirebaseConfigured && db) {
    try {
      // 1. Try first with the new deterministic ID format (ws_<projectId>)
      const newDocId = `ws_${projectId}`;
      const docRef = doc(db, COLLECTION_NAME, newDocId);

      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();

        const payload = {
          ...(data as Omit<Workspace, "id">),
          id: docSnap.id,
        };






        return payload;
      }

      // 2. Try with the old direct projectId format
      const oldDocId = projectId;
      const oldDocRef = doc(db, COLLECTION_NAME, oldDocId);

      const oldDocSnap = await getDoc(oldDocRef);

      if (oldDocSnap.exists()) {
        const data = oldDocSnap.data();

        const payload = {
          ...(data as Omit<Workspace, "id">),
          id: oldDocSnap.id,
        };






        return payload;
      }


      // 3. Fallback query if stored under a different ID (covers random IDs)
      const q = query(collection(db, COLLECTION_NAME), where("projectId", "==", projectId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const firstDoc = querySnapshot.docs[0];

        const payload = {
          ...(firstDoc.data() as Omit<Workspace, "id">),
          id: firstDoc.id,
        };






        return payload;
      }


      // Fallback check: If we have a local fallback copy, return it and upload it to Firestore in the background
      const locals = getLocalFallbackWorkspaces();
      const localFound = locals.find(w => w.projectId === projectId) || null;
      if (localFound) {

        const finalDocId = `ws_${projectId}`;
        localFound.id = finalDocId;
        const uploadDocRef = doc(db, COLLECTION_NAME, finalDocId);
        setDoc(uploadDocRef, localFound).then(() => {

        }).catch(err => {
          console.error(`[workspaceService] Error uploading local fallback workspace to Firestore:`, err);
        });
        





        return localFound;
      }







      return null;
    } catch (error) {
      console.error(`[URJAFLUX AI OS] Error fetching workspace for project ${projectId} from Firestore:`, error);
      // Fallback to local storage
      const locals = getLocalFallbackWorkspaces();
      const found = locals.find(w => w.projectId === projectId) || null;





      return found;
    }
  } else {

    const locals = getLocalFallbackWorkspaces();
    const found = locals.find(w => w.projectId === projectId) || null;





    return found;
  }
}

/**
 * Create a new Workspace.
 * Uses projectId as the Document ID to guarantee uniqueness and fast queries.
 */
export async function createWorkspace(workspaceData: Omit<Workspace, "id"> & { id?: string }): Promise<Workspace> {
  const docId = `ws_${workspaceData.projectId}`;
  const now = new Date().toISOString();
  const newWorkspace: Workspace = {
    ...workspaceData,
    id: docId,
    workspaceName: workspaceData.workspaceName || "",
    clientId: workspaceData.clientId || "",
    clientName: workspaceData.clientName || "",
    propertyId: workspaceData.propertyId || "",
    propertyName: workspaceData.propertyName || "",
    projectName: workspaceData.projectName || "",
    createdAt: workspaceData.createdAt || now,
    updatedAt: now,
  };








  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, docId);





      await setDoc(docRef, newWorkspace);




      return newWorkspace;
    } catch (error) {




      console.error("[workspaceService] [Firestore error] Error creating workspace in Firestore:", error);
    }
  } else {
    console.warn("[workspaceService] Firebase not configured or db is null during createWorkspace. Using local fallback.");
  }

  // Fallback / Local logic

  const locals = getLocalFallbackWorkspaces();
  const filtered = locals.filter(w => w.projectId !== workspaceData.projectId);
  const updated = [newWorkspace, ...filtered];
  saveLocalFallbackWorkspaces(updated);
  return newWorkspace;
}

/**
 * Update an existing Workspace.
 */
export async function updateWorkspace(updatedWorkspace: Workspace): Promise<Workspace> {







  const now = new Date().toISOString();
  let existing: Workspace | null = null;

  // 1. Try to load from Firestore first to merge metadata
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, updatedWorkspace.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        existing = docSnap.data() as Workspace;
      }
    } catch (error) {
      console.error("[workspaceService] Error fetching existing workspace for merge:", error);
    }
  }

  // 2. If not found in Firestore or Firestore failed, try local fallback
  if (!existing) {
    const locals = getLocalFallbackWorkspaces();
    existing = locals.find(w => w.id === updatedWorkspace.id) || null;
  }

  // Helper to resolve metadata safely: incoming -> existing -> "" (empty string)
  const resolveField = (val: string | undefined | null, fallback: string | undefined | null): string => {
    if (val !== undefined && val !== null) return val;
    if (fallback !== undefined && fallback !== null) return fallback;
    return "";
  };

  const workspaceToSave: Workspace = {
    ...updatedWorkspace,
    workspaceName: resolveField(updatedWorkspace.workspaceName, existing?.workspaceName),
    clientId: resolveField(updatedWorkspace.clientId, existing?.clientId),
    clientName: resolveField(updatedWorkspace.clientName, existing?.clientName),
    propertyId: resolveField(updatedWorkspace.propertyId, existing?.propertyId),
    propertyName: resolveField(updatedWorkspace.propertyName, existing?.propertyName),
    projectName: resolveField(updatedWorkspace.projectName, existing?.projectName),
    createdAt: updatedWorkspace.createdAt || existing?.createdAt || now,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, workspaceToSave.id);





      await setDoc(docRef, workspaceToSave, { merge: true });







      return workspaceToSave;
    } catch (error) {







      console.error(`[workspaceService] [Firestore error] Error updating workspace ${workspaceToSave.id} in Firestore:`, error);
    }
  }

  // Fallback / Local logic

  const locals = getLocalFallbackWorkspaces();
  const updated = locals.map((w) => (w.id === workspaceToSave.id ? workspaceToSave : w));
  
  // In case it wasn't in local storage yet (rare)
  if (!locals.some(w => w.id === workspaceToSave.id)) {
    updated.push(workspaceToSave);
  }
  
  saveLocalFallbackWorkspaces(updated);
  return workspaceToSave;
}

/**
 * Delete a Workspace by ID.
 */
export async function deleteWorkspace(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);

    } catch (error) {
      console.error(`[URJAFLUX AI OS] Error deleting workspace ${id} from Firestore:`, error);
    }
  }

  // Fallback / Local logic
  const locals = getLocalFallbackWorkspaces();
  const filtered = locals.filter((w) => w.id !== id);
  saveLocalFallbackWorkspaces(filtered);
}

// Export a default object for backward compatibility
export const workspaceService = {
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
};
