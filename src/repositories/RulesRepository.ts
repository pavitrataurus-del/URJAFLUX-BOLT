// URJAFLUX Enterprise Knowledge Base V2 - Rules Repository

import { BaseRepository } from "./BaseRepository";
import { RuleStoreItem, KBStoreName } from "../core/storage/schema";

export class RulesRepository extends BaseRepository<RuleStoreItem> {
  constructor() {
    super(KBStoreName.RULES);
  }

  public async findByBookId(bookId: string): Promise<RuleStoreItem[]> {
    return this.getByIndex("bookId", bookId);
  }

  public async findByCategory(category: string): Promise<RuleStoreItem[]> {
    return this.getByIndex("category", category);
  }

  public async findByDirection(direction: string): Promise<RuleStoreItem[]> {
    return this.getByIndex("direction", direction);
  }

  public async findByApprovalStatus(status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "DEPRECATED"): Promise<RuleStoreItem[]> {
    return this.getByIndex("approvalStatus", status);
  }
}
