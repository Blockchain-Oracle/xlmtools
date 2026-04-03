import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Horizon } from "@stellar/stellar-sdk";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { logger } from "../lib/logger.js";

export function registerWalletTool(server: McpServer): void {
  server.registerTool(
    "wallet",
    {
      title: "PULSAR Wallet",
      description:
        "Show your Stellar wallet address, current USDC balance, and how to fund it. Free.",
      inputSchema: z.object({}),
    },
    async () => {
      logger.debug("wallet tool invoked");
      try {
        const config = loadOrCreateWallet();
        const horizon = new Horizon.Server(
          "https://horizon-testnet.stellar.org"
        );
        const account = await horizon.loadAccount(config.stellarPublicKey);

        const xlm = account.balances.find(
          (b) => b.asset_type === "native"
        );
        const usdc = account.balances.find(
          (b) =>
            b.asset_type === "credit_alphanum4" &&
            (b as { asset_code?: string }).asset_code === "USDC"
        );

        return ok({
          address: config.stellarPublicKey,
          xlm_balance: xlm?.balance ?? "0",
          usdc_balance:
            usdc?.balance ?? "0 (no USDC trustline yet)",
          fund_instructions: [
            "1. Get testnet XLM: https://lab.stellar.org/account/fund",
            "2. Get testnet USDC: https://faucet.circle.com (select Stellar Testnet)",
            `3. Send USDC to: ${config.stellarPublicKey}`,
          ],
        });
      } catch (e: unknown) {
        logger.error({ err: e }, "wallet tool error");
        return err(`Failed to load account: ${String(e)}`);
      }
    }
  );
}
