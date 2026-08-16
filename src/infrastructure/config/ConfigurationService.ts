import { ConfigValue, Environment, IConfigProvider } from "./ConfigTypes";

export class ConfigurationService {
  private static instance: ConfigurationService;
  private providers: IConfigProvider[] = [];
  private overrides: Map<string, ConfigValue> = new Map();

  private constructor() {}

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  public addProvider(provider: IConfigProvider): void {
    this.providers.push(provider);
  }

  public setOverride(key: string, value: ConfigValue): void {
    this.overrides.set(key, value);
  }

  public clearOverride(key: string): void {
    this.overrides.delete(key);
  }

  public get<T = string>(key: string, defaultValue?: T): T {
    if (this.overrides.has(key)) {
      return this.overrides.get(key) as unknown as T;
    }

    for (const provider of this.providers) {
      if (provider.has(key)) {
        return provider.get(key) as unknown as T;
      }
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`Configuration key '${key}' not found.`);
  }

  public has(key: string): boolean {
    if (this.overrides.has(key)) return true;
    return this.providers.some(provider => provider.has(key));
  }
  
  public getEnvironment(): Environment {
    const envString = this.get<string>("NODE_ENV", "DEVELOPMENT").toUpperCase();
    if (Object.values(Environment).includes(envString as Environment)) {
      return envString as Environment;
    }
    return Environment.DEVELOPMENT;
  }

  public isFeatureEnabled(flag: string, defaultVal = false): boolean {
    const key = `FEATURE_${flag.toUpperCase()}`;
    if (this.has(key)) {
      const val = this.get<ConfigValue>(key);
      return val === true || val === "true" || val === "1";
    }
    return defaultVal;
  }
}
