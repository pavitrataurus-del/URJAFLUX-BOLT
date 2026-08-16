export class EmbeddingClient {
  public static async getEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await fetch("/api/gemini/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: texts, model: "gemini-embedding-2" }),
    });
    if (!response.ok) {
      throw new Error("Failed to get embeddings");
    }
    const data = await response.json();
    return data.embeddings;
  }
}
