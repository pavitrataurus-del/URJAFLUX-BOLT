import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";

const db = getFirestore(
  initializeApp({
    apiKey: appletConfig.apiKey,
    projectId: appletConfig.projectId,
    storageBucket: appletConfig.storageBucket,
  })
);

interface DocSummary {
  id: string;
  title: string;
  originalName: string;
  sizeBytes: number;
  sizeMB: string;
  totalPages: number;
  status: string;
  category: string;
  uploadedAt: string;
  storagePath: string | null;
  downloadURL: string | null;
  sha256Hash: string | null;
  isCloudSsot: boolean | null;
  ocrTextLen: number;
  extractedRulesCount: number;
  approvedRulesCount: number;
  chunkCount: number;
}

const snap = await getDocs(collection(db, "knowledge_documents"));
console.log(`\n=== ALL knowledge_documents in Firestore ===`);
console.log(`Project: ${appletConfig.projectId}`);
console.log(`Total documents: ${snap.size}\n`);

const summaries: DocSummary[] = [];

for (const docSnap of snap.docs) {
  const d = docSnap.data() as Record<string, unknown>;
  let chunkCount = 0;
  try {
    const chunksSnap = await getDocs(collection(db, "knowledge_documents", docSnap.id, "chunks"));
    chunkCount = chunksSnap.size;
  } catch {
    chunkCount = -1;
  }

  summaries.push({
    id: docSnap.id,
    title: String(d.title ?? "—"),
    originalName: String(d.originalName ?? "—"),
    sizeBytes: Number(d.sizeBytes ?? 0),
    sizeMB: (Number(d.sizeBytes ?? 0) / (1024 * 1024)).toFixed(2),
    totalPages: Number(d.totalPages ?? 0),
    status: String(d.status ?? "—"),
    category: String(d.category ?? "—"),
    uploadedAt: String(d.uploadedAt ?? "—"),
    storagePath: d.storagePath ? String(d.storagePath) : null,
    downloadURL: d.downloadURL ? String(d.downloadURL) : null,
    sha256Hash: d.sha256Hash ? String(d.sha256Hash) : null,
    isCloudSsot: d.isCloudSsot != null ? Boolean(d.isCloudSsot) : null,
    ocrTextLen: typeof d.ocrText === "string" ? d.ocrText.length : 0,
    extractedRulesCount: Number(d.extractedRulesCount ?? 0),
    approvedRulesCount: Number(d.approvedRulesCount ?? 0),
    chunkCount,
  });
}

summaries.sort((a, b) => b.sizeBytes - a.sizeBytes);

let totalSize = 0;
let withStorage = 0;
let withChunks = 0;

summaries.forEach((s, i) => {
  totalSize += s.sizeBytes;
  if (s.storagePath) withStorage++;
  if (s.chunkCount > 0) withChunks++;
  console.log(`--- [${i + 1}/${summaries.length}] ${s.id} ---`);
  console.log(`  Title:        ${s.title}`);
  console.log(`  File:         ${s.originalName}`);
  console.log(`  Size:         ${s.sizeMB} MB (${s.sizeBytes} bytes)`);
  console.log(`  Pages:        ${s.totalPages}`);
  console.log(`  Status:       ${s.status}`);
  console.log(`  Category:     ${s.category}`);
  console.log(`  Uploaded:     ${s.uploadedAt}`);
  console.log(`  OCR text:     ${s.ocrTextLen} chars (parent doc preview)`);
  console.log(`  Chunks:       ${s.chunkCount}`);
  console.log(`  Rules:        extracted=${s.extractedRulesCount} approved=${s.approvedRulesCount}`);
  console.log(`  Storage SSOT: ${s.isCloudSsot === true ? "YES" : s.isCloudSsot === false ? "NO" : "—"}`);
  console.log(`  storagePath:  ${s.storagePath ?? "—"}`);
  console.log(`  downloadURL:  ${s.downloadURL ? s.downloadURL.slice(0, 90) + "..." : "—"}`);
  console.log(`  sha256Hash:   ${s.sha256Hash ?? "—"}`);
  console.log("");
});

console.log("=== SUMMARY ===");
console.log(`Total documents:     ${summaries.length}`);
console.log(`Total metadata size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB (claimed file sizes)`);
console.log(`With storagePath:    ${withStorage}`);
console.log(`With chunks:         ${withChunks}`);
console.log(`Without cloud PDF:   ${summaries.length - withStorage}`);
