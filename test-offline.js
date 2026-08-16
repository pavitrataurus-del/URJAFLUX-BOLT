import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, disableNetwork, enableNetwork } from "firebase/firestore";

const firebaseConfig = {
  projectId: "urjaflux-ai-os",
  appId: "1:407931415113:web:25a94382a60aa807192d98",
  apiKey: "AIzaSyBRAwXtebrkq2CqHv7AgKEzrSrS4NQ0spM",
  authDomain: "urjaflux-ai-os.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  await disableNetwork(db);
  try {
    await getDoc(doc(db, "test", "ping"));
  } catch (err) {
    console.error("Error from getDoc when offline:", err.message);
  }
  process.exit(0);
}
run();
