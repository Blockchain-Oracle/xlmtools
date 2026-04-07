import { logger } from "./logger.js";

export interface CallLogEntry {
  tool: string;
  amount: string;
  currency: string;
  tx_hash: string;
  timestamp: string;
}

const log: CallLogEntry[] = [];
const MAX_ENTRIES = 1000;

export function recordCall(entry: CallLogEntry): void {
  log.push(entry);
  if (log.length > MAX_ENTRIES) log.shift();
  logger.debug({ tool: entry.tool, amount: entry.amount }, "call logged");
}

export function getRecentCalls(limit = 20): CallLogEntry[] {
  return log.slice(-limit).reverse();
}

export function getStats() {
  const totalCalls = log.length;
  const totalUSDC = log.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const toolCounts: Record<string, number> = {};
  for (const entry of log) {
    toolCounts[entry.tool] = (toolCounts[entry.tool] || 0) + 1;
  }
  return {
    total_calls: totalCalls,
    total_usdc: totalUSDC.toFixed(3),
    tool_counts: toolCounts,
    recent: log.slice(-20).reverse(),
  };
}
