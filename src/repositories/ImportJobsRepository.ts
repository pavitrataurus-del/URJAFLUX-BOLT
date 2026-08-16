// URJAFLUX Enterprise Knowledge Base V2 - Import Jobs Repository

import { BaseRepository } from "./BaseRepository";
import { ImportJobStoreItem, KBStoreName } from "../core/storage/schema";

export class ImportJobsRepository extends BaseRepository<ImportJobStoreItem> {
  constructor() {
    super(KBStoreName.IMPORT_JOBS);
  }

  public async findByStatus(status: "QUEUED" | "PARSING" | "OCR" | "CHUNKING" | "EMBEDDING" | "COMPLETED" | "FAILED"): Promise<ImportJobStoreItem[]> {
    return this.getByIndex("status", status);
  }

  public async findByBookId(bookId: string): Promise<ImportJobStoreItem[]> {
    return this.getByIndex("bookId", bookId);
  }
}
