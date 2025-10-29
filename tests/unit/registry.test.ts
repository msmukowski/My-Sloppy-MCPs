/**
 * Unit tests for tool registry
 */

import { createToolRegistry } from '../../src/tools/registry.js';
import type { Tool } from '../../src/types/tool.js';

const mockTool1: Tool = {
  name: 'test_tool_1',
  description: 'Test tool 1',
  inputSchema: { type: 'object', properties: {} },
  execute: async () => ({ content: [{ type: 'text', text: 'test' }] }),
};

const mockTool2: Tool = {
  name: 'test_tool_2',
  description: 'Test tool 2',
  inputSchema: { type: 'object', properties: {} },
  execute: async () => ({ content: [{ type: 'text', text: 'test' }] }),
};

describe('createToolRegistry', () => {
  it('should create an empty registry', () => {
    const registry = createToolRegistry();
    expect(registry.count()).toBe(0);
    expect(registry.getAll()).toEqual([]);
  });

  it('should register a single tool', () => {
    const registry = createToolRegistry();
    registry.register([mockTool1]);

    expect(registry.count()).toBe(1);
    expect(registry.has('test_tool_1')).toBe(true);
    expect(registry.get('test_tool_1')).toBe(mockTool1);
  });

  it('should register multiple tools', () => {
    const registry = createToolRegistry();
    registry.register([mockTool1, mockTool2]);

    expect(registry.count()).toBe(2);
    expect(registry.has('test_tool_1')).toBe(true);
    expect(registry.has('test_tool_2')).toBe(true);
  });

  it('should return all registered tools', () => {
    const registry = createToolRegistry();
    registry.register([mockTool1, mockTool2]);

    const all = registry.getAll();
    expect(all).toHaveLength(2);
    expect(all).toContain(mockTool1);
    expect(all).toContain(mockTool2);
  });

  it('should return undefined for non-existent tool', () => {
    const registry = createToolRegistry();
    expect(registry.get('non_existent')).toBeUndefined();
  });

  it('should return false for non-existent tool with has()', () => {
    const registry = createToolRegistry();
    expect(registry.has('non_existent')).toBe(false);
  });

  it('should return all tool names', () => {
    const registry = createToolRegistry();
    registry.register([mockTool1, mockTool2]);

    const names = registry.getNames();
    expect(names).toEqual(['test_tool_1', 'test_tool_2']);
  });

  it('should not register duplicate tool names', () => {
    const registry = createToolRegistry();
    const duplicateTool: Tool = {
      ...mockTool1,
      description: 'Duplicate tool',
    };

    registry.register([mockTool1]);
    registry.register([duplicateTool]);

    expect(registry.count()).toBe(1);
    expect(registry.get('test_tool_1')?.description).toBe('Test tool 1');
  });
});
