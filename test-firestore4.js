import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, orderBy, query } from "firebase/firestore";

const firebaseConfig = {
  projectId: "urjaflux-ai-os",
  appId: "1:407931415113:web:25a94382a60aa807192d98",
  apiKey: "AIzaSyBRAwXtebrkq2CqHv7AgKEzrSrS4NQ0spM",
  authDomain: "urjaflux-ai-os.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const docsQ = await getDocs(query(collection(db, "knowledge_documents"), orderBy("uploadedAt", "desc")));
  for (let d of docsQ.docs) {
    const data = d.data();
    console.log(`\nDoc: ${data.title}, ID: ${d.id}`);
    console.log(`Pages: ${data.totalPages}, ocrText length: ${data.ocrText?.length}, rawText length: ${data.rawTextContent?.length}`);
    if (data.ocrText?.length > 100) {
      console.log("ocrText start:", data.ocrText.substring(0, 200).replace(/\n/g, "\\n"));
    }
  }

  process.exit(0);
}
run();
