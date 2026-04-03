import { Keypair } from "@stellar/stellar-sdk";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { logger } from "./logger.js";

const CONFIG_DIR = join(homedir(), ".pulsar");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

interface PulsarConfig {
  stellarPrivateKey: string;
  stellarPublicKey: string;
  apiUrl: string;
}

export function loadOrCreateWallet(): PulsarConfig {
  if (existsSync(CONFIG_PATH)) {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as PulsarConfig;
  }

  const keypair = Keypair.random();
  const config: PulsarConfig = {
    stellarPrivateKey: keypair.secret(),
    stellarPublicKey: keypair.publicKey(),
    apiUrl: process.env.PULSAR_API_URL ?? "http://localhost:3000",
  };

  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });

  // Human-readable banner — use process.stderr.write (pino is JSON)
  process.stderr.write("\n╔══════════════════════════════════════════════════╗\n");
  process.stderr.write("║           PULSAR — First Run Setup               ║\n");
  process.stderr.write("╚══════════════════════════════════════════════════╝\n");
  process.stderr.write(`\nYour Stellar wallet: ${config.stellarPublicKey}\n`);
  process.stderr.write("Fund it with testnet USDC to use paid tools:\n");
  process.stderr.write("  1. https://lab.stellar.org/account/fund  (get testnet XLM)\n");
  process.stderr.write("  2. https://faucet.circle.com             (get testnet USDC)\n");
  process.stderr.write(`\nConfig saved to: ${CONFIG_PATH}\n`);
  process.stderr.write("─".repeat(52) + "\n\n");

  logger.info({ publicKey: config.stellarPublicKey }, "New Stellar wallet generated");
  return config;
}

export function getKeypair(config: PulsarConfig): Keypair {
  return Keypair.fromSecret(config.stellarPrivateKey);
}
