import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query 
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { Client } from "../types/app";
import type { SubscriberScope } from "../core/access/knowledgeVaultAccess";

const COLLECTION_NAME = "clients";
const LOCAL_STORAGE_KEY = "urjaflux_clients_fallback";

// Initialize fallback local storage if needed
function getLocalFallbackClients(): Client[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("[URJAFLUX AI OS] Error parsing local storage fallback clients:", e);
    }
  }
  // Initialize with mock data if first time
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  return [];
}

function saveLocalFallbackClients(clients: Client[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clients));
}

/**
 * Get all registered clients.
 * If Firebase is active, queries Firestore. Otherwise, reads from local storage fallback.
 */
export async function getClients(scope?: SubscriberScope): Promise<Client[]> {
  let list: Client[];

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const querySnapshot = await getDocs(q);
      list = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          ...(data as Omit<Client, "id">),
          id: docSnap.id,
        });
      });
      list.sort((a, b) => b.joinedDate.localeCompare(a.joinedDate));
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error fetching clients from Firestore, falling back to local:", error);
      list = getLocalFallbackClients();
    }
  } else {
    list = getLocalFallbackClients();
  }

  if (scope?.userId) {
    list = list.filter(
      (c) => c.ownerUserId === scope.userId || c.organizationId === scope.organizationId
    );
  }

  return list;
}

/**
 * Register/Add a new client.
 * Auto-generates a unique id, and ensures Firestore Document ID and client.id are identical.
 */
export async function addClient(
  clientData: Omit<Client, "id" | "joinedDate">,
  ownership?: SubscriberScope
): Promise<Client> {
  const joinedDate = new Date().toISOString().split("T")[0];
  const avatarUrl = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=100&h=100&fit=crop`;
  const ownedFields = ownership
    ? {
        ownerUserId: ownership.userId,
        organizationId: ownership.organizationId || ownership.userId,
      }
    : {};
  
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(collection(db, COLLECTION_NAME));
      const newClient: Client = {
        ...clientData,
        ...ownedFields,
        id: docRef.id,
        joinedDate,
        avatarUrl,
      };

      // 2. Write the client data to that specific document path
      await setDoc(docRef, newClient);

      return newClient;
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error creating client in Firestore, falling back to local:", error);
    }
  }

  // Fallback / Local logic
  const localId = `c_${Date.now()}`;
  const newClient: Client = {
    ...clientData,
    ...ownedFields,
    id: localId,
    joinedDate,
    avatarUrl,
  };
  const current = getLocalFallbackClients();
  const updated = [newClient, ...current];
  saveLocalFallbackClients(updated);
  return newClient;
}

/**
 * Update an existing client.
 * Ensures the Document ID matching updatedClient.id is modified.
 */
export async function updateClient(updatedClient: Client): Promise<Client> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, updatedClient.id);
      // setDoc with merge: true is highly robust and matches the whole object
      await setDoc(docRef, updatedClient, { merge: true });

      return updatedClient;
    } catch (error) {
      console.error("[URJAFLUX AI OS] Error updating client in Firestore, updating locally:", error);
    }
  }

  // Fallback / Local logic
  const current = getLocalFallbackClients();
  const updated = current.map((c) => (c.id === updatedClient.id ? updatedClient : c));
  saveLocalFallbackClients(updated);
  return updatedClient;
}

/**
 * Delete a client by ID.
 * Ensures the Document ID matching the provided ID is deleted.
 */
export async function deleteClient(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);

    } catch (error) {
      console.error("[URJAFLUX AI OS] Error deleting client from Firestore, deleting locally:", error);
    }
  }

  // Fallback / Local logic
  const current = getLocalFallbackClients();
  const filtered = current.filter((c) => c.id !== id);
  saveLocalFallbackClients(filtered);
}

// Export a default object for backward compatibility if any file imports clientService
export const clientService = {
  getClients,
  addClient,
  updateClient,
  deleteClient
};
