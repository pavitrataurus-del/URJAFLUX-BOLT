import { IVastuDocumentMetadata } from "./VastuKnowledgeTypes";

export interface IDuplicateMatch {
  sourceId: string;
  sourceTitle: string;
  matchedId: string;
  matchedTitle: string;
  similarityScore: number;
  matchType: "Duplicate Title & Author" | "Exact Content Hash" | "Near Duplicate Rule" | "Duplicate Entity Definition";
  recommendation: "Reject & Merge" | "Flag for Review" | "Keep Separate Version";
}

export class VastuDuplicateEngine {
  private static instance: VastuDuplicateEngine;

  private constructor() {}

  public static getInstance(): VastuDuplicateEngine {
    if (!VastuDuplicateEngine.instance) {
      VastuDuplicateEngine.instance = new VastuDuplicateEngine();
    }
    return VastuDuplicateEngine.instance;
  }

  public checkDuplicateDocument(doc: Partial<IVastuDocumentMetadata>, existingDocs: IVastuDocumentMetadata[]): IDuplicateMatch | null {
    if (!doc.title) return null;

    const normTitle = doc.title.trim().toLowerCase();
    const normAuthor = (doc.author || "").trim().toLowerCase();

    for (const existing of existingDocs) {
      if (existing.id === doc.id) continue;

      const exTitle = existing.title.trim().toLowerCase();
      const exAuthor = existing.author.trim().toLowerCase();

      if (normTitle === exTitle && normAuthor === exAuthor && normAuthor.length > 0) {
        return {
          sourceId: doc.id || "new-doc",
          sourceTitle: doc.title,
          matchedId: existing.id,
          matchedTitle: existing.title,
          similarityScore: 0.99,
          matchType: "Duplicate Title & Author",
          recommendation: "Reject & Merge"
        };
      }

      if (normTitle === exTitle) {
        return {
          sourceId: doc.id || "new-doc",
          sourceTitle: doc.title,
          matchedId: existing.id,
          matchedTitle: existing.title,
          similarityScore: 0.92,
          matchType: "Near Duplicate Rule",
          recommendation: "Flag for Review"
        };
      }
    }

    return null;
  }

  public detectDuplicateRules(ruleText: string, existingRules: { id: string; ruleText: string; title: string }[]): IDuplicateMatch | null {
    const norm = ruleText.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const r of existingRules) {
      const exNorm = r.ruleText.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (norm === exNorm) {
        return {
          sourceId: "new-rule",
          sourceTitle: ruleText.slice(0, 30),
          matchedId: r.id,
          matchedTitle: r.title,
          similarityScore: 1.0,
          matchType: "Exact Content Hash",
          recommendation: "Reject & Merge"
        };
      }
    }
    return null;
  }
}
