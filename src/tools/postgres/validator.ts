/**
 * SQL query validator to ensure read-only operations
 */

import { SecurityError, ValidationError } from '../../utils/index.js';

/**
 * Validate that a SQL query is a SELECT statement only
 * @throws SecurityError if query contains DML/DDL statements
 */
export function validateReadOnlyQuery(sql: string): void {
  if (!sql || typeof sql !== 'string') {
    throw new ValidationError('SQL query must be a non-empty string');
  }

  const trimmed = sql.trim().toLowerCase();

  if (!trimmed) {
    throw new ValidationError('SQL query cannot be empty');
  }

  if (!trimmed.startsWith('select')) {
    throw new SecurityError('Only SELECT queries are allowed', {
      query: sql.substring(0, 100),
    });
  }

  const dangerousKeywords = [
    'insert',
    'update',
    'delete',
    'drop',
    'create',
    'alter',
    'truncate',
    'grant',
    'revoke',
    'execute',
    'exec',
    'call',
    'set',
    'declare',
    'begin',
    'commit',
    'rollback',
    'savepoint',
  ];

  const sqlLower = ` ${trimmed} `;
  for (const keyword of dangerousKeywords) {
    const pattern = new RegExp(`[\\s;(]${keyword}[\\s;(]`, 'i');
    if (pattern.test(sqlLower)) {
      throw new SecurityError(`Dangerous SQL keyword detected: ${keyword.toUpperCase()}`, {
        keyword,
        query: sql.substring(0, 100),
      });
    }
  }
}

/**
 * Add LIMIT clause to query if not already present
 */
export function ensureLimit(sql: string, maxRows: number): string {
  const trimmed = sql.trim();
  const lowerCase = trimmed.toLowerCase();

  if (lowerCase.includes('limit ')) {
    return trimmed;
  }

  return `${trimmed} LIMIT ${Math.max(1, Math.floor(maxRows))}`;
}
