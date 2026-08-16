import { EnterpriseError } from "./EnterpriseError";
import { ErrorSeverity } from "./ErrorTypes";
import { Logger } from "../logging/Logger";

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(error: Error | EnterpriseError): void {
    const logger = Logger.getInstance();
    if (error instanceof EnterpriseError) {
      if (error.severity === ErrorSeverity.FATAL || error.severity === ErrorSeverity.CRITICAL) {
        logger.fatal(error.message, error.context, error);
      } else if (error.severity === ErrorSeverity.HIGH) {
        logger.error(error.message, error.context, error);
      } else {
        logger.warn(error.message, error.context, error);
      }
    } else {
      logger.error(error.message, {}, error);
    }
  }
}
