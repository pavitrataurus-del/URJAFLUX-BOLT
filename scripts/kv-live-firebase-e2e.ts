/**
 * Live E2E: Browser PDF upload → Firebase Storage + Firestore verification
 * Run: npx tsx scripts/kv-live-firebase-e2e.ts
 */
import puppeteer from "puppeteer";
import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getMetadata } from "firebase/storage";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";
import fs from "fs";
import path from "path";

const PDF_PATH =
  process.env.KV_TEST_PDF ||
  "C:\\Users\\DELL\\Downloads\\vastu-for-flats-pdf.pdf";
const APP_URL = process.env.KV_APP_URL || "http://localhost:3000";
const PIPELINE_TIMEOUT_MS = 180000;

const firebaseConfig = {
  apiKey: appletConfig.apiKey,
  authDomain: appletConfig.authDomain,
  projectId: appletConfig.projectId,
  storageBucket: appletConfig.storageBucket,
  appId: appletConfig.appId,
};

function log(section: string, msg: string) {
  console.log(`[KV-E2E] ${section}: ${msg}`);
}

async function verifyFirebaseCloud(docIdHint?: string) {
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  const db = getFirestore(app);

  log("VERIFY", "Listing Firebase Storage prefix knowledge-vault/ ...");
  const rootRef = ref(storage, "knowledge-vault");
  const listResult = await listAll(rootRef);
  const allItems: { path: string; size?: number }[] = [];

  for (const folder of listResult.prefixes) {
    const sub = await listAll(folder);
    for (const item of sub.items) {
      try {
        const meta = await getMetadata(item);
        allItems.push({ path: item.fullPath, size: meta.size });
      } catch {
        allItems.push({ path: item.fullPath });
      }
    }
  }

  log("VERIFY", `Storage objects under knowledge-vault/: ${allItems.length}`);
  allItems.slice(-5).forEach((o) => log("STORAGE", `${o.path} (${o.size ?? "?"} bytes)`));

  log("VERIFY", "Reading Firestore knowledge_documents (latest 5) ...");
  const docsSnap = await getDocs(
    query(collection(db, "knowledge_documents"), orderBy("uploadedAt", "desc"), limit(5))
  );

  const docs = docsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  docs.forEach((d: Record<string, unknown>) => {
    log(
      "FIRESTORE",
      `id=${d.id} storagePath=${d.storagePath ?? "MISSING"} isCloudSsot=${d.isCloudSsot} sha256=${(d.sha256Hash as string)?.slice(0, 16) ?? "MISSING"}`
    );
  });

  const match =
    docIdHint
      ? docs.find((d) => d.id === docIdHint)
      : docs.find((d) => d.storagePath && d.downloadURL && d.sha256Hash);

  return {
    storageCount: allItems.length,
    storagePaths: allItems.map((o) => o.path),
    firestoreDocs: docs,
    verifiedDoc: match,
    success:
      allItems.length > 0 &&
      match &&
      Boolean(match.storagePath) &&
      Boolean(match.downloadURL) &&
      Boolean(match.sha256Hash) &&
      match.isCloudSsot === true,
  };
}

async function runBrowserUpload(): Promise<{ consoleLogs: string[]; docId?: string }> {
  if (!fs.existsSync(PDF_PATH)) {
    throw new Error(`PDF not found: ${PDF_PATH}`);
  }

  const consoleLogs: string[] = [];
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    page.on("console", (msg) => {
      const text = msg.text();
      if (
        text.includes("KnowledgeVaultStorage") ||
        text.includes("KnowledgeVault") ||
        text.includes("Pipeline") ||
        text.includes("Firebase")
      ) {
        consoleLogs.push(text);
      }
    });

    await page.goto(APP_URL, { waitUntil: "networkidle2", timeout: 60000 });

    await page.evaluate(() => {
      localStorage.setItem("urjaflux_sidebar_expanded", "true");
      localStorage.setItem("urjaflux_user_role", "SUPER_ADMIN");
      const dash = document.querySelector("button[title='Dashboard']");
      if (dash) (dash as HTMLButtonElement).click();
    });
    await new Promise((r) => setTimeout(r, 3000));

    const knowledgeBtn = await page.waitForSelector("button[title='Knowledge & Book Upload']", {
      timeout: 30000,
    });
    await knowledgeBtn!.click();
    await page.waitForFunction(
      () => document.body.innerText.includes("UPLOAD BOOKS") || document.body.innerText.includes("Upload"),
      { timeout: 30000 }
    );

    // File input (accept pdf)
    const fileInput = await page.$("input[type='file']");
    if (!fileInput) throw new Error("File input not found on Upload Center");
    await fileInput.uploadFile(PDF_PATH);

    log("BROWSER", `Uploaded file via UI: ${path.basename(PDF_PATH)}`);

    // Wait for pipeline completion in UI
    await page.waitForFunction(
      () => {
        const text = document.body.innerText;
        return (
          text.includes("Knowledge successfully added") ||
          text.includes("COMPLETED") ||
          text.includes("INGESTED") ||
          text.includes("Existing document detected")
        );
      },
      { timeout: PIPELINE_TIMEOUT_MS }
    );

    // Try to read doc id from recent uploads section or console
    const bodyText = await page.evaluate(() => document.body.innerText);
    const docIdMatch = bodyText.match(/DOC-[A-F0-9]{16,32}/);
    return { consoleLogs, docId: docIdMatch?.[0] };
  } finally {
    await browser.close();
  }
}

async function main() {
  log("START", `PDF=${PDF_PATH} APP=${APP_URL}`);

  const uploadResult = await runBrowserUpload();
  log("BROWSER", `Console logs captured: ${uploadResult.consoleLogs.length}`);
  uploadResult.consoleLogs.slice(-15).forEach((l) => log("CONSOLE", l));

  const cloud = await verifyFirebaseCloud(uploadResult.docId);

  log("RESULT", JSON.stringify({
    browserDocIdHint: uploadResult.docId,
    storageObjectCount: cloud.storageCount,
    firestoreVerified: cloud.success,
    verifiedDocId: cloud.verifiedDoc?.id,
    storagePath: cloud.verifiedDoc?.storagePath,
    downloadURL: (cloud.verifiedDoc?.downloadURL as string)?.slice(0, 80),
    sha256Prefix: (cloud.verifiedDoc?.sha256Hash as string)?.slice(0, 16),
    isCloudSsot: cloud.verifiedDoc?.isCloudSsot,
  }, null, 2));

  if (!cloud.success) {
    console.error("[KV-E2E] FAILED — live Firebase verification incomplete");
    process.exit(1);
  }
  console.log("[KV-E2E] SUCCESS — Phase 1 live upload verified");
}

main().catch((err) => {
  console.error("[KV-E2E] ERROR", err);
  process.exit(1);
});
