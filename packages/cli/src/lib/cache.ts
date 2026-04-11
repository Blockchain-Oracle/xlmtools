import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "./logger.js";

const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  result: CallToolResult;
  expires: number;
}

const store = new Map<string, CacheEntry>();

/**
 * Wrap a tool call with response caching.
 * Identical tool+params within the TTL return the cached result
 * with no API call and no payment.
 */
export async function withCache(
  toolName: string,
  params: Record<string, unknown>,
  fn: () => Promise<CallToolResult>,
): Promise<CallToolResult> {
  const key = `${toolName}:${JSON.stringify(params)}`;

  const cached = store.get(key);
  if (cached && Date.now() < cached.expires) {
    logger.debug({ toolName }, "cache hit");

    const original = cached.result;
    if (original.content[0]?.type === "text") {
      // Strip the "---\nPayment: ..." footer from cached text — no
      // payment happened on this call, so the original tx hash would
      // contradict the [cached — no charge] prefix.
      const stripped = original.content[0].text.replace(
        /\n---\nPayment: .*$/s,
        "",
      );
      return {
        ...original,
        content: [
          {
            type: "text" as const,
            text: `[cached — no charge]\n\n${stripped}`,
          },
        ],
      };
    }
    return original;
  }

  const result = await fn();

  if (!result.isError) {
    store.set(key, { result, expires: Date.now() + TTL_MS });
  }

  // Evict expired entries periodically
  if (store.size > 50) {
    const now = Date.now();
    for (const [k, v] of store) {
      if (now >= v.expires) store.delete(k);
    }
  }

  return result;
}
