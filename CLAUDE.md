# XLMTools — Context for Claude Code

## What we're building
XLMTools is a Stellar-native MCP server for Claude Code, billed via MPP charge payments.
One-line install: `claude mcp add xlmtools npx @xlmtools/cli`

## Why
Stellar Agents x402/MPP hackathon. The gap we're filling: nobody has built an MCP
server on Stellar with MPP billing. BlockRun MCP does this on EVM/Base.
XLMTools does it on Stellar.

## The tools (21 total)
**Paid:** search, research, youtube, screenshot, scrape, image, stocks
**Free:** crypto, weather, domain, wallet, tools, budget
**Stellar-native (free):** dex-orderbook, dex-candles, dex-trades, swap-quote,
stellar-asset, stellar-account, stellar-pools, oracle-price

(Card tool removed — ASGCard already has their own MCP server with x402 billing.
No point duplicating. Users can install ASGCard's MCP server alongside XLMTools.)

## Payment model
MPP charge mode (via `mppx`). Each paid tool call triggers a 402 → Mppx auto-builds
Soroban SAC USDC transfer → signs with local Stellar key → retries with payment proof.

## Project structure
```
packages/
  cli/     ← stdio MCP server (local, user's machine, @xlmtools/cli)
  api/     ← hosted Express 5 API server (verifies MPP, calls backends)
  web/     ← Next.js 16 frontend (landing, tools, explore, stats)
  docs/    ← Nextra 4 documentation site
docs/superpowers/specs/2026-04-03-xlmtools-design.md  ← design spec
docs/superpowers/plans/2026-04-03-xlmtools-implementation.md  ← implementation plan
research/  ← ecosystem research notes
```

## Current state (2026-04-07)
- All 21 CLI tools implemented and registered (7 paid, 14 free)
- All API routes implemented with MPP charge gating
- Spending receipts: every paid call returns Stellar tx hash
- Budget tool: per-session spending cap (CLI-side)
- Response caching: 5-min TTL, identical queries return cached (free)
- Stats API: in-memory call log, /stats and /stats/recent endpoints
- Docs site: Nextra 4 at packages/docs/ with 27 pages
- Frontend: redesigned with layered color system, live activity stream
- Not yet deployed (API server needs hosting)

## Key rules for development
1. Before building a feature, check the spec. If something better emerges, UPDATE THE
   SPEC first and note why, then build. Never silently deviate.
2. After finishing a feature, verify it against the agreed tool list above.
3. The goal is a working hackathon demo — not a perfect codebase. MVP > perfect.
4. Use pino logger, NEVER console.log or console.error.
5. Never hardcode dependency versions — use `pnpm add` to get latest.

## Tech stack
- Node.js 22+, TypeScript 6, ES modules
- @modelcontextprotocol/sdk (MCP)
- @stellar/stellar-sdk, @stellar/mpp, mppx (MPP charge payments)
- Express 5 (API server)
- pino (logging — stderr for CLI, stdout for API)
- zod 4 (schema validation)
- Stellar testnet
