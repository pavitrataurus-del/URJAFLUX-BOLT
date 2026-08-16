import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, limit } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";

const db = getFirestore(
  initializeApp({
    apiKey: appletConfig.apiKey,
    projectId: appletConfig.projectId,
    storageBucket: appletConfig.storageBucket,
  })
);

const docId = "DOC-39055939B2644EDBE27C6C3EE141339C"; // Mayamatam ~52MB
const snap = await getDoc(doc(db, "knowledge_documents", docId));
if (!snap.exists()) {
  console.log("Doc not found");
  process.exit(0);
}
const data = snap.data() as Record<string, unknown>;
console.log("Fields:", Object.keys(data).join(", "));
console.log({
  id: data.id,
  title: data.title,
  sizeBytes: data.sizeBytes,
  storagePath: data.storagePath,
  downloadURL: data.downloadURL ? String(data.downloadURL).slice(0, 80) + "..." : null,
  fileUrl: data.fileUrl ? String(data.fileUrl).slice(0, 80) + "..." : null,
  sha256Hash: data.sha256Hash,
  ocrTextLen: typeof data.ocrText === "string" ? data.ocrText.length : 0,
  ocrPreview: typeof data.ocrText === "string" ? data.ocrText.slice(0, 200) : null,
});

const chunks = await getDocs(collection(db, "knowledge_documents", docId, "chunks"));
console.log(`Chunks subcollection: ${chunks.size} docs`);
chunks.docs.slice(0, 2).forEach((c) => {
  const ch = c.data();
  console.log(`  chunk ${c.id}: textLen=${String(ch.text || ch.content || "").length}`);
});
