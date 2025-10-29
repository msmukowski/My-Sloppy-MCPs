/**
 * Common SQL queries for PostgreSQL introspection
 */

/**
 * Query to list all tables in a schema
 */
export const LIST_TABLES_QUERY = `
  SELECT
    table_name,
    table_type
  FROM information_schema.tables
  WHERE table_schema = $1
  ORDER BY table_name
`;

/**
 * Query to describe table columns
 */
export const DESCRIBE_TABLE_QUERY = `
  SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
  FROM information_schema.columns
  WHERE table_schema = $1 AND table_name = $2
  ORDER BY ordinal_position
`;

/**
 * Query to get table row count estimate
 */
export const TABLE_ROW_COUNT_QUERY = `
  SELECT reltuples::bigint AS estimated_row_count
  FROM pg_class
  WHERE oid = ($1 || '.' || $2)::regclass
`;

/**
 * Query to get table indexes
 */
export const TABLE_INDEXES_QUERY = `
  SELECT
    indexname,
    indexdef
  FROM pg_indexes
  WHERE schemaname = $1 AND tablename = $2
  ORDER BY indexname
`;
