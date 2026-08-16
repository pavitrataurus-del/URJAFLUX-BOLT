/**
 * Knowledge Vault PDF Storage — Cloud SSOT (Supabase preferred, Firebase fallback)
 *
 * Canonical binary path: knowledge-vault/{docId}/{sha16}_{sanitizedFileName}
 * IndexedDB (via EnterprisePdfStorageService) is offline cache only.
 * Firestore holds metadata only — never the PDF binary.
 */

import { ref, uploadBytes, getDownloadURL, deleteObject, getBytes } from "firebase/storage";
import { storage, isFirebaseConfigured } from "../firebase";
import {
  getSupabaseClient,
  isSupabaseConfigured,
  SUPABASE_KNOWLEDGE_BUCKET,
} from "../supabase";
import { EnterprisePdfStorageService } from "../core/storage/EnterprisePdfStorageService";
import { FirebaseKnowledgeVaultPdfDriver } from "../core/storage/FirebaseKnowledgeVaultPdfDriver";

export const KNOWLEDGE_VAULT_STORAGE_PREFIX = "knowledge-vault";

export type KnowledgeVaultCloudProvider = "SUPABASE" | "FIREBASE" | "NONE";

export interface KnowledgeVaultPdfUploadResult {
  storagePath: string;
  downloadURL: string;
  sha256Hash: string;
  /** True when binary is persisted in cloud storage (Supabase or Firebase). */
  isCloudSsot: boolean;
  cloudProvider: KnowledgeVaultCloudProvider;
  storageDriver: string;
  /** IndexedDB archive id when local cache write succeeded. */
  localCacheArchiveId?: string;
}

export interface KnowledgeVaultPdfStorageMetadata {
  storagePath: string;
  downloadURL: string;
  sha256Hash: string;
  storageDriver: string;
  isCloudSsot: boolean;
  cloudProvider: KnowledgeVaultCloudProvider;
  localCacheArchiveId?: string;
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function buildKnowledgeVaultStoragePath(
  docId: string,
  sha256Hash: string,
  fileName: string
): string {
  const shortHash = sha256Hash.substring(0, 16).toLowerCase();
  return `${KNOWLEDGE_VAULT_STORAGE_PREFIX}/${docId}/${shortHash}_${sanitizeFileName(fileName)}`;
}

export function getActiveKnowledgeVaultCloudProvider(): KnowledgeVaultCloudProvider {
  if (isSupabaseConfigured && getSupabaseClient()) return "SUPABASE";
  if (isFirebaseConfigured && storage !== null) return "FIREBASE";
  return "NONE";
}

export function isKnowledgeVaultCloudStorageAvailable(): boolean {
  return getActiveKnowledgeVaultCloudProvider() !== "NONE";
}

async function toUint8Array(
  data: ArrayBuffer | Uint8Array | Blob | File
): Promise<Uint8Array> {
  if (data instanceof Uint8Array) return data;
  if (data instanceof Blob) {
    const buf = await data.arrayBuffer();
    return new Uint8Array(buf);
  }
  return new Uint8Array(data);
}

async function uploadToSupabase(
  storagePath: string,
  bytes: Uint8Array,
  fileName: string,
  mimeType: string,
  docId: string,
  sha256Hash: string
): Promise<{ downloadURL: string }> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Supabase client is not initialized.");
  }

  const uploadOpts = {
    contentType: mimeType,
    upsert: false as const,
    metadata: {
      vaultDocumentId: docId,
      sha256Hash,
      originalFileName: fileName,
    },
  };

  let { error } = await client.storage.from(SUPABASE_KNOWLEDGE_BUCKET).upload(storagePath, bytes, uploadOpts);

  // upsert:true needs UPDATE RLS policy — most anon setups only allow INSERT.
  if (error && /already exists|duplicate/i.test(error.message)) {
    await client.storage.from(SUPABASE_KNOWLEDGE_BUCKET).remove([storagePath]);
    ({ error } = await client.storage.from(SUPABASE_KNOWLEDGE_BUCKET).upload(storagePath, bytes, uploadOpts));
  }

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data: signed, error: signErr } = await client.storage
    .from(SUPABASE_KNOWLEDGE_BUCKET)
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

  if (!signErr && signed?.signedUrl) {
    return { downloadURL: signed.signedUrl };
  }

  const { data: publicData } = client.storage
    .from(SUPABASE_KNOWLEDGE_BUCKET)
    .getPublicUrl(storagePath);

  const downloadURL = publicData.publicUrl;
  if (!downloadURL) {
    throw new Error(`Supabase signed URL failed: ${signErr?.message || "unknown"}`);
  }

  return { downloadURL };
}

