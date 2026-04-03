# PULSAR

**Stellar-native MCP server for Claude Code. 12 tools. Billed via Stellar USDC.**

One-line install:

```bash
claude mcp add pulsar npx @pulsar/mcp
```

## What is this?

PULSAR gives Claude Code 12 useful tools — web search, research, image generation, and more — all billed through MPP (Machine Payment Protocol) on Stellar. Fund once with testnet USDC. Every tool call pays automatically via an on-chain USDC transfer. No subscriptions. No API keys to manage.

**The name:** A pulsar is a rapidly rotating neutron star that emits precise, regular pulses. That's what this does — precise micropayment pulses on Stellar, one per tool call.

## Why this exists

| | EVM (BlockRun MCP) | Stellar (PULSAR) |
|---|---|---|
| Payment | x402 per-call on Base | MPP charge on Stellar |
| 100 tool calls | 100 on-chain txs | 100 on-chain txs (charge mode) |
| Tools | 9 | 12 |
| Network | Base (EVM) | Stellar testnet |

No Stellar equivalent of this existed before PULSAR.

## Tools

### Paid (USDC via Stellar MPP)

| Tool | Cost | What it does |
|------|------|-------------|
| `search` | $0.003 | Web + news search (Brave) |
| `research` | $0.010 | Deep neural research (Exa) |
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

That's it. No API keys, no accounts, no configuration.

## How payments work

PULSAR uses [MPP charge mode](https://stellar.org/mpp) — a direct payment protocol on Stellar. No external facilitator needed.

```
You: "Search for the latest Stellar news"

1. CLI sends request to PULSAR API server
2. Server responds: 402 Payment Required — "pay 0.003 USDC to G..."
3. Mppx (fetch polyfill on CLI) auto-builds a Soroban SAC USDC transfer
4. Signs it with your LOCAL Stellar private key (never leaves your machine)
5. Sends signed transaction back to server
6. Server verifies via simulation, broadcasts to Stellar network
7. 0.003 USDC settles on-chain from your wallet → server wallet
8. Server calls Brave Search API, returns results
9. Results appear in Claude Code

Cost: $0.003 USDC — deducted automatically
```

**Key security points:**
- Your private key lives in `~/.pulsar/config.json` on YOUR machine only
- The server never sees your private key — only the signed transaction
- The server only needs a public key (to receive payments) and a random secret (for mppx credential verification)
- Every payment is a real on-chain Stellar USDC transfer you can verify

## Architecture

```
Claude Code (MCP client)
    │
    │ stdio (local process)
    ▼
PULSAR CLI  (~/.pulsar/config.json)
    │  - auto-generated Stellar keypair (private key stays local)
    │  - Mppx polyfills fetch to handle 402 payments transparently
    │  - 12 MCP tools registered
    │
    │ HTTPS + signed MPP payment credentials
    ▼
PULSAR API Server  (Express)
    │  - STELLAR_RECIPIENT: public key receiving USDC
    │  - MPP_SECRET_KEY: random string for mppx verification
    │  - verifies signed tx via Soroban simulation
    │  - broadcasts to Stellar network
    │  - calls backend APIs with server-side API keys
    │  - users never need API keys
    │
    ├── Brave Search    ├── Exa AI
    ├── YouTube Data    ├── ScreenshotOne
    ├── Jina Reader     ├── OpenAI DALL-E
    ├── Alpha Vantage   ├── CoinGecko
    ├── OpenWeatherMap  └── DNS (domain)
```

## Server deployment

### Docker

```bash
# 1. Copy and fill in your env
cp .env.example packages/api/.env

# 2. Run
docker-compose up -d
```

### Environment variables (server only)

| Variable | What it is |
|----------|-----------|
| `STELLAR_RECIPIENT` | Your Stellar public key (G...) — receives USDC payments |
| `MPP_SECRET_KEY` | Any random string — used by mppx for credential verification (NOT a Stellar key) |
| `BRAVE_API_KEY` | Server's Brave Search key — users never see this |
| `EXA_API_KEY` | Server's Exa key |
| `YOUTUBE_API_KEY` | Server's YouTube Data API key |
| `SCREENSHOTONE_KEY` | Server's ScreenshotOne key |
| `OPENAI_API_KEY` | Server's OpenAI key (for DALL-E 3) |
| `ALPHA_VANTAGE_KEY` | Server's Alpha Vantage key |
| `OPENWEATHER_API_KEY` | Server's OpenWeatherMap key |

Users don't configure any of these. They just install, fund their wallet, and use tools.

## Tech Stack

- **Runtime:** Node.js 22+, TypeScript, ES modules
- **MCP:** `@modelcontextprotocol/sdk`
- **Payments:** `@stellar/mpp` + `mppx` (MPP charge mode — no facilitator needed)
- **Stellar:** `@stellar/stellar-sdk` (testnet, mainnet-ready)
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

# Docker
docker-compose up -d
```

## Hackathon

Built for the **Stellar Agents x402 / Stripe / MPP** hackathon.

**Novel contributions:**
1. First MCP server on Stellar with MPP billing
2. Pay-per-query model — no API keys, no subscriptions for users
3. 12 tools Claude Code actually needs daily
4. Direct settlement via MPP charge — no external facilitator required
