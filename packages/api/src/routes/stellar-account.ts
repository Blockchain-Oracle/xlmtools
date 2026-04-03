import { Router } from "express";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { horizonUrl } from "../lib/stellar.js";

export const stellarAccountRoute = Router();

stellarAccountRoute.get("/", async (req, res) => {
  const address = req.query.address as string | undefined;

  if (!address) {
    apiError(res, 400, "address required (Stellar G-address)");
    return;
  }

  if (!address.startsWith("G") || address.length !== 56) {
    apiError(res, 400, "Invalid Stellar address — must start with G and be 56 characters");
    return;
  }

  logger.info({ address }, "fetching account");

  const response = await fetch(`${horizonUrl()}/accounts/${address}`);

  if (response.status === 404) {
    apiError(res, 404, "Account not found — it may not be funded yet on the Stellar network");
    return;
  }

  if (!response.ok) {
    apiError(res, 502, `Horizon error: ${response.status}`);
    return;
  }

  const raw = await response.json() as HorizonAccount;

  // Format balances for readability
  const balances = raw.balances.map((b) => {
    if (b.asset_type === "native") {
      return { asset: "XLM", balance: b.balance };
    }
    return {
      asset: b.asset_code,
      issuer: b.asset_issuer,
      balance: b.balance,
      limit: b.limit,
      authorized: b.is_authorized,
    };
  });

  // Build user-friendly response
  res.json({
    address: raw.id,
    home_domain: raw.home_domain ?? null,
    xlm_balance: raw.balances.find((b) => b.asset_type === "native")?.balance ?? "0",
    total_assets: balances.length,
    balances,
    signers: raw.signers.length,
    thresholds: raw.thresholds,
    flags: raw.flags,
    sequence: raw.sequence,
    last_modified: raw.last_modified_time,
  });
});

interface HorizonAccount {
  id: string;
  sequence: string;
  home_domain?: string;
  last_modified_time?: string;
  balances: {
    balance: string;
    limit?: string;
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
    is_authorized?: boolean;
  }[];
  signers: { key: string; weight: number; type: string }[];
  thresholds: { low_threshold: number; med_threshold: number; high_threshold: number };
  flags: {
    auth_required: boolean;
    auth_revocable: boolean;
    auth_immutable: boolean;
    auth_clawback_enabled: boolean;
  };
}