async function uploadToFirebase(
  storagePath: string,
  bytes: Uint8Array,
  fileName: string,
  mimeType: string,
  docId: string,
  sha256Hash: string
): Promise<{ downloadURL: string }> {
  if (!isFirebaseConfigured || !storage) {
    throw new Error("Firebase Storage is not configured.");
  }

  const storageRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(storageRef, bytes, {
    contentType: mimeType,
    customMetadata: {
      vaultDocumentId: docId,
      sha256Hash,
      originalFileName: fileName,
    },
  });
  const downloadURL = await getDownloadURL(snapshot.ref);
  return { downloadURL };
}

/**
 * Upload PDF binary to cloud SSOT (Supabase first, then Firebase) and cache in IndexedDB.
 */
export async function uploadKnowledgeVaultPdf(
  docId: string,
  binary: ArrayBuffer | Uint8Array | Blob | File,
  fileName: string,
  mimeType = "application/pdf"
): Promise<KnowledgeVaultPdfUploadResult> {
  const bytes = await toUint8Array(binary);
  const sha256Hash = await EnterprisePdfStorageService.calculateSha256(bytes);
  const storagePath = buildKnowledgeVaultStoragePath(docId, sha256Hash, fileName);

  let downloadURL = "";
  let isCloudSsot = false;
  let cloudProvider: KnowledgeVaultCloudProvider = "NONE";
  let storageDriver = "INDEXED_DB_CACHE";

  const provider = getActiveKnowledgeVaultCloudProvider();

  if (provider === "SUPABASE") {
    try {
      const result = await uploadToSupabase(storagePath, bytes, fileName, mimeType, docId, sha256Hash);
      downloadURL = result.downloadURL;
      isCloudSsot = true;
      cloudProvider = "SUPABASE";
      storageDriver = "SUPABASE_STORAGE";
      console.log(
        `[KnowledgeVaultStorage] PDF uploaded to Supabase SSOT: ${SUPABASE_KNOWLEDGE_BUCKET}/${storagePath} (${bytes.byteLength} bytes)`
      );
    } catch (supabaseErr) {
      console.warn("[KnowledgeVaultStorage] Supabase upload failed, trying Firebase fallback:", supabaseErr);
    }
  }

  if (!isCloudSsot && provider === "FIREBASE") {
    try {
      const result = await uploadToFirebase(storagePath, bytes, fileName, mimeType, docId, sha256Hash);
      downloadURL = result.downloadURL;
      isCloudSsot = true;
      cloudProvider = "FIREBASE";
      storageDriver = "FIREBASE_STORAGE";
      console.log(
        `[KnowledgeVaultStorage] PDF uploaded to Firebase SSOT: ${storagePath} (${bytes.byteLength} bytes)`
      );
    } catch (firebaseErr) {
      console.warn("[KnowledgeVaultStorage] Firebase upload failed:", firebaseErr);
    }
  }

  if (!isCloudSsot) {
    console.warn(
      "[KnowledgeVaultStorage] No cloud storage available — IndexedDB cache only (configure Supabase or Firebase Blaze)."
    );
    downloadURL = `local-cache://${storagePath}`;
  }

  let localCacheArchiveId: string | undefined;
  try {
    const pdfStorage = EnterprisePdfStorageService.getInstance();
    const cached = await pdfStorage.storePdfBinary(bytes, {
      fileName,
      mimeType,
      driverName: "INDEXED_DB",
      metadata: {
        vaultDocumentId: docId,
        storagePath,
        downloadURL,
        sha256Hash,
        isCloudSsot,
        cloudProvider,
        storageRole: "CACHE",
      },
    });
    localCacheArchiveId = cached.id;
  } catch (cacheErr) {
    console.warn("[KnowledgeVaultStorage] IndexedDB cache write failed (non-fatal):", cacheErr);
  }

  return {
    storagePath,
    downloadURL,
    sha256Hash,
    isCloudSsot,
    cloudProvider,
    storageDriver,
    localCacheArchiveId,
  };
}

