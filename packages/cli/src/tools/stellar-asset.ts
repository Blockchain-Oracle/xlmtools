import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { apiFetch } from "../lib/api-fetch.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";

export function registerStellarAssetTool(server: McpServer): void {
  server.registerTool(
    "stellar-asset",
    {
      title: "Stellar Asset Info",
      description:
        `Look up any Stellar asset: supply, trustlines, rating, issuer org, and more.\n` +
        `Combines on-chain data (Horizon) with analytics (StellarExpert).\n` +
        `Examples: "USDC", "AQUA", "yUSDC", or "CODE:ISSUER".\nFree.`,      inputSchema: z.object({
        asset: z
          .string()
          .describe('Asset to look up (e.g. "USDC", "XLM", "AQUA", "CODE:ISSUER")'),
      }),
    },
    async ({ asset }) => {
      logger.debug({ asset }, "stellar-asset invoked");
      try {
        const config = loadOrCreateWallet();
        const res = await apiFetch(
          config,
          `/stellar-asset?asset=${encodeURIComponent(asset)}`,
        );
        if (!res.ok) {
          const body = await res.text();
          return err(`Asset lookup error ${res.status}: ${body}`);
        }
        return ok(await res.json());
      } catch (e) {
        logger.error({ err: e }, "stellar-asset error");
        return err(`Asset lookup failed: ${String(e)}`);
      }
    }
  );
}
