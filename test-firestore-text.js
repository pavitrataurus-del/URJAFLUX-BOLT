import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
  console.log("ocrText length:", data.ocrText?.length);
  console.log("First 300 chars:");
  console.log(data.ocrText?.slice(0, 300));
  console.log("Last 300 chars:");
  console.log(data.ocrText?.slice(-300));
  
  process.exit(0);
}
run();
