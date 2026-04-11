import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { apiFetch } from "../lib/api-fetch.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";

export function registerStellarAccountTool(server: McpServer): void {
  server.registerTool(
    "stellar-account",
    {
      title: "Stellar Account Lookup",
      description:
        `Look up any Stellar account: balances, trustlines, signers, and status.\n` +
        `Provide a Stellar public key (starts with G, 56 characters).\nFree.`,      inputSchema: z.object({
        address: z
          .string()
          .describe("Stellar public key (G-address)"),
      }),
    },
    async ({ address }) => {
      logger.debug({ address }, "stellar-account invoked");
      try {
        const config = loadOrCreateWallet();
        const res = await apiFetch(
          config,
          `/stellar-account?address=${encodeURIComponent(address)}`,
        );
        if (!res.ok) {
          const body = await res.text();
          return err(`Account lookup error ${res.status}: ${body}`);
        }
        return ok(await res.json());
      } catch (e) {
        logger.error({ err: e }, "stellar-account error");
        return err(`Account lookup failed: ${String(e)}`);
      }
    }
  );
}
