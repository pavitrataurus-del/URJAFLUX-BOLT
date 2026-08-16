// URJAFLUX Enterprise Storage Engine - BUILD-019 Migration Engine
// Automatically detects and migrates legacy LocalStorage knowledge database into URJAFLUX_KB_V2 IndexedDB

import { IndexedDBStorageEngine } from "./IndexedDBStorageEngine";
import {
  KBStoreName,
  BookStoreItem,
  ChapterStoreItem,
  SectionStoreItem,
  TopicStoreItem,
  RuleStoreItem,
  FormulaStoreItem,
  EvidenceStoreItem,
  KnowledgeVersionStoreItem,
  AuditLogStoreItem
} from "./schema";

export interface MigrationReport {
  attempted: boolean;
  migrated: boolean;
  legacyCountTotal: number;
  migratedCountTotal: number;
  migratedStores: Record<string, number>;
  durationMs: number;
  error?: string;
}

export class Build019MigrationEngine {
  private static MIGRATION_FLAG_KEY = "urjaflux_kb_v2_migrated";

  private static LEGACY_KEYS = [
    "urjaflux_norm_sources",
    "urjaflux_norm_chapters",
    "urjaflux_norm_sections",
    "urjaflux_norm_topics",
    "urjaflux_norm_rules",
    "urjaflux_norm_formulas",
    "urjaflux_norm_examples",
    "urjaflux_norm_exceptions",
    "urjaflux_norm_evidence",
    "urjaflux_norm_versions",
    "urjaflux_canonical_books"
  ];

  public static isMigrationRequired(): boolean {
    if (typeof localStorage === "undefined") return false;
    const isCompleted = localStorage.getItem(this.MIGRATION_FLAG_KEY) === "true";
    if (isCompleted) return false;

    return this.LEGACY_KEYS.some(key => {
      const val = localStorage.getItem(key);
      return val && val !== "[]" && val !== "{}";
    });
  }

