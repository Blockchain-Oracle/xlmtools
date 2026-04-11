import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { okPaid, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";
import { TOOL_PRICES } from "../lib/config.js";
import { withBudget } from "../lib/budget.js";
import { withCache } from "../lib/cache.js";

export function registerSearchTool(server: McpServer): void {
  server.registerTool(
    "search",
    {
      title: "Web Search",
      description: `Search the web and news in real-time. Returns results with source URLs.\nCost: $${TOOL_PRICES.search} USDC per search (paid via Stellar MPP).`,      inputSchema: z.object({
        query: z.string().describe("Search query"),
        count: z.coerce.number()
          .int()
          .min(1)
          .max(20)
          .default(10)
          .describe("Number of results (1-20)"),
      }),
    },
    async ({ query, count }) => {
      logger.debug({ query, count }, "search tool invoked");
      return withCache("search", { query, count }, () =>
        withBudget("search", async () => {
          try {
            const config = loadOrCreateWallet();
            const res = await fetch(
              `${config.apiUrl}/search?q=${encodeURIComponent(query)}&count=${count}`,
            );
            if (!res.ok) {
              const body = await res.text();
              return err(`Search API error ${res.status}: ${body}`);
            }
            return okPaid(await res.json());
          } catch (e: unknown) {
            logger.error({ err: e }, "search tool error");
            return err(`Search failed: ${String(e)}`);
          }
        }),
      );
    },
  );
}
