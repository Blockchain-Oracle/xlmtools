import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { okPaid, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";
import { TOOL_PRICES } from "../lib/config.js";
import { withBudget } from "../lib/budget.js";
import { withCache } from "../lib/cache.js";

export function registerScrapeTool(server: McpServer): void {
  server.registerTool(
    "scrape",
    {
      title: "Web Scraper",
      description: `Extract clean text content from any public URL.\nCost: $${TOOL_PRICES.scrape} USDC per scrape (paid via Stellar MPP).`,
      inputSchema: z.object({
        url: z.string().url().describe("URL of the page to scrape"),
      }),
    },
    async ({ url }) => {
      logger.debug({ url }, "scrape tool invoked");
      return withCache("scrape", { url }, () =>
        withBudget("scrape", async () => {
          try {
            const config = loadOrCreateWallet();
            const res = await fetch(
              `${config.apiUrl}/scrape?url=${encodeURIComponent(url)}`,
            );
            if (!res.ok) {
              const body = await res.text();
              return err(`Scrape API error ${res.status}: ${body}`);
            }
            return okPaid(await res.json());
          } catch (e: unknown) {
            logger.error({ err: e }, "scrape tool error");
            return err(`Scrape failed: ${String(e)}`);
          }
        }),
      );
    },
  );
}
