import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";

export function registerStellarPoolsTool(server: McpServer): void {
  server.registerTool(
    "stellar-pools",
    {
      title: "Stellar Liquidity Pools",
      description:
        `Browse Stellar liquidity pools. Optionally filter by asset.\n` +
        `Shows reserves, shares, trustlines, and fees.\nFree.`,
      // @ts-expect-error -- zod 4 / MCP SDK type mismatch (runtime compatible)
      inputSchema: z.object({
        asset: z
          .string()
          .optional()
          .describe('Filter by asset (e.g. "XLM", "USDC"). Omit for all pools.'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(200)
          .default(10)
          .describe("Number of pools (1-200)"),
      }),
    },
    async ({ asset, limit }) => {
      logger.debug({ asset, limit }, "stellar-pools invoked");
      try {
        const config = loadOrCreateWallet();
        const params = new URLSearchParams({ limit: String(limit) });
        if (asset) params.set("asset", asset);
        const res = await fetch(`${config.apiUrl}/stellar-pools?${params}`);
        if (!res.ok) {
          const body = await res.text();
          return err(`Pools error ${res.status}: ${body}`);
        }
        return ok(await res.json());
      } catch (e) {
        logger.error({ err: e }, "stellar-pools error");
        return err(`Pools failed: ${String(e)}`);
      }
    }
  );
}
