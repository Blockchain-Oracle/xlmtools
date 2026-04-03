import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";

export function registerCardTool(server: McpServer): void {
  server.registerTool(
    "card",
    {
      title: "Virtual Card",
      description: `Issue a virtual Mastercard for agent spending. Card is funded from your PULSAR USDC balance.
Cost: $10 flat card creation fee + load amount + 3.5% processing.
IMPORTANT: Card details are shown ONCE and not stored.
MVP: ASGCard API integration pending — add @asgcard/sdk and ASGCARD_STELLAR_KEY to enable real cards.`,
      inputSchema: z.object({
        amount: z
          .number()
          .min(5)
          .max(1000)
          .default(20)
          .describe("Amount to load in USD ($5-$1000)"),
        name: z
          .string()
          .default("AI AGENT")
          .describe("Name on card"),
        email: z
          .string()
          .email()
          .default("agent@pulsar.dev")
          .describe("Email for registration"),
      }),
    },
    async ({ amount, name, email }) => {
      logger.debug({ amount, name, email }, "card tool invoked");
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(`${config.apiUrl}/card`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, nameOnCard: name, email }),
        });
        if (!res.ok) {
          const body = await res.text();
          return err(`Card API error ${res.status}: ${body}`);
        }
        const data = await res.json();
        const totalCharge = (10 + amount + amount * 0.035).toFixed(3);
        return ok({ ...(data as object), total_charged_usdc: totalCharge });
      } catch (e: unknown) {
        logger.error({ err: e }, "card tool error");
        return err(String(e));
      }
    }
  );
}
