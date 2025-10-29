/**
 * Integration tests for PostgreSQL tools
 */

import type { Connector } from '../../src/types/connector.js';
import type { Pool } from 'pg';
import { createPostgresTools } from '../../src/tools/postgres/postgres-tools.js';
import { createMockPool, mockQueryResult } from '../mocks/pg-mock.js';

describe('PostgreSQL Tools Integration', () => {
  let mockPool: jest.Mocked<Pool>;
  let mockConnector: Connector<Pool>;

  beforeEach(() => {
    mockPool = createMockPool();
    mockConnector = {
      initialize: jest.fn(),
      getClient: jest.fn().mockReturnValue(mockPool),
      close: jest.fn(),
      isHealthy: jest.fn().mockReturnValue(true),
    };
  });

  describe('postgres_list_tables', () => {
    it('should list tables in default schema', async () => {
      const tools = createPostgresTools(mockConnector, 'public');
      const listTablesTool = tools.find((t) => t.name === 'postgres_list_tables');

      const mockTables = [
        { table_name: 'users', table_type: 'BASE TABLE' },
        { table_name: 'orders', table_type: 'BASE TABLE' },
      ];

      mockPool.query.mockResolvedValue(mockQueryResult(mockTables));

      const result = await listTablesTool!.execute({});

      expect(mockConnector.getClient).toHaveBeenCalled();
      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), ['public']);
      expect(result.content[0]?.text).toContain('users');
      expect(result.content[0]?.text).toContain('orders');
    });

    it('should list tables in custom schema', async () => {
      const tools = createPostgresTools(mockConnector, 'public');
      const listTablesTool = tools.find((t) => t.name === 'postgres_list_tables');

      mockPool.query.mockResolvedValue(mockQueryResult([]));

      await listTablesTool!.execute({ schema: 'custom_schema' });

      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), ['custom_schema']);
    });
  });

  describe('postgres_describe_table', () => {
    it('should describe table columns', async () => {
      const tools = createPostgresTools(mockConnector, 'public');
      const describeTool = tools.find((t) => t.name === 'postgres_describe_table');

      const mockColumns = [
        {
          column_name: 'id',
          data_type: 'integer',
          is_nullable: 'NO',
          column_default: "nextval('users_id_seq'::regclass)",
        },
        {
          column_name: 'email',
          data_type: 'character varying',
          is_nullable: 'NO',
          column_default: null,
        },
      ];

      mockPool.query.mockResolvedValue(mockQueryResult(mockColumns));

      const result = await describeTool!.execute({ table_name: 'users' });

      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), ['public', 'users']);
      expect(result.content[0]?.text).toContain('id');
      expect(result.content[0]?.text).toContain('email');
    });

    it('should return error for non-existent table', async () => {
      const tools = createPostgresTools(mockConnector, 'public');
      const describeTool = tools.find((t) => t.name === 'postgres_describe_table');

      mockPool.query.mockResolvedValue(mockQueryResult([]));

      const result = await describeTool!.execute({ table_name: 'non_existent' });

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain('Table not found');
    });

    it('should throw error when table_name is missing', async () => {
      const tools = createPostgresTools(mockConnector, 'public');
      const describeTool = tools.find((t) => t.name === 'postgres_describe_table');

      await expect(describeTool!.execute({})).rejects.toThrow('table_name is required');
    });
  });

  describe('postgres_query', () => {
    it('should execute SELECT query', async () => {
      const tools = createPostgresTools(mockConnector, 'public');
      const queryTool = tools.find((t) => t.name === 'postgres_query');

      const mockData = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];

      mockPool.query.mockResolvedValue(mockQueryResult(mockData));

      const result = await queryTool!.execute({ sql: 'SELECT * FROM users' });

      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM users'));
      expect(result.content[0]?.text).toContain('Alice');
      expect(result.content[0]?.text).toContain('Bob');
    });

    it('should add LIMIT when not present', async () => {
      const tools = createPostgresTools(mockConnector, 'public');
      const queryTool = tools.find((t) => t.name === 'postgres_query');

      mockPool.query.mockResolvedValue(mockQueryResult([]));

      await queryTool!.execute({ sql: 'SELECT * FROM users' });

      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT 100'));
    });

    it('should respect custom max_rows', async () => {
      const tools = createPostgresTools(mockConnector, 'public');
      const queryTool = tools.find((t) => t.name === 'postgres_query');

      mockPool.query.mockResolvedValue(mockQueryResult([]));

      await queryTool!.execute({ sql: 'SELECT * FROM users', max_rows: 50 });

      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT 50'));
    });

    it('should reject non-SELECT queries', async () => {
      const tools = createPostgresTools(mockConnector, 'public');
      const queryTool = tools.find((t) => t.name === 'postgres_query');

      await expect(queryTool!.execute({ sql: 'DELETE FROM users' })).rejects.toThrow(
        'Only SELECT queries are allowed'
      );
    });

    it('should reject query with dangerous keywords', async () => {
      const tools = createPostgresTools(mockConnector, 'public');
      const queryTool = tools.find((t) => t.name === 'postgres_query');

      await expect(
        queryTool!.execute({ sql: 'SELECT * FROM users; DROP TABLE users;' })
      ).rejects.toThrow();
    });
  });
});
