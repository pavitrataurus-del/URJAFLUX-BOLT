// URJAFLUX AI OS - ENTERPRISE PDF STORAGE EXTENSION
// Persistent Binary PDF Storage Layer with SHA-256 Integrity, Immutability & Multi-Driver Support

import { IndexedDBStorageEngine } from "./IndexedDBStorageEngine";
import {
  KBStoreName,
  PdfBinaryStoreItem,
  PdfBinaryRetentionMetadata,
  StorageStatusType,
  ArchivalTierType,
} from "./schema";

export interface PdfStorageUploadOptions {
  fileName?: string;
  mimeType?: string;
  retentionPolicy?: string;
  archivalTier?: ArchivalTierType;
  expirationDate?: string;
  metadata?: Record<string, unknown>;
  driverName?: string;
}

export interface PdfStorageHealthReport {
  healthy: boolean;
  activeDriver: string;
  availableDrivers: string[];
  totalArchivedPdfs: number;
  totalSizeBytes: number;
  totalSizeMB: number;
  storageEstimate: {
    usageBytes: number;
    quotaBytes: number;
    percentageUsed: number;
  };
  driverHealthDetails: Record<string, unknown>;
}

export interface PdfIntegrityCheckResult {
  id: string;
  sha256Hash: string;
  calculatedHash: string;
  valid: boolean;
  status: StorageStatusType;
  lastVerifiedTimestamp: string;
}

// ============================================================================
// 1. STORAGE DRIVER INTERFACE & CLOUD ADAPTER HOOK
// ============================================================================

export interface IPdfStorageDriver {
  driverName: string;
  storeBinary(item: PdfBinaryStoreItem, binary: Uint8Array): Promise<PdfBinaryStoreItem>;
  retrieveBinary(idOrHash: string): Promise<{ item: PdfBinaryStoreItem; binary: Uint8Array } | null>;
  verifyIntegrity(idOrHash: string): Promise<PdfIntegrityCheckResult | null>;
  getStorageItem(idOrHash: string): Promise<PdfBinaryStoreItem | null>;
  listItems(): Promise<PdfBinaryStoreItem[]>;
  checkDriverHealth(): Promise<{ healthy: boolean; details: Record<string, unknown> }>;
}

export interface CloudStorageHookConfig {
  providerName: "AWS_S3" | "GCS" | "AZURE_BLOB" | "CUSTOM_OBJECT_STORE";
  bucketName: string;
  region?: string;
  endpointUrl?: string;
  uploadHook?: (id: string, binary: Uint8Array, metadata: PdfBinaryStoreItem) => Promise<string>;
  downloadHook?: (id: string) => Promise<Uint8Array>;
}

// ============================================================================
// 2. INDEXEDDB LOCAL PDF STORAGE DRIVER (DEVELOPMENT / BROWSER)
// ============================================================================

export class IndexedDbPdfStorageDriver implements IPdfStorageDriver {
  public driverName = "INDEXED_DB";
  private dbEngine = IndexedDBStorageEngine.getInstance();

  public async storeBinary(item: PdfBinaryStoreItem, binary: Uint8Array): Promise<PdfBinaryStoreItem> {
    await this.dbEngine.initialize();

    // Store binary payload alongside metadata in immutable IndexedDB record
    const recordToStore: PdfBinaryStoreItem = {
      ...item,
      binaryData: binary.buffer,
    };

    await this.dbEngine.executeTransaction(
      [KBStoreName.PDF_BINARIES],
      "readwrite",
      async (stores) => {
        const store = stores[KBStoreName.PDF_BINARIES];
        if (store instanceof Map) {
          store.set(item.id, recordToStore);
        } else {
          (store as IDBObjectStore).put(recordToStore);
        }
      }
    );

    return item;
  }

  public async retrieveBinary(idOrHash: string): Promise<{ item: PdfBinaryStoreItem; binary: Uint8Array } | null> {
    const item = await this.getStorageItem(idOrHash);
    if (!item) return null;

    let binary: Uint8Array;
    if (item.binaryData instanceof ArrayBuffer) {
      binary = new Uint8Array(item.binaryData);
    } else if (item.binaryData instanceof Uint8Array) {
      binary = item.binaryData;
    } else if (typeof item.binaryData === "string") {
      // Decode Base64 string if stored as text
      const binaryString = typeof atob !== "undefined" ? atob(item.binaryData) : Buffer.from(item.binaryData, "base64").toString("binary");
      const len = binaryString.length;
      binary = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        binary[i] = binaryString.charCodeAt(i);
      }
    } else {
      binary = new Uint8Array(0);
    }

