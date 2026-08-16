export interface BaseEngine {
  readonly name: string;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}
