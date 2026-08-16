import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import appletConfig from "../firebase-applet-config.json";
import fs from "fs";

const app = initializeApp({
  apiKey: appletConfig.apiKey,
  authDomain: appletConfig.authDomain,
  projectId: appletConfig.projectId,
  storageBucket: appletConfig.storageBucket,
});
const storage = getStorage(app);
const pdf = fs.readFileSync("C:\\Users\\DELL\\Downloads\\vastu-for-flats-pdf.pdf");
const path = "knowledge-vault/TEST-DOC/test_upload.pdf";
try {
  const snap = await uploadBytes(ref(storage, path), pdf, { contentType: "application/pdf" });
  const url = await getDownloadURL(snap.ref);
  console.log("SUCCESS", url);
} catch (e: any) {
  console.error("FAIL", e.code, e.message);
}
