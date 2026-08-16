import { IOcrPoint, IOcrBoundingBox, IOcrWord, IOcrLine, IOcrParagraph, IOcrBlock, IOcrPage, IOcrResult } from "./OcrModels";

export class OcrBuilder {
  public static createPoint(x: number, y: number): IOcrPoint {
    return { x, y };
  }

  public static createBoundingBox(x: number, y: number, width: number, height: number): IOcrBoundingBox {
    return {
      vertices: [
        this.createPoint(x, y),
        this.createPoint(x + width, y),
        this.createPoint(x + width, y + height),
        this.createPoint(x, y + height)
      ]
    };
  }
}
