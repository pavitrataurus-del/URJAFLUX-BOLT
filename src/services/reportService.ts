import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query 
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { ProjectReport } from "../types/app";
import type { SubscriberScope } from "../core/access/knowledgeVaultAccess";

const COLLECTION_NAME = "reports";
const LOCAL_STORAGE_KEY = "urjaflux_reports_fallback";

// Initialize fallback local storage if needed
function getLocalFallbackReports(): ProjectReport[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("[URJAFLUX AI OS] Error parsing local storage fallback reports:", e);
    }
  }
  // Initialize with mock data if first time
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  return [];
}

function saveLocalFallbackReports(reports: ProjectReport[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
}

/**
 * Get all registered reports.
 * If Firebase is active, queries Firestore. Otherwise, reads from local storage fallback.
 */
export async function getReports(scope?: SubscriberScope): Promise<ProjectReport[]> {
  let list: ProjectReport[];

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const querySnapshot = await getDocs(q);
      list = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          ...(data as Omit<ProjectReport, "id">),
          id: docSnap.id,
        });
      });
      list.sort((a, b) => b.dateCreated.localeCompare(a.dateCreated));
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error fetching reports from Firestore, falling back to local:", error);
      list = getLocalFallbackReports();
    }
  } else {
    list = getLocalFallbackReports();
  }

  if (scope?.userId) {
    list = list.filter(
      (r) => r.ownerUserId === scope.userId || r.organizationId === scope.organizationId
    );
  }

  return list;
}

/**
 * Register/Add a new report.
 */
export async function addReport(
  reportData: Omit<ProjectReport, "id" | "dateCreated">,
  ownership?: SubscriberScope
): Promise<ProjectReport> {
  const dateCreated = new Date().toISOString().split("T")[0];
  const ownedFields = ownership
    ? {
        ownerUserId: ownership.userId,
        organizationId: ownership.organizationId || ownership.userId,
      }
    : {};
  
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(collection(db, COLLECTION_NAME));
      const newReport: ProjectReport = {
        ...reportData,
        ...ownedFields,
        id: docRef.id,
        dateCreated,
      };

      await setDoc(docRef, newReport);

      return newReport;
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error creating report in Firestore, falling back to local:", error);
    }
  }

  // Fallback / Local logic
  const localId = `r_${Date.now()}`;
  const newReport: ProjectReport = {
    ...reportData,
    ...ownedFields,
    id: localId,
    dateCreated,
  };
  const current = getLocalFallbackReports();
  const updated = [newReport, ...current];
  saveLocalFallbackReports(updated);
  return newReport;
}

/**
 * Update an existing report.
 */
export async function updateReport(updatedReport: ProjectReport): Promise<ProjectReport> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, updatedReport.id);
      await setDoc(docRef, updatedReport, { merge: true });

      return updatedReport;
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error updating report in Firestore, updating locally:", error);
    }
  }

  // Fallback / Local logic
  const current = getLocalFallbackReports();
  const updated = current.map((r) => (r.id === updatedReport.id ? updatedReport : r));
  saveLocalFallbackReports(updated);
  return updatedReport;
}

/**
 * Delete a report by ID.
 */
export async function deleteReport(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);

    } catch (error) {
      console.error("[URJAFLUX AI OS] Error deleting report from Firestore, deleting locally:", error);
    }
  }

  // Fallback / Local logic
  const current = getLocalFallbackReports();
  const filtered = current.filter((r) => r.id !== id);
  saveLocalFallbackReports(filtered);
}

// Export a default object
export const reportService = {
  getReports,
  addReport,
  updateReport,
  deleteReport
};
