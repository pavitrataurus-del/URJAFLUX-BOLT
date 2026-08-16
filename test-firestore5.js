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
  const q = await getDocs(collection(db, "knowledge_structured_models"));
  console.log("Total structured models:", q.size);
  q.forEach(d => {
      console.log(`Doc: ${d.id}`);
      const data = d.data();
      console.log(`Has cleanText: ${!!data.cleanText}, length: ${data.cleanText?.length}`);
      console.log(`Chapters: ${data.chapters?.length}`);
  });
  process.exit(0);
}
run();
