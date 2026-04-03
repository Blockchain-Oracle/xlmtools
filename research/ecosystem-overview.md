# Stellar x402 / MPP Ecosystem Research

## Key Repos

### Stellar / x402
- **stellar/x402-stellar** — Official tools, examples, references
  - `examples/simple-paywall` — React frontend + Express server + local facilitator
  - `examples/facilitator` — Self-hosted facilitator service
- **Facilitator URLs**
  - Testnet: https://channels.openzeppelin.com/x402/testnet
  - Mainnet: https://channels.openzeppelin.com/x402

### OpenClaw Ecosystem (EVM, NOT Stellar)
- **daydreamsai/OpenClaw-x402** — Official plugin, routes through Daydreams Router
  - Uses ERC-2612 permits, EVM Base chain, NOT Stellar
  - Many people building OpenClaw skills/plugins for EVM
- **Key point**: OpenClaw x402 is entirely EVM-based. Stellar has NO equivalent.

### Lucid Agents (daydreamsai/lucid-agents)
- Framework for building/monetizing AI agents
- Supports EVM (Base) and Solana — **NOT Stellar**
- Features: agent-to-agent payments, AgentCard auto-discovery, x402 paywalls
- This is the closest thing to an "agent commerce platform" — but it's EVM/Solana only

### Daydreams Router
- Universal AI gateway (OpenAI, Anthropic, Google, Groq)
- Pay-per-use USDC micropayments via x402 on Base
- Live at router.daydreams.systems
- **Stellar equivalent does not exist**

## Gap Analysis (What's Missing on Stellar)
1. No agent-to-agent payment/discovery layer on Stellar
2. No Dreams Router equivalent (AI gateway with Stellar x402 payments)
3. No AgentCard-style service registry for x402 services on Stellar
4. No MCP server with MPP session payments (high-frequency, off-chain)
5. No pay-per-query search service on Stellar (explicitly mentioned as demand signal)

## Hackathon Concrete Demand Signals
- "Pay-per-query web search instead of monthly subscriptions"
- Brave Search on a usage basis for agent workflows like OpenClaw

## Payment Mode Comparison
| Mode | When to use | Settlement |
|------|-------------|------------|
| x402 exact | One-off requests, low frequency | On-chain per request |
| MPP charge | Per-request, no channel setup | On-chain per request |
| MPP session (channel) | High-frequency agents | Single on-chain close |

## MPP Session Key Facts
- Funder deposits USDC once into channel contract
- Each payment is an off-chain ed25519 signature (cumulative)
- No on-chain tx per payment — ideal for AI token billing
- Server settles by calling close() with the highest commitment
