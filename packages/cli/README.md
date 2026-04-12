# @xlmtools/cli

Standalone CLI for XLMTools — 21 pay-per-call tools for AI agents on Stellar. Install it, type `xlm`, and go.

## Install

```bash
npm install -g @xlmtools/cli
```

On first run, XLMTools auto-generates a Stellar testnet wallet, funds it with XLM via friendbot, and adds a USDC trustline. The only manual step is grabbing testnet USDC from [faucet.circle.com](https://faucet.circle.com) to use paid tools.

## Usage

```bash
xlm <tool> [args] [--flag value]
```

### Quick examples

```bash
# Free tools — no cost
xlm crypto bitcoin,ethereum,stellar
xlm weather Lagos
xlm wallet
xlm oracle-price BTC
xlm dex-orderbook XLM/USDC --limit 5
xlm swap-quote XLM USDC 100
xlm stellar-asset USDC
xlm domain xlmtools.com
xlm tools

# Paid tools — USDC charged per call via Stellar MPP
xlm search "Stellar x402 micropayments" --count 5
xlm stocks AAPL
xlm research "Soroban smart contracts" --num-results 3
xlm youtube "Stellar blockchain"
xlm scrape https://stellar.org
xlm screenshot https://xlmtools.com --format png
xlm image "a stingray gliding over a coral reef at dusk" --size 1024x1024
```

Output is JSON. Pipe to `jq` for filtering:

```bash
xlm crypto bitcoin | jq '.bitcoin.usd'
```

### All commands

**Paid** ($0.001–$0.04 USDC per call, settled on Stellar testnet):

| Command | Price | What it does |
| --- | --- | --- |
| `xlm search <query> [--count N]` | $0.003 | Web + news search |
| `xlm research <query> [--num-results N]` | $0.010 | Multi-source deep research |
| `xlm youtube <query>` or `--id <id>` | $0.002 | Video search or lookup |
| `xlm screenshot <url> [--format png]` | $0.010 | Capture a URL screenshot |
| `xlm scrape <url>` | $0.002 | Extract clean text from a URL |
| `xlm image <prompt> [--size 1024x1024]` | $0.040 | AI image generation |
| `xlm stocks <symbol>` | $0.001 | Real-time stock quotes |

**Free** (no cost):

| Command | What it does |
| --- | --- |
| `xlm crypto <ids> [--vs-currency usd]` | Crypto prices from CoinGecko |
| `xlm weather <location>` | Current weather for any city |
| `xlm domain <name>` | Domain availability check |
| `xlm dex-orderbook <pair> [--limit N]` | Stellar DEX orderbook |
| `xlm dex-candles <pair> [--resolution 1h] [--limit N]` | OHLCV candlesticks |
| `xlm dex-trades <pair> [--limit N]` | Recent DEX trades |
| `xlm swap-quote <from> <to> <amount>` | Best swap path between assets |
| `xlm stellar-asset <asset>` | Asset info, supply, trustlines |
| `xlm stellar-account <address>` | Account balances and signers |
| `xlm stellar-pools [--asset X] [--limit N]` | Liquidity pool data |
| `xlm oracle-price <asset> [--feed crypto]` | Reflector oracle prices |
| `xlm wallet` | Your Stellar wallet address + balance |
| `xlm tools` | List all 21 tools and prices |
| `xlm --help` | Full help text |

## Payment

Every paid tool call produces a real Stellar testnet transaction. The receipt shows at the bottom of the output:

```
Payment: $0.003 USDC · tx/a3f9c28d71e0... · stellar testnet
```

Verify any payment at [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet).

## Wallet

Your wallet is at `~/.xlmtools/config.json`. The private key never leaves your machine. Check your balance:

```bash
xlm wallet
```

Fund with testnet USDC: visit [faucet.circle.com](https://faucet.circle.com), select Stellar, paste your wallet address.

## Also available as

- **MCP server**: `claude mcp add xlmtools npx @xlmtools/mcp` — for Claude Code, Cursor, Cline, VS Code Copilot, Windsurf, and 7+ other MCP hosts. Same wallet, same tools.
- **Agent Skill**: `pnpm dlx skills add github:Blockchain-Oracle/xlmtools --skill xlmtools` — teaches agents when and how to use each tool.

## Links

- [xlmtools.com](https://xlmtools.com) — website
- [docs.xlmtools.com](https://docs.xlmtools.com) — full documentation
- [api.xlmtools.com](https://api.xlmtools.com) — hosted API
- [GitHub](https://github.com/Blockchain-Oracle/xlmtools) — source code
- [`@xlmtools/mcp`](https://www.npmjs.com/package/@xlmtools/mcp) — MCP server package

---

## For contributors

This package provides two things:

1. The `xlm` binary (standalone CLI) at `dist/cli.js`
2. A `createMcpServer()` factory at `dist/server.js` — imported by [`@xlmtools/mcp`](https://www.npmjs.com/package/@xlmtools/mcp) to power the MCP stdio server

### Development

```bash
pnpm dev:cli    # from monorepo root
# or
cd packages/cli && pnpm dev
```

### Build

```bash
pnpm build
```

### Key files

| File | Purpose |
| --- | --- |
| `src/cli.ts` | Standalone `xlm` binary — arg parsing, URL building, response printing |
| `src/server.ts` | `createMcpServer()` factory — registers all 21 tools on a fresh McpServer |
| `src/lib/wallet.ts` | Wallet creation, testnet auto-funding |
| `src/lib/api-fetch.ts` | Shared fetch with `X-XLMTools-Client` header for stats attribution |
| `src/lib/budget.ts` | Session budget cap (`withBudget()` wrapper) |
| `src/lib/cache.ts` | 5-min response cache (`withCache()` wrapper) |
| `src/tools/*.ts` | One file per tool — each calls `server.registerTool(...)` |

## License

MIT
