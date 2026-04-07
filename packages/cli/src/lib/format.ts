import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export interface ReceiptInfo {
  tx_hash: string;
  amount: string;
  currency: string;
  network: string;
}

function formatReceipt(receipt: ReceiptInfo): string {
  const hashShort = receipt.tx_hash.length > 12
    ? receipt.tx_hash.slice(0, 12) + "..."
    : receipt.tx_hash;
  const network = receipt.network === "stellar:testnet" ? "stellar testnet" : receipt.network;
  return `\n---\nPayment: $${receipt.amount} ${receipt.currency} \u00b7 tx/${hashShort} \u00b7 ${network}`;
}

export function ok(data: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    isError: false,
  };
}

/**
 * Format a paid tool response, appending a receipt line if present.
 * Strips the receipt from the data to avoid cluttering the JSON output,
 * then appends a human-readable payment line.
 */
export function okPaid(data: Record<string, unknown>): CallToolResult {
  const receipt = data.receipt as ReceiptInfo | undefined;
  if (!receipt) {
    return ok(data);
  }

  // Strip receipt from the JSON data — show it as a footer instead
  const { receipt: _, ...rest } = data;
  const text = JSON.stringify(rest, null, 2) + formatReceipt(receipt);

  return {
    content: [{ type: "text", text }],
    isError: false,
  };
}

export function err(message: string): CallToolResult {
  return {
    content: [{ type: "text", text: `Error: ${message}` }],
    isError: true,
  };
}
