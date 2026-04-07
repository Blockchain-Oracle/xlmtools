import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { okPaid, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";
import { TOOL_PRICES } from "../lib/config.js";
import { withBudget } from "../lib/budget.js";
import { withCache } from "../lib/cache.js";

export function registerStocksTool(server: McpServer): void {
  server.registerTool(
    "stocks",
    {
      title: "Stock Quotes",
      description: `Get real-time stock price and market data for any ticker symbol.\nCost: $${TOOL_PRICES.stocks} USDC per query (paid via Stellar MPP).`,
      inputSchema: z.object({
        symbol: z
          .string()
          .describe("Stock ticker symbol (e.g. AAPL, TSLA, MSFT)"),
      }),
    },
    async ({ symbol }) => {
      logger.debug({ symbol }, "stocks tool invoked");
      return withCache("stocks", { symbol }, () =>
        withBudget("stocks", async () => {
          try {
            const config = loadOrCreateWallet();
            const res = await fetch(
              `${config.apiUrl}/stocks?symbol=${encodeURIComponent(symbol)}`,
            );
            if (!res.ok) {
              const body = await res.text();
              return err(`Stocks API error ${res.status}: ${body}`);
            }
            return okPaid(await res.json());
          } catch (e: unknown) {
            logger.error({ err: e }, "stocks tool error");
            return err(`Stocks query failed: ${String(e)}`);
          }
        }),
      );
    },
  );
}
