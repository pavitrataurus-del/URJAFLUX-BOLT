import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";

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
  console.log("ocrText:", data.ocrText);
  
  const chunkQ = await getDocs(collection(db, "knowledge_chunks"));
  console.log("Total semantic chunks:", chunkQ.size);
  chunkQ.forEach(c => console.log(c.id, "=>", c.data().content));

  const graphQ = await getDocs(collection(db, "knowledge_graph_nodes"));
  console.log("Total knowledge graph nodes created:", graphQ.size);
  
  const embedQ = await getDocs(collection(db, "knowledge_embeddings"));
  console.log("Total embeddings generated:", embedQ.size);

  process.exit(0);
}
run();
