/**
 * MCP Server setup and configuration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { ToolRegistry } from './tools/registry.js';
import { getLogger, isMCPError, formatError } from './utils/index.js';

/**
 * Create and configure the MCP server
 */
export function createMCPServer(registry: ToolRegistry): Server {
  const logger = getLogger();

  const server = new Server(
    {
      name: 'mcp-multi-tool-server',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  /**
   * Handle ListTools request - return all registered tools
   */
  server.setRequestHandler(ListToolsRequestSchema, () => {
    const tools = registry.getAll();

    logger.debug('ListTools request', { count: tools.length });

    // Convert to MCP tool format
    return {
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  /**
   * Handle CallTool request - execute the requested tool
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info('CallTool request', { tool: name });

    const tool = registry.get(name);

    if (!tool) {
      const errorMessage = `Unknown tool: ${name}`;
      logger.warn(errorMessage);
      return {
        content: [{ type: 'text' as const, text: errorMessage }],
        isError: true,
      };
    }

    try {
      const result = await tool.execute(args);
      logger.info('Tool execution succeeded', { tool: name });
      return result;
    } catch (error) {
      logger.error('Tool execution failed', {
        tool: name,
        error: error instanceof Error ? error.message : String(error),
      });

      const errorMessage = isMCPError(error)
        ? formatError(error)
        : error instanceof Error
          ? error.message
          : String(error);

      return {
        content: [
          {
            type: 'text' as const,
            text: errorMessage,
          },
        ],
        isError: true,
      };
    }
  });

  logger.info('MCP server configured', {
    toolCount: registry.count(),
    tools: registry.getNames(),
  });

  return server;
}
