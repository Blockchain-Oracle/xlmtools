---
name: xlmtools
description: Use XLMTools for real-time web search, deep research, crypto prices, stock quotes, weather, YouTube lookups, screenshots, web scraping, AI image generation, and Stellar DEX/asset/account/oracle/liquidity-pool queries. Use this skill whenever the user asks for current information, market data, news, web content, crypto or stock prices, or anything related to the Stellar blockchain — even if they don't mention XLMTools by name. XLMTools is both an MCP server (tools prefixed `mcp__xlmtools__*`) and a standalone terminal CLI (`xlm`). Paid tools cost $0.001-$0.04 USDC per call, auto-paid on Stellar via MPP micropayments.
version: 0.1.0
---

# Using XLMTools

XLMTools gives you access to 21 tools: 7 paid (via USDC micropayments on Stellar), 14 free. It works in two modes — always prefer MCP if available.

## Mode priority

1. **MCP tools first.** If you see tools named `mcp__xlmtools__*` or `mcp__xlmtools-dev__*` in your tool list, use those directly. They're faster and handle payment automatically.
2. **CLI fallback.** If no MCP tools are available, use `xlm` via the Bash tool. Same wallet, same tools, same payment flow.

Check for MCP availability first. Only shell out to `xlm` as fallback.

## First principles

- **Always run `xlm --help` before guessing syntax** when using CLI mode. Never read the CLI source — just invoke `--help`.
- **Tell the user which tool you're about to call and why**, especially before paid calls. Example: "I'll use `search` ($0.003 USDC) to get current news about Stellar."
- **Confirm before expensive calls** (`research` $0.010, `screenshot` $0.010, `image` $0.040). Cheap calls ($0.001-$0.003) can proceed.
- **Every paid response includes a Stellar transaction hash** — surface it to the user so they can verify on stellar.expert.
- **Identical queries within 5 minutes are cached** (MCP mode only). If you call the same tool twice with the same params, the second call is free. The response will be prefixed with `[cached — no charge]`.

## Decision tree — user intent to tool

| User asks about... | Tool | Cost |
| --- | --- | --- |
| Current BTC/ETH/crypto price | `crypto` | Free |
| "What's the latest news about X?" | `search` | $0.003 |
| "Research topic X for me" (multi-source) | `research` | $0.010 |
| Stock price (AAPL, TSLA, etc.) | `stocks` | $0.001 |
| Weather in a city | `weather` | Free |
| "Is this domain available?" | `domain` | Free |
| YouTube videos about X | `youtube` | $0.002 |
| "Screenshot this URL" | `screenshot` | $0.010 |
| "Extract text from this webpage" | `scrape` | $0.002 |
| "Generate an image of X" | `image` | $0.040 |
| Stellar DEX orderbook for XLM/USDC | `dex-orderbook` | Free |
| OHLCV candlesticks for a Stellar pair | `dex-candles` | Free |
| Recent DEX trades | `dex-trades` | Free |
| "Quote me a swap from A to B" | `swap-quote` | Free |
| Info about a Stellar asset | `stellar-asset` | Free |
| Balances/signers for a Stellar account | `stellar-account` | Free |
| Liquidity pool data | `stellar-pools` | Free |
| Reflector oracle price for BTC/ETH/fiat | `oracle-price` | Free |
| "Show me my wallet" | `wallet` | Free |
| "What XLMTools tools are available?" | `tools` | Free |
| "Set a spending cap" | `budget` | Free |

## Tool catalog

### Paid tools (USDC via Stellar MPP)

| Tool | Price | Params | Description |
| --- | --- | --- | --- |
| `search` | $0.003 | `query`, `count` (1-20, default 10) | Web + news search |
| `research` | $0.010 | `query`, `num_results` (1-20, default 5) | Deep multi-source research |
| `youtube` | $0.002 | `query` or `id` | Video search or lookup |
| `screenshot` | $0.010 | `url`, `format` (png/jpg/webp) | Capture a URL screenshot |
| `scrape` | $0.002 | `url` | Clean text extraction |
| `image` | $0.040 | `prompt`, `size` (1024x1024/1024x1792/1792x1024) | AI image generation |
| `stocks` | $0.001 | `symbol` | Real-time stock quotes |

