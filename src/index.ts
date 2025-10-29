#!/usr/bin/env node

/**
 * MCP Multi-Tool Server - Entry Point
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config/index.js';
import { createPostgresConnector } from './connectors/postgres.js';
import { createMCPServer } from './server.js';
import { createToolRegistry } from './tools/registry.js';
import { createPostgresTools } from './tools/postgres/index.js';
import {
  createLogger,
  getLogger,
  setupShutdownHandlers,
  onShutdown,
  ConfigurationError,
} from './utils/index.js';

async function main() {
  try {
    const config = loadConfig();

    createLogger(config.logging?.level ?? 'info', config.logging?.format ?? 'json');
    const logger = getLogger();

    logger.info('Starting MCP Multi-Tool Server...', {
      enablePostgres: config.enablePostgres,
    });

    const registry = createToolRegistry();

    if (config.enablePostgres) {
      logger.info('PostgreSQL tools enabled');

      const postgresConnector = createPostgresConnector(config.postgres);
      await postgresConnector.initialize();

      onShutdown(async () => {
        await postgresConnector.close();
      });

      const postgresTools = createPostgresTools(postgresConnector, config.postgres.schema);
      registry.register(postgresTools);

      logger.info('PostgreSQL tools registered', {
        count: postgresTools.length,
        tools: postgresTools.map((t) => t.name),
      });
    } else {
      logger.info('PostgreSQL tools disabled');
    }

    if (registry.count() === 0) {
      throw new ConfigurationError('No tools enabled. Enable at least one connector (postgres)');
    }

    setupShutdownHandlers();

    const server = createMCPServer(registry);
    const transport = new StdioServerTransport();

    await server.connect(transport);

    logger.info('MCP server running on stdio', {
      toolCount: registry.count(),
      tools: registry.getNames(),
    });
  } catch (error) {
    const logger = getLogger();
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
