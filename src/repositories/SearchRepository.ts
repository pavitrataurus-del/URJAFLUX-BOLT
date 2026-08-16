// URJAFLUX Enterprise Knowledge Base V2 - Search Index Repository

import { BaseRepository } from "./BaseRepository";
import { SearchIndexStoreItem, KBStoreName } from "../core/storage/schema";

export class SearchRepository extends BaseRepository<SearchIndexStoreItem> {
  constructor() {
    super(KBStoreName.SEARCH_INDEX);
  }

  public async findByToken(token: string): Promise<SearchIndexStoreItem[]> {
    return this.getByIndex("token", token.toLowerCase());
  }

  public async findByBookId(bookId: string): Promise<SearchIndexStoreItem[]> {
    return this.getByIndex("bookId", bookId);
  }

  public async findByEntityType(entityType: "rule" | "formula" | "chapter" | "topic" | "evidence"): Promise<SearchIndexStoreItem[]> {
    return this.getByIndex("entityType", entityType);
  }
}
