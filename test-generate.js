import { GoogleGenAI } from "@google/genai";

async function main() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: "Test data for evidence"
    });
    console.log("Generate result:", response.text);
  } catch (error) {
    console.error("SDK Error:", error);
  }
}
main();
