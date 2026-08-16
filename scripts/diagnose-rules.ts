import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";
import { extractApprovedRulesFromDocument } from "../src/services/knowledgeVaultRuleExtractionService";

const db = getFirestore(
  initializeApp({
    apiKey: appletConfig.apiKey,
    projectId: appletConfig.projectId,
    storageBucket: appletConfig.storageBucket,
  })
);

const docId = "DOC-A2EC46EEFD520CA8721F4994DAF1F620";
const docSnap = await getDoc(doc(db, "knowledge_documents", docId));
const d = docSnap.data() as Record<string, unknown> | undefined;
if (!d) {
  console.log("Document not found");
  process.exit(1);
}

const chunksSnap = await getDocs(collection(db, "knowledge_documents", docId, "chunks"));
console.log("Doc:", d.title, "pages:", d.totalPages);
console.log("OCR preview len:", String(d.ocrText || "").length);
console.log("OCR preview:", String(d.ocrText || "").slice(0, 400));
console.log("Chunks:", chunksSnap.size);

let totalChunkChars = 0;
for (const c of chunksSnap.docs.slice(0, 5)) {
  const data = c.data() as Record<string, unknown>;
  const text = String(data.text || data.content || data.rawText || "");
  totalChunkChars += text.length;
  console.log(`--- chunk ${c.id} page=${data.pageNumber} len=${text.length} ---`);
  console.log(text.slice(0, 250));
}

for (const c of chunksSnap.docs.slice(5)) {
  const data = c.data() as Record<string, unknown>;
  totalChunkChars += String(data.text || data.content || data.rawText || "").length;
}
console.log("Total chunk chars:", totalChunkChars);

const fullFromChunks = chunksSnap.docs
  .map((c) => {
    const data = c.data() as Record<string, unknown>;
    const pn = Number(data.pageNumber || data.page || 1);
    const t = String(data.text || data.content || data.rawText || "");
    return `--- PAGE ${pn} OF ${Number(d.totalPages || 766)} ---\n${t}`;
  })
  .join("\n\n");

const rules = extractApprovedRulesFromDocument(
  { id: docId, title: String(d.title || ""), totalPages: Number(d.totalPages || 766) },
  fullFromChunks,
  20
);
console.log("Rules extractable from stored chunks:", rules.length);
if (rules[0]) {
  console.log("Sample:", rules[0].id, rules[0].condition?.slice(0, 100));
}
