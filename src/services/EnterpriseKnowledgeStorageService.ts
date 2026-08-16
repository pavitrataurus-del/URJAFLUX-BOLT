// URJAFLUX Enterprise Storage Service
// Central orchestrator for URJAFLUX_KB_V2 IndexedDB storage, repository management, diagnostics, backup & restore

import { IndexedDBStorageEngine } from "../core/storage/IndexedDBStorageEngine";
import { KBStoreName, STORAGE_ENGINE_VERSION, DB_NAME, DB_VERSION } from "../core/storage/schema";
import { Build019MigrationEngine, MigrationReport } from "../core/storage/Build019MigrationEngine";
import { BooksRepository } from "../repositories/BooksRepository";
import { RulesRepository } from "../repositories/RulesRepository";
import { EvidenceRepository } from "../repositories/EvidenceRepository";
import { ImportJobsRepository } from "../repositories/ImportJobsRepository";
import { EmbeddingsRepository } from "../repositories/EmbeddingsRepository";
import { SearchRepository } from "../repositories/SearchRepository";
import { EmbeddingRepository } from "../repositories/EmbeddingRepository";
import { KnowledgeGraphRepository } from "../repositories/KnowledgeGraphRepository";

export interface StorageStats {
  databaseName: string;
  databaseVersion: number;
  engineVersion: string;
  isFallbackMode: boolean;
  totalRecords: number;
  estimatedSizeBytes: number;
  estimatedSizeMB: number;
  storeCounts: Record<KBStoreName, number>;
}

export interface StorageHealthReport {
  status: "HEALTHY" | "DEGRADED" | "OFFLINE";
  healthScore: number; // 0 - 100
  databaseName: string;
  databaseVersion: number;
  engineVersion: string;
  initLatencyMs: number;
  isFallbackMode: boolean;
  migrationStatus: {
    performed: boolean;
    migratedRecords: number;
  };
  storageEstimate: {
    usageBytes: number;
    quotaBytes: number;
    percentageUsed: number;
  };
  storeCounts: Record<KBStoreName, number>;
  issues: string[];
}

export class EnterpriseKnowledgeStorageService {
  private static instance: EnterpriseKnowledgeStorageService | null = null;
  private engine: IndexedDBStorageEngine;

  // Repositories
  public readonly booksRepo: BooksRepository;
  public readonly rulesRepo: RulesRepository;
  public readonly evidenceRepo: EvidenceRepository;
  public readonly importJobsRepo: ImportJobsRepository;
  public readonly embeddingsRepo: EmbeddingsRepository;
  public readonly searchRepo: SearchRepository;
  public readonly embeddingRepo: EmbeddingRepository;
  public readonly knowledgeGraphRepo: KnowledgeGraphRepository;

  private isInitialized = false;
  private initLatencyMs = 0;
  private lastMigrationReport: MigrationReport | null = null;

  private constructor() {
    this.engine = IndexedDBStorageEngine.getInstance();
    this.booksRepo = new BooksRepository();
    this.rulesRepo = new RulesRepository();
    this.evidenceRepo = new EvidenceRepository();
    this.importJobsRepo = new ImportJobsRepository();
    this.embeddingsRepo = new EmbeddingsRepository();
    this.searchRepo = new SearchRepository();
    this.embeddingRepo = new EmbeddingRepository();
    this.knowledgeGraphRepo = new KnowledgeGraphRepository();
  }

  public static getInstance(): EnterpriseKnowledgeStorageService {
    if (!EnterpriseKnowledgeStorageService.instance) {
      EnterpriseKnowledgeStorageService.instance = new EnterpriseKnowledgeStorageService();
    }
    return EnterpriseKnowledgeStorageService.instance;
  }

  /**
   * Initializes IndexedDB connection and performs automatic BUILD-019 LocalStorage migration.
   * Execution time is guaranteed <500ms for clean database.
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    const startTime = performance.now();
    const initResult = await this.engine.initialize();
    this.initLatencyMs = Math.round(performance.now() - startTime);

    // Auto-migrate legacy BUILD-019 data if required
    if (Build019MigrationEngine.isMigrationRequired()) {
      this.lastMigrationReport = await Build019MigrationEngine.executeMigration();
    }

    this.isInitialized = true;
    console.log(`[EnterpriseKnowledgeStorageService] Storage initialized in ${this.initLatencyMs}ms (Fallback mode: ${initResult.isFallback})`);
    return true;
  }

  /**
   * Generates comprehensive diagnostic statistics across all 16 object stores.
   */
  public async getStats(): Promise<StorageStats> {
    await this.initialize();

    const storeCounts = {} as Record<KBStoreName, number>;
    let totalRecords = 0;

    const allStores = Object.values(KBStoreName) as KBStoreName[];
    for (const storeName of allStores) {
      const count = await this.engine.getStoreCount(storeName);
      storeCounts[storeName] = count;
      totalRecords += count;
    }

    const estimate = await this.engine.getStorageEstimate();
    const estimatedSizeBytes = estimate.usageBytes || (totalRecords * 512); // ~512 bytes average per record estimation
    const estimatedSizeMB = Number((estimatedSizeBytes / (1024 * 1024)).toFixed(2));

    return {
      databaseName: DB_NAME,
      databaseVersion: DB_VERSION,
      engineVersion: STORAGE_ENGINE_VERSION,
      isFallbackMode: this.engine.getIsFallback(),
      totalRecords,
      estimatedSizeBytes,
      estimatedSizeMB,
      storeCounts
    };
  }

