import { BlueprintData } from "../../../../components/CadBlueprintWorkspace";
import { GEMINI_PROMPT_TEMPLATES } from "./templates/GeminiPromptTemplates";
import { GeminiPromptTemplateKey, GeminiRecognitionRequest } from "./types";

/**
 * ============================================================================
 * GEMINI PROMPT BUILDER
 * ============================================================================
 * Responsible ONLY for assembling prompt text from external templates and injecting
 * runtime parameter variables.
 *
 * ARCHITECTURAL RULE:
 * PromptBuilder contains ZERO hardcoded prompt text. All templates reside
 * exclusively inside GeminiPromptTemplates.
 */
export class GeminiPromptBuilder {
  /**
   * Assembles a structured recognition request using a specified prompt template key.
   */
  public buildRequest(
    blueprint: BlueprintData,
    templateKey: GeminiPromptTemplateKey = "BLUEPRINT_FULL",
    timeoutMs = 30000,
    customSettings?: Record<string, unknown>
  ): GeminiRecognitionRequest {
    const templateText = GEMINI_PROMPT_TEMPLATES[templateKey];
    if (!templateText) {
      throw new Error(`Prompt template '${templateKey}' not found in GEMINI_PROMPT_TEMPLATES.`);
    }

    const naturalWidth = blueprint.naturalWidth || 1000;
    const naturalHeight = blueprint.naturalHeight || 1000;
    const rotation = blueprint.rotation || 0;

    const populatedPrompt = templateText
      .replace(/{{IMAGE_WIDTH}}/g, String(naturalWidth))
      .replace(/{{IMAGE_HEIGHT}}/g, String(naturalHeight))
      .replace(/{{ROTATION}}/g, String(rotation));

    return {
      blueprintId: blueprint.id,
      imageDataUrl: blueprint.url,
      promptText: populatedPrompt,
      naturalWidth,
      naturalHeight,
      timeoutMs,
      options: customSettings
    };
  }
}
