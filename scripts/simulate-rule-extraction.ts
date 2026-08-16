import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";
import { extractApprovedRulesFromDocument } from "../src/services/knowledgeVaultRuleExtractionService";
import { rebuildFullTextFromChunkRecords } from "../src/services/knowledgeVaultChunkTextUtils";
import { resolveMaxRulesForDocument } from "../src/services/knowledgeVaultLimits";

const db = getFirestore(
  initializeApp({
    apiKey: appletConfig.apiKey,
    projectId: appletConfig.projectId,
    storageBucket: appletConfig.storageBucket,
  })
);

const docIds = [
  "DOC-C26C554DBF919633795CAF2D2FC562C4",
  "DOC-01603FFDA7A63955AD128EE554452892",
];

for (const docId of docIds) {
  const meta = (await getDoc(doc(db, "knowledge_documents", docId))).data() as Record<string, unknown>;
  const chunks = (await getDocs(collection(db, "knowledge_documents", docId, "chunks"))).docs.map((d) =>
    d.data()
  );
  const totalPages = Number(meta?.totalPages || 1);
  const { fullText, pagesWithText } = rebuildFullTextFromChunkRecords(chunks, totalPages);
  const rules = extractApprovedRulesFromDocument(
    { id: docId, title: String(meta?.title), totalPages },
    fullText
  );
  const cap = resolveMaxRulesForDocument(pagesWithText, true);
  console.log(
    `${meta?.title} | pages w/text: ${pagesWithText} | dynamic cap: ${cap} | extractable rules: ${rules.length}`
  );
}
