import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";

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
  console.log("totalPages in knowledge_documents:", data?.totalPages);
  
  if (data?.ocrText) {
    console.log("OCR Text Length:", data.ocrText.length);
    // Is there any page marker?
    console.log("Contains PAGE marker?", data.ocrText.includes("PAGE "));
  }

  const chunkQ = query(collection(db, "knowledge_chunks"), where("documentId", "==", "DOC-1648EC2A56E963E9440984C358627286"));
  const chunks = await getDocs(chunkQ);
  console.log("Total semantic chunks:", chunks.size);
  
  if (chunks.size > 0) {
    console.log("Sample chunk:", JSON.stringify(chunks.docs[0].data(), null, 2).substring(0, 500));
  }

  // knowledge graph nodes? 
  const nodes = await getDocs(collection(db, "knowledge_graph_nodes"));
  console.log("Total knowledge graph nodes created:", nodes.size);
  // wait, what is the graph nodes collection name? Let's check!
  
  const embeddings = await getDocs(collection(db, "knowledge_embeddings"));
  console.log("Total embeddings generated:", embeddings.size);
  
  process.exit(0);
}
run();
