export interface BaseCommand<TContext = any, TResult = any> {
  readonly id: string;
  readonly name: string;
  readonly timestamp: number;
  
  execute(context: TContext): Promise<TResult>;
  undo?(context: TContext): Promise<void>;
  redo?(context: TContext): Promise<TResult>;
}

export interface CommandResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
}
