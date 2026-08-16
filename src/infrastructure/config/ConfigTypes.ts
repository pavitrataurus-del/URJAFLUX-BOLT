export type ConfigValue = string | number | boolean | null | undefined | ConfigObject | ConfigArray;
export interface ConfigObject {
  [key: string]: ConfigValue;
}
export interface ConfigArray extends Array<ConfigValue> {}

export enum Environment {
  DEVELOPMENT = "DEVELOPMENT",
  STAGING = "STAGING",
  PRODUCTION = "PRODUCTION",
  TEST = "TEST",
}

export interface IConfigProvider {
  get(key: string): ConfigValue;
  has(key: string): boolean;
}
