import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";

export function registerCryptoTool(server: McpServer): void {
  server.registerTool(
    "crypto",
    {
      title: "Crypto Prices",
      description: "Get real-time cryptocurrency prices, market caps, and 24h changes. Free.",
      // @ts-expect-error -- zod 4 / MCP SDK type mismatch (runtime compatible)
      inputSchema: z.object({
        ids: z.string().describe("Comma-separated coin IDs (e.g. bitcoin,ethereum,stellar)"),
        vs_currency: z.string().default("usd").describe("Quote currency (e.g. usd, eur)"),
      }),
    },
    async ({ ids, vs_currency }) => {
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(`${config.apiUrl}/crypto?ids=${encodeURIComponent(ids)}&vs_currency=${vs_currency}`);
        if (!res.ok) return err(`Crypto API error: ${res.status}`);
        return ok(await res.json());
      } catch (e) { return err(String(e)); }
    }
  );
}
