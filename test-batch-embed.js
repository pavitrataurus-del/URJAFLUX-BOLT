import { GoogleGenAI } from "@google/genai";
async function main() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.batchEmbedContents({
        model: "gemini-embedding-001",
        contents: ["Test", "data"]
    });
    console.log("Batch embed result:", response.embeddings.length);
  } catch (error) {
    console.error("SDK Error:", error.message);
  }
}
main();
