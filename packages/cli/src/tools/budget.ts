import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ok, err } from "../lib/format.js";
import { setBudget, clearBudget, getStatus } from "../lib/budget.js";
import { logger } from "../lib/logger.js";

export function registerBudgetTool(server: McpServer): void {
  server.registerTool(
    "budget",
    {
      title: "Session Budget",
      description:
        "Set, check, or clear a spending limit for this session. " +
        "The budget resets when the MCP server restarts. " +
        "Cached responses do not count against the budget.",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- zod 4 / MCP SDK type mismatch
      // @ts-expect-error -- zod 4 / MCP SDK type mismatch (runtime compatible)
      inputSchema: z.object({
        action: z
          .enum(["set", "check", "clear"])
          .describe("Action: set a limit, check status, or clear limit"),
        amount: z
          .number()
          .positive()
          .optional()
          .describe("Budget amount in USD (required for 'set')"),
      }),
    },
    async ({ action, amount }) => {
      logger.debug({ action, amount }, "budget tool invoked");

      switch (action) {
        case "set": {
          if (amount === undefined) {
            return err(
              "Amount is required for 'set'. Example: budget set 5.00",
            );
          }
          setBudget(amount);
          return ok({
            message: `Budget set to $${amount.toFixed(2)} for this session.`,
            ...getStatus(),
          });
        }
        case "check": {
          const status = getStatus();
          if (status.max === null) {
            return ok({
              message:
                "No budget limit set. All tool calls will be charged normally.",
              ...status,
            });
          }
          return ok({
            message: `$${status.remaining?.toFixed(3)} remaining of $${status.max.toFixed(2)} budget.`,
            ...status,
          });
        }
        case "clear": {
          clearBudget();
          return ok({
            message:
              "Budget limit cleared. All tool calls will be charged normally.",
            ...getStatus(),
          });
        }
      }
    },
  );
}
