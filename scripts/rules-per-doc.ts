import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";
import { normalizeVisionOcrText } from "../src/services/knowledgeVaultOcrTextUtils";

const db = getFirestore(
  initializeApp({
    apiKey: appletConfig.apiKey,
    projectId: appletConfig.projectId,
    storageBucket: appletConfig.storageBucket,
  })
);

const docsSnap = await getDocs(collection(db, "knowledge_documents"));
console.log("Documents:", docsSnap.size);

for (const d of docsSnap.docs) {
  const data = d.data();
  const chunksSnap = await getDocs(collection(db, "knowledge_documents", d.id, "chunks"));
  const pageText = new Map<number, number>();
  for (const c of chunksSnap.docs) {
    const pn = Number(c.data().pageNumber || 0);
    const t = normalizeVisionOcrText(String(c.data().text || c.data().content || "")).replace(/--- PAGE.*?---/gi, "").trim();
    if (pn && t.length >= 35) pageText.set(pn, t.length);
  }
  console.log("---", d.id);
  console.log("  title:", data.title, "| totalPages:", data.totalPages);
  console.log("  chunks:", chunksSnap.size, "| pages with OCR text (>=35 chars):", pageText.size);
}

const rulesSnap = await getDocs(collection(db, "knowledge_rules"));
const byDoc = new Map<string, number>();
for (const r of rulesSnap.docs) {
  const docId = String(r.data().documentId || "unknown");
  byDoc.set(docId, (byDoc.get(docId) || 0) + 1);
}
console.log("\nRules by document:");
for (const [id, n] of byDoc) {
  const ds = await getDoc(doc(db, "knowledge_documents", id));
  console.log(`  ${n} rules -> ${ds.data()?.title || id}`);
}
console.log("Total rules:", rulesSnap.size);