export async function getKnowledgeVaultPdfDownloadUrl(storagePath: string): Promise<string> {
  if (isSupabaseConfigured && getSupabaseClient()) {
    const client = getSupabaseClient()!;
    const { data } = client.storage.from(SUPABASE_KNOWLEDGE_BUCKET).getPublicUrl(storagePath);
    if (data.publicUrl) return data.publicUrl;
    const { data: signed, error } = await client.storage
      .from(SUPABASE_KNOWLEDGE_BUCKET)
      .createSignedUrl(storagePath, 60 * 60);
    if (error) throw error;
    return signed.signedUrl;
  }

  if (isFirebaseConfigured && storage) {
    return await getDownloadURL(ref(storage, storagePath));
  }

  throw new Error("No cloud storage provider configured.");
}

export async function fetchKnowledgeVaultPdfBinary(storagePath: string): Promise<Uint8Array> {
  if (isSupabaseConfigured && getSupabaseClient()) {
    const client = getSupabaseClient()!;
    const { data, error } = await client.storage.from(SUPABASE_KNOWLEDGE_BUCKET).download(storagePath);
    if (error) throw new Error(`Supabase download failed: ${error.message}`);
    const buf = await data.arrayBuffer();
    return new Uint8Array(buf);
  }

  if (isFirebaseConfigured && storage) {
    const bytes = await getBytes(ref(storage, storagePath));
    return new Uint8Array(bytes);
  }

  throw new Error("No cloud storage provider configured.");
}

export async function deleteKnowledgeVaultPdf(storagePath: string): Promise<boolean> {
  if (!storagePath || storagePath.startsWith("local-cache://")) {
    return false;
  }

  let deleted = false;

  if (isSupabaseConfigured && getSupabaseClient()) {
    try {
      const { error } = await getSupabaseClient()!
        .storage.from(SUPABASE_KNOWLEDGE_BUCKET)
        .remove([storagePath]);
      if (!error) {
        console.log(`[KnowledgeVaultStorage] Deleted Supabase object: ${storagePath}`);
        deleted = true;
      }
    } catch (err) {
      console.warn(`[KnowledgeVaultStorage] Supabase delete failed for ${storagePath}:`, err);
    }
  }

  if (isFirebaseConfigured && storage) {
    try {
      await deleteObject(ref(storage, storagePath));
      console.log(`[KnowledgeVaultStorage] Deleted Firebase object: ${storagePath}`);
      deleted = true;
    } catch (err) {
      console.warn(`[KnowledgeVaultStorage] Firebase delete failed for ${storagePath}:`, err);
    }
  }

  return deleted;
}

export function toVaultStorageMetadata(
  upload: KnowledgeVaultPdfUploadResult
): KnowledgeVaultPdfStorageMetadata {
  return {
    storagePath: upload.storagePath,
    downloadURL: upload.downloadURL,
    sha256Hash: upload.sha256Hash,
    storageDriver: upload.storageDriver,
    isCloudSsot: upload.isCloudSsot,
    cloudProvider: upload.cloudProvider,
    localCacheArchiveId: upload.localCacheArchiveId,
  };
}

let firebaseDriverRegistrationPromise: Promise<void> | null = null;

export async function ensureKnowledgeVaultFirebaseDriverAsync(): Promise<void> {
  // Supabase SSOT path does not need the Firebase driver module at upload time.
  if (getActiveKnowledgeVaultCloudProvider() === "SUPABASE") {
    return;
  }

  if (!firebaseDriverRegistrationPromise) {
    firebaseDriverRegistrationPromise = (async () => {
      const pdfStorage = EnterprisePdfStorageService.getInstance();
      if (!pdfStorage.hasDriver("FIREBASE_STORAGE")) {
        pdfStorage.registerDriver(new FirebaseKnowledgeVaultPdfDriver());
      }
    })();
  }
  await firebaseDriverRegistrationPromise;
}

export function ensureKnowledgeVaultFirebaseDriver(): void {
  void ensureKnowledgeVaultFirebaseDriverAsync();
}
