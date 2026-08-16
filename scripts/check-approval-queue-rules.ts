import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";

const db = getFirestore(
  initializeApp({
    apiKey: appletConfig.apiKey,
    projectId: appletConfig.projectId,
    storageBucket: appletConfig.storageBucket,
  })
);

const docId = "DOC-818BD43759AD8371C46D013718365CB9";

const rulesSnap = await getDocs(collection(db, "knowledge_rules"));
const allRules = rulesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];

const forDoc = allRules.filter((r) => r.documentId === docId);
const pending = allRules.filter((r) => r.approvalStatus === "PENDING");
const approved = allRules.filter((r) => r.approvalStatus === "APPROVED");

console.log("=== Rules summary ===");
console.log(`Total rules in Firestore: ${allRules.length}`);
console.log(`PENDING (Approval Queue): ${pending.length}`);
console.log(`APPROVED: ${approved.length}`);

console.log(`\n=== Rules for Brhatsamhita_compressed2 (${docId}) ===`);
console.log(`Count: ${forDoc.length}`);
forDoc.slice(0, 5).forEach((r) => {
  console.log(`- ${r.id} | ${r.approvalStatus} | ${String(r.recommendation || "").slice(0, 80)}...`);
});
if (forDoc.length > 5) console.log(`  ... and ${forDoc.length - 5} more`);

const statusCounts = forDoc.reduce(
  (acc, r) => {
    const s = String(r.approvalStatus || "?");
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);
console.log("\nStatus breakdown for this doc:", statusCounts);
