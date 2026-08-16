import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, query, limit } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";
import {
  extractApprovedRulesFromDocument,
  parsePageSegments,
} from "../src/services/knowledgeVaultRuleExtractionService";

const db = getFirestore(
  initializeApp({
    apiKey: appletConfig.apiKey,
    projectId: appletConfig.projectId,
    storageBucket: appletConfig.storageBucket,
  })
);

const docId = "DOC-A2EC46EEFD520CA8721F4994DAF1F620";
const docSnap = await getDoc(doc(db, "knowledge_documents", docId));
console.log("Parent doc fields:", Object.keys(docSnap.data() || {}));
console.log("Title:", docSnap.data()?.title, "pages:", docSnap.data()?.totalPages);

const rulesSnap = await getDocs(collection(db, "knowledge_rules"));
console.log("\nRules:", rulesSnap.size);
for (const r of rulesSnap.docs) {
  const d = r.data();
  console.log(`- ${r.id}`);
  console.log(`  page: ${d.evidence?.pageNumber} cat: ${d.category}`);
  console.log(`  condition: ${String(d.condition || "").slice(0, 120)}`);
}

const chunksSnap = await getDocs(collection(db, "knowledge_documents", docId, "chunks"));
console.log("\nTotal chunks:", chunksSnap.size);

const byPage = new Map<number, number>();
let withText = 0;
let sampleTexts: string[] = [];
for (const c of chunksSnap.docs) {
  const data = c.data() as Record<string, unknown>;
  const text = String(data.text || data.content || data.rawText || "");
  const pn = Number(data.pageNumber || 0);
  byPage.set(pn, (byPage.get(pn) || 0) + 1);
  if (text.replace(/---\s*PAGE.*?---/gi, "").trim().length > 30) withText++;
  if (sampleTexts.length < 8 && text.length > 50) sampleTexts.push(`[p${pn} len=${text.length}] ${text.slice(0, 180)}`);
}
console.log("Pages with chunks:", byPage.size);
console.log("Chunks with substantive text (>30 chars body):", withText);
console.log("\nSample chunk bodies:");
sampleTexts.forEach((s) => console.log(s));

// Build page-marked text like pipeline
const pageMap = new Map<number, string[]>();
for (const c of chunksSnap.docs) {
  const data = c.data() as Record<string, unknown>;
  const pn = Number(data.pageNumber || 1);
  const t = String(data.text || data.content || data.rawText || "").trim();
  if (!t) continue;
  if (!pageMap.has(pn)) pageMap.set(pn, []);
  pageMap.get(pn)!.push(t);
}
const totalPages = Number(docSnap.data()?.totalPages || 766);
const fullText = Array.from(pageMap.entries())
  .sort((a, b) => a[0] - b[0])
  .map(([pn, parts]) => `--- PAGE ${pn} OF ${totalPages} ---\n${parts.join("\n")}`)
  .join("\n\n");

console.log("\nRebuilt fullText len:", fullText.length);
console.log("Page segments:", parsePageSegments(fullText).length);
const rules = extractApprovedRulesFromDocument(
  { id: docId, title: "Brhatsamhita_compressed2", totalPages },
  fullText,
  150
);
console.log("Rules from rebuilt text:", rules.length);
if (rules[1]) console.log("Rule 2 sample:", rules[1].condition?.slice(0, 100));
