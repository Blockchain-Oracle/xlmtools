# @xlmtools/mcp

XLMTools MCP server — a thin stdio wrapper that gives any MCP-capable agent host access to 21 Stellar-native and web tools with pay-per-call USDC micropayments on Stellar.

## Install

```bash
# Claude Code
claude mcp add xlmtools npx @xlmtools/mcp

# Gemini CLI
gemini mcp add xlmtools npx -y @xlmtools/mcp

# OpenAI Codex
codex mcp add xlmtools npx -y @xlmtools/mcp

# Cursor / Windsurf / Claude Desktop / Cline (add to MCP config JSON)
{ "command": "npx", "args": ["-y", "@xlmtools/mcp"] }

# VS Code Copilot (.vscode/mcp.json — note: "servers", not "mcpServers")
{ "type": "stdio", "command": "npx", "args": ["-y", "@xlmtools/mcp"] }
```

See the [MCP Host Setup guide](https://docs.xlmtools.com/guides/mcp-setup) for exact config for all 12 supported clients.

## What you get

**Paid tools** ($0.001–$0.04 USDC per call, settled on Stellar testnet via MPP):

| Tool | Price | Source |
| --- | --- | --- |
| `search` | $0.003 | Brave Search |
| `research` | $0.010 | Exa |
| `youtube` | $0.002 | YouTube Data API |
| `screenshot` | $0.010 | ScreenshotOne |
| `scrape` | $0.002 | Text extraction |
| `image` | $0.040 | OpenAI DALL-E 3 |
| `stocks` | $0.001 | Alpha Vantage |

**Free tools** (14): `crypto`, `weather`, `domain`, `wallet`, `tools`, `budget`, `dex-orderbook`, `dex-candles`, `dex-trades`, `swap-quote`, `stellar-asset`, `stellar-account`, `stellar-pools`, `oracle-price`

## How it works

On first run, XLMTools auto-generates a Stellar testnet wallet at `~/.xlmtools/config.json`, funds it with XLM via friendbot, and adds a USDC trustline. Paid tool calls trigger an HTTP 402 challenge-response — the local `mppx` client signs a Soroban SAC USDC transfer, retries with payment proof, and returns the result plus a verifiable Stellar transaction hash.

## Architecture

This package is a ~15-line stdio wrapper. It imports `createMcpServer()` from [`@xlmtools/cli`](https://www.npmjs.com/package/@xlmtools/cli) (which owns all 21 tool implementations, the wallet, budget tracking, and response caching) and connects it to an MCP `StdioServerTransport`. The two packages are published separately because npx requires a single-bin package to auto-resolve — shipping MCP and CLI as separate single-bin packages is the only way `npx @xlmtools/mcp` works without a `-p` flag.

## Also available as

- **Standalone CLI**: `npm install -g @xlmtools/cli` — gives you `xlm` in your terminal. Same wallet, same tools.
- **Agent Skill**: `pnpm dlx skills add github:Blockchain-Oracle/xlmtools --skill xlmtools` — teaches agents when and how to use each tool.

## Links

- [xlmtools.com](https://xlmtools.com) — landing page
- [docs.xlmtools.com](https://docs.xlmtools.com) — full documentation
- [api.xlmtools.com](https://api.xlmtools.com) — hosted API server
- [GitHub](https://github.com/Blockchain-Oracle/xlmtools) — source code
- [`@xlmtools/cli`](https://www.npmjs.com/package/@xlmtools/cli) — standalone CLI + server factory

## License

MIT
