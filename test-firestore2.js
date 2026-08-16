import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";

const firebaseConfig = {
  projectId: "urjaflux-ai-os",
  appId: "1:407931415113:web:25a94382a60aa807192d98",
  apiKey: "AIzaSyBRAwXtebrkq2CqHv7AgKEzrSrS4NQ0spM",
  authDomain: "urjaflux-ai-os.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const docs = await getDocs(query(collection(db, "knowledge_documents"), orderBy("uploadedAt", "desc")));
  docs.forEach(d => {
      console.log(`Doc: ${d.id}, Title: ${d.data().title}, uploadedAt: ${d.data().uploadedAt}, ocrText Length: ${d.data().ocrText?.length}, totalPages: ${d.data().totalPages}`);
  });
  
  process.exit(0);
}
run();
