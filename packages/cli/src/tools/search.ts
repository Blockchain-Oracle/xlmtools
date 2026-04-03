import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";
import { TOOL_PRICES } from "../lib/config.js";

export function registerSearchTool(server: McpServer): void {
  server.registerTool(
    "search",
    {
      title: "Web Search",
      description: `Search the web and news in real-time. Returns results with source URLs.\nCost: $${TOOL_PRICES.search} USDC per search (paid via Stellar MPP).`,
      inputSchema: z.object({
        query: z.string().describe("Search query"),
        count: z
          .number()
          .int()
          .min(1)
          .max(20)
          .default(10)
          .describe("Number of results (1-20)"),
      }),
      outputSchema: z.object({
        query: z.string(),
        results: z.array(
          z.object({
            title: z.string(),
            url: z.string(),
            description: z.string(),
          })
        ),
        count: z.number(),
      }),
    },
    async ({ query, count }) => {
      logger.debug({ query, count }, "search tool invoked");
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(
          `${config.apiUrl}/search?q=${encodeURIComponent(query)}&count=${count}`
        );
        if (!res.ok) {
          const body = await res.text();
          return err(`Search API error ${res.status}: ${body}`);
        }
        return ok(await res.json());
      } catch (e: unknown) {
        logger.error({ err: e }, "search tool error");
        return err(`Search failed: ${String(e)}`);
      }
    }
  );
}
