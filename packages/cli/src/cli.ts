#!/usr/bin/env node

import { Mppx } from "mppx/client";
import { stellar } from "@stellar/mpp/charge/client";
import { Horizon } from "@stellar/stellar-sdk";
import { loadOrCreateWallet, getKeypair } from "./lib/wallet.js";
import { TOOL_PRICES } from "./lib/config.js";
import { logger } from "./lib/logger.js";

// ── Arg parsing ──────────────────────────────────────────

function parseArgs(argv: string[]) {
  const [tool, ...rest] = argv;
  const positional: string[] = [];
  const flags: Record<string, string> = {};

  for (let i = 0; i < rest.length; i++) {
    if (rest[i].startsWith("--") && i + 1 < rest.length) {
      const key = rest[i].slice(2).replace(/-/g, "_");
      flags[key] = rest[i + 1];
      i++;
    } else {
      positional.push(rest[i]);
    }
  }

  return { tool: tool ?? "", positional, flags };
}

// ── URL builder ──────────────────────────────────────────

function buildRequest(
  base: string,
  tool: string,
  pos: string[],
  flags: Record<string, string>,
): { url: string; init: RequestInit } {
  const p = new URLSearchParams();

  // Map each tool to its API endpoint + params
  const toolMap: Record<string, () => { path: string; method?: string; body?: string }> = {
    search:          () => { p.set("q", pos[0] ?? ""); if (flags.count) p.set("count", flags.count); return { path: "/search" }; },
    research:        () => { p.set("q", pos[0] ?? ""); if (flags.num_results) p.set("num_results", flags.num_results); return { path: "/research" }; },
    youtube:         () => { if (flags.id) p.set("id", flags.id); else p.set("q", pos[0] ?? flags.query ?? ""); return { path: "/youtube" }; },
    screenshot:      () => { p.set("url", pos[0] ?? ""); if (flags.format) p.set("format", flags.format); return { path: "/screenshot" }; },
    scrape:          () => { p.set("url", pos[0] ?? ""); return { path: "/scrape" }; },
    image:           () => ({ path: "/image", method: "POST", body: JSON.stringify({ prompt: pos[0] ?? "", size: flags.size ?? "1024x1024" }) }),
    stocks:          () => { p.set("symbol", pos[0] ?? ""); return { path: "/stocks" }; },
    crypto:          () => { p.set("ids", pos[0] ?? ""); if (flags.vs_currency) p.set("vs_currency", flags.vs_currency); return { path: "/crypto" }; },
    weather:         () => { p.set("location", pos[0] ?? ""); return { path: "/weather" }; },
    domain:          () => { p.set("name", pos[0] ?? ""); return { path: "/domain" }; },
    "dex-orderbook": () => { p.set("pair", pos[0] ?? ""); if (flags.limit) p.set("limit", flags.limit); return { path: "/dex-orderbook" }; },
    "dex-candles":   () => { p.set("pair", pos[0] ?? ""); if (flags.resolution) p.set("resolution", flags.resolution); if (flags.limit) p.set("limit", flags.limit); return { path: "/dex-candles" }; },
    "dex-trades":    () => { p.set("pair", pos[0] ?? ""); if (flags.limit) p.set("limit", flags.limit); if (flags.trade_type) p.set("trade_type", flags.trade_type); return { path: "/dex-trades" }; },
    "swap-quote":    () => { p.set("from", pos[0] ?? flags.from ?? ""); p.set("to", pos[1] ?? flags.to ?? ""); p.set("amount", pos[2] ?? flags.amount ?? ""); if (flags.mode) p.set("mode", flags.mode); return { path: "/swap-quote" }; },
    "stellar-asset": () => { p.set("asset", pos[0] ?? ""); return { path: "/stellar-asset" }; },
    "stellar-account": () => { p.set("address", pos[0] ?? ""); return { path: "/stellar-account" }; },
    "stellar-pools": () => { if (pos[0] || flags.asset) p.set("asset", pos[0] ?? flags.asset ?? ""); if (flags.limit) p.set("limit", flags.limit); return { path: "/stellar-pools" }; },
    "oracle-price":  () => { p.set("asset", pos[0] ?? ""); if (flags.feed) p.set("feed", flags.feed); return { path: "/oracle-price" }; },
  };

  const builder = toolMap[tool];
  if (!builder) {
    process.stderr.write(`Unknown tool: ${tool}\nRun xlm --help for available tools.\n`);
    process.exit(1);
  }

  const { path, method, body } = builder();
  const qs = p.toString();
  const url = qs ? `${base}${path}?${qs}` : `${base}${path}`;
  const init: RequestInit = { method: method ?? "GET" };
  if (body) {
    init.headers = { "Content-Type": "application/json" };
    init.body = body;
  }

  return { url, init };
}

// ── Local tool handlers ──────────────────────────────────

