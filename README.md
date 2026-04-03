# PULSAR

**Stellar-native MCP server for Claude Code. 13 tools. Billed via Stellar USDC.**

One-line install:

```bash
claude mcp add pulsar npx @pulsar/mcp
```

## What is this?

PULSAR gives Claude Code 13 useful tools — web search, research, image generation, and more — all billed through MPP (Machine Payment Protocol) on Stellar. Fund once with testnet USDC. Every tool call pays automatically via an on-chain USDC transfer. No subscriptions. No API keys to manage.

**The name:** A pulsar is a rapidly rotating neutron star that emits precise, regular pulses. That's what this does — precise micropayment pulses on Stellar, one per tool call.

## Why this exists

| | EVM (BlockRun MCP) | Stellar (PULSAR) |
|---|---|---|
| Payment | x402 per-call on Base | MPP charge on Stellar |
| 100 tool calls | 100 on-chain txs | 100 on-chain txs (charge mode) |
| Tools | 9 | 13 |
| Network | Base (EVM) | Stellar testnet |

No Stellar equivalent of this existed before PULSAR.

## Tools

### Paid (USDC via Stellar MPP)

| Tool | Cost | What it does |
|------|------|-------------|
| `search` | $0.003 | Web + news search (Brave) |
| `research` | $0.010 | Deep neural research (Exa) |
| `reddit` | $0.002 | Reddit posts + discussions |
| `youtube` | $0.002 | Video search + captions |
| `screenshot` | $0.010 | Screenshot any URL |
| `scrape` | $0.002 | Extract webpage content (Jina) |
| `image` | $0.040 | Generate images (DALL-E 3) |
| `stocks` | $0.001 | Stock prices (Alpha Vantage) |

### Free

| Tool | What it does |
|------|-------------|
| `crypto` | Crypto prices + market cap (CoinGecko) |
| `weather` | Current weather anywhere (OpenWeatherMap) |
| `domain` | Check domain availability (DNS) |
| `wallet` | Your Stellar USDC balance + fund instructions |
| `tools` | List all tools with pricing |

## Setup (2 minutes, once)

```bash
# 1. Add to Claude Code
claude mcp add pulsar npx @pulsar/mcp

# 2. Start Claude Code — first run generates your Stellar wallet
claude

# 3. Fund your wallet with testnet USDC:
#    a. Get testnet XLM: https://lab.stellar.org/account/fund
#    b. Get testnet USDC: https://faucet.circle.com (select Stellar Testnet)
#    c. Send USDC to the address PULSAR printed
```

## How billing works

```
You: "Search for the latest Stellar news"

Claude Code calls search("Stellar news")
  → PULSAR CLI sends request to PULSAR API
  → API responds with 402 Payment Required + USDC amount
  → Mppx (fetch polyfill) auto-builds Soroban SAC transfer
  → Signs with your local Stellar key
  → Retries request with payment proof
  → API verifies payment, calls Brave Search
  → Results returned to Claude Code

Cost: $0.003 USDC — deducted automatically
```

## Architecture

```
Claude Code (MCP client)
    │
    │ stdio (local process)
    ▼
PULSAR CLI process  (~/.pulsar/)
    │  - holds Stellar keypair locally
    │  - Mppx polyfills fetch to handle 402 payments
    │  - 13 MCP tools registered
    │
    │ HTTPS + MPP payment headers
    ▼
PULSAR API Server  (Express)
    │  - verifies MPP payment via mppx
    │  - calls backend APIs
    │  - returns tool results
    │
    ├── Brave Search    ├── Exa AI
    ├── Reddit OAuth    ├── YouTube Data API
    ├── ScreenshotOne   ├── Jina Reader
    ├── OpenAI DALL-E   ├── Alpha Vantage
    ├── CoinGecko       ├── OpenWeatherMap
    └── DNS (domain)
```

## Tech Stack

- **Runtime:** Node.js 22+, TypeScript, ES modules
- **MCP:** `@modelcontextprotocol/sdk`
- **Payments:** `@stellar/mpp`, `mppx` (MPP charge mode)
- **Stellar:** `@stellar/stellar-sdk` (testnet)
- **API Server:** Express 5
- **Logging:** pino

## Development

```bash
# Install deps
pnpm install

# Start API server
pnpm dev:api

# Start CLI in dev mode
pnpm dev:cli

# Build both
pnpm build
```

## Hackathon

Built for the **Stellar Agents x402 / Stripe / MPP** hackathon.

**Novel contributions:**
1. First MCP server on Stellar
2. First MPP charge billing for AI tool calls
3. 13 tools Claude Code actually needs daily
4. Pay-per-query model — no API keys, no subscriptions
