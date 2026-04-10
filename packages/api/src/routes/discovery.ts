import { Router } from "express";
import { TOOL_PRICES } from "../lib/pricing.js";

export const discoveryRoute = Router();

const TOOLS = [
  // Paid
  { name: "search", description: "Real-time web and news search", price: TOOL_PRICES.search, method: "GET", path: "/search", params: ["q", "count"] },
  { name: "research", description: "Multi-source deep research with summaries", price: TOOL_PRICES.research, method: "GET", path: "/research", params: ["q", "num_results"] },
  { name: "youtube", description: "YouTube video search and lookup", price: TOOL_PRICES.youtube, method: "GET", path: "/youtube", params: ["q", "id"] },
  { name: "screenshot", description: "Capture a screenshot of any URL", price: TOOL_PRICES.screenshot, method: "GET", path: "/screenshot", params: ["url", "format"] },
  { name: "scrape", description: "Extract clean text from any URL", price: TOOL_PRICES.scrape, method: "GET", path: "/scrape", params: ["url"] },
  { name: "image", description: "AI image generation from text prompts", price: TOOL_PRICES.image, method: "POST", path: "/image", params: ["prompt", "size"] },
  { name: "stocks", description: "Real-time stock quotes and market data", price: TOOL_PRICES.stocks, method: "GET", path: "/stocks", params: ["symbol"] },
  // Free
  { name: "crypto", description: "Cryptocurrency prices and market data", price: null, method: "GET", path: "/crypto", params: ["ids", "vs_currency"] },
  { name: "weather", description: "Current weather for any city", price: null, method: "GET", path: "/weather", params: ["location"] },
  { name: "domain", description: "Domain name availability check", price: null, method: "GET", path: "/domain", params: ["name"] },
  { name: "dex-orderbook", description: "Stellar DEX live orderbook", price: null, method: "GET", path: "/dex-orderbook", params: ["pair", "limit"] },
  { name: "dex-candles", description: "DEX candlestick OHLCV data", price: null, method: "GET", path: "/dex-candles", params: ["pair", "resolution", "limit"] },
  { name: "dex-trades", description: "Recent DEX trade history", price: null, method: "GET", path: "/dex-trades", params: ["pair", "limit"] },
  { name: "swap-quote", description: "Best swap path between assets", price: null, method: "GET", path: "/swap-quote", params: ["from", "to", "amount", "mode"] },
  { name: "stellar-asset", description: "Asset info, supply, and trustlines", price: null, method: "GET", path: "/stellar-asset", params: ["asset"] },
  { name: "stellar-account", description: "Account balances and signers", price: null, method: "GET", path: "/stellar-account", params: ["address"] },
  { name: "stellar-pools", description: "Liquidity pool data", price: null, method: "GET", path: "/stellar-pools", params: ["asset", "limit"] },
  { name: "oracle-price", description: "Reflector oracle prices", price: null, method: "GET", path: "/oracle-price", params: ["asset", "feed"] },
];

/**
 * /.well-known/pulsar.json — machine-readable service discovery
 */
discoveryRoute.get("/pulsar.json", (_req, res) => {
  res.json({
    name: "PULSAR",
    version: "0.1.0",
    description: "Stellar-native MCP server with 21 pay-per-call tools for AI agents",
    protocol: "MCP (Model Context Protocol)",
    install: "claude mcp add pulsar npx @pulsar/mcp",
    payment: {
      protocol: "MPP (Machine Payment Protocol)",
      network: "stellar:testnet",
      currency: "USDC",
      settlement: "~5 seconds",
      pattern: "HTTP 402 challenge-response with Soroban SAC transfer",
    },
    tools: TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      price_usdc: t.price,
      free: t.price === null,
      method: t.method,
      path: t.path,
      params: t.params,
    })),
    features: [
      "Spending receipts — Stellar tx hash in every paid response",
      "Session budget — per-session spending cap",
      "Response caching — 5-min TTL, identical queries free",
      "Auto-wallet — testnet wallet created and funded on first run",
    ],
    links: {
      github: "https://github.com/pulsarmcp/pulsar",
      docs: "/docs",
      stats: "/stats",
      health: "/health",
    },
  });
});

/**
 * /llms.txt — plain-text service description for LLMs
 */
discoveryRoute.get("/", (_req, res) => {
  const paid = TOOLS.filter((t) => t.price !== null);
  const free = TOOLS.filter((t) => t.price === null);

  const text = `# PULSAR — Stellar-Native MCP Tools

PULSAR is an MCP server that gives AI agents access to 21 tools, paid via USDC micropayments on Stellar.

## Install
claude mcp add pulsar npx @pulsar/mcp

## Payment
Paid tools use Stellar's Micropayment Protocol (MPP). Each call triggers an automatic USDC payment on-chain. No API keys or subscriptions needed.

## Paid Tools (${paid.length})
${paid.map((t) => `- ${t.name}: ${t.description} ($${t.price} USDC)`).join("\n")}

## Free Tools (${free.length})
${free.map((t) => `- ${t.name}: ${t.description}`).join("\n")}

## Features
- Every paid response includes a Stellar transaction hash for on-chain verification
- Session budget control (set a max spend per session)
- Response caching (identical queries within 5 min are free)
- Auto-wallet creation and funding on testnet

## Links
- API: /health, /stats, /stats/recent
- Discovery: /.well-known/pulsar.json
- GitHub: https://github.com/pulsarmcp/pulsar
`;

  res.type("text/plain").send(text);
});
