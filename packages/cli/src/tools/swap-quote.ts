import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";

export function registerSwapQuoteTool(server: McpServer): void {
  server.registerTool(
    "swap-quote",
    {
      title: "Stellar Swap Quote",
      description:
        `Find the best swap path between any two Stellar assets using the native DEX.\n` +
        `Shows rate, path hops, and slippage tips.\n` +
        `Examples: swap 100 XLM to USDC, swap 50 USDC to EURC.\n` +
        `Well-known assets: XLM, USDC, EURC, AQUA, yUSDC, BLND, SHX.\nFree.`,      inputSchema: z.object({
        from: z.string().describe('Source asset (e.g. "XLM", "USDC")'),
        to: z.string().describe('Destination asset (e.g. "USDC", "EURC")'),
        amount: z.string().describe("Amount to swap"),
        mode: z
          .enum(["send", "receive"])
          .default("send")
          .describe('"send" = you fix what you send; "receive" = you fix what you get'),
      }),
    },
    async ({ from, to, amount, mode }) => {
      logger.debug({ from, to, amount, mode }, "swap-quote invoked");
      try {
        const config = loadOrCreateWallet();
        const params = new URLSearchParams({ from, to, amount, mode });
        const res = await fetch(`${config.apiUrl}/swap-quote?${params}`);
        if (!res.ok) {
          const body = await res.text();
          return err(`Swap quote error ${res.status}: ${body}`);
        }
        return ok(await res.json());
      } catch (e) {
        logger.error({ err: e }, "swap-quote error");
        return err(`Swap quote failed: ${String(e)}`);
      }
    }
  );
}
