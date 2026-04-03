import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";
import { TOOL_PRICES } from "../lib/config.js";

export function registerRedditTool(server: McpServer): void {
  server.registerTool(
    "reddit",
    {
      title: "Reddit Search",
      description: `Search Reddit posts and comments in real-time.\nCost: $${TOOL_PRICES.reddit} USDC per query (paid via Stellar MPP).`,
      inputSchema: z.object({
        query: z.string().describe("Search query"),
        subreddit: z
          .string()
          .optional()
          .describe("Limit search to a specific subreddit (without r/ prefix)"),
        sort: z
          .enum(["relevance", "hot", "new", "top"])
          .default("relevance")
          .describe("Sort order for results"),
      }),
    },
    async ({ query, subreddit, sort }) => {
      logger.debug({ query, subreddit, sort }, "reddit tool invoked");
      try {
        const config = loadOrCreateWallet();
        const params = new URLSearchParams({ q: query, sort });
        if (subreddit) params.set("subreddit", subreddit);
        const res = await fetch(`${config.apiUrl}/reddit?${params.toString()}`);
        if (!res.ok) {
          const body = await res.text();
          return err(`Reddit API error ${res.status}: ${body}`);
        }
        return ok(await res.json());
      } catch (e: unknown) {
        logger.error({ err: e }, "reddit tool error");
        return err(`Reddit search failed: ${String(e)}`);
      }
    }
  );
}
