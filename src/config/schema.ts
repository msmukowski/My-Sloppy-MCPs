import { z } from 'zod';

/**
 * Zod schema for PostgreSQL configuration
 */
export const postgresConfigSchema = z.object({
  host: z.string().min(1, 'PostgreSQL host is required'),
  port: z.number().int().min(1).max(65535).default(5432),
  database: z.string().min(1, 'PostgreSQL database is required'),
  user: z.string().min(1, 'PostgreSQL user is required'),
  password: z.string().default(''),
  schema: z.string().min(1).default('public'),
  maxConnections: z.number().int().min(1).max(100).optional(),
  idleTimeoutMs: z.number().int().min(0).optional(),
  connectionTimeoutMs: z.number().int().min(0).optional(),
});

/**
 * Zod schema for logging configuration
 */
export const loggingConfigSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  format: z.enum(['json', 'text']).default('json'),
});

/**
 * Zod schema for the complete application configuration
 */
export const appConfigSchema = z.object({
  enablePostgres: z.boolean().default(true),
  postgres: postgresConfigSchema,
  logging: loggingConfigSchema.optional(),
});

/**
 * Type inference from Zod schemas
 */
export type ValidatedAppConfig = z.infer<typeof appConfigSchema>;
export type AppConfig = ValidatedAppConfig; // Alias for convenience
export type PostgresConfig = z.infer<typeof postgresConfigSchema>;
