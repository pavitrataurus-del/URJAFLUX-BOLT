import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

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
    console.log(`Found ${docsSnap.size} documents in knowledge_documents`);
    
    docsSnap.forEach(d => {
      const data = d.data();
      console.log(`\nDocument ID: ${d.id}`);
      console.log(`File Name: ${data.originalName || data.title}`);
      console.log(`Page Count: ${data.totalPages}`);
      console.log(`OCR Text Length: ${data.ocrText ? data.ocrText.length : 0}`);
    });

    const chunksSnap = await getDocs(collection(db, "knowledge_chunks"));
    console.log(`\nFound ${chunksSnap.size} chunks in knowledge_chunks`);

    // Let's see if we have embeddings. If knowledge_chunks has embeddings
    if (chunksSnap.size > 0) {
       const firstChunk = chunksSnap.docs[0].data();
       console.log(`Embeddings exist on chunk: ${firstChunk.embedding ? 'Yes (' + firstChunk.embedding.length + ' dims)' : 'No'}`);
    }

  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
