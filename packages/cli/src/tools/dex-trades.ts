import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";

export function registerDexTradesTool(server: McpServer): void {
  server.registerTool(
    "dex-trades",
    {
      title: "Stellar DEX Trades",
      description:
        `Get recent trades for any Stellar asset pair.\n` +
        `Filter by trade type: "all", "orderbook", or "liquidity_pool".\nFree.`,      inputSchema: z.object({
        pair: z
          .string()
          .describe('Asset pair (e.g. "XLM/USDC")'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(200)
          .default(10)
          .describe("Number of trades (1-200)"),
        trade_type: z
          .enum(["all", "orderbook", "liquidity_pool"])
          .default("all")
          .describe("Filter by trade source"),
      }),
    },
    async ({ pair, limit, trade_type }) => {
      logger.debug({ pair, limit, trade_type }, "dex-trades invoked");
      try {
        const config = loadOrCreateWallet();
        const params = new URLSearchParams({
          pair,
          limit: String(limit),
          trade_type,
        });
        const res = await fetch(`${config.apiUrl}/dex-trades?${params}`);
        if (!res.ok) {
          const body = await res.text();
          return err(`Trades error ${res.status}: ${body}`);
        }
        return ok(await res.json());
      } catch (e) {
        logger.error({ err: e }, "dex-trades error");
        return err(`Trades failed: ${String(e)}`);
      }
    }
  );
}
