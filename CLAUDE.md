# PULSAR — Context for Claude Code

## What we're building
PULSAR is a Stellar-native MCP server for Claude Code, billed via MPP charge payments.
One-line install: `claude mcp add pulsar npx @pulsar/mcp`

## Why
Stellar Agents x402/MPP hackathon. The gap we're filling: nobody has built an MCP
server on Stellar with MPP billing. BlockRun MCP does this on EVM/Base.
PULSAR does it on Stellar.

## The 14 tools
search, research, reddit, youtube, screenshot, scrape, image, crypto, weather,
stocks, card, domain, wallet, tools

## Payment model
MPP charge mode (via `mppx`). Each paid tool call triggers a 402 → Mppx auto-builds
Soroban SAC USDC transfer → signs with local Stellar key → retries with payment proof.

## The `card` tool (MVP scope)
Issues a virtual Mastercard via ASGCard API. Currently a stub — `@asgcard/sdk@1.1.4`
exists on npm and can be wired in. Card details go into Claude Code context; user
uses them manually. Autonomous agent spending is a future problem.

## Project structure
```
packages/
  cli/     ← stdio MCP server (local, user's machine, @pulsar/mcp)
  api/     ← hosted Express 5 API server (verifies MPP, calls backends)
docs/superpowers/specs/2026-04-03-pulsar-design.md  ← design spec
docs/superpowers/plans/2026-04-03-pulsar-implementation.md  ← implementation plan
research/  ← ecosystem research notes
```

## Current state (2026-04-03)
- All 14 CLI tools implemented and registered
- All API routes implemented with MPP charge gating
- Card tool is MVP stub (wire @asgcard/sdk when ready)
- Both packages build cleanly with TypeScript
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
