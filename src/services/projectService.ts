import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query 
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { Project } from "../types/app";

const COLLECTION_NAME = "projects";
const LOCAL_STORAGE_KEY = "urjaflux_projects_fallback";

// Initialize fallback local storage if needed
function getLocalFallbackProjects(): Project[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("[URJAFLUX AI OS] Error parsing local storage fallback projects:", e);
    }
  }
  // Initialize with mock data if first time
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  return [];
}

function saveLocalFallbackProjects(projects: Project[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
}

/**
 * Get all registered projects.
 * If Firebase is active, queries Firestore. Otherwise, reads from local storage fallback.
 */
export async function getProjects(): Promise<Project[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const querySnapshot = await getDocs(q);
      const list: Project[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Force project ID to match the Firestore document ID precisely
        list.push({
          ...(data as Omit<Project, "id">),
          id: docSnap.id,
        });
      });
      return list;
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error fetching projects from Firestore, falling back to local:", error);
      return getLocalFallbackProjects();
    }
  } else {
    return getLocalFallbackProjects();
  }
}

/**
 * Register/Add a new project.
 * Auto-generates a unique id, and ensures Firestore Document ID and project.id are identical.
 */
export async function addProject(projectData: Omit<Project, "id">): Promise<Project> {
  if (isFirebaseConfigured && db) {
    try {
      // 1. Get a document reference to pre-generate the document ID
      const docRef = doc(collection(db, COLLECTION_NAME));
      const newProject: Project = {
        ...projectData,
        id: docRef.id, // Set the project.id directly to the generated Firestore doc ID!
      };

      // 2. Write the project data to that specific document path
      await setDoc(docRef, newProject);

      return newProject;
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error creating project in Firestore, falling back to local:", error);
    }
  }

  // Fallback / Local logic
  const localId = `p_${Date.now()}`;
  const newProject: Project = {
    ...projectData,
    id: localId,
  };
  const current = getLocalFallbackProjects();
  const updated = [newProject, ...current];
  saveLocalFallbackProjects(updated);
  return newProject;
}

/**
 * Update an existing project.
 * Ensures the Document ID matching updatedProject.id is modified.
 */
export async function updateProject(updatedProject: Project): Promise<Project> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, updatedProject.id);
      // setDoc with merge: true is highly robust and matches the whole object
      await setDoc(docRef, updatedProject, { merge: true });

      return updatedProject;
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error updating project in Firestore, updating locally:", error);
    }
  }

  // Fallback / Local logic
  const current = getLocalFallbackProjects();
  const updated = current.map((p) => (p.id === updatedProject.id ? updatedProject : p));
  saveLocalFallbackProjects(updated);
  return updatedProject;
}

/**
 * Delete a project by ID.
 * Ensures the Document ID matching the provided ID is deleted.
 */
export async function deleteProject(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);

    } catch (error) {
      console.error("[URJAFLUX AI OS] Error deleting project from Firestore, deleting locally:", error);
    }
  }

  // Fallback / Local logic
  const current = getLocalFallbackProjects();
  const filtered = current.filter((p) => p.id !== id);
  saveLocalFallbackProjects(filtered);
}

// Export a default object for backward compatibility if any file imports projectService
export const projectService = {
  getProjects,
  addProject,
  updateProject,
  deleteProject
};
