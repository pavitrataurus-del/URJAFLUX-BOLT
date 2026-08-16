import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
  projectId: "urjaflux-ai-os",
  appId: "1:407931415113:web:25a94382a60aa807192d98",
  apiKey: "AIzaSyBRAwXtebrkq2CqHv7AgKEzrSrS4NQ0spM",
  authDomain: "urjaflux-ai-os.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const docRef = doc(db, "knowledge_documents", "DOC-1648EC2A56E963E9440984C358627286");
  const snap = await getDoc(docRef);
  const data = snap.data();
  console.log("totalPages in knowledge_documents:", data.totalPages);
  console.log("extractedRulesCount:", data.extractedRulesCount);
  
  const structRef = doc(db, "knowledge_quality_metrics", "DOC-1648EC2A56E963E9440984C358627286");
  const structSnap = await getDoc(structRef);
  const structData = structSnap.data();
  if (structData) {
    console.log("Quality Metrics detectedParagraphsCount:", structData.detectedParagraphsCount);
  } else {
    console.log("No Quality Metrics found.");
  }
  
  const chunkQ = query(collection(db, "knowledge_chunks"), where("documentId", "==", "DOC-1648EC2A56E963E9440984C358627286"));
  const chunks = await getDocs(chunkQ);
  console.log("Total chunks:", chunks.size);
  
  process.exit(0);
}
run();