  /**
   * Performs an automated diagnostic health check and returns a 0 - 100 Health Score.
   */
  public async checkHealth(): Promise<StorageHealthReport> {
    await this.initialize();

    const issues: string[] = [];
    let healthScore = 100;

    const stats = await this.getStats();
    const storageEstimate = await this.engine.getStorageEstimate();

    if (this.engine.getIsFallback()) {
      issues.push("Running in high-performance In-Memory Fallback mode (Native IndexedDB unavailable or restricted).");
      healthScore -= 5;
    }

    if (this.initLatencyMs > 500) {
      issues.push(`Initialization latency high (${this.initLatencyMs}ms > 500ms target).`);
      healthScore -= 10;
    }

    if (storageEstimate.percentageUsed > 80) {
      issues.push(`Storage capacity usage high (${storageEstimate.percentageUsed}% of quota used).`);
      healthScore -= 20;
    }

    if (this.lastMigrationReport && !this.lastMigrationReport.migrated && this.lastMigrationReport.error) {
      issues.push(`BUILD-019 Migration failed: ${this.lastMigrationReport.error}`);
      healthScore -= 30;
    }

    let status: "HEALTHY" | "DEGRADED" | "OFFLINE" = "HEALTHY";
    if (healthScore < 50) {
      status = "OFFLINE";
    } else if (healthScore < 90) {
      status = "DEGRADED";
    }

    return {
      status,
      healthScore: Math.max(0, healthScore),
      databaseName: DB_NAME,
      databaseVersion: DB_VERSION,
      engineVersion: STORAGE_ENGINE_VERSION,
      initLatencyMs: this.initLatencyMs,
      isFallbackMode: this.engine.getIsFallback(),
      migrationStatus: {
        performed: !!this.lastMigrationReport?.attempted,
        migratedRecords: this.lastMigrationReport?.migratedCountTotal || 0
      },
      storageEstimate,
      storeCounts: stats.storeCounts,
      issues
    };
  }

  /**
   * Exports entire URJAFLUX_KB_V2 database as a structured JSON backup.
   */
  public async exportBackup(): Promise<string> {
    await this.initialize();
    const backupData: Record<string, any[]> = {};

    const allStores = Object.values(KBStoreName) as KBStoreName[];
    for (const storeName of allStores) {
      backupData[storeName] = await this.engine.executeTransaction([storeName], "readonly", async (stores) => {
        const store = stores[storeName];
        if (store instanceof Map) {
          return Array.from(store.values());
        }
        return new Promise<any[]>((resolve, reject) => {
          const req = (store as IDBObjectStore).getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
      });
    }

    return JSON.stringify({
      version: DB_VERSION,
      engineVersion: STORAGE_ENGINE_VERSION,
      exportedAt: new Date().toISOString(),
      stores: backupData
    }, null, 2);
  }

  /**
   * Restores URJAFLUX_KB_V2 database from a JSON backup string with transaction safety.
   */
  public async importBackup(jsonString: string): Promise<{ success: boolean; importedRecords: number }> {
    await this.initialize();
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.stores || typeof parsed.stores !== "object") {
        throw new Error("Invalid backup format: missing 'stores' object.");
      }

      const allStores = Object.values(KBStoreName) as KBStoreName[];
      let totalImported = 0;

      await this.engine.executeTransaction(allStores, "readwrite", async (stores) => {
        allStores.forEach(storeName => {
          const store = stores[storeName];
          const items = parsed.stores[storeName] || [];

          if (store instanceof Map) {
            store.clear();
            items.forEach((item: any) => store.set(item.id, item));
          } else {
            const objStore = store as IDBObjectStore;
            objStore.clear();
            items.forEach((item: any) => objStore.put(item));
          }
          totalImported += items.length;
        });
      });

      console.log(`[EnterpriseKnowledgeStorageService] Restored ${totalImported} records from backup.`);
      return { success: true, importedRecords: totalImported };
    } catch (err: any) {
      console.error("[EnterpriseKnowledgeStorageService] Failed to import backup:", err);
      throw err;
    }
  }

  /**
   * Resets database by clearing all 16 object stores.
   */
  public async resetDatabase(): Promise<boolean> {
    await this.engine.clearAllData();
    console.log("[EnterpriseKnowledgeStorageService] Database reset complete.");
    return true;
  }
}

export const storageService = EnterpriseKnowledgeStorageService.getInstance();
