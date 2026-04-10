# PULSAR

Stellar-native MCP server with pay-per-call tools for AI agents. One-line install. No subscriptions. Every payment settles on-chain.

Built for the Stellar Agents x402/MPP hackathon.

## Quick start

PULSAR works with any MCP-compatible client, and also ships as a standalone CLI. Pick your flavour:

```bash
# Claude Code
claude mcp add pulsar npx @pulsar/mcp

# Standalone CLI (works without any MCP host)
npm install -g @pulsar/mcp

# Cursor, Windsurf, Claude Desktop, VS Code, Zed, Cline, Goose, 5ire, Continue, Roo, LibreChat
# Add to the client's MCP config:
#   { "command": "npx", "args": ["-y", "@pulsar/mcp"] }
```

See the [MCP Host Setup guide](/guides/mcp-setup) for exact config for each client.

On first run, PULSAR generates a Stellar testnet wallet, funds it with XLM via friendbot, and adds a USDC trustline — all automatically. This only happens on testnet. The only manual step is getting testnet USDC:

1. Run the install command above and make any tool call to trigger wallet setup
2. Go to [faucet.circle.com](https://faucet.circle.com), select Stellar, paste your wallet address
3. Done — all paid tools will now work

Your wallet is at `~/.pulsar/config.json`. The secret key never leaves your machine.

Note: Auto-wallet funding (friendbot XLM + USDC trustline) only runs on testnet. On mainnet, fund your wallet manually.

## What this does

PULSAR gives AI agents access to 21 tools. Paid tools cost $0.001 to $0.04 per call in USDC via Stellar's Micropayment Protocol. Free tools have no cost. No API keys needed. No accounts to create.

Works with every major MCP client (Claude Code, Claude Desktop, Cursor, Windsurf, VS Code Copilot, Cline, Zed, Continue, Goose, 5ire, Roo Code, LibreChat) and as a standalone `pulsar-cli` for direct terminal use.

## Tools

### Paid (USDC via Stellar MPP)

| Tool | Price | What it does |
| --- | --- | --- |
| search | $0.003 | Web and news search |
| research | $0.010 | Multi-source deep research with summaries |
| youtube | $0.002 | Video search and lookup |
| screenshot | $0.010 | Capture a screenshot of any URL |
| scrape | $0.002 | Extract clean text from any URL |
| image | $0.040 | AI image generation from text prompts |
| stocks | $0.001 | Real-time stock quotes |

### Free

| Tool | What it does |
| --- | --- |
| crypto | Cryptocurrency prices and market data |
| weather | Current weather for any city |
| domain | Domain availability check |
| budget | Set/check/clear session spending limits |
| wallet | Your Stellar wallet address and balance |
| tools | List all available tools and prices |
| dex-orderbook | Stellar DEX live orderbook |
| dex-candles | OHLCV candlestick data |
| dex-trades | Recent DEX trade history |
| swap-quote | Best swap path between assets |
| stellar-asset | Asset info, supply, trustlines |
| stellar-account | Account balances and signers |
| stellar-pools | Liquidity pool data |
| oracle-price | Reflector oracle prices |

## Standalone CLI

PULSAR also ships as a terminal tool. Same wallet, same payments, no MCP host needed.

```bash
npm install -g @pulsar/mcp

pulsar-cli wallet
pulsar-cli crypto bitcoin,stellar
pulsar-cli weather Lagos
pulsar-cli search "Stellar MPP" --count 5
pulsar-cli dex-orderbook XLM/USDC --limit 3
pulsar-cli --help
```

Every paid call prints a Stellar transaction hash you can verify on-chain.

## How payment works

```
You ask Claude to search for something
  -> CLI sends request to PULSAR API
  -> API returns 402 Payment Required
  -> mppx auto-builds a Soroban USDC transfer on Stellar
  -> Your local key signs it (key never leaves your machine)
  -> API verifies payment, calls the backend, returns results
  -> Response includes a Stellar transaction hash for verification
```

No manual steps. Every paid response includes a receipt:

```
Payment: $0.003 USDC · tx/8f3a1b2c... · stellar testnet
```

Verify any transaction at [stellar.expert](https://stellar.expert/explorer/testnet).

## Cost management

**Budget** — set a per-session spending cap so agents cannot overspend:

```
Set my budget to $2.00
```

Calls that would exceed the limit are blocked. Use `budget check` to see remaining balance.

**Caching** — identical queries within 5 minutes return cached results at no charge. You never pay twice for the same data.

## Architecture

```
Claude / Cursor / Windsurf (MCP client)
    |
    | stdio
    v
PULSAR CLI (@pulsar/mcp, runs locally)
    |  - auto-generated Stellar wallet
    |  - mppx handles 402 payments transparently
    |  - budget tracking + response caching
    |
    | HTTPS + signed MPP credentials
    v
PULSAR API Server (Express, hosted)
    |  - verifies payments via Soroban simulation
    |  - calls backend APIs (Brave, Exa, OpenAI, etc.)
    |  - users never need backend API keys
    |  - in-memory call log for stats
    |
    v
Stellar Testnet (USDC settlement)
```

## Project structure

```
packages/
  cli/   - MCP server (local, user's machine)
  api/   - Express API (hosted, verifies MPP, calls backends)
  web/   - Next.js frontend (landing page, tools, explorer)
  docs/  - Nextra documentation site (29 pages)
```

## Documentation

Full documentation covering installation, all 21 tools, payment flow, MCP host setup for Claude/Cursor/Windsurf, API reference, and FAQ.

```bash
cd packages/docs && pnpm dev
```

## Docker

```bash
# 1. Copy and configure env
cp packages/api/.env.example packages/api/.env
# Edit packages/api/.env with your API keys

# 2. Run
docker compose up -d

# 3. Verify
curl http://localhost:3000/health
```

The Docker setup runs the API server only. The CLI (`@pulsar/mcp`) runs locally on the user's machine via `npx`.

## Development

```bash
pnpm install

# API server (needs .env with backend API keys)
pnpm dev:api

# CLI in dev mode
pnpm dev:cli

# Frontend
cd packages/web && pnpm dev

# Docs
cd packages/docs && pnpm dev
```

### Environment variables (API server only)

| Variable | Purpose |
| --- | --- |
| STELLAR_RECIPIENT | Stellar public key receiving USDC payments |
| MPP_SECRET_KEY | Random string for mppx credential verification |
| BRAVE_API_KEY | Brave Search API |
| EXA_API_KEY | Exa research API |
| YOUTUBE_API_KEY | YouTube Data API |
| SCREENSHOTONE_KEY | ScreenshotOne API |
| OPENAI_API_KEY | OpenAI (DALL-E 3) |
| ALPHA_VANTAGE_KEY | Alpha Vantage stock data |
| OPENWEATHER_API_KEY | OpenWeatherMap |

Users never configure these. They install, fund their wallet, and use tools.

## Tech stack

- TypeScript, Node.js 22+, ES modules
- @modelcontextprotocol/sdk (MCP)
- @stellar/stellar-sdk, @stellar/mpp, mppx (Stellar MPP payments)
- Express 5 (API), Next.js 16 (frontend), Nextra 4 (docs)
- Zod 4 (validation), pino (logging)
- Stellar testnet, USDC

## What makes this different

1. First MCP server on Stellar with MPP billing
2. Pay per call, not per month. No API keys for users to manage
3. 21 tools covering web, media, finance, and the full Stellar DEX
4. Response caching and budget enforcement built in
5. Every payment verifiable on-chain with a real Stellar transaction hash
6. Direct settlement via MPP charge mode on Soroban

## License

MIT
