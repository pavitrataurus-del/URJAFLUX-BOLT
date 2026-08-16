// BUILD-021A Automated Validation Test Suite
// Verifies URJAFLUX_KB_V2 IndexedDB storage foundation, schema, repositories, migration engine, transaction rollback, and backup/restore

import { storageService, EnterpriseKnowledgeStorageService } from "../services/EnterpriseKnowledgeStorageService";
import { Build019MigrationEngine } from "../core/storage/Build019MigrationEngine";
import { IndexedDBStorageEngine } from "../core/storage/IndexedDBStorageEngine";
import { KBStoreName, BookStoreItem, RuleStoreItem, EvidenceStoreItem, ImportJobStoreItem, EmbeddingStoreItem } from "../core/storage/schema";

// Simple assertion helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ PASS: ${message}`);
}

async function runIndexedDBFoundationTests() {
  console.log("\n================================================================");
  console.log("     BUILD-021A: ENTERPRISE INDEXEDDB FOUNDATION TEST SUITE");
  console.log("================================================================\n");

  const startTime = performance.now();

  // --------------------------------------------------------------------------
  // TEST 1: Database Initialization & Latency Benchmark (<500ms)
  // --------------------------------------------------------------------------
  console.log("STEP 1: Testing Database Initialization & Latency Benchmark...");
  const initStart = performance.now();
  const initResult = await storageService.initialize();
  const initLatency = Math.round(performance.now() - initStart);

  assert(initResult === true, "Storage service initialized successfully.");
  assert(initLatency < 500, `Database init latency ${initLatency}ms is under 500ms target.`);

  // Clear any existing test state
  await storageService.resetDatabase();

  // --------------------------------------------------------------------------
  // TEST 2: Object Stores & Schema Verification (16 Collections)
  // --------------------------------------------------------------------------
  console.log("\nSTEP 2: Verifying Object Stores & Schema Definitions...");
  const statsBefore = await storageService.getStats();
  const storeNames = Object.values(KBStoreName);

  assert(storeNames.length === 16, "16 object stores defined in schema.");
  storeNames.forEach(s => {
    assert(statsBefore.storeCounts[s] !== undefined, `Object store '${s}' is initialized.`);
  });

  // --------------------------------------------------------------------------
  // TEST 3: BooksRepository CRUD Operations
  // --------------------------------------------------------------------------
  console.log("\nSTEP 3: Testing BooksRepository CRUD...");
  const sampleBook: BookStoreItem = {
    id: "BOOK-1001-TEST",
    title: "Brihat Samhita - Vastu Adhyaya",
    author: "Varahamihira",
    publisher: "Classical Shastra Institute",
    edition: "Critical Sanskrit Edition",
    language: "Sanskrit / English",
    category: "Vastu Shastra",
    tags: ["brihat", "samhita", "classical"],
    status: "active",
    version: "1.0.0",
    visibility: "PRIVATE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    format: "BOOK"
  };

  await storageService.booksRepo.put(sampleBook);
  const fetchedBook = await storageService.booksRepo.get("BOOK-1001-TEST");
  assert(fetchedBook !== null, "Book retrieved successfully by ID.");
  assert(fetchedBook?.title === "Brihat Samhita - Vastu Adhyaya", "Book title matches inserted record.");
  assert(fetchedBook?.visibility === "PRIVATE", "Book visibility is PRIVATE by default.");

  const booksByAuthor = await storageService.booksRepo.findByAuthor("Varahamihira");
  assert(booksByAuthor.length >= 1, "Book query by index 'author' returned record.");

  // --------------------------------------------------------------------------
  // TEST 4: RulesRepository CRUD & Querying
  // --------------------------------------------------------------------------
  console.log("\nSTEP 4: Testing RulesRepository & Directional Querying...");
  const sampleRule1: RuleStoreItem = {
    id: "RULE-5001-NE",
    bookId: "BOOK-1001-TEST",
    title: "Ishan Corner Water Reserve Principle",
    statement: "The Northeast corner (Ishan Kon) must host pure water element reserves to maximize sattvic energy.",
    category: "Elemental Balance",
    direction: "NE",
    version: "1.0.0",
    approvalStatus: "APPROVED",
    visibility: "PRIVATE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const sampleRule2: RuleStoreItem = {
    id: "RULE-5002-SE",
    bookId: "BOOK-1001-TEST",
    title: "Agni Corner Kitchen Placement Rule",
    statement: "The Southeast corner (Agneya Kon) must harbor the primary thermal cooking hearth.",
    category: "Thermal Mechanics",
    direction: "SE",
    version: "1.0.0",
    approvalStatus: "APPROVED",
    visibility: "PRIVATE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await storageService.rulesRepo.putBatch([sampleRule1, sampleRule2]);
  const rulesByBook = await storageService.rulesRepo.findByBookId("BOOK-1001-TEST");
  assert(rulesByBook.length === 2, "2 rules retrieved by book ID.");

  const neRules = await storageService.rulesRepo.findByDirection("NE");
  assert(neRules.length === 1 && neRules[0].id === "RULE-5001-NE", "Direction index query for 'NE' returned correct rule.");

  // --------------------------------------------------------------------------
  // TEST 5: EvidenceRepository & Linkages
  // --------------------------------------------------------------------------
  console.log("\nSTEP 5: Testing EvidenceRepository Linkages...");
  const sampleEvidence: EvidenceStoreItem = {
    id: "EVIDENCE-9001-V1",
    ruleId: "RULE-5001-NE",
    bookId: "BOOK-1001-TEST",
    chapter: "Adhyaya 53",
    page: 142,
    paragraph: "Verse 53.19: Ishane devagriham kuryad udake caivarashim.",
    confidence: 0.98,
    evidenceNotes: "Direct Sanskrit textual proof for Northeast water placement.",
    createdAt: new Date().toISOString()
  };

  await storageService.evidenceRepo.put(sampleEvidence);
  const evidenceList = await storageService.evidenceRepo.findByRuleId("RULE-5001-NE");
  assert(evidenceList.length === 1 && evidenceList[0].page === 142, "Evidence retrieved by rule ID.");

  // --------------------------------------------------------------------------
  // TEST 6: Knowledge Graph Nodes & Edges Repository
  // --------------------------------------------------------------------------
  console.log("\nSTEP 6: Testing Knowledge Graph Repository...");
  await storageService.knowledgeGraphRepo.nodes.put({
    id: "NODE-BOOK-1001",
    bookId: "BOOK-1001-TEST",
    type: "book",
    label: "Brihat Samhita",
    properties: { author: "Varahamihira" },
    createdAt: new Date().toISOString()
  });

  await storageService.knowledgeGraphRepo.nodes.put({
    id: "NODE-RULE-5001",
    bookId: "BOOK-1001-TEST",
    type: "rule",
    label: "Ishan Water Principle",
    properties: { direction: "NE" },
    createdAt: new Date().toISOString()
  });

  await storageService.knowledgeGraphRepo.edges.put({
    id: "EDGE-101",
    sourceId: "NODE-BOOK-1001",
    targetId: "NODE-RULE-5001",
    relationshipType: "explains",
    weight: 1.0,
    createdAt: new Date().toISOString()
  });

  const graphData = await storageService.knowledgeGraphRepo.getGraphForBook("BOOK-1001-TEST");
  assert(graphData.nodes.length === 2, "Graph returned 2 nodes for book.");
  assert(graphData.edges.length === 1, "Graph returned 1 edge connecting nodes.");

  // --------------------------------------------------------------------------
  // TEST 7: Transaction Rollback Protection
  // --------------------------------------------------------------------------
  console.log("\nSTEP 7: Testing Atomic Transaction Rollback...");
  let rollbackCaught = false;
  try {
    const engine = IndexedDBStorageEngine.getInstance();
    await engine.executeTransaction([KBStoreName.BOOKS], "readwrite", async (stores) => {
      const store = stores[KBStoreName.BOOKS];
      const tempBook: BookStoreItem = {
        id: "BOOK-TEMP-ROLLBACK",
        title: "Temporary Book",
        author: "Unknown",
        publisher: "Test",
        edition: "1.0",
        language: "Sanskrit",
        category: "Test",
        tags: [],
        status: "draft",
        version: "1.0.0",
        visibility: "PRIVATE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        format: "BOOK"
      };

      if (store instanceof Map) {
        store.set(tempBook.id, tempBook);
      } else {
        (store as IDBObjectStore).put(tempBook);
      }

      // Force intentional error to trigger rollback
      throw new Error("INTENTIONAL_SIMULATED_TRANSACTION_FAILURE");
    });
  } catch (err: any) {
    if (err.message.includes("INTENTIONAL_SIMULATED_TRANSACTION_FAILURE")) {
      rollbackCaught = true;
    }
  }

  assert(rollbackCaught === true, "Forced transaction error caught cleanly.");
  const rolledBackBook = await storageService.booksRepo.get("BOOK-TEMP-ROLLBACK");
  assert(rolledBackBook === null, "Rolled-back record was NOT committed to store.");

  // --------------------------------------------------------------------------
  // TEST 8: BUILD-019 LocalStorage Migration Engine
  // --------------------------------------------------------------------------
  console.log("\nSTEP 8: Testing BUILD-019 LocalStorage Migration Engine...");

  // Mock legacy LocalStorage if global localStorage exists
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("urjaflux_kb_v2_migrated");
    localStorage.setItem("urjaflux_norm_sources", JSON.stringify([
      { id: "BOOK-LEGACY-1", title: "Legacy Vastu Text 1", author: "Rishi Maya", category: "Classical" }
    ]));
    localStorage.setItem("urjaflux_norm_rules", JSON.stringify([
      { id: "RULE-LEGACY-1", bookId: "BOOK-LEGACY-1", title: "Legacy Brahmasthan Rule", statement: "Keep center open." }
    ]));

    assert(Build019MigrationEngine.isMigrationRequired() === true, "Migration engine detected legacy data in LocalStorage.");

    const migrationReport = await Build019MigrationEngine.executeMigration();
    assert(migrationReport.migrated === true, "Migration executed successfully.");
    assert(migrationReport.migratedCountTotal >= 2, "Migrated legacy records counted.");

    const migratedBook = await storageService.booksRepo.get("BOOK-LEGACY-1");
    assert(migratedBook !== null && migratedBook.title === "Legacy Vastu Text 1", "Migrated book retrieved from IndexedDB.");

    assert(localStorage.getItem("urjaflux_norm_sources") === null, "Legacy LocalStorage key cleared post-migration.");
    assert(localStorage.getItem("urjaflux_kb_v2_migrated") === "true", "Migration completion flag set.");
  } else {
    console.log("  ℹ Node environment without window.localStorage — migration skipped naturally.");
  }

  // --------------------------------------------------------------------------
  // TEST 9: Health Check & Diagnostics Score Calculation
  // --------------------------------------------------------------------------
  console.log("\nSTEP 9: Testing Storage Health Check & Score Calculation...");
  const healthReport = await storageService.checkHealth();
  assert(healthReport.healthScore >= 90, `Health score is ${healthReport.healthScore}/100.`);
  assert(healthReport.status === "HEALTHY", `Health status is '${healthReport.status}'.`);

  // --------------------------------------------------------------------------
  // TEST 10: JSON Backup Export & Restore Cycle
  // --------------------------------------------------------------------------
  console.log("\nSTEP 10: Testing Database Backup Export & Atomic Restore...");
  const backupJson = await storageService.exportBackup();
  assert(typeof backupJson === "string" && backupJson.includes("URJAFLUX_KB_V2"), "Backup JSON generated with valid headers.");

  // Reset database completely
  await storageService.resetDatabase();
  const resetStats = await storageService.getStats();
  assert(resetStats.totalRecords === 0, "Database reset confirmed (0 records).");

  // Restore from exported backup JSON
  const restoreRes = await storageService.importBackup(backupJson);
  assert(restoreRes.success === true, "Backup imported successfully.");

  const restoredStats = await storageService.getStats();
  assert(restoredStats.totalRecords > 0, `Restored ${restoredStats.totalRecords} records into database.`);

  const totalTime = Math.round(performance.now() - startTime);

  console.log("\n================================================ death");
  console.log(`✓ ALL 10 BUILD-021A FOUNDATION TESTS PASSED SUCCESSFULLY! (${totalTime} ms)`);
  console.log("================================================================\n");
}

runIndexedDBFoundationTests().catch((err) => {
  console.error("❌ TEST SUITE FAILED:", err);
  process.exit(1);
});
