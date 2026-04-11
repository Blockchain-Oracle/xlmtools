import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";

export function registerDexOrderbookTool(server: McpServer): void {
  server.registerTool(
    "dex-orderbook",
    {
      title: "Stellar DEX Orderbook",
      description:
        `View the live orderbook for any Stellar asset pair. Shows bids, asks, and spread.\n` +
        `Use pairs like "XLM/USDC", "USDC/EURC", or "CODE:ISSUER/XLM".\n` +
        `Well-known assets: XLM, USDC, EURC, AQUA, yUSDC, BLND, SHX.\nFree.`,      inputSchema: z.object({
        pair: z
          .string()
          .describe('Asset pair (e.g. "XLM/USDC", "USDC/EURC")'),
        limit: z.coerce.number()
          .int()
          .min(1)
          .max(200)
          .default(10)
          .describe("Number of price levels per side (1-200)"),
      }),
    },
    async ({ pair, limit }) => {
      logger.debug({ pair, limit }, "dex-orderbook invoked");
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(
          `${config.apiUrl}/dex-orderbook?pair=${encodeURIComponent(pair)}&limit=${limit}`
        );
        if (!res.ok) {
          const body = await res.text();
          return err(`Orderbook error ${res.status}: ${body}`);
        }
        return ok(await res.json());
      } catch (e) {
        logger.error({ err: e }, "dex-orderbook error");
        return err(`Orderbook failed: ${String(e)}`);
      }
    }
  );
}
