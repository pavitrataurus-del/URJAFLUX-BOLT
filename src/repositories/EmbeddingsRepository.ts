// URJAFLUX Enterprise Knowledge Base V2 - Embeddings Repository

import { BaseRepository } from "./BaseRepository";
import { EmbeddingStoreItem, KBStoreName } from "../core/storage/schema";

export class EmbeddingsRepository extends BaseRepository<EmbeddingStoreItem> {
  constructor() {
    super(KBStoreName.EMBEDDINGS);
  }

  public async findByBookId(bookId: string): Promise<EmbeddingStoreItem[]> {
    return this.getByIndex("bookId", bookId);
  }

  public async findByEntityId(entityId: string): Promise<EmbeddingStoreItem[]> {
    return this.getByIndex("entityId", entityId);
  }

  public async findByModel(model: string): Promise<EmbeddingStoreItem[]> {
    return this.getByIndex("model", model);
  }
}
