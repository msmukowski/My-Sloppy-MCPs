/**
 * PostgreSQL connector using node-postgres (pg)
 */

import { Pool, type PoolConfig } from 'pg';
import type { Connector, PostgresConfig } from '../types/index.js';
import { ConnectionError, getLogger } from '../utils/index.js';

/**
 * Create a PostgreSQL connector with connection pooling
 */
export function createPostgresConnector(config: PostgresConfig): Connector<Pool> {
  let pool: Pool | null = null;
  const logger = getLogger();

  const poolConfig: PoolConfig = {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: config.maxConnections ?? 10,
    idleTimeoutMillis: config.idleTimeoutMs ?? 30000,
    connectionTimeoutMillis: config.connectionTimeoutMs ?? 5000,
    application_name: 'mcp-multi-tool-server',
  };

  return {
    async initialize() {
      if (pool) {
        logger.warn('PostgreSQL connector already initialized');
        return;
      }

      logger.info('Initializing PostgreSQL connector...', {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
      });

      pool = new Pool(poolConfig);

      // Test connection
      try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        logger.info('PostgreSQL connector initialized successfully');
      } catch (error) {
        pool = null;
        const message =
          error instanceof Error ? error.message : 'Unknown error during connection test';
        logger.error('Failed to initialize PostgreSQL connector:', { error: message });
        throw new ConnectionError('Failed to connect to PostgreSQL', {
          host: config.host,
          port: config.port,
          database: config.database,
          error: message,
        });
      }

      // Handle pool errors
      pool.on('error', (err) => {
        logger.error('Unexpected PostgreSQL pool error:', {
          error: err.message,
        });
      });
    },

    getClient() {
      if (!pool) {
        throw new ConnectionError('PostgreSQL connector not initialized');
      }
      return pool;
    },

    async close() {
      if (pool) {
        logger.info('Closing PostgreSQL connection pool...');
        await pool.end();
        pool = null;
        logger.info('PostgreSQL connection pool closed');
      }
    },

    isHealthy() {
      return pool !== null && pool.totalCount >= 0;
    },
  };
}
