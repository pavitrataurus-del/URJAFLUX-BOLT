import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getMetadata, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";

const app = initializeApp({
  apiKey: appletConfig.apiKey,
  authDomain: appletConfig.authDomain,
  projectId: appletConfig.projectId,
  storageBucket: appletConfig.storageBucket,
});

const storage = getStorage(app);
const db = getFirestore(app);

async function listStorageRecursive(prefix: string, depth = 0): Promise<void> {
  const root = ref(storage, prefix);
  const res = await listAll(root);
  for (const item of res.items) {
    try {
      const meta = await getMetadata(item);
      let url = "";
      try {
        url = await getDownloadURL(item);
      } catch {
        url = "(download URL denied)";
      }
      console.log(
        `STORAGE FILE: ${item.fullPath} | ${meta.size} bytes | ${meta.contentType || "?"} | updated ${meta.updated}`
      );
      console.log(`  URL: ${url.slice(0, 100)}...`);
    } catch (e: any) {
      console.log(`STORAGE FILE: ${item.fullPath} | meta error: ${e?.code || e?.message}`);
    }
  }
  if (depth < 3) {
    for (const folder of res.prefixes) {
      console.log(`STORAGE FOLDER: ${folder.fullPath}/`);
      await listStorageRecursive(folder.fullPath, depth + 1);
    }
  }
}

console.log("=== Firebase Storage audit ===");
console.log(`Bucket: ${appletConfig.storageBucket}`);
for (const prefix of ["", "projects", "knowledge-vault"]) {
  console.log(`\n--- prefix: '${prefix || "(root)"}' ---`);
  try {
    await listStorageRecursive(prefix);
  } catch (e: any) {
    console.error(`Storage list error [${prefix}]:`, e?.code, e?.message);
  }
}

console.log("\n=== Firestore knowledge_documents (sample) ===");
try {
  const snap = await getDocs(query(collection(db, "knowledge_documents"), limit(15)));
  console.log(`Total fetched: ${snap.size}`);
  snap.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    console.log(
      `DOC ${d.id}: title=${data.title} storagePath=${data.storagePath ?? "—"} isCloudSsot=${data.isCloudSsot} size=${data.sizeBytes}`
    );
  });
} catch (e: any) {
  console.error("Firestore read error:", e?.code, e?.message);
}
