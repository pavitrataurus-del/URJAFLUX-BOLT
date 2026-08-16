import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";
import { normalizeVisionOcrText } from "../src/services/knowledgeVaultOcrTextUtils";

const docId = "DOC-A2EC46EEFD520CA8721F4994DAF1F620";
const db = getFirestore(
  initializeApp({
    apiKey: appletConfig.apiKey,
    projectId: appletConfig.projectId,
    storageBucket: appletConfig.storageBucket,
  })
);

const snap = await getDocs(collection(db, "knowledge_documents", docId, "chunks"));
const pageText = new Map<number, string>();

for (const c of snap.docs) {
  const d = c.data() as Record<string, unknown>;
  const pn = Number(d.pageNumber || 0);
  if (!pn) continue;
  const part = normalizeVisionOcrText(String(d.text || d.content || d.rawText || ""));
  if (!part) continue;
  pageText.set(pn, (pageText.get(pn) || "") + "\n" + part);
}

const withText = [...pageText.entries()]
  .map(([pn, t]) => ({ pn, len: t.replace(/\s+/g, " ").trim().length, preview: t.slice(0, 80) }))
  .filter((x) => x.len >= 35)
  .sort((a, b) => a.pn - b.pn);

console.log("Pages with merged OCR (>=35 chars):", withText.length);
withText.forEach((x) => console.log(`  p${x.pn} (${x.len} chars): ${x.preview.replace(/\n/g, " ")}`));
