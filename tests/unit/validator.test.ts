/**
 * Unit tests for SQL validator
 */

import { validateReadOnlyQuery, ensureLimit } from '../../src/tools/postgres/validator.js';
import { SecurityError, ValidationError } from '../../src/utils/errors.js';

describe('validateReadOnlyQuery', () => {
  describe('valid SELECT queries', () => {
    it('should accept simple SELECT query', () => {
      expect(() => validateReadOnlyQuery('SELECT * FROM users')).not.toThrow();
    });

    it('should accept SELECT with WHERE clause', () => {
      expect(() =>
        validateReadOnlyQuery("SELECT id, name FROM users WHERE status = 'active'")
      ).not.toThrow();
    });

    it('should accept SELECT with JOIN', () => {
      expect(() =>
        validateReadOnlyQuery('SELECT u.*, o.* FROM users u JOIN orders o ON u.id = o.user_id')
      ).not.toThrow();
    });

    it('should accept SELECT with aggregations', () => {
      expect(() =>
        validateReadOnlyQuery('SELECT COUNT(*), AVG(price) FROM products GROUP BY category')
      ).not.toThrow();
    });

    it('should accept SELECT with subquery', () => {
      expect(() =>
        validateReadOnlyQuery('SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)')
      ).not.toThrow();
    });
  });

  describe('invalid queries', () => {
    it('should reject empty query', () => {
      expect(() => validateReadOnlyQuery('')).toThrow(ValidationError);
    });

    it('should reject non-string query', () => {
      expect(() => validateReadOnlyQuery(null as any)).toThrow(ValidationError);
    });

    it('should reject INSERT query', () => {
      expect(() => validateReadOnlyQuery('INSERT INTO users VALUES (1, "test")')).toThrow(
        SecurityError
      );
    });

    it('should reject UPDATE query', () => {
      expect(() => validateReadOnlyQuery('UPDATE users SET name = "test"')).toThrow(SecurityError);
    });

    it('should reject DELETE query', () => {
      expect(() => validateReadOnlyQuery('DELETE FROM users')).toThrow(SecurityError);
    });

    it('should reject DROP query', () => {
      expect(() => validateReadOnlyQuery('DROP TABLE users')).toThrow(SecurityError);
    });

    it('should reject CREATE query', () => {
      expect(() => validateReadOnlyQuery('CREATE TABLE test (id INT)')).toThrow(SecurityError);
    });

    it('should reject TRUNCATE query', () => {
      expect(() => validateReadOnlyQuery('TRUNCATE TABLE users')).toThrow(SecurityError);
    });

    it('should reject query not starting with SELECT', () => {
      expect(() => validateReadOnlyQuery('EXPLAIN SELECT * FROM users')).toThrow(SecurityError);
    });

    it('should reject query with embedded dangerous keyword', () => {
      expect(() => validateReadOnlyQuery('SELECT * FROM users; DROP TABLE users;')).toThrow(
        SecurityError
      );
    });
  });
});

describe('ensureLimit', () => {
  it('should add LIMIT to query without one', () => {
    const result = ensureLimit('SELECT * FROM users', 100);
    expect(result).toBe('SELECT * FROM users LIMIT 100');
  });

  it('should not add LIMIT if already present', () => {
    const query = 'SELECT * FROM users LIMIT 50';
    const result = ensureLimit(query, 100);
    expect(result).toBe(query);
  });

  it('should handle case-insensitive LIMIT check', () => {
    const query = 'SELECT * FROM users limit 50';
    const result = ensureLimit(query, 100);
    expect(result).toBe(query);
  });

  it('should enforce minimum limit of 1', () => {
    const result = ensureLimit('SELECT * FROM users', 0);
    expect(result).toBe('SELECT * FROM users LIMIT 1');
  });

  it('should floor fractional limits', () => {
    const result = ensureLimit('SELECT * FROM users', 99.7);
    expect(result).toBe('SELECT * FROM users LIMIT 99');
  });
});
