import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query 
} from "firebase/firestore";
import { safeSetDoc } from "../utils/firestoreSanitizer";
import { db, isFirebaseConfigured } from "../firebase";
import { Property } from "../types/app";
import type { SubscriberScope } from "../core/access/knowledgeVaultAccess";

const COLLECTION_NAME = "properties";
const LOCAL_STORAGE_KEY = "urjaflux_properties_fallback";

// Initialize fallback local storage if needed
function getLocalFallbackProperties(): Property[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("[URJAFLUX AI OS] Error parsing local storage fallback properties:", e);
    }
  }
  // Initialize with mock data if first time
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  return [];
}

function saveLocalFallbackProperties(properties: Property[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(properties));
}

/**
 * Get all registered properties.
 * If Firebase is active, queries Firestore. Otherwise, reads from local storage fallback.
 */
export async function getProperties(scope?: SubscriberScope): Promise<Property[]> {
  let list: Property[];

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const querySnapshot = await getDocs(q);
      list = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          ...(data as Omit<Property, "id">),
          id: docSnap.id,
        });
      });
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error fetching properties from Firestore, falling back to local:", error);
      list = getLocalFallbackProperties();
    }
  } else {
    list = getLocalFallbackProperties();
  }

  if (scope?.userId) {
    list = list.filter(
      (p) => p.ownerUserId === scope.userId || p.organizationId === scope.organizationId
    );
  }

  return list;
}

/**
 * Register/Add a new property.
 * Auto-generates a unique id, and ensures Firestore Document ID and property.id are identical.
 */
export async function addProperty(
  propertyData: Omit<Property, "id">,
  ownership?: SubscriberScope
): Promise<Property> {
  const ownedFields = ownership
    ? {
        ownerUserId: ownership.userId,
        organizationId: ownership.organizationId || ownership.userId,
      }
    : {};

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(collection(db, COLLECTION_NAME));
      const newProperty: Property = {
        ...propertyData,
        ...ownedFields,
        id: docRef.id,
      };

      // 2. Write the property data to that specific document path
      await safeSetDoc(docRef, newProperty);

      return newProperty;
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error creating property in Firestore, falling back to local:", error);
    }
  }

  // Fallback / Local logic
  const localId = `p_${Date.now()}`;
  const newProperty: Property = {
    ...propertyData,
    ...ownedFields,
    id: localId,
  };
  const current = getLocalFallbackProperties();
  const updated = [newProperty, ...current];
  saveLocalFallbackProperties(updated);
  return newProperty;
}

/**
 * Update an existing property.
 * Ensures the Document ID matching updatedProperty.id is modified.
 */
export async function updateProperty(updatedProperty: Property): Promise<Property> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, updatedProperty.id);
      // setDoc with merge: true is highly robust and matches the whole object
      await safeSetDoc(docRef, updatedProperty, { merge: true });

      return updatedProperty;
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error updating property in Firestore, updating locally:", error);
    }
  }

  // Fallback / Local logic
  const current = getLocalFallbackProperties();
  const updated = current.map((p) => (p.id === updatedProperty.id ? updatedProperty : p));
  saveLocalFallbackProperties(updated);
  return updatedProperty;
}

/**
 * Delete a property by ID.
 * Ensures the Document ID matching the provided ID is deleted.
 */
export async function deleteProperty(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);

    } catch (error) {
      console.error("[URJAFLUX AI OS] Error deleting property from Firestore, deleting locally:", error);
    }
  }

  // Fallback / Local logic
  const current = getLocalFallbackProperties();
  const filtered = current.filter((p) => p.id !== id);
  saveLocalFallbackProperties(filtered);
}

// Export a default object for backward compatibility if any file imports propertyService
export const propertyService = {
  getProperties,
  addProperty,
  updateProperty,
  deleteProperty
};
