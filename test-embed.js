import { GoogleGenAI } from "@google/genai";

async function main() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: "Test data for evidence"
    });
    console.log("Embed result:", response.embeddings[0].values.slice(0, 5));
  } catch (error) {
    console.error("SDK Error:", error.message);
  }
}
main();
