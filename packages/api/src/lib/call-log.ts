import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

export interface CallLogEntry {
  tool: string;
  paid: boolean;
  timestamp: string;
  // Only present when paid === true
  amount?: string;
  currency?: string;
  tx_hash?: string;
}

const log: CallLogEntry[] = [];
const MAX_ENTRIES = 1000;

/**
 * Record a paid tool call with its Stellar tx hash.
 * Called from withReceiptBody() after a successful MPP-gated response.
 */
export function recordCall(entry: Omit<CallLogEntry, "paid">): void {
  log.push({ ...entry, paid: true });
  if (log.length > MAX_ENTRIES) log.shift();
  logger.debug(
    { tool: entry.tool, amount: entry.amount },
    "paid call logged",
  );
}

/**
 * Record a free tool call. No tx hash, no amount.
 * Called from the withFreeStats middleware on any 2xx response from a
 * free-tool route.
 */
export function recordFreeCall(tool: string): void {
  log.push({
    tool,
    paid: false,
    timestamp: new Date().toISOString(),
  });
  if (log.length > MAX_ENTRIES) log.shift();
  logger.debug({ tool }, "free call logged");
}

/**
 * Express middleware that records a free tool call on 2xx responses.
 * Attach before each free-tool route mount:
 *   app.use("/crypto", withFreeStats("crypto"), cryptoRoute);
 */
export function withFreeStats(tool: string) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        recordFreeCall(tool);
      }
    });
    next();
  };
}

/**
 * Get a window of calls from the log, newest-first.
 *
 * offset = 0 returns the most recent `limit` calls.
 * offset = limit returns the next page (older), and so on.
 *
 * Page math is done against the raw (append-only) log, so we can slice
 * without reversing the entire array on every request.
 */
export function getRecentCalls(limit = 20, offset = 0): CallLogEntry[] {
  const total = log.length;
  const end = Math.max(0, total - offset);
  const start = Math.max(0, end - limit);
  return log.slice(start, end).reverse();
}

export function getTotalCalls(): number {
  return log.length;
}

export function getStats() {
  let paidCalls = 0;
  let freeCalls = 0;
  let totalUSDC = 0;
  const toolCounts: Record<string, number> = {};

  for (const entry of log) {
    toolCounts[entry.tool] = (toolCounts[entry.tool] || 0) + 1;
    if (entry.paid) {
      paidCalls += 1;
      totalUSDC += parseFloat(entry.amount ?? "0");
    } else {
      freeCalls += 1;
    }
  }

  return {
    total_calls: log.length,
    paid_calls: paidCalls,
    free_calls: freeCalls,
    total_usdc: totalUSDC.toFixed(3),
    tool_counts: toolCounts,
    recent: getRecentCalls(20),
  };
}