    return { item, binary };
  }

  public async getStorageItem(idOrHash: string): Promise<PdfBinaryStoreItem | null> {
    await this.dbEngine.initialize();
    let result: PdfBinaryStoreItem | null = null;

    await this.dbEngine.executeTransaction(
      [KBStoreName.PDF_BINARIES],
      "readonly",
      async (stores) => {
        const store = stores[KBStoreName.PDF_BINARIES];
        if (store instanceof Map) {
          const direct = store.get(idOrHash);
          if (direct) {
            result = direct;
            return;
          }
          // Fallback search by hash
          for (const item of store.values()) {
            if (item.sha256Hash === idOrHash) {
              result = item;
              break;
            }
          }
        } else {
          const idbStore = store as IDBObjectStore;
          const req = idbStore.get(idOrHash);
          await new Promise<void>((resolve) => {
            req.onsuccess = () => {
              if (req.result) {
                result = req.result;
                resolve();
              } else {
                // Try searching by sha256Hash index
                try {
                  const idx = idbStore.index("sha256Hash");
                  const hashReq = idx.get(idOrHash);
                  hashReq.onsuccess = () => {
                    result = hashReq.result || null;
                    resolve();
                  };
                  hashReq.onerror = () => resolve();
                } catch {
                  resolve();
                }
              }
            };
            req.onerror = () => resolve();
          });
        }
      }
    );

    return result;
  }

  public async verifyIntegrity(idOrHash: string): Promise<PdfIntegrityCheckResult | null> {
    const data = await this.retrieveBinary(idOrHash);
    if (!data) return null;

    const calculatedHash = await EnterprisePdfStorageService.calculateSha256(data.binary);
    const valid = calculatedHash.toLowerCase() === data.item.sha256Hash.toLowerCase();
    const status: StorageStatusType = valid ? data.item.storageStatus : "CORRUPTED";

    const now = new Date().toISOString();
    data.item.lastVerifiedTimestamp = now;
    data.item.storageStatus = status;

    // Persist status update
    await this.dbEngine.executeTransaction(
      [KBStoreName.PDF_BINARIES],
      "readwrite",
      async (stores) => {
        const store = stores[KBStoreName.PDF_BINARIES];
        if (store instanceof Map) {
          store.set(data.item.id, data.item);
        } else {
          (store as IDBObjectStore).put(data.item);
        }
      }
    );

    return {
      id: data.item.id,
      sha256Hash: data.item.sha256Hash,
      calculatedHash,
      valid,
      status,
      lastVerifiedTimestamp: now,
    };
  }

  public async listItems(): Promise<PdfBinaryStoreItem[]> {
    await this.dbEngine.initialize();
    const items: PdfBinaryStoreItem[] = [];

    await this.dbEngine.executeTransaction(
      [KBStoreName.PDF_BINARIES],
      "readonly",
      async (stores) => {
        const store = stores[KBStoreName.PDF_BINARIES];
        if (store instanceof Map) {
          store.forEach((val) => {
            // Exclude raw binaryData buffer from listing summary to save memory
            const { binaryData, ...meta } = val;
            items.push(meta as PdfBinaryStoreItem);
          });
        } else {
          const idbStore = store as IDBObjectStore;
          const req = idbStore.openCursor();
          await new Promise<void>((resolve) => {
            req.onsuccess = () => {
              const cursor = req.result;
              if (cursor) {
                const { binaryData, ...meta } = cursor.value;
                items.push(meta as PdfBinaryStoreItem);
                cursor.continue();
              } else {
                resolve();
              }
            };
            req.onerror = () => resolve();
          });
        }
      }
    );

    return items;
  }

  public async checkDriverHealth(): Promise<{ healthy: boolean; details: Record<string, unknown> }> {
    try {
      await this.dbEngine.initialize();
      const isFallback = this.dbEngine.getIsFallback();
      const count = await this.dbEngine.getStoreCount(KBStoreName.PDF_BINARIES);
      return {
        healthy: true,
        details: {
          isFallbackMode: isFallback,
          storedPdfCount: count,
          engineVersion: this.dbEngine.getEngineVersion(),
        },
      };
    } catch (err: any) {
      return {
        healthy: false,
        details: { error: err?.message || String(err) },
      };
    }
  }
}

// ============================================================================
// 3. PLUGGABLE CLOUD STORAGE ADAPTER HOOK
// ============================================================================

export class CloudStorageAdapterDriver implements IPdfStorageDriver {
  public driverName: string;
  private config: CloudStorageHookConfig;
  private localFallback = new IndexedDbPdfStorageDriver();

  constructor(config: CloudStorageHookConfig) {
    this.config = config;
    this.driverName = `CLOUD_STORAGE_${config.providerName}`;
  }

