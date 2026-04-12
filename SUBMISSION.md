<p align="center">
  <img src="./assets/xlmtools-header.svg" alt="XLMTools — Stellar-native MCP server with pay-per-call tools for AI agents" width="100%"/>
</p>

# The first Stellar-native MCP server with on-chain micropayments

**XLMTools** gives any AI agent 21 tools — web search, research, screenshots, stocks, the full Stellar DEX — and charges per call in USDC on Stellar testnet. No API keys. No subscriptions. No accounts. Every payment is a real Soroban SAC transfer with a verifiable transaction hash.

One line installs it into any MCP host:

```bash
claude mcp add xlmtools npx @xlmtools/mcp
```

That's it. A Stellar testnet wallet is auto-generated on first run, funded via friendbot, USDC trustline added, and your agent is ready to spend.

---

## The problem

Today's AI agents can reason, plan, and act — right up until they need to pay for something. Every service ships tools the same way: sign up, get an API key, handle billing, build rate limits, pay a monthly fee whether you use the tool or not. That friction makes it effectively impossible for an agent to discover a tool mid-task and pay for just the calls it needs.

If agents are going to buy, sell, coordinate, and earn on the open internet, they need rails that match the way they actually work: ephemeral, machine-to-machine, pay-per-call, no account provisioning. That's what x402 and MPP on Stellar are building toward. XLMTools is an existence proof.

## The solution

**A single MCP server that any agent can install with one line, with 21 tools behind HTTP 402 challenge-response.** When an agent calls a paid tool, the API returns `402 Payment Required`. The local `mppx` client auto-builds a Soroban Stellar Asset Contract USDC transfer, signs it with the agent's local wallet, retries the request with the payment proof, and gets the tool result plus an on-chain transaction hash. No subscriptions, no API keys, no dashboards — just HTTP and the Stellar blockchain.

It ships in two flavors:

| | |
| --- | --- |
| **MCP server** | `claude mcp add xlmtools npx @xlmtools/mcp` — works in Claude Code, Cursor, Cline, VS Code Copilot, Windsurf, Gemini CLI, OpenAI Codex, Zed, Continue, Goose, OpenCode, and any other MCP-capable host. |
| **Standalone CLI** | `npm install -g @xlmtools/cli` — gives you `xlm` in your terminal. Any agent with a Bash tool can use XLMTools even without MCP support, just by shelling out. |

Both share the same wallet, same payment flow, same 21 tools.

---

## Architecture

<p align="center">
  <img src="./assets/xlmtools-architecture.svg" alt="XLMTools architecture — five-step flow from MCP host to Stellar testnet" width="100%"/>
</p>

Every paid call follows the same five-step path:

1. **Agent host** (Claude Code, Cursor, etc.) spawns the MCP subprocess over stdio.
2. **`@xlmtools/mcp`** — a 15-line npx wrapper — receives the JSON-RPC call and imports the server factory from `@xlmtools/cli`.
3. **`@xlmtools/cli`** registers all 21 tools, handles the wallet, and makes the HTTPS call to the API. The `mppx` polyfill transparently converts any 402 response into a signed USDC transfer.
4. **`api.xlmtools.com`** verifies the MPP receipt via Soroban simulation, calls the backend (Brave, Exa, OpenAI, etc.), and returns the tool output with a Payment-Receipt header.
5. **Stellar testnet** settles the USDC SAC transfer in roughly one second. The returned transaction hash is a real, auditable payment.

---

## What's inside

### Paid tools (USDC via Stellar MPP)

| Tool | Price | Source |
| --- | --- | --- |
| `search` | $0.003 | Brave Search |
| `research` | $0.010 | Exa multi-source synthesis |
| `youtube` | $0.002 | YouTube Data API v3 |
| `screenshot` | $0.010 | ScreenshotOne |
| `scrape` | $0.002 | Clean text extraction |
| `image` | $0.040 | OpenAI DALL-E 3 |
| `stocks` | $0.001 | Alpha Vantage |

### Free tools

**Stellar-native** (pulled straight from Horizon / Reflector):
`dex-orderbook`, `dex-candles`, `dex-trades`, `swap-quote`, `stellar-asset`, `stellar-account`, `stellar-pools`, `oracle-price`

