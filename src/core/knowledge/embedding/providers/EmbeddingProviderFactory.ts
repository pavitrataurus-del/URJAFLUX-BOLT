import { IEmbeddingProvider } from "./IEmbeddingProvider";
import { EnterpriseError } from "../../../../infrastructure/error/EnterpriseError";
import { ErrorCategory } from "../../../../infrastructure/error/ErrorTypes";

export class EmbeddingProviderFactory {
  private static instance: EmbeddingProviderFactory;
  private providers: Map<string, IEmbeddingProvider> = new Map();
  private defaultProviderId: string | null = null;

  private constructor() {}

  public static getInstance(): EmbeddingProviderFactory {
    if (!EmbeddingProviderFactory.instance) {
      EmbeddingProviderFactory.instance = new EmbeddingProviderFactory();
    }
    return EmbeddingProviderFactory.instance;
  }

  public registerProvider(provider: IEmbeddingProvider, isDefault = false): void {
    const id = provider.getProviderId();
    this.providers.set(id, provider);
    if (isDefault || !this.defaultProviderId) {
      this.defaultProviderId = id;
    }
  }

  public getProvider(providerId?: string): IEmbeddingProvider {
    const id = providerId || this.defaultProviderId;
    if (!id) {
      throw new EnterpriseError("No embedding provider configured", { category: ErrorCategory.VALIDATION });
    }
    const provider = this.providers.get(id);
    if (!provider) {
      throw new EnterpriseError(`Embedding provider ${id} not found`, { category: ErrorCategory.NOT_FOUND });
    }
    return provider;
  }

  public clear(): void {
    this.providers.clear();
    this.defaultProviderId = null;
  }
}
