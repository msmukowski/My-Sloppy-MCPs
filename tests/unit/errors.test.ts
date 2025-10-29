/**
 * Unit tests for error utilities
 */

import {
  MCPError,
  ConfigurationError,
  ConnectionError,
  ToolExecutionError,
  ValidationError,
  SecurityError,
  isMCPError,
  formatError,
} from '../../src/utils/errors.js';

describe('MCPError', () => {
  it('should create error with message and code', () => {
    const error = new MCPError('Test error', 'TEST_CODE');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.name).toBe('MCPError');
  });

  it('should include details', () => {
    const details = { key: 'value' };
    const error = new MCPError('Test error', 'TEST_CODE', details);
    expect(error.details).toEqual(details);
  });

  it('should serialize to JSON', () => {
    const error = new MCPError('Test error', 'TEST_CODE', { key: 'value' });
    const json = error.toJSON();
    expect(json).toEqual({
      name: 'MCPError',
      message: 'Test error',
      code: 'TEST_CODE',
      details: { key: 'value' },
    });
  });
});

describe('ConfigurationError', () => {
  it('should create with correct code', () => {
    const error = new ConfigurationError('Config failed');
    expect(error.code).toBe('CONFIGURATION_ERROR');
    expect(error.message).toBe('Config failed');
  });
});

describe('ConnectionError', () => {
  it('should create with correct code', () => {
    const error = new ConnectionError('Connection failed');
    expect(error.code).toBe('CONNECTION_ERROR');
    expect(error.message).toBe('Connection failed');
  });
});

describe('ToolExecutionError', () => {
  it('should create with tool name', () => {
    const error = new ToolExecutionError('Execution failed', 'test_tool');
    expect(error.code).toBe('TOOL_EXECUTION_ERROR');
    expect(error.toolName).toBe('test_tool');
    expect(error.details).toEqual({ toolName: 'test_tool' });
  });
});

describe('ValidationError', () => {
  it('should create with correct code', () => {
    const error = new ValidationError('Validation failed');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Validation failed');
  });
});

describe('SecurityError', () => {
  it('should create with correct code', () => {
    const error = new SecurityError('Security violation');
    expect(error.code).toBe('SECURITY_ERROR');
    expect(error.message).toBe('Security violation');
  });
});

describe('isMCPError', () => {
  it('should return true for MCPError instances', () => {
    const error = new MCPError('Test', 'TEST');
    expect(isMCPError(error)).toBe(true);
  });

  it('should return true for error subclasses', () => {
    expect(isMCPError(new ConfigurationError('Test'))).toBe(true);
    expect(isMCPError(new ConnectionError('Test'))).toBe(true);
    expect(isMCPError(new ValidationError('Test'))).toBe(true);
  });

  it('should return false for regular Error', () => {
    expect(isMCPError(new Error('Test'))).toBe(false);
  });

  it('should return false for non-error values', () => {
    expect(isMCPError('string')).toBe(false);
    expect(isMCPError(123)).toBe(false);
    expect(isMCPError(null)).toBe(false);
    expect(isMCPError(undefined)).toBe(false);
  });
});

describe('formatError', () => {
  it('should format MCPError', () => {
    const error = new MCPError('Test error', 'TEST_CODE', { key: 'value' });
    const formatted = formatError(error);
    const parsed = JSON.parse(formatted);
    expect(parsed).toEqual({
      name: 'MCPError',
      message: 'Test error',
      code: 'TEST_CODE',
      details: { key: 'value' },
    });
  });

  it('should format regular Error', () => {
    const error = new Error('Test error');
    const formatted = formatError(error);
    expect(formatted).toBe('Error: Test error');
  });

  it('should format non-error values', () => {
    expect(formatError('string error')).toBe('string error');
    expect(formatError(123)).toBe('123');
    expect(formatError(null)).toBe('null');
  });
});
