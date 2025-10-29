# MCP Multi-Tool Server

Extensible MCP server with PostgreSQL tools. TypeScript, Zod validation, modular architecture.

## What It Does

- Query PostgreSQL databases (list tables, describe schema, run SELECT queries)
- Read-only, safe queries with validation
- Easy to extend with more connectors (S3, Redis, etc.)

## Quick Setup

```bash
npm install
cp config.example.json config.json
# Edit config.json with your DB credentials
npm run build
```

## Configuration

### For local dev: `config.json`
```json
{
  "enablePostgres": true,
  "postgres": {
    "host": "localhost",
    "port": 5432,
    "database": "mydb",
    "user": "readonly_user",
    "password": "your_password",
    "schema": "public"
  }
}
```

### For runner setup: Environment variables in config
```json
{
  "mcpServers": {
    "postgres-tools": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": {
        "ENABLE_POSTGRES": "true",
        "PGHOST": "localhost",
        "PGPORT": "5432",
        "PGDATABASE": "mydb",
        "PGUSER": "readonly_user",
        "PGPASSWORD": "your_password"
      }
    }
  }
}
```

## Available Tools

- `postgres_list_tables` - List tables in schema
- `postgres_describe_table` - Show table structure (columns, types)
- `postgres_query` - Run SELECT queries (max 100 rows default)

## Quick Read-Only User Setup

```sql
CREATE ROLE mcp_readonly WITH LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE mydb TO mcp_readonly;
GRANT USAGE ON SCHEMA public TO mcp_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mcp_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO mcp_readonly;
```

## Development

```bash
npm run dev        # Dev mode with reload
npm test           # Run tests
npm run lint       # Lint code
npm run format     # Format code
```

## Testing with MCP Inspector

Test your server:

```bash
npm run build
npx @modelcontextprotocol/inspector node dist/index.js
```

Opens web UI at `http://localhost:5173` to test tools, view logs, and debug.

With environment variables:
```bash
ENABLE_POSTGRES=true PGHOST=localhost PGDATABASE=mydb PGUSER=user PGPASSWORD=pass \
npx @modelcontextprotocol/inspector node dist/index.js
```

## Extending

See [CONTRIBUTING.md](./CONTRIBUTING.md) for step-by-step guide. Quick version:
1. Add config schema (Zod + types)
2. Create connector in `src/connectors/`
3. Create tools in `src/tools/your-tool/`
4. Register in `src/index.ts`
5. Write tests

## Architecture

```
src/
├── config/       # Zod validation, loads config.json or env vars
├── connectors/   # DB connection managers
├── tools/        # MCP tool implementations
├── utils/        # Logging, errors
└── server.ts     # MCP server setup
```
