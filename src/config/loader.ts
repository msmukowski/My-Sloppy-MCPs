import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appConfigSchema, type ValidatedAppConfig } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load configuration from file (config.json) and environment variables.
 * Environment variables take precedence over file configuration.
 *
 * Looks for config.json in:
 * 1. Current working directory (process.cwd())
 * 2. Server installation directory (where the MCP server is installed)
 */
export function loadConfig(): ValidatedAppConfig {
  let configPath = path.join(process.cwd(), 'config.json');

  if (!fs.existsSync(configPath)) {
    configPath = path.join(__dirname, '../../config.json');
  }

  let fileConfig: Partial<ValidatedAppConfig> = {};
  if (fs.existsSync(configPath)) {
    try {
      const fileContent = fs.readFileSync(configPath, 'utf-8');
      fileConfig = JSON.parse(fileContent) as Partial<ValidatedAppConfig>;
    } catch (error) {
      console.error('Failed to parse config.json:', error);
      throw new Error('Invalid config.json file');
    }
  }

  const maxConnections = getEnvNumber('PG_MAX_CONNECTIONS', fileConfig.postgres?.maxConnections);
  const idleTimeoutMs = getEnvNumber('PG_IDLE_TIMEOUT_MS', fileConfig.postgres?.idleTimeoutMs);
  const connectionTimeoutMs = getEnvNumber(
    'PG_CONNECTION_TIMEOUT_MS',
    fileConfig.postgres?.connectionTimeoutMs
  );

  const rawConfig = {
    enablePostgres: getEnvBoolean('ENABLE_POSTGRES', fileConfig.enablePostgres),
    postgres: {
      host: process.env.PGHOST ?? fileConfig.postgres?.host ?? 'localhost',
      port: getEnvNumber('PGPORT', fileConfig.postgres?.port) ?? 5432,
      database: process.env.PGDATABASE ?? fileConfig.postgres?.database ?? 'postgres',
      user: process.env.PGUSER ?? fileConfig.postgres?.user ?? 'postgres',
      password: process.env.PGPASSWORD ?? fileConfig.postgres?.password ?? '',
      schema: process.env.PGSCHEMA ?? fileConfig.postgres?.schema ?? 'public',
      ...(maxConnections !== undefined && { maxConnections }),
      ...(idleTimeoutMs !== undefined && { idleTimeoutMs }),
      ...(connectionTimeoutMs !== undefined && { connectionTimeoutMs }),
    },
    logging: {
      level: (process.env.LOG_LEVEL ?? fileConfig.logging?.level ?? 'info') as
        | 'debug'
        | 'info'
        | 'warn'
        | 'error',
      format: (process.env.LOG_FORMAT ?? fileConfig.logging?.format ?? 'json') as 'json' | 'text',
    },
  };

  const result = appConfigSchema.safeParse(rawConfig);

  if (!result.success) {
    console.error('Configuration validation failed:', result.error.format());
    throw new Error('Invalid configuration');
  }

  return result.data;
}

function getEnvBoolean(key: string, fallback?: boolean): boolean | undefined {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true' || value === '1';
}

function getEnvNumber(key: string, fallback?: number): number | undefined {
  const value = process.env[key];
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
}
