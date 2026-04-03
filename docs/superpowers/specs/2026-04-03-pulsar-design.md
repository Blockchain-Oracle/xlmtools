# PULSAR — Design Spec
**Date:** 2026-04-03
**Hackathon:** Stellar Agents x402 / Stripe / MPP
**Install:** `claude mcp add pulsar npx @pulsar/mcp`

---

## What It Is

PULSAR is a Stellar-native MCP server for Claude Code. It gives Claude Code 14 useful tools — web search, research, image generation, virtual card issuance, and more — all billed through a single MPP session (payment channel) on Stellar. Fund once with USDC. Every tool call signs an off-chain commitment. No on-chain transaction per call.

The name: a pulsar is a rapidly rotating neutron star that emits precise, regular pulses. That's what this does — precise micropayment pulses on Stellar, one per tool call.

---

## Why This Wins

**What exists on EVM (Base):** BlockRun MCP — 9 tools, x402 per-call payments, each call = 1 on-chain USDC transfer.

**What PULSAR does differently:**
- Built on Stellar (not EVM)
- Uses MPP sessions — fund a channel once, then every tool call is just a cryptographic signature off-chain
- 100 tool calls on EVM = 100 on-chain txs. On PULSAR = 1 on-chain tx + 100 off-chain signatures
- Includes `card` tool — issues a real virtual Mastercard (via ASGCard) paid from the channel

No Stellar equivalent of this exists anywhere.

---

## The 14 Tools

### Paid Tools (billed via MPP session)

| Tool | What it does | Backend | Cost |
|------|-------------|---------|------|
| `search` | Web + news search | Brave Search API | ~$0.003/query |
| `research` | Deep neural research, papers, competitors | Exa API | ~$0.01/query |
| `reddit` | Trending posts, search by topic | Reddit API (free) | ~$0.002/query |
| `youtube` | Video metadata + full transcripts | YouTube Data API | ~$0.002/query |
| `screenshot` | Screenshot any URL | ScreenshotOne | ~$0.01/screenshot |
| `scrape` | Extract clean text from any webpage | Jina Reader | ~$0.002/page |
| `image` | Generate images | DALL-E 3 or Flux (fal.ai) | ~$0.04/image |
| `stocks` | Stock prices + company financials | Alpha Vantage / Polygon | ~$0.001/query |
| `card` | Issue virtual Mastercard (MVP scope) | ASGCard SDK | ~$10 flat + 3.5% load |

### Free Tools (no charge)

| Tool | What it does |
|------|-------------|
| `crypto` | Crypto prices + market cap (CoinGecko free tier) |
| `weather` | Current + forecast for any location (OpenWeatherMap free tier) |
| `domain` | Check domain name availability and pricing |
| `wallet` | MPP channel balance, cumulative spend, per-tool breakdown, top-up instructions |
| `tools` | List all tools with per-call costs |

---

## Architecture

```
Claude Code (MCP client)
    │
    │ stdio (local process)
    ▼
PULSAR CLI process  (~/.pulsar/)
    │  - holds Stellar keypair
    │  - holds MPP commitment key
    │  - signs off-chain commitments per tool call
    │  - tracks cumulative channel amount locally
    │
    │ HTTPS + MPP-Credential header
    ▼
PULSAR API Server  (hosted, Express/Hono)
    │  - verifies MPP commitment signature
    │  - verifies amount is >= price for the tool
    │  - calls the appropriate backend API
    │  - updates cumulative amount in store
    │  - returns tool result
    │
    ├── Brave Search API
    ├── Exa API
    ├── Reddit API
    ├── YouTube Data API
    ├── Jina Reader
    ├── ScreenshotOne
    ├── DALL-E 3 / fal.ai
    ├── CoinGecko (free)
    ├── OpenWeatherMap (free)
    └── ASGCard SDK
```

---

## Payment Flow (MPP Session Mode)

```
First use:
  1. PULSAR CLI auto-generates Stellar keypair + ed25519 commitment key
  2. Prints Stellar address to console
  3. User sends USDC on Stellar testnet (via Stellar Lab / Circle faucet)
  4. PULSAR CLI builds + signs the MPP channel deploy tx
  5. Sends to PULSAR API server → server broadcasts → channel is live

Per tool call:
  1. Claude Code calls a tool (e.g., "search for X")
  2. PULSAR CLI checks: does a channel exist? Yes.
  3. Calculates new cumulative amount (prev + tool_price)
  4. Calls Stellar RPC to simulate prepare_commitment (read-only, no tx)
  5. Signs the commitment bytes with ed25519 commitment key
  6. Sends HTTPS request to PULSAR API with MPP-Credential header
  7. Server verifies signature + amount >= tool price
  8. Server calls backend API (Brave, Exa, etc.)
  9. Returns result to Claude Code

Settlement:
  - Server closes channel when balance threshold reached or on request
  - Single on-chain tx transfers cumulative USDC to server wallet
  - Remainder returned to user's Stellar address
```