async function handleWallet(publicKey: string) {
  const server = new Horizon.Server("https://horizon-testnet.stellar.org");
  try {
    const account = await server.loadAccount(publicKey);
    const xlm = account.balances.find(
      (b: Horizon.HorizonApi.BalanceLine) => b.asset_type === "native",
    );
    const usdc = account.balances.find(
      (b: Horizon.HorizonApi.BalanceLine) =>
        "asset_code" in b && b.asset_code === "USDC",
    );
    return {
      address: publicKey,
      network: "stellar:testnet",
      xlm_balance: xlm?.balance ?? "0",
      usdc_balance: usdc && "balance" in usdc ? usdc.balance : "0",
    };
  } catch {
    return {
      address: publicKey,
      network: "stellar:testnet",
      xlm_balance: "0",
      usdc_balance: "0",
      note: "Account not funded yet",
    };
  }
}

function handleTools() {
  const paid = Object.entries(TOOL_PRICES).map(([name, price]) => ({
    name,
    price: `$${price}`,
  }));
  // Note: `budget` is MCP-only — the CLI is a fresh process per invocation
  // so a session-scoped cap is meaningless. Excluded from the CLI's free list.
  const free = [
    "crypto", "weather", "domain", "wallet", "tools",
    "dex-orderbook", "dex-candles", "dex-trades", "swap-quote",
    "stellar-asset", "stellar-account", "stellar-pools", "oracle-price",
  ];
  return { paid, free, network: "stellar:testnet", payment: "MPP / USDC" };
}

// ── Help text ────────────────────────────────────────────

const HELP = `XLMTools CLI — Stellar-native tools with pay-per-call

Usage: xlm <tool> [args] [--flag value]

Paid tools ($0.001-$0.04 USDC via Stellar MPP):
  search <query> [--count N]            Web search
  research <query> [--num-results N]    Deep research
  youtube <query> | --id <id>           YouTube search/lookup
  screenshot <url> [--format png]       Capture URL screenshot
  scrape <url>                          Extract text from URL
  image <prompt> [--size 1024x1024]     AI image generation
  stocks <symbol>                       Stock quotes

Free tools:
  crypto <ids> [--vs-currency usd]      Crypto prices
  weather <location>                    Current weather
  domain <name>                         Domain availability
  dex-orderbook <pair> [--limit N]      Stellar DEX orderbook
  dex-candles <pair>                    OHLCV candlesticks
  dex-trades <pair>                     Recent DEX trades
  swap-quote <from> <to> <amount>       DEX swap pathfinding
  stellar-asset <asset>                 Asset info
  stellar-account <address>             Account lookup
  stellar-pools [--asset X]             Liquidity pools
  oracle-price <asset> [--feed crypto]  Oracle prices
  wallet                                Your Stellar wallet
  tools                                 List all tools

Examples:
  xlm search "Stellar MPP micropayments"
  xlm crypto bitcoin,ethereum,stellar
  xlm weather Lagos
  xlm stocks AAPL
  xlm dex-orderbook XLM/USDC --limit 5
  xlm wallet
`;

// ── Main ─────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    process.stdout.write(HELP);
    return;
  }

  const { tool, positional, flags } = parseArgs(args);

  // Init wallet + mppx (payment handling)
  const config = loadOrCreateWallet();
  const keypair = getKeypair(config);

  Mppx.create({
    methods: [
      stellar.charge({
        keypair,
        mode: "pull",
        onProgress(event) {
          logger.debug({ eventType: event.type }, "MPP payment event");
        },
      }),
    ],
  });

  // ── Local tools (no API call needed) ──

  if (tool === "wallet") {
    const data = await handleWallet(config.stellarPublicKey);
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (tool === "tools") {
    console.log(JSON.stringify(handleTools(), null, 2));
    return;
  }

  // ── API tools ──

  const isPaid = tool in TOOL_PRICES;
  const { url, init } = buildRequest(config.apiUrl, tool, positional, flags);

  if (isPaid) {
    process.stderr.write(`  Tool: ${tool} · Cost: $${TOOL_PRICES[tool]} USDC\n`);
  }

  const res = await fetch(url, init);

  if (!res.ok) {
    const text = await res.text();
    process.stderr.write(`Error ${res.status}: ${text}\n`);
    process.exit(1);
  }

  const data = (await res.json()) as Record<string, unknown>;

  // Print receipt footer for paid tools
  if (isPaid && data.receipt) {
    const { receipt, ...rest } = data;
    const r = receipt as { tx_hash: string; amount: string; currency: string; network: string };
    console.log(JSON.stringify(rest, null, 2));
    const hash = r.tx_hash.length > 16 ? r.tx_hash.slice(0, 16) + "..." : r.tx_hash;
    const network = r.network === "stellar:testnet" ? "stellar testnet" : r.network;
    process.stderr.write(`\n  Payment: $${r.amount} ${r.currency} · tx/${hash} · ${network}\n`);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

main().catch((e) => {
  logger.error({ err: e }, "CLI fatal error");
  process.exit(1);
});
