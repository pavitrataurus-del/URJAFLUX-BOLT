import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const client = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
const bucket = process.env.VITE_SUPABASE_KNOWLEDGE_BUCKET || "knowledge-vault";

async function tryUpload(label: string, objectPath: string, body: Buffer | Uint8Array, contentType: string) {
  const { error } = await client.storage.from(bucket).upload(objectPath, body, {
    contentType,
    upsert: true,
  });
  console.log(`${label}: ${error ? `FAIL — ${error.message}` : `OK (${body.byteLength} bytes)`}`);
}

const tinyPdf = Buffer.from("%PDF-1.4 tiny test");
await tryUpload("Tiny PDF", "knowledge-vault/TEST/tiny.pdf", tinyPdf, "application/pdf");

const oneMb = Buffer.alloc(1024 * 1024, 120);
await tryUpload("1 MB blob", "knowledge-vault/TEST/1mb.bin", oneMb, "application/octet-stream");

const candidates = [
  path.join(process.cwd(), "Brhatsamhita_compressed2.pdf"),
  "C:/Users/DELL/Downloads/Brhatsamhita_compressed2.pdf",
];
for (const p of candidates) {
  if (fs.existsSync(p)) {
    const buf = fs.readFileSync(p);
    await tryUpload(
      `Large PDF (${(buf.length / 1024 / 1024).toFixed(1)} MB)`,
      "knowledge-vault/DOC-TEST/740e6897_Brhatsamhita_compressed2.pdf",
      buf,
      "application/pdf"
    );
    break;
  }
}

console.log("\n--- MIME type probe (3 MB) ---");
const buf3 = Buffer.alloc(3 * 1024 * 1024, 37);
for (const ct of ["application/pdf", "application/octet-stream", "text/plain"]) {
  const p = `knowledge-vault/TEST/mime-${ct.replace(/\//g, "-")}.bin`;
  await tryUpload(`MIME ${ct}`, p, buf3, ct);
}

for (const mb of [2, 5, 10, 20]) {
  const buf = Buffer.alloc(mb * 1024 * 1024, 120);
  await tryUpload(`${mb} MB synthetic`, `knowledge-vault/TEST/${mb}mb.bin`, buf, "application/octet-stream");
}
