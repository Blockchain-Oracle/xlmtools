import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TOOL_PRICES, FREE_TOOLS } from "../lib/config.js";
import { ok } from "../lib/format.js";

export function registerToolsListTool(server: McpServer): void {
  server.registerTool(
    "tools",
    {
      title: "List Tools",
      description: "List all XLMTools tools with their per-call cost in USDC.",      inputSchema: z.object({}),
    },
    async () => {
      return ok({
        paid: Object.entries(TOOL_PRICES).map(([tool, cost]) => ({ tool, cost_usdc: cost })),
        free: Array.from(FREE_TOOLS),
        network: "stellar:testnet",
        payment: "MPP charge mode — USDC auto-deducted per call",
      });
    }
  );
}
