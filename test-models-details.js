import { GoogleGenAI } from "@google/genai";

async function main() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY);
    const data = await response.json();
    if (data.models) {
        const checkModels = [
            "models/gemini-3.6-flash", 
            "models/gemini-3.1-pro-preview", 
            "models/gemini-2.5-pro",
            "models/gemini-embedding-2-preview",
            "models/gemini-embedding-2"
        ];
        data.models.filter(m => checkModels.includes(m.name)).forEach(m => {
            console.log(`\nModel: ${m.name}`);
            console.log(`Display Name: ${m.displayName}`);
            console.log(`Version: ${m.version}`);
            console.log(`Description: ${m.description}`);
        });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
main();