**General utility**: `crypto`, `weather`, `domain`, `wallet`, `tools`, `budget`

---

## What makes this different

1. **First MCP server on Stellar** with MPP charge-mode billing. BlockRun MCP does this pattern on EVM/Base. XLMTools is the Stellar analog.
2. **Every payment is on-chain** with a verifiable Stellar tx hash. No hidden billing ledger, no dashboards. Users can audit every call on [stellar.expert](https://stellar.expert/explorer/testnet).
3. **Two install paths from one source of truth** — MCP for agent hosts, CLI for terminal users, same wallet, same tools, zero duplication. Packaged as `@xlmtools/mcp` (thin wrapper) importing `createMcpServer()` from `@xlmtools/cli`.
4. **Works with every major MCP client** out of the box: Claude Code, Cursor, Cline, VS Code Copilot, Windsurf, Gemini CLI, OpenAI Codex, Zed, Continue, Goose, OpenCode. One install command per client, all documented.
5. **Per-address history** — paste any Stellar address into `xlmtools.com/stats` and see every tool call from that wallet, free and paid, newest first, live-refreshing. Attribution flows through an `X-XLMTools-Client` request header. Every agent can audit its own spending.
6. **Session budget + response caching** built in — agents cannot overspend, and identical queries within 5 minutes return cached results at no charge.
7. **Discovery by spec** — `api.xlmtools.com/.well-known/xlmtools.json` serves an agent-readable manifest with every tool, its price, and its parameters. An autonomous agent that has never heard of XLMTools can find it, install it, and start using it in one turn.

---

## Submission checklist

This submission satisfies all three Stellar Agents hackathon requirements explicitly:

| Requirement | Where it lives |
| --- | --- |
| **Open-source repo with detailed README** | [github.com/Blockchain-Oracle/xlmtools](https://github.com/Blockchain-Oracle/xlmtools) — monorepo with `packages/{api,cli,mcp,web,docs,skills}`. README includes quick start, architecture diagram, tool catalog, payment flow, development setup, and Docker instructions. Two additional docs: [`SUBMISSION.md`](./SUBMISSION.md) (this document) and [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md) for the video walkthrough. |
| **2–3 minute video demo** | Walks through the problem, the one-line install, a live paid tool call, the on-chain receipt, and the per-address history page. Script in [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md). |
| **Real Stellar testnet interaction** | Every paid tool call is a real Soroban SAC USDC transfer, verifiable on stellar.expert. The auto-created wallet is funded via Stellar friendbot. The free `oracle-price`, `dex-orderbook`, `dex-candles`, `dex-trades`, `swap-quote`, `stellar-asset`, `stellar-account`, and `stellar-pools` tools all read live data from Horizon, Reflector, and Stellar Expert. |

---

## Live

| What | Where |
| --- | --- |
| **Website** | [xlmtools.com](https://xlmtools.com) |
| **Documentation** | [docs.xlmtools.com](https://docs.xlmtools.com) |
| **API server** | [api.xlmtools.com](https://api.xlmtools.com) (health · `/.well-known/xlmtools.json` · `/stats`) |
| **GitHub** | [github.com/Blockchain-Oracle/xlmtools](https://github.com/Blockchain-Oracle/xlmtools) |
| **npm — MCP** | [`@xlmtools/mcp`](https://www.npmjs.com/package/@xlmtools/mcp) |
| **npm — CLI** | [`@xlmtools/cli`](https://www.npmjs.com/package/@xlmtools/cli) |
| **Demo video** | _[link added after recording]_ |

---

## Built for

**Stellar Hacks: Agents** — exploring what happens when agents don't just talk, but can buy, sell, coordinate, and earn. XLMTools fills a specific gap: until now, no MCP server on Stellar used MPP charge mode for real micropayment-gated tool access. It's the rails that let any AI agent, in any MCP-capable host, pay for tools on-chain with a single-line install and no account setup — the kind of primitive that has to exist before the agent economy can be more than a demo.

Stellar's fast settlement, low fees, stablecoin infrastructure, and Soroban authorization model are exactly the substrate this kind of pattern needs. XLMTools is one working example of what that enables.