---

## User Flow (End to End)

### Setup (2 minutes, once)

```bash
# Add to Claude Code
claude mcp add pulsar npx @pulsar/mcp

# Start Claude Code in any project
claude

# First time: PULSAR prints your Stellar address
# "PULSAR wallet: GABC...XYZ — send testnet USDC to activate"

# Fund it (testnet):
# 1. Go to https://lab.stellar.org/account/fund
# 2. Go to https://faucet.circle.com — get testnet USDC
# 3. Send USDC to the printed address
```

### Daily use (zero friction)

```
You: "Search for the latest news on Stellar blockchain,
      screenshot the stellar.org homepage,
      and generate a logo for my project"

Claude Code:
  → calls search("Stellar blockchain news")
  → calls screenshot("https://stellar.org")
  → calls image("logo for a Stellar payment tool called PULSAR")
  → all 3 calls signed off-chain, total cost ~$0.053
  → results appear in conversation
```

### Checking your balance

```
You: "How much have I spent?"

Claude Code calls wallet():
  → "Channel balance: $9.95 remaining
      Spent: $0.05 total
      Breakdown: search ×3 ($0.009), screenshot ×1 ($0.01),
                 image ×1 ($0.04)
      Top-up: send USDC to GABC...XYZ on Stellar"
```

### Agent commerce (MVP scope)

```
You: "I need a virtual card to pay for hosting"

Claude Code calls card(amount=20):
  → PULSAR pays ASGCard API via MPP channel ($31.75 total)
  → Returns:
      Card: 5395 **** **** 7890
      Expiry: 12/2028, CVV: 123
      Balance: $20.00
      Billing: 123 Main St, SF CA 94105, US

Claude Code: "Here's your virtual Mastercard (ending 7890).
              Use these details at any checkout that accepts
              Mastercard. Card details are one-time only —
              they will not be shown again."
```

**Known open problem:** Claude Code can't autonomously navigate web checkout flows. Card details are in context — user must paste them manually, OR a future tool integration (e.g., `domain_register`) calls an API directly with card details. This is noted as future work.

---

## Package Structure

```
pulsar/
├── packages/
│   ├── cli/               # stdio MCP server (local process)
│   │   ├── src/
│   │   │   ├── index.ts   # MCP server setup, tool registration
│   │   │   ├── wallet.ts  # Stellar keypair + MPP channel management
│   │   │   ├── channel.ts # commitment signing per tool call
│   │   │   └── tools/     # one file per tool
│   │   └── package.json   # bin: pulsar
│   │
│   └── api/               # hosted API server
│       ├── src/
│       │   ├── index.ts   # Express/Hono server
│       │   ├── mpp.ts     # MPP credential verification
│       │   ├── store.ts   # cumulative amount tracking (SQLite)
│       │   └── routes/    # one file per tool endpoint
│       └── package.json
│
├── package.json           # workspace root
└── .env.example
```

---

## Tech Stack

- **Runtime:** Node.js 22+, TypeScript, ES modules
- **MCP:** `@modelcontextprotocol/sdk`
- **Stellar:** `@stellar/stellar-sdk`, `@stellar/mpp`, `mppx`
- **ASGCard:** `@asgcard/sdk`
- **API Server:** Hono (lightweight, Cloudflare Workers compatible)
- **Store:** SQLite (via `better-sqlite3`) for channel state
- **Network:** Stellar testnet (mainnet-ready with env var switch)

---

## Key Decisions

**Why MCP stdio (not remote HTTP)?**
The private key and commitment key stay on the user's machine. The local process handles all signing — the server only sees MPP credential headers, never private keys.

**Why MPP session (not x402 per-call)?**
Per-call x402 on Stellar would be one on-chain USDC transfer per tool call. MPP sessions = 1 setup tx + unlimited off-chain signatures. For 100 tool calls, that's 100x cheaper in on-chain costs and significantly faster per call.

**Why not include an LLM router?**
Reselling AI inference means paying AI providers, managing margins, and building routing logic. That's a different business. PULSAR is a tool server, not an AI reseller.

**Agent commerce scope (MVP):**
`card` tool issues the Mastercard and puts details in Claude Code's context. Autonomous spending via programmatic card use is a future problem — needs specific API integrations (e.g., `domain_register` calling Cloudflare API with card details directly).

---

## What Makes This Hackathon-Worthy

1. **Novel:** First MCP server on Stellar. First MPP session billing for tool calls.
2. **Technically deep:** Demonstrates x402 + MPP session + ASGCard (3 payment primitives).
3. **Demo-able:** One-line install. Real tool calls. Real USDC on Stellar testnet.
4. **Useful beyond the hackathon:** 14 tools Claude Code actually needs daily.
5. **Exploits Stellar's structural advantage:** Off-chain micropayments make per-tool-call billing economically viable in a way EVM can't match.
