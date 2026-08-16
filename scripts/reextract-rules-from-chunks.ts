/**
 * Rebuild rules from stored Firestore chunks (after OCR fixes or rule cap increase).
 * Usage:
 *   npx tsx scripts/reextract-rules-from-chunks.ts
 *   npx tsx scripts/reextract-rules-from-chunks.ts DOC-C26C554DBF919633795CAF2D2FC562C4
 *   npx tsx scripts/reextract-rules-from-chunks.ts --all
 */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";
import { extractApprovedRulesFromDocument } from "../src/services/knowledgeVaultRuleExtractionService";
import { rebuildFullTextFromChunkRecords } from "../src/services/knowledgeVaultChunkTextUtils";
import { KNOWLEDGE_MAX_RULES_ABSOLUTE_CEILING } from "../src/services/knowledgeVaultLimits";

const arg = process.argv[2] || "DOC-C26C554DBF919633795CAF2D2FC562C4";
const reextractAll = arg === "--all";

const db = getFirestore(
  initializeApp({
    apiKey: appletConfig.apiKey,
    projectId: appletConfig.projectId,
    storageBucket: appletConfig.storageBucket,
  })
);

async function reextractOne(docId: string): Promise<number> {
  const docSnap = await getDoc(doc(db, "knowledge_documents", docId));
  if (!docSnap.exists()) {
    console.warn(`Skip ${docId} — not found`);
    return 0;
  }
  const meta = docSnap.data() as Record<string, unknown>;
  const title = String(meta?.title || meta?.originalName || docId);
  const totalPages = Number(meta?.totalPages || 1);

  const chunksSnap = await getDocs(collection(db, "knowledge_documents", docId, "chunks"));
  const chunkRecords = chunksSnap.docs.map((c) => c.data() as Record<string, unknown>);
  const { fullText, pagesWithText } = rebuildFullTextFromChunkRecords(chunkRecords, totalPages);

  console.log(`\n[${title}] pages w/text: ${pagesWithText}, rebuilt len: ${fullText.length}`);

  const rules = extractApprovedRulesFromDocument({ id: docId, title, totalPages }, fullText);
  console.log(`Extracted rules: ${rules.length} (dynamic cap up to ${KNOWLEDGE_MAX_RULES_ABSOLUTE_CEILING}/doc)`);

  const oldRules = await getDocs(collection(db, "knowledge_rules"));
  let deleted = 0;
  for (const r of oldRules.docs) {
    if ((r.data() as { documentId?: string }).documentId === docId) {
      await deleteDoc(r.ref);
      deleted++;
    }
  }
  console.log(`Deleted old rules: ${deleted}`);

  for (const rule of rules) {
    await setDoc(doc(db, "knowledge_rules", rule.id), rule);
  }

  await setDoc(
    doc(db, "knowledge_documents", docId),
    {
      extractedRulesCount: rules.length,
      approvedRulesCount: rules.length,
      ocrPagesWithText: pagesWithText,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log(`Saved ${rules.length} rules.`);
  return rules.length;
}

if (reextractAll) {
  const docsSnap = await getDocs(collection(db, "knowledge_documents"));
  let total = 0;
  for (const d of docsSnap.docs) {
    total += await reextractOne(d.id);
  }
  console.log(`\nDone. Total rules written: ${total}`);
} else {
  await reextractOne(arg);
}
