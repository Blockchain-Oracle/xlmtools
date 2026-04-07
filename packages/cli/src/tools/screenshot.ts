import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { okPaid, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";
import { TOOL_PRICES } from "../lib/config.js";
import { withBudget } from "../lib/budget.js";
import { withCache } from "../lib/cache.js";

export function registerScreenshotTool(server: McpServer): void {
  server.registerTool(
    "screenshot",
    {
      title: "Web Screenshot",
      description: `Capture a screenshot of any public URL and return it as an image.\nCost: $${TOOL_PRICES.screenshot} USDC per screenshot (paid via Stellar MPP).`,
      inputSchema: z.object({
        url: z.string().url().describe("URL of the page to screenshot"),
        format: z
          .enum(["png", "jpg", "webp"])
          .default("png")
          .describe("Image format for the screenshot"),
      }),
    },
    async ({ url, format }) => {
      logger.debug({ url, format }, "screenshot tool invoked");
      return withCache("screenshot", { url, format }, () =>
        withBudget("screenshot", async () => {
          try {
            const config = loadOrCreateWallet();
            const params = new URLSearchParams({ url, format });
            const res = await fetch(
              `${config.apiUrl}/screenshot?${params.toString()}`,
            );
            if (!res.ok) {
              const body = await res.text();
              return err(`Screenshot API error ${res.status}: ${body}`);
            }
            return okPaid(await res.json());
          } catch (e: unknown) {
            logger.error({ err: e }, "screenshot tool error");
            return err(`Screenshot failed: ${String(e)}`);
          }
        }),
      );
    },
  );
}
