import { IOcrProvider } from "./IOcrProvider";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class OcrProviderFactory {
  private static instance: OcrProviderFactory;
  private providers: Map<string, IOcrProvider> = new Map();
  private defaultProviderId: string | null = null;

  private constructor() {}

  public static getInstance(): OcrProviderFactory {
    if (!OcrProviderFactory.instance) {
      OcrProviderFactory.instance = new OcrProviderFactory();
    }
    return OcrProviderFactory.instance;
  }

  public registerProvider(provider: IOcrProvider, isDefault = false): void {
    const id = provider.getProviderId();
    this.providers.set(id, provider);
    if (isDefault || !this.defaultProviderId) {
      this.defaultProviderId = id;
    }
  }

  public getProvider(providerId?: string): IOcrProvider {
    const id = providerId || this.defaultProviderId;
    if (!id) {
      throw new EnterpriseError("No OCR provider configured", { category: ErrorCategory.VALIDATION });
    }
    const provider = this.providers.get(id);
    if (!provider) {
      throw new EnterpriseError(`OCR provider ${id} not found`, { category: ErrorCategory.NOT_FOUND });
    }
    return provider;
  }

  public clear(): void {
    this.providers.clear();
    this.defaultProviderId = null;
  }
}
