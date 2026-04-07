import { Receipt } from "mppx";
import { TOOL_PRICES, type PaidTool } from "./pricing.js";
import { recordCall } from "./call-log.js";

export interface ReceiptInfo {
  tx_hash: string;
  amount: string;
  currency: string;
  network: string;
}

/**
 * Extracts the receipt from a withReceipt() response and builds
 * a receipt info object for inclusion in the JSON response body.
 */
export function extractReceipt(
  webRes: globalThis.Response,
  tool: PaidTool,
): ReceiptInfo | undefined {
  const header = webRes.headers.get("Payment-Receipt");
  if (!header) return undefined;

  try {
    const receipt = Receipt.deserialize(header);
    return {
      tx_hash: receipt.reference,
      amount: TOOL_PRICES[tool],
      currency: "USDC",
      network: "stellar:testnet",
    };
  } catch {
    return undefined;
  }
}

/**
 * Wraps a JSON body with receipt data, producing a new web Response
 * that preserves the Payment-Receipt header and includes the receipt
 * in the JSON body.
 */
export function withReceiptBody(
  webRes: globalThis.Response,
  body: Record<string, unknown>,
  tool: PaidTool,
): globalThis.Response {
  const receipt = extractReceipt(webRes, tool);
  const enrichedBody = receipt ? { ...body, receipt } : body;

  // Record call in the in-memory log for the stats API
  if (receipt) {
    recordCall({
      tool,
      amount: receipt.amount,
      currency: receipt.currency,
      tx_hash: receipt.tx_hash,
      timestamp: new Date().toISOString(),
    });
  }

  // Preserve the original headers (including Payment-Receipt)
  const headers = new Headers(webRes.headers);
  headers.set("Content-Type", "application/json");

  return new Response(JSON.stringify(enrichedBody), {
    status: webRes.status,
    statusText: webRes.statusText,
    headers,
  });
}
