import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";
import { TOOL_PRICES } from "../lib/config.js";

export function registerYoutubeTool(server: McpServer): void {
  server.registerTool(
    "youtube",
    {
      title: "YouTube Search / Lookup",
      description: `Search YouTube videos or look up a specific video by ID. Provide either query or id.\nCost: $${TOOL_PRICES.youtube} USDC per call (paid via Stellar MPP).`,
      inputSchema: z.object({
        query: z.string().optional().describe("Search query to find videos"),
        id: z.string().optional().describe("YouTube video ID for direct lookup"),
      }),
    },
    async ({ query, id }) => {
      logger.debug({ query, id }, "youtube tool invoked");
      if (!query && !id) {
        return err("Provide either query or id");
      }
      try {
        const config = loadOrCreateWallet();
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (id) params.set("id", id);
        const res = await fetch(`${config.apiUrl}/youtube?${params.toString()}`);
        if (!res.ok) {
          const body = await res.text();
          return err(`YouTube API error ${res.status}: ${body}`);
        }
        return ok(await res.json());
      } catch (e: unknown) {
        logger.error({ err: e }, "youtube tool error");
        return err(`YouTube lookup failed: ${String(e)}`);
      }
    }
  );
}
