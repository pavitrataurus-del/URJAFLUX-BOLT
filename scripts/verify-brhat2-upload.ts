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

async function listRecursive(prefix: string, depth = 0): Promise<{ path: string; size?: number }[]> {
  const found: { path: string; size?: number }[] = [];
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 200 });
  if (error || !data) return found;
  for (const item of data) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) {
      found.push({ path, size: item.metadata?.size as number | undefined });
    } else if (depth < 5) {
      found.push(...(await listRecursive(path, depth + 1)));
    }
  }
  return found;
}

console.log("=== Supabase Storage — all files ===\n");
const all = await listRecursive("");
console.log(`Total objects: ${all.length}\n`);

const brhatFiles = all.filter((f) => f.path.toLowerCase().includes("brhat"));
if (brhatFiles.length === 0) {
  console.log("No Brhatsamhita file in Supabase.");
  all.forEach((f) => console.log(`  ${f.path} (${f.size ?? "?"} bytes)`));
} else {
  for (const f of brhatFiles) {
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(f.path);
    console.log(`✅ SUPABASE FILE: ${f.path}`);
    console.log(`   Size: ${f.size ?? "?"} bytes (${((f.size ?? 0) / (1024 * 1024)).toFixed(2)} MB)`);
    console.log(`   URL:  ${pub.publicUrl}`);
    console.log("");
  }
}

console.log("=== Firestore — Brhatsamhita docs ===\n");
const snap = await getDocs(collection(db, "knowledge_documents"));
const docs = snap.docs
  .filter((d) => {
    const s = JSON.stringify(d.data()).toLowerCase();
    return s.includes("brhat") || s.includes("samhita");
  })
  .sort((a, b) => {
    const ta = String(a.data().uploadedAt || "");
    const tb = String(b.data().uploadedAt || "");
    return tb.localeCompare(ta);
  });

docs.forEach((d) => {
  const x = d.data() as Record<string, unknown>;
  const cloudOk =
    x.isCloudSsot === true &&
    x.storageDriver === "SUPABASE_STORAGE" &&
    x.downloadURL &&
    !String(x.downloadURL).startsWith("local-cache");
  console.log(`${cloudOk ? "✅" : "⚠️"} ${d.id}`);
  console.log(`   title:         ${x.title}`);
  console.log(`   originalName:  ${x.originalName}`);
  console.log(`   uploadedAt:    ${x.uploadedAt}`);
  console.log(`   sizeBytes:     ${x.sizeBytes} (${((Number(x.sizeBytes) || 0) / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`   storageDriver: ${x.storageDriver ?? "—"}`);
  console.log(`   cloudProvider: ${x.cloudProvider ?? "—"}`);
  console.log(`   isCloudSsot:   ${x.isCloudSsot ?? "—"}`);
  console.log(`   storagePath:   ${x.storagePath ?? "—"}`);
  console.log(`   sha256Hash:    ${x.sha256Hash ? String(x.sha256Hash).slice(0, 24) + "..." : "—"}`);
  console.log(`   downloadURL:   ${x.downloadURL ? String(x.downloadURL).slice(0, 100) : "—"}`);
  console.log("");
});

const latest = docs[0];
if (latest) {
  const x = latest.data() as Record<string, unknown>;
  const success =
    x.isCloudSsot === true &&
    String(x.storageDriver) === "SUPABASE_STORAGE" &&
    brhatFiles.some((f) => f.path.toLowerCase().includes("brhat"));
  console.log("=== VERDICT (latest Brhatsamhita doc) ===");
  console.log(success ? "SUCCESS — PDF in Supabase + Firestore metadata OK" : "PARTIAL/FAILED — check fields above");
}