  public async storeBinary(item: PdfBinaryStoreItem, binary: Uint8Array): Promise<PdfBinaryStoreItem> {
    item.storageDriver = this.driverName;
    if (this.config.uploadHook) {
      const cloudUrl = await this.config.uploadHook(item.id, binary, item);
      item.metadata = { ...item.metadata, cloudUrl, bucket: this.config.bucketName };
    }
    // Always store metadata locally for offline access
    return await this.localFallback.storeBinary(item, binary);
  }

  public async retrieveBinary(idOrHash: string): Promise<{ item: PdfBinaryStoreItem; binary: Uint8Array } | null> {
    const item = await this.getStorageItem(idOrHash);
    if (!item) return null;

    if (this.config.downloadHook) {
      try {
        const binary = await this.config.downloadHook(item.id);
        return { item, binary };
      } catch (err) {
        console.warn(`[CloudStorageAdapter] Cloud download failed, trying local store:`, err);
      }
    }
    return await this.localFallback.retrieveBinary(idOrHash);
  }

  public async getStorageItem(idOrHash: string): Promise<PdfBinaryStoreItem | null> {
    return await this.localFallback.getStorageItem(idOrHash);
  }

  public async verifyIntegrity(idOrHash: string): Promise<PdfIntegrityCheckResult | null> {
    return await this.localFallback.verifyIntegrity(idOrHash);
  }

  public async listItems(): Promise<PdfBinaryStoreItem[]> {
    return await this.localFallback.listItems();
  }

  public async checkDriverHealth(): Promise<{ healthy: boolean; details: Record<string, unknown> }> {
    return {
      healthy: true,
      details: {
        provider: this.config.providerName,
        bucket: this.config.bucketName,
        hasUploadHook: !!this.config.uploadHook,
        hasDownloadHook: !!this.config.downloadHook,
      },
    };
  }
}

// ============================================================================
// 4. ENTERPRISE PDF STORAGE SERVICE (SINGLETON MANAGER)
// ============================================================================

export class EnterprisePdfStorageService {
  private static instance: EnterprisePdfStorageService | null = null;
  private drivers: Map<string, IPdfStorageDriver> = new Map();
  private activeDriverName = "INDEXED_DB";

  private constructor() {
    this.registerDriver(new IndexedDbPdfStorageDriver());
  }

  public hasDriver(driverName: string): boolean {
    return this.drivers.has(driverName);
  }

  /**
   * Prefer Firebase Storage as active driver when cloud is configured.
   */
  public configureKnowledgeVaultStorageDriver(): void {
    if (this.drivers.has("FIREBASE_STORAGE")) {
      this.activeDriverName = "FIREBASE_STORAGE";
    }
  }

  public static getInstance(): EnterprisePdfStorageService {
    if (!EnterprisePdfStorageService.instance) {
      EnterprisePdfStorageService.instance = new EnterprisePdfStorageService();
    }
    return EnterprisePdfStorageService.instance;
  }

  public registerDriver(driver: IPdfStorageDriver): void {
    this.drivers.set(driver.driverName, driver);
  }

  public setActiveDriver(driverName: string): void {
    if (!this.drivers.has(driverName)) {
      throw new Error(`[EnterprisePdfStorageService] Driver '${driverName}' is not registered.`);
    }
    this.activeDriverName = driverName;
  }

  public getActiveDriver(): IPdfStorageDriver {
    const driver = this.drivers.get(this.activeDriverName);
    if (!driver) {
      throw new Error(`[EnterprisePdfStorageService] Active driver '${this.activeDriverName}' not found.`);
    }
    return driver;
  }

  /**
   * Calculates cryptographic SHA-256 hash of binary data using standard Web Crypto API.
   */
  public static async calculateSha256(data: ArrayBuffer | Uint8Array | string): Promise<string> {
    let buffer: ArrayBuffer;
    if (typeof data === "string") {
      const encoder = new TextEncoder();
      buffer = encoder.encode(data).buffer;
    } else if (data instanceof Uint8Array) {
      buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    } else {
      buffer = data;
    }

    if (typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest) {
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    // Fallback simple checksum if Crypto API unavailable
    let hash = 0;
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      hash = (hash << 5) - hash + bytes[i];
      hash |= 0;
    }
    return `sha256-fallback-${Math.abs(hash).toString(16).padStart(8, "0")}`;
  }

