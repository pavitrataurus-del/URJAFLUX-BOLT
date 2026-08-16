import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const client = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
const bucket = process.env.VITE_SUPABASE_KNOWLEDGE_BUCKET || "knowledge-vault";

const path =
  "knowledge-vault/DOC-A2EC46EEFD520CA8721F4994DAF1F620/740e6897bea461ec_Brhatsamhita_compressed2.pdf";
const buf = Buffer.alloc(20 * 1024 * 1024, 120);

console.log("Testing app-identical upload path + metadata + upsert...");

const { error: up1 } = await client.storage.from(bucket).upload(path, buf, {
  contentType: "application/pdf",
  upsert: true,
  metadata: {
    vaultDocumentId: "DOC-A2EC46EEFD520CA8721F4994DAF1F620",
    sha256Hash: "740e6897bea461ec721dfa8f7c3722f3b734a4f6a77f67d7e680e922eb5debce",
    originalFileName: "Brhatsamhita_compressed2.pdf",
  },
});
console.log("upsert:true =>", up1 ? up1.message : "OK");

const { error: up2 } = await client.storage.from(bucket).upload(path + ".v2", buf, {
  contentType: "application/pdf",
  upsert: false,
});
console.log("upsert:false (new path) =>", up2 ? up2.message : "OK");

const { error: rmErr } = await client.storage.from(bucket).remove([path]);
console.log("remove existing =>", rmErr ? rmErr.message : "OK");

const { error: up3 } = await client.storage.from(bucket).upload(path, buf, {
  contentType: "application/pdf",
  upsert: false,
});
console.log("after remove, insert same path =>", up3 ? up3.message : "OK");

const { data: signed, error: signErr } = await client.storage.from(bucket).createSignedUrl(path, 3600);
console.log("signed URL =>", signErr ? signErr.message : signed?.signedUrl?.slice(0, 80) + "...");
