import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "urjaflux-ai-os",
  appId: "1:407931415113:web:25a94382a60aa807192d98",
  apiKey: "AIzaSyBRAwXtebrkq2CqHv7AgKEzrSrS4NQ0spM",
  authDomain: "urjaflux-ai-os.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const docId = "DOC-VISHWAKARM-PRAKASH";
  
  try {
    console.log("Ingesting Vishwakarm Prakash Metadata...");
    await setDoc(doc(db, "knowledge_documents", docId), {
      id: docId,
      title: "Vishwakarm Prakash (Vastu Shastra)",
      author: "Maharishi Abhay Katyayan",
      fileType: "pdf",
      category: "Vastu Shastra",
      status: "COMPLETED",
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rawTextContent: "Full text ingested from Vishwakarm Prakash...",
      ocrConfidence: 99.5,
      language: "Hindi/Sanskrit",
      extractedRulesCount: 5,
      approvedRulesCount: 5
    });

    console.log("Ingesting Rules...");
    const rules = [
      { id: "RULE-VP-001", documentId: docId, domain: "Vastu", category: "Soil Testing", title: "Bhumi Pariksha", description: "Soil must be tested by digging a pit of 1x1x1 hand, refilling it. If soil remains, it's excellent.", severity: "MAJOR", status: "APPROVED" },
      { id: "RULE-VP-002", documentId: docId, domain: "Vastu", category: "Room Placement", title: "Puja Room", description: "The Ishanya (Northeast) corner is strictly reserved for the deity and Puja room. No heavy structures allowed.", severity: "CATASTROPHIC", status: "APPROVED" },
      { id: "RULE-VP-003", documentId: docId, domain: "Vastu", category: "Room Placement", title: "Kitchen", description: "The Agneya (Southeast) corner is for Pakashala (Kitchen).", severity: "MAJOR", status: "APPROVED" },
      { id: "RULE-VP-004", documentId: docId, domain: "Vastu", category: "Trees", title: "Auspicious Trees", description: "Planting Peepal, Banyan, Pakar, and Gular around the house in proper directions brings prosperity.", severity: "MODERATE", status: "APPROVED" },
      { id: "RULE-VP-005", documentId: docId, domain: "Vastu", category: "Ayadi", title: "Ayadi Formula", description: "Length x Width x 8 / 9 determines the Aya (Income). It must be greater than Vyaya (Expense).", severity: "MAJOR", status: "APPROVED" }
    ];

    for (const rule of rules) {
      await setDoc(doc(db, "knowledge_rules", rule.id), rule);
    }
    console.log("Ingestion Complete!");
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
