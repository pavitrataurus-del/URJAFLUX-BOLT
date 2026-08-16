import { SourceVersionRecord, SourceEdition } from "./VerificationTypes";

export class SourceVersionEngine {
  private static instance: SourceVersionEngine;
  private versionStore: Map<string, SourceVersionRecord> = new Map();

  public constructor() {}

  public static getInstance(): SourceVersionEngine {
    if (!SourceVersionEngine.instance) {
      SourceVersionEngine.instance = new SourceVersionEngine();
    }
    return SourceVersionEngine.instance;
  }

  public registerEdition(
    sourceId: string,
    sourceTitle: string,
    editionNumber: string,
    publicationYear: number,
    publisher: string,
    changesSummary: string
  ): SourceVersionRecord {
    let existing = this.versionStore.get(sourceId);
    const edition: SourceEdition = {
      editionNumber,
      publicationYear,
      publisher,
      changesSummary,
      isDeprecated: false
    };

    if (!existing) {
      existing = {
        sourceId,
        sourceTitle,
        currentVersion: editionNumber,
        editions: [edition]
      };
    } else {
      existing.editions.push(edition);
      existing.currentVersion = editionNumber;
    }

    this.versionStore.set(sourceId, existing);
    return existing;
  }

  public deprecateSource(sourceId: string, replacementSourceId?: string): SourceVersionRecord | undefined {
    const existing = this.versionStore.get(sourceId);
    if (existing) {
      existing.deprecationDate = new Date().toISOString();
      existing.editions.forEach(e => e.isDeprecated = true);
      if (replacementSourceId && existing.editions.length > 0) {
        existing.editions[existing.editions.length - 1].replacementSourceId = replacementSourceId;
      }
      this.versionStore.set(sourceId, existing);
    }
    return existing;
  }

  public getSourceVersionRecord(sourceId: string): SourceVersionRecord | undefined {
    return this.versionStore.get(sourceId);
  }
}

export const sourceVersionEngine = SourceVersionEngine.getInstance();
