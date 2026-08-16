import { describe, it, expect, beforeEach } from "vitest";
import { ImagePreprocessor, IPreprocessingConfig } from "../index";

describe("Image Preprocessing Pipeline", () => {
  beforeEach(() => {
    ImagePreprocessor.getInstance().clearPlugins();
  });

  it("should apply plugins in order", async () => {
    const preprocessor = ImagePreprocessor.getInstance();
    
    preprocessor.registerPlugin(async (buf, config) => {
      return Buffer.concat([buf, Buffer.from("A")]);
    });
    
    preprocessor.registerPlugin(async (buf, config) => {
      if (config.grayscale) {
        return Buffer.concat([buf, Buffer.from("B")]);
      }
      return buf;
    });

    const result = await preprocessor.preprocess(Buffer.from("0"), { grayscale: true });
    expect(result.toString()).toBe("0AB");
  });
});
