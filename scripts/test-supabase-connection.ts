import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const url = process.env.VITE_SUPABASE_URL!;
const key = process.env.VITE_SUPABASE_ANON_KEY!;
const bucket = process.env.VITE_SUPABASE_KNOWLEDGE_BUCKET || "knowledge-vault";

const supabase = createClient(url, key);

console.log("URL:", url);
console.log("Bucket:", bucket);

const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
if (listErr) {
  console.error("List buckets error:", listErr.message);
} else {
  console.log(
    "Buckets:",
    buckets?.map((b) => `${b.name} (public=${b.public})`).join(", ") || "(none)"
  );
}

const testPath = `knowledge-vault/TEST-CONNECT/${Date.now()}_ping.txt`;
const body = new TextEncoder().encode("URJAFLUX Supabase connectivity test");

const { error: upErr } = await supabase.storage.from(bucket).upload(testPath, body, {
  contentType: "text/plain",
  upsert: true,
});

if (upErr) {
  console.error("Upload test FAILED:", upErr.message);
  console.error("\nFix: Supabase → Storage → create bucket 'knowledge-vault' (public) + storage policies");
  process.exit(1);
}

const { data: pub } = supabase.storage.from(bucket).getPublicUrl(testPath);
console.log("Upload test OK:", pub.publicUrl);

if (fs.existsSync("C:\\Users\\DELL\\Downloads\\vastu-for-flats-pdf.pdf")) {
  const pdf = fs.readFileSync("C:\\Users\\DELL\\Downloads\\vastu-for-flats-pdf.pdf");
  const pdfPath = `knowledge-vault/TEST-CONNECT/vastu-for-flats-test.pdf`;
  const { error: pdfErr } = await supabase.storage.from(bucket).upload(pdfPath, pdf, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (pdfErr) console.error("PDF upload test FAILED:", pdfErr.message);
  else console.log("PDF upload test OK:", pdfPath, `(${pdf.length} bytes)`);
}
