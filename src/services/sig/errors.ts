/**
 * Base abstract exception class for all Spatial Intelligence Graph errors.
 */
export abstract class SIGError extends Error {
  public abstract readonly code: string;
  public readonly timestamp: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a queried node does not exist inside the specified tenant workspace.
 */
export class NodeNotFoundError extends SIGError {
  public readonly code = "NODE_NOT_FOUND";
  constructor(public readonly nodeId: string, public readonly tenantId: string) {
    super(`Node '${nodeId}' not found within tenant '${tenantId}' partitioning boundary.`);
  }
}

/**
 * Thrown when a semantic relationship fails graph schema specification checks.
 */
export class InvalidRelationshipError extends SIGError {
  public readonly code = "INVALID_RELATIONSHIP";
  constructor(public readonly messageDetails: string) {
    super(`Graph schema constraint violated: ${messageDetails}`);
  }
}

/**
 * Thrown when multi-tenant partitions, circular paths, or topological rules are breached.
 */
export class ConstraintViolationError extends SIGError {
  public readonly code = "CONSTRAINT_VIOLATION";
  constructor(public readonly messageDetails: string) {
    super(`Topological or multi-tenant constraint violated: ${messageDetails}`);
  }
}

/**
 * Thrown when transaction operations encounter failures or require a full rollback.
 */
export class TransactionRollbackError extends SIGError {
  public readonly code = "TRANSACTION_ROLLBACK";
  constructor(public readonly transactionId: string, public readonly reason: string) {
    super(`Transaction '${transactionId}' roll-back failed: ${reason}`);
  }
}
