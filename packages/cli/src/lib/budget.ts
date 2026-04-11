import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { err } from "./format.js";
import { TOOL_PRICES } from "./config.js";
import { logger } from "./logger.js";

// Session-scoped budget state (resets on MCP server restart)
let maxBudget: number | null = null;
let totalSpent = 0;

export function setBudget(max: number): void {
  maxBudget = max;
  // Reset spent counter so the new cap starts fresh. Users expect
  // "I just set a $1.00 budget" to mean they have $1.00 to spend
  // from now — not "$1.00 minus whatever I spent before setting it".
  totalSpent = 0;
  logger.info({ max }, "session budget set");
}

export function clearBudget(): void {
  maxBudget = null;
  totalSpent = 0;
  logger.info("session budget cleared");
}

export function getStatus(): {
  max: number | null;
  spent: number;
  remaining: number | null;
} {
  return {
    max: maxBudget,
    spent: Math.round(totalSpent * 1000) / 1000,
    remaining:
      maxBudget !== null
        ? Math.round((maxBudget - totalSpent) * 1000) / 1000
        : null,
  };
}

function canSpend(amount: number): boolean {
  if (maxBudget === null) return true;
  // Round to 3 decimal places to avoid floating-point drift
  const spent = Math.round(totalSpent * 1000) / 1000;
  return spent + amount <= maxBudget;
}

function recordSpend(amount: number): void {
  totalSpent += amount;
  logger.debug({ amount, totalSpent }, "spend recorded");
}

/**
 * Wrap a paid tool call with budget checking.
 * If budget would be exceeded, returns an error without calling the API.
 * On success, records the spend.
 */
export async function withBudget(
  toolName: string,
  fn: () => Promise<CallToolResult>,
): Promise<CallToolResult> {
  const price = parseFloat(TOOL_PRICES[toolName] ?? "0");
  if (!canSpend(price)) {
    const status = getStatus();
    return err(
      `Budget limit reached. This call costs $${TOOL_PRICES[toolName]} ` +
        `but only $${status.remaining?.toFixed(3)} remains. ` +
        `Use the budget tool to check or adjust your limit.`,
    );
  }

  const result = await fn();

  if (!result.isError) {
    recordSpend(price);
  }

  return result;
}
