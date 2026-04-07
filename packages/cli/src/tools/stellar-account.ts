import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";

export function registerStellarAccountTool(server: McpServer): void {
  server.registerTool(
    "stellar-account",
    {
      title: "Stellar Account Lookup",
      description:
        `Look up any Stellar account: balances, trustlines, signers, and status.\n` +
        `Provide a Stellar public key (starts with G, 56 characters).\nFree.`,
      // @ts-expect-error -- zod 4 / MCP SDK type mismatch (runtime compatible)
      inputSchema: z.object({
        address: z
          .string()
          .describe("Stellar public key (G-address)"),
      }),
    },
    async ({ address }) => {
      logger.debug({ address }, "stellar-account invoked");
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(
          `${config.apiUrl}/stellar-account?address=${encodeURIComponent(address)}`
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
