# PULSAR — Context for Claude Code

## What we're building
PULSAR is a Stellar-native MCP server for Claude Code, billed via MPP sessions.
One-line install: `claude mcp add pulsar npx @pulsar/mcp`

## Why
Stellar Agents x402/MPP hackathon. The gap we're filling: nobody has built an MCP
server on Stellar with MPP session (channel) billing. BlockRun MCP does this on EVM.
PULSAR does it on Stellar — cheaper, off-chain per call.

## The 14 tools
search, research, reddit, youtube, screenshot, scrape, image, crypto, weather,
stocks, card, domain, wallet, tools

## Payment model
MPP session (channel mode). User funds Stellar USDC once. Each tool call = off-chain
ed25519 commitment signature. No on-chain tx per call. Server settles once at end.

## The `card` tool (MVP scope)
Issues a virtual Mastercard via ASGCard API, paid from the MPP channel.
**Known open problem:** autonomous spending (Claude Code using the card to pay APIs)
is not solved in MVP. Card details go into Claude Code context; user uses them manually.

## Project structure
```
packages/
  cli/     ← stdio MCP server (local, user's machine)
  api/     ← hosted Hono API server (verifies MPP, calls backends)
docs/superpowers/specs/2026-04-03-pulsar-design.md  ← full design spec
research/  ← ecosystem research notes
```

## Key rules for development
1. Before building a feature, check the spec. If something better emerges, UPDATE THE
   SPEC first and note why, then build. Never silently deviate.
2. After finishing a feature, verify it against the agreed tool list above. Don't add
   things not on the list without flagging it.
3. If confused about direction, re-read this file and the spec before guessing.
4. The goal is a working hackathon demo — not a perfect codebase. MVP > perfect.

## Tech stack
- Node.js 22+, TypeScript, ES modules
- @modelcontextprotocol/sdk (MCP)
- @stellar/stellar-sdk, @stellar/mpp, mppx (payments)
- @asgcard/sdk (virtual card)
- Hono (API server)
- better-sqlite3 (channel state store)
- Stellar testnet
