import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { okPaid, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";
import { TOOL_PRICES } from "../lib/config.js";
import { withBudget } from "../lib/budget.js";
import { withCache } from "../lib/cache.js";

export function registerResearchTool(server: McpServer): void {
  server.registerTool(
    "research",
    {
      title: "Deep Research",
      description: `Deep research on any topic — returns summarized, sourced results from multiple web pages.\nCost: $${TOOL_PRICES.research} USDC per query (paid via Stellar MPP).`,      inputSchema: z.object({
        query: z.string().describe("Research query"),
        num_results: z.coerce.number()
          .int()
          .min(1)
          .max(20)
          .default(5)
          .describe("Number of results to return (1-20)"),
      }),
    },
    async ({ query, num_results }) => {
      logger.debug({ query, num_results }, "research tool invoked");
      return withCache("research", { query, num_results }, () =>
        withBudget("research", async () => {
          try {
            const config = loadOrCreateWallet();
            const res = await fetch(
              `${config.apiUrl}/research?q=${encodeURIComponent(query)}&num_results=${num_results}`,
            );
            if (!res.ok) {
              const body = await res.text();
              return err(`Research API error ${res.status}: ${body}`);
            }
            return okPaid(await res.json());
          } catch (e: unknown) {
            logger.error({ err: e }, "research tool error");
            return err(`Research failed: ${String(e)}`);
          }
        }),
      );
    },
  );
}