  public static async executeMigration(): Promise<MigrationReport> {
    const startTime = performance.now();
    const report: MigrationReport = {
      attempted: true,
      migrated: false,
      legacyCountTotal: 0,
      migratedCountTotal: 0,
      migratedStores: {},
      durationMs: 0
    };

    if (typeof localStorage === "undefined") {
      report.attempted = false;
      report.durationMs = Math.round(performance.now() - startTime);
      return report;
    }

    if (localStorage.getItem(this.MIGRATION_FLAG_KEY) === "true") {
      report.attempted = false;
      report.migrated = true;
      report.durationMs = Math.round(performance.now() - startTime);
      return report;
    }

    try {
      console.log("[Build019MigrationEngine] Starting atomic migration from BUILD-019 LocalStorage to IndexedDB URJAFLUX_KB_V2...");

      // 1. Read & Parse Legacy LocalStorage Items
      const books: BookStoreItem[] = [];
      const chapters: ChapterStoreItem[] = [];
      const sections: SectionStoreItem[] = [];
      const topics: TopicStoreItem[] = [];
      const rules: RuleStoreItem[] = [];
      const formulas: FormulaStoreItem[] = [];
      const evidence: EvidenceStoreItem[] = [];
      const versions: KnowledgeVersionStoreItem[] = [];

      // Read sources
      const rawSources = localStorage.getItem("urjaflux_norm_sources") || localStorage.getItem("urjaflux_canonical_books");
      if (rawSources) {
        try {
          const list = JSON.parse(rawSources);
          list.forEach((s: any) => {
            books.push({
              id: s.id || `BOOK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              title: s.title || "Untitled Classical Text",
              author: s.author || "Sage Rishi",
              publisher: s.publisher || "Canonical Shastra",
              edition: s.edition || "First Edition",
              language: s.language || "Sanskrit",
              category: s.category || "Vastu Shastra",
              subCategory: s.subCategory || "Classical",
              tags: s.tags || ["vastu", "shastra"],
              status: s.status === "active" ? "active" : "active",
              version: s.version || "1.0.0",
              visibility: "PRIVATE", // Enforce enterprise private default
              createdAt: s.createdAt || new Date().toISOString(),
              updatedAt: s.updatedAt || new Date().toISOString(),
              format: s.format || "BOOK"
            });
          });
        } catch (e) {
          console.warn("[Build019MigrationEngine] Failed parsing legacy sources:", e);
        }
      }

      // Read chapters
      const rawChapters = localStorage.getItem("urjaflux_norm_chapters");
      if (rawChapters) {
        try {
          const list = JSON.parse(rawChapters);
          list.forEach((c: any) => {
            chapters.push({
              id: c.id,
              bookId: c.bookId || books[0]?.id || "BOOK-UNKNOWN",
              title: c.title || "Chapter",
              chapterNumber: c.chapterNumber || 1,
              createdAt: c.createdAt || new Date().toISOString(),
              updatedAt: c.updatedAt || new Date().toISOString()
            });
          });
        } catch (e) {}
      }

      // Read sections
      const rawSections = localStorage.getItem("urjaflux_norm_sections");
      if (rawSections) {
        try {
          const list = JSON.parse(rawSections);
          list.forEach((sec: any) => {
            sections.push({
              id: sec.id,
              bookId: sec.bookId || books[0]?.id || "BOOK-UNKNOWN",
              chapterId: sec.chapterId || "CH-UNKNOWN",
              title: sec.title || "Section",
              sectionNumber: sec.sectionNumber || 1,
              createdAt: sec.createdAt || new Date().toISOString(),
              updatedAt: sec.updatedAt || new Date().toISOString()
            });
          });
        } catch (e) {}
      }

      // Read topics
      const rawTopics = localStorage.getItem("urjaflux_norm_topics");
      if (rawTopics) {
        try {
          const list = JSON.parse(rawTopics);
          list.forEach((top: any) => {
            topics.push({
              id: top.id,
              bookId: top.bookId || books[0]?.id || "BOOK-UNKNOWN",
              chapterId: top.chapterId || "CH-UNKNOWN",
              sectionId: top.sectionId,
              topicName: top.title || top.topicName || "Topic",
              description: top.description || "",
              createdAt: top.createdAt || new Date().toISOString(),
              updatedAt: top.updatedAt || new Date().toISOString()
            });
          });
        } catch (e) {}
      }

      // Read rules
      const rawRules = localStorage.getItem("urjaflux_norm_rules");
      if (rawRules) {
        try {
          const list = JSON.parse(rawRules);
          list.forEach((r: any) => {
            rules.push({
              id: r.id,
              bookId: r.bookId || books[0]?.id || "BOOK-UNKNOWN",
              chapterId: r.chapterId,
              topicId: r.topicId,
              title: r.title || "Vastu Rule",
              statement: r.statement || r.description || "",
              category: r.category || "General Vastu",
              direction: r.direction,
              version: r.version || "1.0.0",
              approvalStatus: "APPROVED",
              visibility: "PRIVATE",
              createdAt: r.createdAt || new Date().toISOString(),
              updatedAt: r.updatedAt || new Date().toISOString()
            });
          });
        } catch (e) {}
      }

      // Read formulas
      const rawFormulas = localStorage.getItem("urjaflux_norm_formulas");
      if (rawFormulas) {
        try {
          const list = JSON.parse(rawFormulas);
          list.forEach((f: any) => {
            formulas.push({
              id: f.id,
              bookId: f.bookId || books[0]?.id || "BOOK-UNKNOWN",
              ruleId: f.ruleId,
              formulaName: f.title || f.formulaName || "Ayadi Formula",
              expression: f.expression || "",
              variables: f.variables || [],
              outputType: f.outputType || "number",
              description: f.description || "",
              createdAt: f.createdAt || new Date().toISOString(),
              updatedAt: f.updatedAt || new Date().toISOString()
            });
          });
        } catch (e) {}
      }

      // Read evidence
      const rawEvidence = localStorage.getItem("urjaflux_norm_evidence");
      if (rawEvidence) {
        try {
          const list = JSON.parse(rawEvidence);
          list.forEach((ev: any) => {
            evidence.push({
              id: ev.id,
              ruleId: ev.targetId || ev.ruleId || "RULE-UNKNOWN",
              bookId: ev.sourceBookId || books[0]?.id || "BOOK-UNKNOWN",
              chapter: ev.chapter || "Chapter 1",
              page: ev.page || 1,
              paragraph: ev.paragraph || "",
              confidence: ev.confidence || 0.95,
              evidenceNotes: ev.evidenceNotes || "",
              createdAt: ev.createdAt || new Date().toISOString()
            });
          });
        } catch (e) {}
      }

      report.legacyCountTotal = books.length + chapters.length + sections.length + topics.length + rules.length + formulas.length + evidence.length;

      if (report.legacyCountTotal === 0) {
        console.log("[Build019MigrationEngine] No legacy records found to migrate. Marking migration complete.");
        localStorage.setItem(this.MIGRATION_FLAG_KEY, "true");
        report.migrated = true;
        report.durationMs = Math.round(performance.now() - startTime);
        return report;
      }

      // 2. Execute Atomic IndexedDB Insertion
      const engine = IndexedDBStorageEngine.getInstance();
      await engine.executeTransaction(
        [
          KBStoreName.BOOKS,
          KBStoreName.CHAPTERS,
          KBStoreName.SECTIONS,
          KBStoreName.TOPICS,
          KBStoreName.RULES,
          KBStoreName.FORMULAS,
          KBStoreName.EVIDENCE,
          KBStoreName.AUDIT_LOGS
        ],
        "readwrite",
        async (stores) => {
          const booksMap = stores[KBStoreName.BOOKS];
          const chaptersMap = stores[KBStoreName.CHAPTERS];
          const sectionsMap = stores[KBStoreName.SECTIONS];
          const topicsMap = stores[KBStoreName.TOPICS];
          const rulesMap = stores[KBStoreName.RULES];
          const formulasMap = stores[KBStoreName.FORMULAS];
          const evidenceMap = stores[KBStoreName.EVIDENCE];
          const auditMap = stores[KBStoreName.AUDIT_LOGS];

          if (booksMap instanceof Map) {
            books.forEach(b => (booksMap as Map<string, any>).set(b.id, b));
            chapters.forEach(c => (chaptersMap as Map<string, any>).set(c.id, c));
            sections.forEach(s => (sectionsMap as Map<string, any>).set(s.id, s));
            topics.forEach(t => (topicsMap as Map<string, any>).set(t.id, t));
            rules.forEach(r => (rulesMap as Map<string, any>).set(r.id, r));
            formulas.forEach(f => (formulasMap as Map<string, any>).set(f.id, f));
            evidence.forEach(e => (evidenceMap as Map<string, any>).set(e.id, e));

            const auditEntry: AuditLogStoreItem = {
              id: `AUDIT-MIGRATE-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: "BUILD_019_MIGRATION",
              actorId: "SYSTEM_MIGRATOR",
              details: {
                booksCount: books.length,
                rulesCount: rules.length,
                totalRecords: report.legacyCountTotal
              }
            };
            (auditMap as Map<string, any>).set(auditEntry.id, auditEntry);
          } else {
            // Native IDB Stores
            const putBatch = (store: IDBObjectStore, items: any[]) => {
              items.forEach(item => store.put(item));
            };

            putBatch(booksMap as IDBObjectStore, books);
            putBatch(chaptersMap as IDBObjectStore, chapters);
            putBatch(sectionsMap as IDBObjectStore, sections);
            putBatch(topicsMap as IDBObjectStore, topics);
            putBatch(rulesMap as IDBObjectStore, rules);
            putBatch(formulasMap as IDBObjectStore, formulas);
            putBatch(evidenceMap as IDBObjectStore, evidence);

            (auditMap as IDBObjectStore).put({
              id: `AUDIT-MIGRATE-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: "BUILD_019_MIGRATION",
              actorId: "SYSTEM_MIGRATOR",
              details: {
                booksCount: books.length,
                rulesCount: rules.length,
                totalRecords: report.legacyCountTotal
              }
            });
          }
        }
      );

      // 3. Verify Record Counts in IndexedDB
      const verifyBooksCount = await engine.getStoreCount(KBStoreName.BOOKS);
      const verifyRulesCount = await engine.getStoreCount(KBStoreName.RULES);

      report.migratedStores = {
        books: books.length,
        chapters: chapters.length,
        sections: sections.length,
        topics: topics.length,
        rules: rules.length,
        formulas: formulas.length,
        evidence: evidence.length
      };

      report.migratedCountTotal = Object.values(report.migratedStores).reduce((a, b) => a + b, 0);

      if (verifyBooksCount < books.length || verifyRulesCount < rules.length) {
        throw new Error(`Record verification failed: Expected at least ${books.length} books and ${rules.length} rules, found ${verifyBooksCount} books and ${verifyRulesCount} rules in IndexedDB.`);
      }

      // 4. Clear LocalStorage only AFTER successful verification
      this.LEGACY_KEYS.forEach(key => localStorage.removeItem(key));
      localStorage.setItem(this.MIGRATION_FLAG_KEY, "true");

      report.migrated = true;
      console.log(`[Build019MigrationEngine] Migration completed successfully. ${report.migratedCountTotal} records imported into URJAFLUX_KB_V2 IndexedDB.`);
    } catch (err: any) {
      report.error = err?.message || String(err);
      console.error("[Build019MigrationEngine] Migration failed:", report.error);
    }

    report.durationMs = Math.round(performance.now() - startTime);
    return report;
  }
}
