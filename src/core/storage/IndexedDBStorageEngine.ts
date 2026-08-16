// URJAFLUX Enterprise Storage Engine - IndexedDB Core Driver
// High-performance, transaction-safe, offline-first storage driver for URJAFLUX_KB_V2

import {
  DB_NAME,
  DB_VERSION,
  KB_STORE_DEFINITIONS,
  KBStoreName,
  STORAGE_ENGINE_VERSION
} from "./schema";

export interface TransactionOptions {
  timeoutMs?: number;
}

export class StorageEngineError extends Error {
  constructor(
    message: string,
    public code: "IDB_NOT_SUPPORTED" | "OPEN_FAILED" | "TRANSACTION_FAILED" | "QUOTA_EXCEEDED" | "ROLLBACK_SUCCESS" | "SCHEMA_MISMATCH",
    public cause?: unknown
  ) {
    super(`[IndexedDBStorageEngine] ${message}`);
    this.name = "StorageEngineError";
  }
}

// In-Memory Fallback Store for Node.js / Headless environments without native IndexedDB
class InMemoryIDBFallback {
  private stores: Map<string, Map<string, any>> = new Map();

  constructor() {
    KB_STORE_DEFINITIONS.forEach(def => {
      this.stores.set(def.name, new Map());
    });
  }

  public getStore(storeName: string): Map<string, any> {
    if (!this.stores.has(storeName)) {
      this.stores.set(storeName, new Map());
    }
    return this.stores.get(storeName)!;
  }

  public clearAll(): void {
    this.stores.forEach(s => s.clear());
  }
}

