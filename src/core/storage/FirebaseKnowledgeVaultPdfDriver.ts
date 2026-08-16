/**
 * Firebase-first PDF storage driver for Knowledge Vault.
 * Upload order: Firebase Storage (SSOT) → IndexedDB (cache).
 * Read order: IndexedDB cache → cloud download (Firebase or Supabase).
 *
 * NOTE: Does not import knowledgeVaultStorageService (avoids circular dynamic-import failure in Vite).
 */

import { ref, getBytes } from "firebase/storage";
import { storage, isFirebaseConfigured } from "../../firebase";
import {
  getSupabaseClient,
  isSupabaseConfigured,
  SUPABASE_KNOWLEDGE_BUCKET,
} from "../../supabase";
import type { PdfBinaryStoreItem } from "./schema";
import { IndexedDbPdfStorageDriver, type IPdfStorageDriver, type PdfIntegrityCheckResult } from "./EnterprisePdfStorageService";

function isCloudStorageAvailable(): boolean {
  return (isSupabaseConfigured && !!getSupabaseClient()) || (isFirebaseConfigured && !!storage);
}

async function fetchCloudBinary(storagePath: string): Promise<Uint8Array | null> {
  if (isSupabaseConfigured && getSupabaseClient()) {
    const { data, error } = await getSupabaseClient()!
      .storage.from(SUPABASE_KNOWLEDGE_BUCKET)
      .download(storagePath);
    if (error) return null;
    return new Uint8Array(await data.arrayBuffer());
  }

  if (isFirebaseConfigured && storage) {
    const bytes = await getBytes(ref(storage, storagePath));
    return new Uint8Array(bytes);
  }

  return null;
}

export class FirebaseKnowledgeVaultPdfDriver implements IPdfStorageDriver {
  public driverName = "FIREBASE_STORAGE";
  private localCache = new IndexedDbPdfStorageDriver();

  public async storeBinary(
    item: PdfBinaryStoreItem,
    binary: Uint8Array
  ): Promise<PdfBinaryStoreItem> {
    item.storageDriver = isCloudStorageAvailable() ? this.driverName : "INDEXED_DB_CACHE";
    return await this.localCache.storeBinary(item, binary);
  }

  public async retrieveBinary(idOrHash: string): Promise<{ item: PdfBinaryStoreItem; binary: Uint8Array } | null> {
    const cached = await this.localCache.retrieveBinary(idOrHash);
    if (cached) return cached;

    const meta = await this.localCache.getStorageItem(idOrHash);
    const storagePath = meta?.metadata?.storagePath as string | undefined;
    if (storagePath && isCloudStorageAvailable()) {
      try {
        const binary = await fetchCloudBinary(storagePath);
        if (binary && meta) {
          await this.localCache.storeBinary(meta, binary);
          return { item: meta, binary };
        }
      } catch (err) {
        console.warn("[FirebaseKnowledgeVaultPdfDriver] Cloud fetch failed:", err);
      }
    }
    return null;
  }

  public async getStorageItem(idOrHash: string): Promise<PdfBinaryStoreItem | null> {
    return await this.localCache.getStorageItem(idOrHash);
  }

  public async verifyIntegrity(idOrHash: string): Promise<PdfIntegrityCheckResult | null> {
    return await this.localCache.verifyIntegrity(idOrHash);
  }

  public async listItems(): Promise<PdfBinaryStoreItem[]> {
    return await this.localCache.listItems();
  }

  public async checkDriverHealth(): Promise<{ healthy: boolean; details: Record<string, unknown> }> {
    const localHealth = await this.localCache.checkDriverHealth();
    return {
      healthy: localHealth.healthy,
      details: {
        driver: this.driverName,
        cloudAvailable: isCloudStorageAvailable(),
        localCache: localHealth.details,
      },
    };
  }
}
