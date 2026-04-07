import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";

export function registerDexCandlesTool(server: McpServer): void {
  server.registerTool(
    "dex-candles",
    {
      title: "Stellar DEX Price Candles",
      description:
        `Get OHLCV candlestick price data for any Stellar asset pair.\n` +
        `Resolutions: 1m, 5m, 15m, 1h, 1d, 1w.\n` +
        `Examples: "XLM/USDC" at "1h", "USDC/EURC" at "1d".\nFree.`,      inputSchema: z.object({
        pair: z
          .string()
          .describe('Asset pair (e.g. "XLM/USDC")'),
        resolution: z
          .enum(["1m", "5m", "15m", "1h", "1d", "1w"])
          .default("1h")
          .describe("Candle interval"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(200)
          .default(20)
          .describe("Number of candles (1-200)"),
      }),
    },
    async ({ pair, resolution, limit }) => {
      logger.debug({ pair, resolution, limit }, "dex-candles invoked");
      try {
        const config = loadOrCreateWallet();
        const params = new URLSearchParams({
          pair,
          resolution,
          limit: String(limit),
        });
        const res = await fetch(`${config.apiUrl}/dex-candles?${params}`);
        if (!res.ok) {
          const body = await res.text();
          return err(`Candles error ${res.status}: ${body}`);
        }
        return ok(await res.json());
      } catch (e) {
        logger.error({ err: e }, "dex-candles error");
        return err(`Candles failed: ${String(e)}`);
      }
    }
  );
}
