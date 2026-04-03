import { Router } from "express";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import {
  resolveAsset,
  assetQueryParams,
  formatAsset,
  horizonUrl,
  stellarExpertUrl,
  stellarExpertAssetId,
} from "../lib/stellar.js";

export const stellarAssetRoute = Router();

stellarAssetRoute.get("/", async (req, res) => {
  const asset = req.query.asset as string | undefined;

  if (!asset) {
    apiError(res, 400, 'asset required (e.g. "USDC", "XLM", "CODE:ISSUER")');
    return;
  }

  let resolved;
  try {
    resolved = resolveAsset(asset);
  } catch (e) {
    apiError(res, 400, String(e));
    return;
  }

  // XLM (native) doesn't have an issuer — just return basic info
  if (resolved.asset_type === "native") {
    res.json({
      asset: "XLM",
      name: "Stellar Lumens",
      type: "native",
      description: "The native asset of the Stellar network",
      note: "XLM is not issued by any account — it is the native protocol token.",
    });
    return;
  }

  logger.info({ asset }, "fetching asset info");

  // Fetch from Horizon + StellarExpert in parallel
  const horizonParams = assetQueryParams(resolved, "");
  // Horizon uses flat params: asset_code, asset_issuer
  const hUrl = `${horizonUrl()}/assets?asset_code=${resolved.asset_code}&asset_issuer=${resolved.asset_issuer}&limit=1`;
  const seUrl = `${stellarExpertUrl()}/asset/${stellarExpertAssetId(resolved)}`;

  const [horizonRes, expertRes] = await Promise.allSettled([
    fetch(hUrl).then(async (r) => r.ok ? await r.json() as HorizonAssetsResponse : null),
    fetch(seUrl).then(async (r) => r.ok ? await r.json() as StellarExpertAsset : null),
  ]);

  const horizon = horizonRes.status === "fulfilled" ? horizonRes.value : null;
  const expert = expertRes.status === "fulfilled" ? expertRes.value : null;

  const horizonAsset = horizon?._embedded?.records?.[0];

  if (!horizonAsset && !expert) {
    apiError(res, 404, `Asset ${formatAsset(resolved)} not found on Stellar`);
    return;
  }

  // Build user-friendly response
  const result: Record<string, unknown> = {
    asset: formatAsset(resolved),
    code: resolved.asset_code,
    issuer: resolved.asset_issuer,
    type: resolved.asset_type,
  };

  // From StellarExpert (richer data)
  if (expert && !("error" in expert)) {
    if (expert.toml_info ?? expert.tomlInfo) {
      const toml = expert.toml_info ?? expert.tomlInfo;
      result.org_name = toml?.orgName;
      result.description = toml?.desc;
      result.image = toml?.image;
      result.anchor_asset = toml?.anchorAsset;
      result.anchor_type = toml?.anchorAssetType;
    }
    result.domain = expert.home_domain ?? expert.domain;
    result.price_xlm = expert.price;
    result.volume_7d = expert.volume7d != null ? (Number(expert.volume7d) / 1e7).toFixed(2) : undefined;
    result.trades_total = expert.trades;
    result.payments_total = expert.payments;
    if (expert.rating) {
      result.rating = expert.rating;
    }
    if (expert.contract) {
      result.soroban_contract = expert.contract;
    }
  }

  // From Horizon (authoritative on-chain data)
  if (horizonAsset) {
    result.total_supply = horizonAsset.balances?.authorized;
    result.accounts_authorized = horizonAsset.accounts?.authorized;
    result.flags = horizonAsset.flags;
    if (horizonAsset.contract_id) {
      result.soroban_contract = horizonAsset.contract_id;
    }
  }

  res.json(result);
});

// Types for API responses
interface HorizonAssetsResponse {
  _embedded: {
    records: {
      asset_type: string;
      asset_code: string;
      asset_issuer: string;
      contract_id?: string;
      accounts?: { authorized: number };
      balances?: { authorized: string };
      flags?: {
        auth_required: boolean;
        auth_revocable: boolean;
        auth_immutable: boolean;
        auth_clawback_enabled: boolean;
      };
    }[];
  };
}

interface StellarExpertAsset {
  asset: string;
  price?: number;
  volume7d?: number;
  trades?: number;
  payments?: number;
  home_domain?: string;
  domain?: string;
  contract?: string;
  rating?: {
    age: number;
    activity: number;
    trustlines: number;
    liquidity: number;
    volume7d: number;
    interop: number;
    average: number;
  };
  toml_info?: TomlInfo;
  tomlInfo?: TomlInfo;
  error?: string;
}

interface TomlInfo {
  orgName?: string;
  desc?: string;
  image?: string;
  anchorAsset?: string;
  anchorAssetType?: string;
}
