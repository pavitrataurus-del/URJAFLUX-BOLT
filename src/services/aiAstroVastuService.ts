import { ASTRO_VASTU_ANALYSIS_PROMPT, ASTRO_VASTU_ANALYSIS_SCHEMA } from "./geminiPrompts";

export interface AstroVastuRequest {
  clientProfile: {
    mulank: number;
    bhagyank: number;
    loshuGridMissingNumbers: number[];
  };
  astroData: {
    lalKitabKundliPlacements: any;
    activeDasha: string;
  };
  spatialBlueprint: {
    degreesOffset: number;
    roomLayoutPerZone: any;
    detectedGeopathicStressPoints: any[];
  };
}

export async function generateAstroVastuReport(request: AstroVastuRequest) {
  const contents = [
    {
      role: "user",
      parts: [
        { text: ASTRO_VASTU_ANALYSIS_PROMPT },
        { text: "Here is the input data:\n" + JSON.stringify(request, null, 2) }
      ]
    }
  ];

  const config = {
    responseMimeType: "application/json",
    responseSchema: ASTRO_VASTU_ANALYSIS_SCHEMA,
  };

  const response = await fetch("/api/gemini/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemini-3.6-flash",
      contents,
      config
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate report");
  }

  const data = await response.json();
  return JSON.parse(data.text || "{}");
}
