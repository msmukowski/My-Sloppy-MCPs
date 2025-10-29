/**
 * PostgreSQL connection configuration
 */
export type PostgresConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  schema: string;
  maxConnections?: number;
  idleTimeoutMs?: number;
  connectionTimeoutMs?: number;
};

/**
 * Application configuration
 */
export type AppConfig = {
  /** Enable/disable PostgreSQL tools */
  enablePostgres: boolean;

  /** PostgreSQL connection settings */
  postgres: PostgresConfig;

  /** Logging configuration */
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
};
