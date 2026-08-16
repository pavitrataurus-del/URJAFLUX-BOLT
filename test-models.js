import dotenv from "dotenv";

dotenv.config();

function sanitizeGeminiApiKey(raw) {
  if (!raw) return "";
  return raw.trim().replace(/^["']+|["',\s]+$/g, "").trim();
}

const apiKey = sanitizeGeminiApiKey(process.env.GEMINI_API_KEY || process.env.USER_GEMINI_API_KEY);
if (!apiKey) {
  console.error("GEMINI_API_KEY is empty in .env");
  process.exit(1);
}

console.log("Key prefix:", apiKey.slice(0, 6));
console.log("Key type:", apiKey.startsWith("AQ.") ? "auth (AQ.)" : apiKey.startsWith("AIza") ? "standard (AIza)" : "unknown");

async function main() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
      headers: { "x-goog-api-key": apiKey },
    });
    const data = await response.json();
    if (data.error) {
      console.error("FAILED:", data.error.message);
      process.exit(1);
    }
    const names = (data.models || []).slice(0, 5).map((m) => m.name);
    console.log("OK — models sample:", names.join(", "));
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
