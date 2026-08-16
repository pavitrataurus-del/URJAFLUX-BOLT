export interface IPreprocessingConfig {
  normalize?: boolean;
  autoRotate?: boolean;
  deskew?: boolean;
  noiseReduction?: boolean;
  contrastEnhancement?: boolean;
  brightnessNormalization?: boolean;
  resolutionNormalization?: boolean;
  grayscale?: boolean;
  binaryConversion?: boolean;
}

export type PreprocessingPlugin = (image: Buffer, config: IPreprocessingConfig) => Promise<Buffer>;

export class ImagePreprocessor {
  private static instance: ImagePreprocessor;
  private plugins: PreprocessingPlugin[] = [];

  private constructor() {
    // Register default dummy plugins that just pass through the buffer
    this.registerPlugin(async (img) => img);
  }

  public static getInstance(): ImagePreprocessor {
    if (!ImagePreprocessor.instance) {
      ImagePreprocessor.instance = new ImagePreprocessor();
    }
    return ImagePreprocessor.instance;
  }

  public registerPlugin(plugin: PreprocessingPlugin): void {
    this.plugins.push(plugin);
  }

  public async preprocess(imageBuffer: Buffer, config: IPreprocessingConfig): Promise<Buffer> {
    let currentBuffer = imageBuffer;
    for (const plugin of this.plugins) {
      currentBuffer = await plugin(currentBuffer, config);
    }
    return currentBuffer;
  }

  public clearPlugins(): void {
    this.plugins = [];
  }
}
