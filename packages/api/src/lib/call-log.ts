import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

export interface CallLogEntry {
  tool: string;
  paid: boolean;
  timestamp: string;
  /**
   * Stellar G-address that made the call, read from the
   * `X-XLMTools-Client` request header.
   *
   * **This field is spoofable for BOTH free and paid calls** — anyone
   * can set `X-XLMTools-Client` to any address on any request. For
   * free calls there's no economic value to spoof. For paid calls,
   * `tx_hash` is the cryptographic ground truth (the Stellar tx
   * source account is the real payer) — but an attacker paying with
   * their own wallet and stamping a victim's address will have the
   * entry appear in the victim's /stats/by-client history, linked to
   * a legitimate-looking tx whose actual source account on Stellar
   * Expert is the attacker's, not the victim's.
   *
   * Always cross-check against `tx_hash` source account on-chain
   * when integrity matters. For the demo/hackathon use case this
   * tradeoff is fine (the feature is a convenience audit log, not
   * an authoritative billing record).
   *
   * May be `undefined` for requests from clients that don't stamp
   * the header (raw curl, older CLI versions).
   */
  client?: string;
  // Only present when paid === true
  amount?: string;
  currency?: string;
  tx_hash?: string;
}

const log: CallLogEntry[] = [];
const MAX_ENTRIES = 1000;

const CLIENT_HEADER = "x-xlmtools-client";

/** Extract and validate the X-XLMTools-Client header off a request. */
export function getClient(req: Request): string | undefined {
  const raw = req.headers[CLIENT_HEADER];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return undefined;
  // Light validation — Stellar G-addresses are 56 chars starting with G.
  // We don't reject missing matches (the log still takes whatever was
  // sent), but we refuse bogus values that would pollute the index.
  if (typeof value !== "string" || value.length > 120) return undefined;
  return value;
}

/**
 * Record a paid tool call with its Stellar tx hash.
 * Called from withReceiptBody() after a successful MPP-gated response.
 */
export function recordCall(entry: Omit<CallLogEntry, "paid">): void {
  log.push({ ...entry, paid: true });
  // FIFO cap: older entries age out once we hit MAX_ENTRIES. Note that
  // once the log is at capacity, pagination `offset` values against
  // /stats/recent become approximate — entries scroll off under the
  // cursor. Live refresh on page 1 masks this for the main view.
  if (log.length > MAX_ENTRIES) log.shift();
  logger.debug(
    { tool: entry.tool, amount: entry.amount, client: entry.client },
    "paid call logged",
  );
}

/**
 * Record a free tool call. No tx hash, no amount.
 * Called from the withFreeStats middleware on any 2xx response from a
 * free-tool route.
 */
export function recordFreeCall(tool: string, client?: string): void {
  log.push({
    tool,
    paid: false,
    timestamp: new Date().toISOString(),
    client,
  });
  if (log.length > MAX_ENTRIES) log.shift();
  logger.debug({ tool, client }, "free call logged");
}

/**
 * Express middleware that records a free tool call on 2xx responses.
 * Attach before each free-tool route mount:
 *   app.use("/crypto", withFreeStats("crypto"), cryptoRoute);
 *
 * Timing note: `res.on("finish", ...)` fires after the response is
 * fully flushed to the socket, which happens AFTER any async route
 * handler resolves — so this works for async handlers too. The
 * statusCode check inside the listener gates logging to only 2xx
 * responses, so `apiError(res, 400, ...)` calls correctly do NOT
 * land in the call log.
 */
export function withFreeStats(tool: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const client = getClient(req);
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        recordFreeCall(tool, client);
      }
    });
    next();
  };
}

export function getRecentCalls(limit = 20, offset = 0): CallLogEntry[] {
  const total = log.length;
  const end = Math.max(0, total - offset);
  const start = Math.max(0, end - limit);
  return log.slice(start, end).reverse();
}

export function getTotalCalls(): number {
  return log.length;
}

/**
 * Paginated history for a single client (Stellar G-address).
 *
 * Same semantics as getRecentCalls (newest first, offset 0 = newest)
 * but filtered to entries where `client === address`. Used by the
 * `/stats/by-client` endpoint that powers the Stats page.
 */
export function getCallsByClient(
  address: string,
  limit = 20,
  offset = 0,
): CallLogEntry[] {
  const filtered = log.filter((e) => e.client === address);
  // filtered is already in append order (oldest → newest). Apply
  // offset/limit from the newest end, then reverse for display.
  const total = filtered.length;
  const end = Math.max(0, total - offset);
  const start = Math.max(0, end - limit);
  return filtered.slice(start, end).reverse();
}

export function countCallsByClient(address: string): number {
  let count = 0;
  for (const entry of log) {
    if (entry.client === address) count += 1;
  }
  return count;
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
