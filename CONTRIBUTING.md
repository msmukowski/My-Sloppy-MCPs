# Contributing & Extending

## Setup
Clone repo → `npm install` → copy `config.example.json` to `config.json` → `npm test`

**Commands**: `npm run lint`, `npm run format`, `npm test`

## Adding New Tools

1. **Config Schema**: Add Zod schema in `src/config/schema.ts` + type in `src/types/config.ts` + feature toggle
2. **Connector**: Create `src/connectors/yourname.ts` with 4 methods: `initialize()`, `getClient()`, `close()`, `isHealthy()`
3. **Tools**: Create `src/tools/yourname/` with tool definitions (name, description, inputSchema, execute)
4. **Register**: Wire up in `src/index.ts` - init connector, register tools, add shutdown hook
5. **Tests**: Add integration tests in `tests/integration/`
6. **Config**: Update `config.example.json`

## Checklist
- [ ] Config schema (Zod + types)
- [ ] Connector (4 methods)
- [ ] Tools
- [ ] Register in index.ts
- [ ] Tests
- [ ] Update config.example.json
- [ ] Lint & format

Reference: `src/connectors/postgres.ts` and `src/tools/postgres/` for working example
