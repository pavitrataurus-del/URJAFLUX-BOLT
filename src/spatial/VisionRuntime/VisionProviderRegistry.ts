import { IVisionProvider } from "./IVisionProvider";
import { VisionProviderCapabilities } from "./types";

/**
 * ============================================================================
 * VISION PROVIDER REGISTRY
 * ============================================================================
 * Central registry managing dynamic provider registrations.
 *
 * ARCHITECTURAL RULE:
 * Explicit application bootstrap registration. No silent auto-registration.
 */
export class VisionProviderRegistry {
  private providers: Map<string, IVisionProvider> = new Map();
  private defaultProviderId: string | null = null;

  /**
   * Registers a vision provider instance.
   */
  public registerProvider(provider: IVisionProvider): void {
    const caps = provider.capabilities();
    if (!caps.providerId) {
      throw new Error("Cannot register provider with empty providerId.");
    }
    this.providers.set(caps.providerId, provider);

    // Set as default if first provider registered
    if (!this.defaultProviderId) {
      this.defaultProviderId = caps.providerId;
    }
  }

  /**
   * Unregisters a vision provider by ID.
   */
  public unregisterProvider(providerId: string): void {
    this.providers.delete(providerId);
    if (this.defaultProviderId === providerId) {
      const remainingKeys = Array.from(this.providers.keys());
      this.defaultProviderId = remainingKeys.length > 0 ? remainingKeys[0] : null;
    }
  }

  /**
   * Retrieves a registered provider by ID.
   */
  public getProvider(providerId: string): IVisionProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Lists capabilities of all registered providers.
   */
  public listProviders(): VisionProviderCapabilities[] {
    return Array.from(this.providers.values()).map((p) => p.capabilities());
  }

  /**
   * Explicitly sets the default provider ID.
   */
  public setDefaultProvider(providerId: string): void {
    if (!this.providers.has(providerId)) {
      throw new Error(`Provider '${providerId}' is not registered.`);
    }
    this.defaultProviderId = providerId;
  }

  /**
   * Gets the active default provider instance.
   */
  public getDefaultProvider(): IVisionProvider | undefined {
    if (!this.defaultProviderId) return undefined;
    return this.providers.get(this.defaultProviderId);
  }

  /**
   * Clears all registered providers.
   */
  public clear(): void {
    this.providers.clear();
    this.defaultProviderId = null;
  }
}

export const visionProviderRegistry = new VisionProviderRegistry();
