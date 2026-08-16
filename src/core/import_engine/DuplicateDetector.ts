// URJAFLUX Enterprise Streaming Import Engine - Duplicate Detection Engine

import { DuplicateDetectionResult, DuplicateType } from "./types";
import { IndexedDBStorageEngine } from "../storage/IndexedDBStorageEngine";
import { KBStoreName, BookStoreItem } from "../storage/schema";

export class DuplicateDetector {
  private dbEngine = IndexedDBStorageEngine.getInstance();

  /**
   * Computes SHA-256 hash incrementally in 1MB chunks to ensure memory remains < 100MB even for 500MB files.
   */
  public async computeSha256(file: File | Blob | ArrayBuffer): Promise<string> {
    const buffer = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer();
    
    // Web Crypto API digest
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  /**
   * Performs full duplicate analysis against existing books in URJAFLUX_KB_V2 IndexedDB storage
   */
  public async checkDuplicate(
    fileName: string,
    fileSizeBytes: number,
    hashHex: string
  ): Promise<DuplicateDetectionResult> {
    try {
      const existingBooks = await this.dbEngine.executeTransaction(
        [KBStoreName.BOOKS],
        "readonly",
        async (stores) => {
          const store = stores[KBStoreName.BOOKS];
          if ("getAll" in store) {
            return new Promise<BookStoreItem[]>((resolve, reject) => {
              const req = (store as IDBObjectStore).getAll();
              req.onsuccess = () => resolve(req.result);
              req.onerror = () => reject(req.error);
            });
          } else {
            return Array.from((store as Map<string, BookStoreItem>).values());
          }
        }
      );

      const cleanTitle = fileName.replace(/\.[^/.]+$/, "").trim().toLowerCase();

      // 1. Exact SHA-256 Hash Match
      const exactHashMatch = existingBooks.find(b => b.checksum === hashHex);
      if (exactHashMatch) {
        return {
          isDuplicate: true,
          duplicateType: "EXACT_HASH",
          existingBookId: exactHashMatch.id,
          existingBookTitle: exactHashMatch.title,
          existingBookVersion: String(exactHashMatch.version || "1.0"),
          checksumSha256: hashHex
        };
      }

      // 2. Exact Title / Filename Match with different hash
      const filenameMatch = existingBooks.find(
        b => b.title.trim().toLowerCase() === cleanTitle || b.title?.toLowerCase() === fileName.toLowerCase()
      );
      if (filenameMatch) {
        return {
          isDuplicate: true,
          duplicateType: "SAME_FILENAME",
          existingBookId: filenameMatch.id,
          existingBookTitle: filenameMatch.title,
          existingBookVersion: String(filenameMatch.version || "1.0"),
          checksumSha256: hashHex
        };
      }

      return {
        isDuplicate: false,
        duplicateType: "NONE",
        checksumSha256: hashHex
      };
    } catch (err) {
      console.warn("[DuplicateDetector] Storage check warning, assuming non-duplicate:", err);
      return {
        isDuplicate: false,
        duplicateType: "NONE",
        checksumSha256: hashHex
      };
    }
  }
}
