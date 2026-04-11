import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
} from "@stellar/stellar-sdk";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { logger } from "./logger.js";

const CONFIG_DIR = join(homedir(), ".xlmtools");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

// Circle USDC issuer on Stellar testnet
const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";

interface XLMToolsConfig {
  stellarPrivateKey: string;
  stellarPublicKey: string;
  apiUrl: string;
}

/**
 * Auto-fund a new wallet on Stellar TESTNET only.
 * This uses the public friendbot (free testnet XLM) and adds a USDC
 * trustline so the account can receive payments. This function must
 * never be called on mainnet — friendbot does not exist there.
 */
async function fundTestnetWallet(keypair: Keypair): Promise<boolean> {
  // Safety: only run on testnet
  const network = process.env.STELLAR_NETWORK ?? "testnet";
  if (network !== "testnet") {
    logger.info({ network }, "Skipping auto-fund — not on testnet");
    return false;
  }

  const publicKey = keypair.publicKey();

  // Step 1: Fund with friendbot
  process.stderr.write("  Funding wallet with testnet XLM...");
  try {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${publicKey}`,
    );
    if (!res.ok) {
      process.stderr.write(" failed\n");
      logger.warn({ status: res.status }, "Friendbot funding failed");
      return false;
    }
    process.stderr.write(" done\n");
  } catch (e) {
    process.stderr.write(" failed (network error)\n");
    logger.warn({ err: e }, "Friendbot request failed");
    return false;
  }

  // Step 2: Add USDC trustline
  process.stderr.write("  Adding USDC trustline...");
  try {
    const server = new Horizon.Server(HORIZON_TESTNET);
    const account = await server.loadAccount(publicKey);
    const usdcAsset = new Asset("USDC", USDC_ISSUER);

    const tx = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.changeTrust({ asset: usdcAsset }))
      .setTimeout(30)
      .build();

    tx.sign(keypair);
    await server.submitTransaction(tx);
    process.stderr.write(" done\n");
  } catch (e) {
    process.stderr.write(" failed\n");
    logger.warn({ err: e }, "USDC trustline failed");
    return false;
  }

  return true;
}

export function loadOrCreateWallet(): XLMToolsConfig {
  if (existsSync(CONFIG_PATH)) {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as XLMToolsConfig;
  }

  const keypair = Keypair.random();
  const config: XLMToolsConfig = {
    stellarPrivateKey: keypair.secret(),
    stellarPublicKey: keypair.publicKey(),
    apiUrl: process.env.XLMTOOLS_API_URL ?? "https://api.xlmtools.com",
  };

  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });

  process.stderr.write(
    "\n" +
      "XLMTools — First Run Setup (Stellar Testnet)\n" +
      "─".repeat(44) + "\n\n" +
      `  Wallet:  ${config.stellarPublicKey}\n` +
      `  Network: Stellar Testnet\n\n`,
  );

  // Auto-fund on testnet (non-blocking — don't break startup if it fails)
  fundTestnetWallet(keypair)
    .then((funded) => {
      if (funded) {
        process.stderr.write(
          "\n  Wallet funded and ready.\n" +
            "  Get testnet USDC: https://faucet.circle.com\n" +
            "  (paste your wallet address above)\n\n" +
            "─".repeat(40) + "\n\n",
        );
      } else {
        process.stderr.write(
          "\n  Auto-funding failed. Fund manually:\n" +
            "  1. https://lab.stellar.org/account/fund  (testnet XLM)\n" +
            "  2. https://faucet.circle.com             (testnet USDC)\n\n" +
            "─".repeat(40) + "\n\n",
        );
      }
    })
    .catch(() => {
      // Silently handle — wallet is still created, just unfunded
    });

  logger.info(
    { publicKey: config.stellarPublicKey },
    "New Stellar wallet generated",
  );
  return config;
}

export function getKeypair(config: XLMToolsConfig): Keypair {
  return Keypair.fromSecret(config.stellarPrivateKey);
}