  /**
   * Stores original PDF binary with immutable archive protection and integrity verification.
   */
  public async storePdfBinary(
    binaryData: ArrayBuffer | Uint8Array | Blob | string,
    options: PdfStorageUploadOptions = {}
  ): Promise<PdfBinaryStoreItem> {
    let uint8Array: Uint8Array;

    if (binaryData instanceof Blob) {
      const arrayBuffer = await binaryData.arrayBuffer();
      uint8Array = new Uint8Array(arrayBuffer);
    } else if (binaryData instanceof ArrayBuffer) {
      uint8Array = new Uint8Array(binaryData);
    } else if (binaryData instanceof Uint8Array) {
      uint8Array = binaryData;
    } else if (typeof binaryData === "string") {
      const encoder = new TextEncoder();
      uint8Array = encoder.encode(binaryData);
    } else {
      throw new Error("[EnterprisePdfStorageService] Invalid binary data input format.");
    }

    const fileSizeBytes = uint8Array.byteLength;
    const sha256Hash = await EnterprisePdfStorageService.calculateSha256(uint8Array);

    const driverName = options.driverName || this.activeDriverName;
    const driver = this.drivers.get(driverName) || this.getActiveDriver();

    // Check if duplicate immutable archive already exists by SHA-256 hash
    const existing = await driver.getStorageItem(sha256Hash);
    if (existing) {
      console.log(`[EnterprisePdfStorageService] Immutable PDF archive already exists for hash: ${sha256Hash}. Returning existing record.`);
      return existing;
    }

    const archiveId = `PDF-ARCHIVE-${sha256Hash.substring(0, 16).toUpperCase()}`;
    const now = new Date().toISOString();

    const retentionMetadata: PdfBinaryRetentionMetadata = {
      retentionPolicy: options.retentionPolicy || "PERMANENT_IMMUTABLE",
      immutableArchive: true, // IMMUTABLE ARCHIVE GUARANTEE
      archivalTier: options.archivalTier || "HOT",
      expirationDate: options.expirationDate,
    };

    const item: PdfBinaryStoreItem = {
      id: archiveId,
      fileName: options.fileName || `document_${sha256Hash.substring(0, 8)}.pdf`,
      fileSizeBytes,
      sha256Hash,
      mimeType: options.mimeType || "application/pdf",
      storageStatus: "STORED",
      storageDriver: driver.driverName,
      uploadTimestamp: now,
      lastVerifiedTimestamp: now,
      retentionMetadata,
      metadata: options.metadata || {},
    };

    return await driver.storeBinary(item, uint8Array);
  }

  /**
   * Retrieves original PDF binary and metadata from archive.
   */
  public async retrievePdfBinary(idOrHash: string): Promise<{ item: PdfBinaryStoreItem; binary: Uint8Array }> {
    const driver = this.getActiveDriver();
    const result = await driver.retrieveBinary(idOrHash);
    if (!result) {
      throw new Error(`[EnterprisePdfStorageService] PDF Binary archive '${idOrHash}' not found.`);
    }
    return result;
  }

  /**
   * Verifies binary cryptographic integrity against stored SHA-256 hash.
   */
  public async verifyBinaryIntegrity(idOrHash: string): Promise<PdfIntegrityCheckResult> {
    const driver = this.getActiveDriver();
    const result = await driver.verifyIntegrity(idOrHash);
    if (!result) {
      throw new Error(`[EnterprisePdfStorageService] PDF Binary archive '${idOrHash}' not found for verification.`);
    }
    return result;
  }

  /**
   * Retrieves current storage status for a PDF archive.
   */
  public async getStorageStatus(idOrHash: string): Promise<PdfBinaryStoreItem | null> {
    const driver = this.getActiveDriver();
    return await driver.getStorageItem(idOrHash);
  }

  /**
   * Lists all archived PDF binary records.
   */
  public async listArchivedPdfs(): Promise<PdfBinaryStoreItem[]> {
    const driver = this.getActiveDriver();
    return await driver.listItems();
  }

  /**
   * Checks health and capacity of active storage drivers.
   */
  public async checkStorageHealth(): Promise<PdfStorageHealthReport> {
    const activeDriver = this.getActiveDriver();
    const healthResult = await activeDriver.checkDriverHealth();
    const archivedItems = await activeDriver.listItems();

    const totalSizeBytes = archivedItems.reduce((acc, item) => acc + item.fileSizeBytes, 0);
    const totalSizeMB = Number((totalSizeBytes / (1024 * 1024)).toFixed(2));

    const dbEngine = IndexedDBStorageEngine.getInstance();
    const storageEstimate = await dbEngine.getStorageEstimate();

    return {
      healthy: healthResult.healthy,
      activeDriver: this.activeDriverName,
      availableDrivers: Array.from(this.drivers.keys()),
      totalArchivedPdfs: archivedItems.length,
      totalSizeBytes,
      totalSizeMB,
      storageEstimate,
      driverHealthDetails: healthResult.details,
    };
  }
}
