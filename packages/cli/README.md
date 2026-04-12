# @xlmtools/cli

XLMTools CLI — the universal standalone CLI that runs on the user's machine. Provides the `xlm` binary for direct terminal use and exports the `createMcpServer()` factory that powers the `@xlmtools/mcp` stdio server. Handles tool registration, payment signing, budget tracking, and response caching.

## How it works

This package ships two things:

1. A standalone `xlm` binary — the universal path. Any agent host with a Bash tool can invoke XLMTools by shelling out to `xlm <tool> <args>`.
2. A `createMcpServer()` factory exported from `main`/`types` — consumed by the sibling `@xlmtools/mcp` package, which wraps it in a thin stdio adapter for MCP-capable hosts.

```
Agent host
    |
    |--  Bash tool  --> xlm (this package's bin)
    |
    |--  MCP stdio  --> @xlmtools/mcp ──> imports createMcpServer() from @xlmtools/cli
    v
@xlmtools/api (hosted API server)
    - 21 tools registered via @modelcontextprotocol/sdk
    - mppx polyfills fetch to auto-handle 402 payments
    - budget enforcement (withBudget)
    - response caching (withCache, 5-min TTL)
```

## Install (for users)

```bash
# Standalone CLI (universal — works with any agent host that has Bash)
npm install -g @xlmtools/cli

# MCP server (optional fast-path — install the sibling package)
claude mcp add xlmtools npx @xlmtools/mcp
```

On first run, the CLI:
1. Generates a Stellar keypair at `~/.xlmtools/config.json`
2. Funds the wallet with testnet XLM via friendbot (testnet only)
3. Adds a USDC trustline so the wallet can receive payments

## Development

```bash
# From the monorepo root
pnpm dev:cli

# Or directly
cd packages/cli
pnpm dev
```

The dev script uses `tsx watch` for hot-reload during development.

## Build

```bash
pnpm build
```

Compiles TypeScript to `dist/`. Two compiled outputs matter:

- `dist/cli.js` — the `xlm` standalone binary (entry declared in `package.json` `bin`)
- `dist/server.js` — the `createMcpServer()` factory (entry declared in `package.json` `main`), consumed by `@xlmtools/mcp` as a runtime dependency

## Architecture

### Tools (21 total)

**Paid** (7) — wrapped with `withCache` + `withBudget`:
search, research, youtube, screenshot, scrape, image, stocks

**Free** (14):
crypto, weather, domain, wallet, tools, budget, dex-orderbook, dex-candles, dex-trades, swap-quote, stellar-asset, stellar-account, stellar-pools, oracle-price

### Key modules

| File | Purpose |
| --- | --- |
| `src/server.ts` | `createMcpServer()` factory — builds a fresh McpServer and registers all 21 tools. No transport connected. Consumed by `@xlmtools/mcp`. |
| `src/cli.ts` | Standalone `xlm` binary — arg parsing, URL building, response printing, receipt footer rendering |
| `src/lib/wallet.ts` | Wallet creation, auto-funding on testnet |
| `src/lib/api-fetch.ts` | Shared fetch helper that stamps `X-XLMTools-Client` header for per-address stats attribution |
| `src/lib/budget.ts` | Session budget state, `withBudget()` wrapper |
| `src/lib/cache.ts` | Response cache, `withCache()` wrapper |
| `src/lib/format.ts` | `ok()`, `okPaid()`, `err()` response formatters |
| `src/lib/config.ts` | Tool prices and free tool list |
| `src/lib/logger.ts` | pino logger (stderr) |
| `src/tools/*.ts` | One file per tool — each calls `server.registerTool(...)` |

### Payment flow

1. Tool handler calls `fetch(apiUrl/toolname)` with params
2. API returns `402 Payment Required`
3. mppx (global fetch polyfill) intercepts the 402
4. Builds a Soroban SAC USDC transfer using the local Stellar keypair
5. Signs and retries the request with payment proof
6. API verifies, executes the tool, returns result with receipt
7. `okPaid()` strips the receipt and appends a human-readable payment footer

### Budget flow

```
withCache(tool, params, () =>
  withBudget(tool, async () => {
    // API call
  })
)
```

Cache is checked first (hit = free). Budget is checked second (over limit = blocked). API call happens last. Only successful calls are charged and cached.
