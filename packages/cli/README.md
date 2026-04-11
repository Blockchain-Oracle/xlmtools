# @xlmtools/cli

XLMTools CLI — the MCP server that runs locally on the user's machine. Handles tool registration, payment signing, budget tracking, and response caching.

## How it works

This package is an MCP stdio server. It's started automatically by Claude, Cursor, or any MCP-compatible host when a user calls a XLMTools tool.

```
MCP Host (Claude, Cursor, Windsurf)
    |  stdio
    v
@xlmtools/cli (this package)
    |  - 21 tools registered via @modelcontextprotocol/sdk
    |  - mppx polyfills fetch to auto-handle 402 payments
    |  - budget enforcement (withBudget)
    |  - response caching (withCache, 5-min TTL)
    |
    |  HTTPS
    v
@xlmtools/api (hosted API server)
```

## Install (for users)

```bash
claude mcp add xlmtools npx @xlmtools/cli
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

Compiles TypeScript to `dist/`. The compiled entry point is `dist/index.js`.

## Architecture

### Tools (21 total)

**Paid** (7) — wrapped with `withCache` + `withBudget`:
search, research, youtube, screenshot, scrape, image, stocks

**Free** (14):
crypto, weather, domain, wallet, tools, budget, dex-orderbook, dex-candles, dex-trades, swap-quote, stellar-asset, stellar-account, stellar-pools, oracle-price

### Key modules

| File | Purpose |
| --- | --- |
| `src/index.ts` | Entry point, registers all 21 tools |
| `src/lib/wallet.ts` | Wallet creation, auto-funding on testnet |
| `src/lib/budget.ts` | Session budget state, `withBudget()` wrapper |
| `src/lib/cache.ts` | Response cache, `withCache()` wrapper |
| `src/lib/format.ts` | `ok()`, `okPaid()`, `err()` response formatters |
| `src/lib/config.ts` | Tool prices and free tool list |
| `src/lib/logger.ts` | pino logger (stderr) |
| `src/tools/*.ts` | One file per tool |

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
