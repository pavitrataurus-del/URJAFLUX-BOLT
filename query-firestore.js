import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  projectId: "urjaflux-ai-os",
  appId: "1:407931415113:web:25a94382a60aa807192d98",
  apiKey: "AIzaSyBRAwXtebrkq2CqHv7AgKEzrSrS4NQ0spM",
  authDomain: "urjaflux-ai-os.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const docsSnap = await getDocs(collection(db, "knowledge_documents"));
    docsSnap.forEach(doc => {
      console.log(`Doc: ${doc.id}`);
    });
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
