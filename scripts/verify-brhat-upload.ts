import { createClient } from "@supabase/supabase-js";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
const bucket = process.env.VITE_SUPABASE_KNOWLEDGE_BUCKET || "knowledge-vault";

const db = getFirestore(
  initializeApp({
    apiKey: appletConfig.apiKey,
    projectId: appletConfig.projectId,
    storageBucket: appletConfig.storageBucket,
  })
);

console.log("=== Supabase: search Brhatsamhita files ===\n");

async function listRecursive(prefix: string, depth = 0): Promise<string[]> {
  const found: string[] = [];
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 100 });
  if (error || !data) return found;
  for (const item of data) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) {
      found.push(path);
    } else if (depth < 4) {
      found.push(...(await listRecursive(path, depth + 1)));
    }
  }
  return found;
}

const allPaths = await listRecursive("");
const brhatPaths = allPaths.filter(
  (p) => p.toLowerCase().includes("brhat") || p.toLowerCase().includes("samhita")
);

console.log(`Total files in bucket: ${allPaths.length}`);
if (brhatPaths.length === 0) {
  console.log("No Brhatsamhita path found. Recent paths:");
  allPaths.slice(-15).forEach((p) => console.log(" ", p));
} else {
  for (const p of brhatPaths) {
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(p);
    const folder = p.split("/").slice(0, -1).join("/");
    const fileName = p.split("/").pop();
    const { data: meta } = await supabase.storage.from(bucket).list(folder, {
      search: fileName,
    });
    const size = meta?.[0]?.metadata?.size ?? meta?.[0]?.metadata?.contentLength ?? "?";
    console.log(`FILE: ${p}`);
    console.log(`  Size: ${size} bytes`);
    console.log(`  URL:  ${pub.publicUrl.slice(0, 100)}...`);
  }
}

console.log("\n=== Firestore: Brhatsamhita documents ===\n");
const snap = await getDocs(collection(db, "knowledge_documents"));
const brhatDocs = snap.docs.filter((d) => {
  const t = JSON.stringify(d.data()).toLowerCase();
  return t.includes("brhat") || t.includes("samhita");
});

if (brhatDocs.length === 0) {
  console.log("No Brhatsamhita doc in Firestore.");
} else {
  brhatDocs.forEach((d) => {
    const x = d.data() as Record<string, unknown>;
    console.log(`DOC: ${d.id}`);
    console.log(`  title:         ${x.title}`);
    console.log(`  uploadedAt:    ${x.uploadedAt}`);
    console.log(`  sizeBytes:     ${x.sizeBytes}`);
    console.log(`  storageDriver: ${x.storageDriver ?? "—"}`);
    console.log(`  cloudProvider: ${x.cloudProvider ?? "—"}`);
    console.log(`  isCloudSsot:   ${x.isCloudSsot ?? "—"}`);
    console.log(`  storagePath:   ${x.storagePath ?? "—"}`);
    console.log(`  sha256Hash:    ${x.sha256Hash ? String(x.sha256Hash).slice(0, 20) + "..." : "—"}`);
    console.log(`  downloadURL:   ${x.downloadURL ? String(x.downloadURL).slice(0, 90) + "..." : "—"}`);
    console.log("");
  });
}
