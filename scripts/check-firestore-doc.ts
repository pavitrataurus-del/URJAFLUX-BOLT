import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";

const app = initializeApp({
  apiKey: appletConfig.apiKey,
  projectId: appletConfig.projectId,
  storageBucket: appletConfig.storageBucket,
});
const db = getFirestore(app);
const docId = "DOC-ED60882152D0BC0C17F349BEB4A4BABE";
const snap = await getDoc(doc(db, "knowledge_documents", docId));
console.log("exists:", snap.exists());
if (snap.exists()) console.log(JSON.stringify(snap.data(), null, 2));
