import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";

const db = getFirestore(
  initializeApp({
    apiKey: appletConfig.apiKey,
    projectId: appletConfig.projectId,
    storageBucket: appletConfig.storageBucket,
  })
);

const docId = "DOC-818BD43759AD8371C46D013718365CB9";
const snap = await getDoc(doc(db, "knowledge_documents", docId));
if (!snap.exists()) {
  console.log("Document not found");
  process.exit(0);
}
const d = snap.data() as Record<string, unknown>;
console.log("Document:", d.title);
console.log("extractedRulesCount:", d.extractedRulesCount);
console.log("approvedRulesCount:", d.approvedRulesCount);
console.log("ocrText length:", typeof d.ocrText === "string" ? d.ocrText.length : 0);
console.log("totalPages:", d.totalPages);

const chunks = await getDocs(collection(db, "knowledge_documents", docId, "chunks"));
console.log("Chunks in Firestore:", chunks.size);
chunks.docs.slice(0, 3).forEach((c) => {
  const ch = c.data();
  const text = String(ch.text || ch.content || ch.rawText || "");
  console.log(`  ${c.id}: ${text.length} chars — ${text.slice(0, 100).replace(/\n/g, " ")}...`);
});
