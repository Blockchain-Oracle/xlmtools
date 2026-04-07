import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";

export function registerOraclePriceTool(server: McpServer): void {
  server.registerTool(
    "oracle-price",
    {
      title: "Stellar Oracle Price",
      description:
        `Get real-time prices from Reflector, Stellar's decentralized oracle.\n` +
        `Feeds: "crypto" (BTC, ETH, SOL, etc.), "fiat" (EUR, GBP, JPY), "dex" (Stellar DEX pairs).\n` +
        `Prices are updated every 5 minutes via multi-node consensus.\nFree.`,      inputSchema: z.object({
        asset: z
          .string()
          .describe('Asset ticker (e.g. "BTC", "ETH", "EUR", "SOL")'),
        feed: z
          .enum(["crypto", "fiat", "dex"])
          .default("crypto")
          .describe("Oracle feed to query"),
      }),
    },
    async ({ asset, feed }) => {
      logger.debug({ asset, feed }, "oracle-price invoked");
      try {
        const config = loadOrCreateWallet();
        const params = new URLSearchParams({ asset, feed });
        const res = await fetch(`${config.apiUrl}/oracle-price?${params}`);
        if (!res.ok) {
          const body = await res.text();
          return err(`Oracle error ${res.status}: ${body}`);
        }
        return ok(await res.json());
      } catch (e) {
        logger.error({ err: e }, "oracle-price error");
        return err(`Oracle failed: ${String(e)}`);
      }
    }
  );
}
