/**
 * Multi-provider Vision OCR for Knowledge Vault page extraction.
 * Order: OpenRouter (Gemini free) → Groq (Qwen vision) → direct Gemini API.
 */

export type VisionOcrProviderResult = {
  text: string;
  provider: "openrouter" | "groq" | "gemini" | "none";
  modelName: string;
  quotaExceeded: boolean;
  errors: string[];
};

function sanitizeEnvKey(raw?: string): string {
  if (!raw) return "";
  return raw.trim().replace(/^["']+|["',\s]+$/g, "").trim();
}

function isRateLimitError(status: number, message: string): boolean {
  return (
    status === 429 ||
    /429|quota|rate limit|RESOURCE_EXHAUSTED|too many requests/i.test(message)
  );
}

async function callOpenRouterVision(
  mimeType: string,
  base64Data: string,
  promptText: string
): Promise<{ text: string; model: string; quotaExceeded: boolean; error?: string }> {
  const apiKey = sanitizeEnvKey(process.env.OPENROUTER_API_KEY);
  if (!apiKey) return { text: "", model: "", quotaExceeded: false, error: "OPENROUTER_API_KEY not set" };

  const model =
    sanitizeEnvKey(process.env.OPENROUTER_VISION_MODEL) || "google/gemini-2.0-flash-exp:free";

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "URJAFLUX Knowledge Vault",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } },
          ],
        },
      ],
    }),
  });

  const bodyText = await resp.text();
  if (!resp.ok) {
    return {
      text: "",
      model,
      quotaExceeded: isRateLimitError(resp.status, bodyText),
      error: `OpenRouter ${resp.status}: ${bodyText.slice(0, 200)}`,
    };
  }

  try {
    const json = JSON.parse(bodyText) as {
      choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
      error?: { message?: string };
    };
    if (json.error?.message) {
      return {
        text: "",
        model,
        quotaExceeded: isRateLimitError(0, json.error.message),
        error: json.error.message,
      };
    }
    const content = json.choices?.[0]?.message?.content;
    const text =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content.map((p) => p.text || "").join("\n")
          : "";
    return { text: text.trim(), model, quotaExceeded: false };
  } catch {
    return { text: "", model, quotaExceeded: false, error: "OpenRouter invalid JSON response" };
  }
}

async function callGroqVision(
  mimeType: string,
  base64Data: string,
  promptText: string
): Promise<{ text: string; model: string; quotaExceeded: boolean; error?: string }> {
  const apiKey = sanitizeEnvKey(process.env.GROQ_API_KEY);
  if (!apiKey) return { text: "", model: "", quotaExceeded: false, error: "GROQ_API_KEY not set" };

  const model = sanitizeEnvKey(process.env.GROQ_VISION_MODEL) || "qwen/qwen3.6-27b";

  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } },
          ],
        },
      ],
    }),
  });

  const bodyText = await resp.text();
  if (!resp.ok) {
    return {
      text: "",
      model,
      quotaExceeded: isRateLimitError(resp.status, bodyText),
      error: `Groq ${resp.status}: ${bodyText.slice(0, 200)}`,
    };
  }

  try {
    const json = JSON.parse(bodyText) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };
    if (json.error?.message) {
      return {
        text: "",
        model,
        quotaExceeded: isRateLimitError(0, json.error.message),
        error: json.error.message,
      };
    }
    const text = json.choices?.[0]?.message?.content?.trim() || "";
    return { text, model, quotaExceeded: false };
  } catch {
    return { text: "", model, quotaExceeded: false, error: "Groq invalid JSON response" };
  }
}

async function callGeminiVision(
  mimeType: string,
  base64Data: string,
  promptText: string,
  generateFn: (prompt: string, mime: string, b64: string, jsonMode: boolean) => Promise<string>
): Promise<{ text: string; model: string; quotaExceeded: boolean; error?: string }> {
  try {
    const text = await generateFn(promptText, mimeType, base64Data, false);
    return { text: text.trim(), model: "gemini-direct", quotaExceeded: false };
  } catch (err: any) {
    const msg = String(err?.message || err);
    return {
      text: "",
      model: "gemini-direct",
      quotaExceeded: isRateLimitError(Number(err?.status) || 0, msg),
      error: msg,
    };
  }
}

export function getVisionOcrProviderStatus() {
  return {
    openrouter: Boolean(sanitizeEnvKey(process.env.OPENROUTER_API_KEY)),
    groq: Boolean(sanitizeEnvKey(process.env.GROQ_API_KEY)),
    gemini: Boolean(sanitizeEnvKey(process.env.GEMINI_API_KEY || process.env.USER_GEMINI_API_KEY)),
    openrouterModel: sanitizeEnvKey(process.env.OPENROUTER_VISION_MODEL) || "google/gemini-2.0-flash-exp:free",
    groqModel: sanitizeEnvKey(process.env.GROQ_VISION_MODEL) || "qwen/qwen3.6-27b",
  };
}

/** Knowledge Vault page OCR with provider fallback. */
export async function runKnowledgeVaultVisionOcr(
  mimeType: string,
  base64Data: string,
  promptText: string,
  geminiGenerate: (prompt: string, mime: string, b64: string, jsonMode: boolean) => Promise<string>
): Promise<VisionOcrProviderResult> {
  const errors: string[] = [];
  let anyQuota = false;

  const openRouter = await callOpenRouterVision(mimeType, base64Data, promptText);
  if (openRouter.error) errors.push(openRouter.error);
  if (openRouter.quotaExceeded) anyQuota = true;
  if (openRouter.text.length >= 8) {
    return {
      text: openRouter.text,
      provider: "openrouter",
      modelName: openRouter.model,
      quotaExceeded: false,
      errors,
    };
  }

  const groq = await callGroqVision(mimeType, base64Data, promptText);
  if (groq.error) errors.push(groq.error);
  if (groq.quotaExceeded) anyQuota = true;
  if (groq.text.length >= 8) {
    return {
      text: groq.text,
      provider: "groq",
      modelName: groq.model,
      quotaExceeded: false,
      errors,
    };
  }

  const gemini = await callGeminiVision(mimeType, base64Data, promptText, geminiGenerate);
  if (gemini.error) errors.push(gemini.error);
  if (gemini.quotaExceeded) anyQuota = true;
  if (gemini.text.length >= 8) {
    return {
      text: gemini.text,
      provider: "gemini",
      modelName: gemini.model,
      quotaExceeded: false,
      errors,
    };
  }

  return {
    text: "",
    provider: "none",
    modelName: "",
    quotaExceeded: anyQuota,
    errors,
  };
}