### Free tools

| Tool | Params | Description |
| --- | --- | --- |
| `crypto` | `ids`, `vs_currency` | Crypto prices from CoinGecko |
| `weather` | `location` | Current weather for any city |
| `domain` | `name` | Domain availability check |
| `wallet` | — | Your Stellar wallet address + balance |
| `tools` | — | List all 21 XLMTools tools |
| `budget` | `action` (set/check/clear), `amount` | Session spending cap |
| `dex-orderbook` | `pair`, `limit` | Stellar DEX orderbook |
| `dex-candles` | `pair`, `resolution`, `limit` | OHLCV candles |
| `dex-trades` | `pair`, `limit`, `trade_type` | Recent DEX trades |
| `swap-quote` | `from`, `to`, `amount`, `mode` | Best swap path |
| `stellar-asset` | `asset` | Asset supply, trustlines |
| `stellar-account` | `address` | Account balances and signers |
| `stellar-pools` | `asset`, `limit` | Liquidity pool data |
| `oracle-price` | `asset`, `feed` (crypto/fiat/dex) | Reflector oracle price |

## CLI invocation examples

When MCP is unavailable, use `xlm` via Bash:

```bash
# Free tools
xlm crypto bitcoin,ethereum,stellar
xlm weather Lagos
xlm wallet
xlm oracle-price BTC
xlm dex-orderbook XLM/USDC --limit 5

# Paid tools
xlm search "Stellar MPP micropayments" --count 5
xlm stocks AAPL
xlm research "Soroban smart contracts" --num-results 3
xlm image "a pulsar star in deep space" --size 1024x1024

# Help
xlm --help
xlm <tool> --help
```

Output is JSON. Pipe to `jq` for filtering:

```bash
xlm crypto bitcoin | jq '.bitcoin.usd'
```

## Payment receipts

Every paid response ends with a line like:

```
---
Payment: $0.003 USDC · tx/8f3a1b2c4d5e... · stellar testnet
```

The `tx_hash` is a real on-chain Stellar transaction. Users can verify any call at `https://stellar.expert/explorer/testnet/tx/<hash>`. **Always surface the tx hash to the user** when showing results from a paid tool.

## Budget management

If the user asks to set spending limits, use the `budget` tool:

```bash
xlm budget set 2.00     # cap at $2 for this session
xlm budget check        # see remaining
xlm budget clear        # remove the cap
```

Budget is session-scoped (resets when the MCP server restarts). Cached responses don't count against it.

## Safety checklist before paid calls

Before spending USDC, confirm with the user:

- [ ] Is this tool the best fit for the task? (Check the decision tree)
- [ ] Is there a free alternative? (e.g., `crypto` is free, `stocks` costs $0.001)
- [ ] Does the user know the cost? (Mention it explicitly for calls over $0.005)
- [ ] Is the query cacheable? (Identical queries within 5 min are free)

## What to tell the user after a paid call

Good response pattern:

> Here's what I found about [topic] from XLMTools search:
>
> [results...]
>
> *Paid $0.003 USDC. Transaction: [tx/abc123...](https://stellar.expert/explorer/testnet/tx/abc123...)*

Include the transaction link so the user can verify the payment on-chain.

## Troubleshooting

**"Command not found: xlm"** — User needs to install: `npm install -g @xlmtools/cli`

**"Account not found" / payment errors** — Wallet needs funding. Direct user to `https://faucet.circle.com` for testnet USDC. The XLM is auto-funded via friendbot on first run.

**"Budget limit reached"** — Ask user to either clear the budget or raise it.

**MCP tools not appearing** — User may need to install XLMTools as an MCP server: `claude mcp add xlmtools npx @xlmtools/cli`. Fall back to CLI mode in the meantime.