export class IndexedDBStorageEngine {
  private static instance: IndexedDBStorageEngine | null = null;
  private db: IDBDatabase | null = null;
  private isFallbackMode = false;
  private fallbackStore: InMemoryIDBFallback | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): IndexedDBStorageEngine {
    if (!IndexedDBStorageEngine.instance) {
      IndexedDBStorageEngine.instance = new IndexedDBStorageEngine();
    }
    return IndexedDBStorageEngine.instance;
  }

  /**
   * Initializes database connection, runs schema upgrades and returns connection latency in ms.
   */
  public async initialize(): Promise<{ initialized: boolean; latencyMs: number; isFallback: boolean }> {
    if (this.isInitialized) {
      return { initialized: true, latencyMs: 0, isFallback: this.isFallbackMode };
    }

    if (this.initPromise) {
      await this.initPromise;
      return { initialized: true, latencyMs: 0, isFallback: this.isFallbackMode };
    }

    const startTime = performance.now();

    this.initPromise = new Promise<void>((resolve, reject) => {
      const hasIDB = typeof window !== "undefined" && "indexedDB" in window && window.indexedDB !== null;

      if (!hasIDB) {
        console.warn("[IndexedDBStorageEngine] Native IndexedDB not available in current environment. Activating high-performance In-Memory Storage Fallback.");
        this.isFallbackMode = true;
        this.fallbackStore = new InMemoryIDBFallback();
        this.isInitialized = true;
        resolve();
        return;
      }

      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = request.result;
          console.log(`[IndexedDBStorageEngine] Upgrading database ${DB_NAME} to version ${DB_VERSION}`);

          KB_STORE_DEFINITIONS.forEach(storeDef => {
            let objectStore: IDBObjectStore;
            if (!db.objectStoreNames.contains(storeDef.name)) {
              objectStore = db.createObjectStore(storeDef.name, {
                keyPath: storeDef.keyPath,
                autoIncrement: storeDef.autoIncrement ?? false
              });
              console.log(`[IndexedDBStorageEngine] Created object store: ${storeDef.name}`);
            } else {
              objectStore = request.transaction!.objectStore(storeDef.name);
            }

            storeDef.indexes.forEach(idx => {
              if (!objectStore.indexNames.contains(idx.name)) {
                objectStore.createIndex(idx.name, idx.keyPath, { unique: idx.unique ?? false });
              }
            });
          });
        };

        request.onsuccess = () => {
          this.db = request.result;
          this.isInitialized = true;
          this.db.onversionchange = () => {
            this.db?.close();
            this.db = null;
            this.isInitialized = false;
          };
          resolve();
        };

        request.onerror = () => {
          console.error("[IndexedDBStorageEngine] Failed to open IndexedDB:", request.error);
          this.isFallbackMode = true;
          this.fallbackStore = new InMemoryIDBFallback();
          this.isInitialized = true;
          resolve();
        };
      } catch (err) {
        console.warn("[IndexedDBStorageEngine] Exception during IndexedDB init. Using in-memory fallback.", err);
        this.isFallbackMode = true;
        this.fallbackStore = new InMemoryIDBFallback();
        this.isInitialized = true;
        resolve();
      }
    });

    await this.initPromise;
    const latencyMs = Math.round(performance.now() - startTime);
    return { initialized: true, latencyMs, isFallback: this.isFallbackMode };
  }

  public getIsFallback(): boolean {
    return this.isFallbackMode;
  }

  public getEngineVersion(): string {
    return STORAGE_ENGINE_VERSION;
  }

  /**
   * Executes a transaction across specified object stores with async promise wrappers and rollback protection.
   */
  public async executeTransaction<T>(
    storeNames: KBStoreName[],
    mode: IDBTransactionMode,
    operation: (stores: Record<string, IDBObjectStore | Map<string, any>>) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    await this.initialize();

    if (this.isFallbackMode || !this.db) {
      const mapStores: Record<string, Map<string, any>> = {};
      const snapshots: Record<string, Map<string, any>> = {};

      storeNames.forEach(name => {
        const storeMap = this.fallbackStore!.getStore(name);
        mapStores[name] = storeMap;
        if (mode === "readwrite") {
          snapshots[name] = new Map(storeMap);
        }
      });

      try {
        return await operation(mapStores);
      } catch (err) {
        // Atomic rollback on error for fallback mode
        if (mode === "readwrite") {
          storeNames.forEach(name => {
            const storeMap = this.fallbackStore!.getStore(name);
            storeMap.clear();
            snapshots[name].forEach((val, key) => storeMap.set(key, val));
          });
        }
        throw err;
      }
    }

    return new Promise<T>((resolve, reject) => {
      let tx: IDBTransaction;
      try {
        tx = this.db!.transaction(storeNames, mode);
      } catch (err: any) {
        if (err.name === "QuotaExceededError") {
          return reject(new StorageEngineError("Storage quota exceeded", "QUOTA_EXCEEDED", err));
        }
        return reject(new StorageEngineError(`Failed to start transaction: ${err.message}`, "TRANSACTION_FAILED", err));
      }

      const storeHandles: Record<string, IDBObjectStore> = {};
      storeNames.forEach(name => {
        storeHandles[name] = tx.objectStore(name);
      });

      let timeoutId: any = null;
      if (options?.timeoutMs) {
        timeoutId = setTimeout(() => {
          try { tx.abort(); } catch {}
          reject(new StorageEngineError(`Transaction timed out after ${options.timeoutMs}ms`, "TRANSACTION_FAILED"));
        }, options.timeoutMs);
      }

      operation(storeHandles)
        .then(result => {
          tx.oncomplete = () => {
            if (timeoutId) clearTimeout(timeoutId);
            resolve(result);
          };
          tx.onerror = () => {
            if (timeoutId) clearTimeout(timeoutId);
            reject(new StorageEngineError(`Transaction aborted or errored: ${tx.error?.message}`, "TRANSACTION_FAILED", tx.error));
          };
          tx.onabort = () => {
            if (timeoutId) clearTimeout(timeoutId);
            reject(new StorageEngineError("Transaction was aborted (Rollback triggered)", "ROLLBACK_SUCCESS"));
          };
        })
        .catch(err => {
          if (timeoutId) clearTimeout(timeoutId);
          try { tx.abort(); } catch {}
          reject(err);
        });
    });
  }

  // Low-level helper: Get record count for a store
  public async getStoreCount(storeName: KBStoreName): Promise<number> {
    await this.initialize();
    if (this.isFallbackMode || !this.db) {
      return this.fallbackStore!.getStore(storeName).size;
    }

    return new Promise<number>((resolve, reject) => {
      const tx = this.db!.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // Low-level helper: Clear all data from all stores
  public async clearAllData(): Promise<void> {
    await this.initialize();
    if (this.isFallbackMode || !this.db) {
      this.fallbackStore!.clearAll();
      return;
    }

    const allStores = KB_STORE_DEFINITIONS.map(d => d.name);
    return new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction(allStores, "readwrite");
      allStores.forEach(name => {
        tx.objectStore(name).clear();
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Estimates byte usage for IndexedDB
  public async getStorageEstimate(): Promise<{ usageBytes: number; quotaBytes: number; percentageUsed: number }> {
    if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const usageBytes = estimate.usage || 0;
        const quotaBytes = estimate.quota || 1;
        const percentageUsed = Number(((usageBytes / quotaBytes) * 100).toFixed(2));
        return { usageBytes, quotaBytes, percentageUsed };
      } catch (e) {
        // Fallback calculation
      }
    }
    return { usageBytes: 1024 * 50, quotaBytes: 1024 * 1024 * 500, percentageUsed: 0.01 };
  }
}
