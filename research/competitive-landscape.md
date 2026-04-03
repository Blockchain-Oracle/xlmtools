# Competitive Landscape — Stellar Agents x402/MPP Hackathon

## Already Built on Stellar (Competition)

### Allen-Saji/agent-bazaar (April 1, strong entry)
- Free service registry (SKILL.md discovery, SQLite)
- LLM-planned orchestration of x402-gated agents
- x402 per-request USDC on Stellar
- MCP integration with Claude Code (4 tools)
- Reputation tracking, fallback routing, dynamic pricing
- **Verdict: Agent marketplace is well-covered**

### HuydZzz/agentforge (March 31)
- Orchestrator + specialist agent marketplace
- x402 micropayments on Stellar

### stellar-experimental/stellar-mpp-demo (March 21)
- CLI-style terminal chat gated by MPP channel (session mode)
- Frontend → MPP server (402) → Cloudflare AI Worker
- Cloudflare Workers + Soroban one-way-channel
- **Uses MPP sessions but is a demo, not a production tool**

### ASGCompute/stellar-mpp-payments-skill (April 2)
- AI skill/docs for building MPP flows on Stellar
- References Stripe MPP → Stellar MPP adaptation
- Not a live service, more of an educational resource

---

## Hot Trends on EVM x402 (Inspiration)

### BlockRunAI/blockrun-mcp — MOST RELEVANT
- MCP server for Claude Code: web search, Exa, Twitter, markets, image gen, multi-model chat
- x402 pay-per-call on Base (EVM)
- `claude mcp add blockrun npx @blockrun/mcp` — one-line install
- Auto-creates wallet, user funds with USDC on Base
- **Stellar equivalent does NOT exist**

### BlockRunAI/ClawRouter — USDC Hackathon Winner
- LLM router for autonomous agents, no API keys
- x402 USDC on Base/Solana, 55+ models
- Smart 15-dimension routing (<1ms)
- **Stellar equivalent does NOT exist**

### microchipgnu/MCPay
- Registry + proxy for MCP servers with x402 payments
- mcpay.tech — browse and register MCP servers
- Server can become paid with zero friction
- **Stellar equivalent does NOT exist**

### nach-dakwale/instadomain-mcp — KEY REFERENCE
- Domain registration MCP server for Claude Code
- **Stripe checkout OR x402 USDC (both options)**
- Perfect example of dual Stripe + crypto payment

### vercel-labs/x402-ai-starter
- Next.js + AI SDK with x402 payments
- Remote MCP server with paid tools
- Coinbase CDP-managed wallets

---

## The Gap (What Nobody Has Built for Stellar)

1. **No MCP server with Stellar x402/MPP billing** — the blockrun-mcp equivalent
2. **No MCP server with MPP sessions** — fund channel once, unlimited off-chain tool calls
3. **No LLM router on Stellar** — the Dreams Router / ClawRouter equivalent
4. **No Stripe + Stellar x402 combo** — like instadomain-mcp but on Stellar
5. **No pay-per-token AI inference via MPP sessions** — the ultimate use case for channel mode

---

## Why MPP Sessions Win for AI Tool Calls
- EVM x402: every tool call = 1 on-chain USDC transfer ($$$)
- Stellar MPP session: fund channel once, sign 1000s of off-chain commitments, settle once
- For 100 tool calls: EVM = 100 txs | Stellar MPP = 1 tx on-chain + 100 signatures
- This is Stellar's unique structural advantage for AI agents

---

## Hackathon Payment Protocols
The hackathon name is: stellar-agents-x402-stripe-mpp
- **x402** — Coinbase/Stellar HTTP 402 micropayment protocol
- **Stripe** — Traditional Stripe payments (fiat on-ramp, likely for human-facing demos)
- **MPP** — Stellar Machine Payment Protocol (charge + session modes)
