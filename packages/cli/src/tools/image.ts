import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { okPaid, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";
import { TOOL_PRICES } from "../lib/config.js";
import { withBudget } from "../lib/budget.js";
import { withCache } from "../lib/cache.js";

export function registerImageTool(server: McpServer): void {
  server.registerTool(
    "image",
    {
      title: "AI Image Generation",
      description: `Generate images from a text prompt using AI.\nCost: $${TOOL_PRICES.image} USDC per image (paid via Stellar MPP).`,
      // @ts-expect-error -- zod 4 / MCP SDK type mismatch (runtime compatible)
      inputSchema: z.object({
        prompt: z
          .string()
          .describe("Text prompt describing the image to generate"),
        size: z
          .enum(["1024x1024", "1024x1792", "1792x1024"])
          .default("1024x1024")
          .describe("Output image dimensions"),
      }),
    },
    async ({ prompt, size }) => {
      logger.debug({ prompt, size }, "image tool invoked");
      return withCache("image", { prompt, size }, () =>
        withBudget("image", async () => {
          try {
            const config = loadOrCreateWallet();
            const res = await fetch(`${config.apiUrl}/image`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt, size }),
            });
            if (!res.ok) {
              const body = await res.text();
              return err(`Image API error ${res.status}: ${body}`);
            }
            return okPaid(await res.json());
          } catch (e: unknown) {
            logger.error({ err: e }, "image tool error");
            return err(`Image generation failed: ${String(e)}`);
          }
        }),
      );
    },
  );
}
