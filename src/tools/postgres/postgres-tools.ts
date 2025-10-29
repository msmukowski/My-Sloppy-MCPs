/**
 * PostgreSQL tools for MCP
 */

import type { Pool } from 'pg';
import type { Connector, Tool, ToolResult } from '../../types/index.js';
import { ToolExecutionError, ValidationError, getLogger } from '../../utils/index.js';
import { LIST_TABLES_QUERY, DESCRIBE_TABLE_QUERY } from './queries.js';
import { validateReadOnlyQuery, ensureLimit } from './validator.js';

/**
 * Create PostgreSQL tools
 */
export function createPostgresTools(connector: Connector<Pool>, defaultSchema: string): Tool[] {
  const logger = getLogger();

  /**
   * Tool: postgres_list_tables
   */
  const listTablesTool: Tool = {
    name: 'postgres_list_tables',
    description: 'List all tables in the configured schema (PostgreSQL)',
    inputSchema: {
      type: 'object',
      properties: {
        schema: {
          type: 'string',
          description: 'Schema name (defaults to configured schema)',
        },
      },
    },
    execute: async (args: unknown): Promise<ToolResult> => {
      try {
        const params = (args as { schema?: string }) ?? {};
        const schema = params.schema ?? defaultSchema;

        logger.debug('Executing postgres_list_tables', { schema });

        const pool = connector.getClient();
        const result = await pool.query(LIST_TABLES_QUERY, [schema]);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.rows, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error('postgres_list_tables failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw new ToolExecutionError(
          error instanceof Error ? error.message : 'Unknown error',
          'postgres_list_tables'
        );
      }
    },
  };

  /**
   * Tool: postgres_describe_table
   */
  const describeTableTool: Tool = {
    name: 'postgres_describe_table',
    description: 'Describe table columns and their types (PostgreSQL)',
    inputSchema: {
      type: 'object',
      required: ['table_name'],
      properties: {
        table_name: {
          type: 'string',
          description: 'Name of the table to describe',
        },
        schema: {
          type: 'string',
          description: 'Schema name (defaults to configured schema)',
        },
      },
    },
    execute: async (args: unknown): Promise<ToolResult> => {
      try {
        const params = args as { table_name?: string; schema?: string };

        if (!params?.table_name) {
          throw new ValidationError('table_name is required');
        }

        const schema = params.schema ?? defaultSchema;
        logger.debug('Executing postgres_describe_table', {
          schema,
          table: params.table_name,
        });

        const pool = connector.getClient();
        const result = await pool.query(DESCRIBE_TABLE_QUERY, [schema, params.table_name]);

        if (result.rows.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Table not found',
                  schema,
                  table: params.table_name,
                }),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.rows, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error('postgres_describe_table failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw new ToolExecutionError(
          error instanceof Error ? error.message : 'Unknown error',
          'postgres_describe_table'
        );
      }
    },
  };

  /**
   * Tool: postgres_query
   */
  const queryTool: Tool = {
    name: 'postgres_query',
    description: 'Execute a read-only SQL SELECT query (PostgreSQL)',
    inputSchema: {
      type: 'object',
      required: ['sql'],
      properties: {
        sql: {
          type: 'string',
          description: 'SELECT-only SQL query to execute',
        },
        max_rows: {
          type: 'number',
          description: 'Maximum number of rows to return (default: 100)',
        },
      },
    },
    execute: async (args: unknown): Promise<ToolResult> => {
      try {
        const params = args as { sql?: string; max_rows?: number };

        if (!params?.sql) {
          throw new ValidationError('sql parameter is required');
        }

        validateReadOnlyQuery(params.sql);

        const maxRows = params.max_rows ?? 100;
        const limitedSql = ensureLimit(params.sql, maxRows);

        logger.debug('Executing postgres_query', {
          queryLength: limitedSql.length,
          maxRows,
        });

        const pool = connector.getClient();
        const result = await pool.query(limitedSql);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  rowCount: result.rowCount,
                  rows: result.rows,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        logger.error('postgres_query failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw new ToolExecutionError(
          error instanceof Error ? error.message : 'Unknown error',
          'postgres_query'
        );
      }
    },
  };

  return [listTablesTool, describeTableTool, queryTool];
}
