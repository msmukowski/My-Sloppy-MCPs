/**
 * Custom error classes for the MCP server
 */

/**
 * Base error class for all application errors
 */
export class MCPError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * Configuration-related errors
 */
export class ConfigurationError extends MCPError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', details);
  }
}

/**
 * Connection-related errors (database, API, etc.)
 */
export class ConnectionError extends MCPError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONNECTION_ERROR', details);
  }
}

/**
 * Tool execution errors
 */
export class ToolExecutionError extends MCPError {
  constructor(
    message: string,
    public readonly toolName: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'TOOL_EXECUTION_ERROR', { ...details, toolName });
  }
}

/**
 * Validation errors (input validation, SQL validation, etc.)
 */
export class ValidationError extends MCPError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

/**
 * Security-related errors (SQL injection attempts, etc.)
 */
export class SecurityError extends MCPError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'SECURITY_ERROR', details);
  }
}

/**
 * Type guard to check if an error is an MCPError
 */
export function isMCPError(error: unknown): error is MCPError {
  return error instanceof MCPError;
}

/**
 * Format any error for logging or display
 */
export function formatError(error: unknown): string {
  if (isMCPError(error)) {
    return JSON.stringify(error.toJSON());
  }
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}
