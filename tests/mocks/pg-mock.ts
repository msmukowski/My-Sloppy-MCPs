/**
 * Mock PostgreSQL Pool for testing
 */

import type { Pool, QueryResult } from 'pg';

export type MockQueryResult = {
  rows: any[];
  rowCount: number;
};

export type MockClient = {
  query: jest.Mock;
  release: jest.Mock;
};

export function createMockPool(): jest.Mocked<Pool> {
  const mockClient: MockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  const mockPool = {
    query: jest.fn(),
    connect: jest.fn().mockResolvedValue(mockClient),
    end: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    totalCount: 1,
    idleCount: 0,
    waitingCount: 0,
  } as unknown as jest.Mocked<Pool>;

  return mockPool;
}

export function mockQueryResult(rows: any[], rowCount?: number): QueryResult {
  return {
    rows,
    rowCount: rowCount ?? rows.length,
    command: 'SELECT',
    oid: 0,
    fields: [],
  };
}
