/**
 * Tool registry for managing and discovering MCP tools
 */

import type { Tool } from '../types/index.js';
import { getLogger } from '../utils/index.js';

export type ToolRegistry = {
  /**
   * Register one or more tools
   */
  register: (tools: Tool[]) => void;

  /**
   * Get all registered tools
   */
  getAll: () => Tool[];

  /**
   * Get a specific tool by name
   */
  get: (name: string) => Tool | undefined;

  /**
   * Check if a tool is registered
   */
  has: (name: string) => boolean;

  /**
   * Get count of registered tools
   */
  count: () => number;

  /**
   * Get all tool names
   */
  getNames: () => string[];
};

/**
 * Create a new tool registry
 */
export function createToolRegistry(): ToolRegistry {
  const tools = new Map<string, Tool>();
  const logger = getLogger();

  return {
    register: (newTools: Tool[]) => {
      for (const tool of newTools) {
        if (tools.has(tool.name)) {
          logger.warn(`Tool "${tool.name}" is already registered, skipping`);
          continue;
        }

        tools.set(tool.name, tool);
        logger.debug(`Registered tool: ${tool.name}`);
      }
    },

    getAll: () => Array.from(tools.values()),

    get: (name: string) => tools.get(name),

    has: (name: string) => tools.has(name),

    count: () => tools.size,

    getNames: () => Array.from(tools.keys()),
  };
}
