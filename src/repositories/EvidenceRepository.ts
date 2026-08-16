// URJAFLUX Enterprise Knowledge Base V2 - Evidence Repository

import { BaseRepository } from "./BaseRepository";
import { EvidenceStoreItem, KBStoreName } from "../core/storage/schema";

export class EvidenceRepository extends BaseRepository<EvidenceStoreItem> {
  constructor() {
    super(KBStoreName.EVIDENCE);
  }

  public async findByRuleId(ruleId: string): Promise<EvidenceStoreItem[]> {
    return this.getByIndex("ruleId", ruleId);
  }

  public async findByBookId(bookId: string): Promise<EvidenceStoreItem[]> {
    return this.getByIndex("bookId", bookId);
  }
}
