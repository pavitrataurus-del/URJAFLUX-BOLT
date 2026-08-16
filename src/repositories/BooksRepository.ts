// URJAFLUX Enterprise Knowledge Base V2 - Books Repository

import { BaseRepository } from "./BaseRepository";
import { BookStoreItem, KBStoreName } from "../core/storage/schema";

export class BooksRepository extends BaseRepository<BookStoreItem> {
  constructor() {
    super(KBStoreName.BOOKS);
  }

  public async findByStatus(status: "draft" | "active" | "archived" | "deprecated"): Promise<BookStoreItem[]> {
    return this.getByIndex("status", status);
  }

  public async findByAuthor(author: string): Promise<BookStoreItem[]> {
    return this.getByIndex("author", author);
  }

  public async findByVisibility(visibility: "PRIVATE" | "INTERNAL" | "PUBLIC"): Promise<BookStoreItem[]> {
    return this.getByIndex("visibility", visibility);
  }
}
