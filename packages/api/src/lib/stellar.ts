/**
 * Stellar asset resolver — turns user-friendly names into Horizon query params.
 *
 * Users can type:
 *   "XLM"           → native
 *   "USDC"          → well-known USDC (Circle)
 *   "USDC:GA5Z..."  → explicit code:issuer
 *   "GA5Z..."       → treated as issuer (for asset search)
 */

const HORIZON_PUBLIC = "https://horizon.stellar.org";
const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";
const STELLAR_EXPERT_PUBLIC = "https://api.stellar.expert/explorer/public";
const STELLAR_EXPERT_TESTNET = "https://api.stellar.expert/explorer/testnet";

/** Well-known mainnet assets — saves users from memorising issuer addresses */
const WELL_KNOWN: Record<string, { code: string; issuer: string }> = {
  USDC: { code: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" },
  EURC: { code: "EURC", issuer: "GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2" },
  AQUA: { code: "AQUA", issuer: "GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA" },
  yUSDC: { code: "yUSDC", issuer: "GDGTVWSM4MGS4T7Z6W4RPWOCHE2I6FDFDZWARD3NOY7P5VKB6NIAGCQI" },
  BLND: { code: "BLND", issuer: "CD25MNVTZDL4Y3XBCPCJXGXATV5WUHHOWMYFF4YBXDALQUB6T3UKBCRA" },
  SHX: { code: "SHX", issuer: "GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEZ6UIRGYLAXUHMZAOQR2S5SKR" },
};

export interface ResolvedAsset {
  asset_type: "native" | "credit_alphanum4" | "credit_alphanum12";
  asset_code?: string;
  asset_issuer?: string;
}

/**
 * Resolve a user-friendly asset string into Horizon query params.
 *
 * Accepted formats:
 *   "XLM" | "native" | "xlm"           → native
 *   "USDC"                              → well-known lookup
 *   "USDC:GA5ZSEJYB37..."              → explicit code:issuer
 *   Full G-address only                 → error (ambiguous)
 */
export function resolveAsset(input: string): ResolvedAsset {
  const trimmed = input.trim();

  // Native XLM
  if (trimmed.toLowerCase() === "xlm" || trimmed.toLowerCase() === "native") {
    return { asset_type: "native" };
  }

  // Explicit CODE:ISSUER
  if (trimmed.includes(":")) {
    const [code, issuer] = trimmed.split(":", 2);
    if (!code || !issuer) throw new Error(`Invalid asset format: "${trimmed}". Use CODE:ISSUER`);
    return {
      asset_type: code.length <= 4 ? "credit_alphanum4" : "credit_alphanum12",
      asset_code: code,
      asset_issuer: issuer,
    };
  }

  // Well-known lookup
  const known = WELL_KNOWN[trimmed] ?? WELL_KNOWN[trimmed.toUpperCase()];
  if (known) {
    return {
      asset_type: known.code.length <= 4 ? "credit_alphanum4" : "credit_alphanum12",
      asset_code: known.code,
      asset_issuer: known.issuer,
    };
  }

  throw new Error(
    `Unknown asset "${trimmed}". Use CODE:ISSUER format, or one of: ${["XLM", ...Object.keys(WELL_KNOWN)].join(", ")}`
  );
}

/** Build Horizon query string params for a resolved asset with a given prefix (e.g. "base", "selling") */
export function assetQueryParams(asset: ResolvedAsset, prefix: string): URLSearchParams {
  const params = new URLSearchParams();
  params.set(`${prefix}_asset_type`, asset.asset_type);
  if (asset.asset_code) params.set(`${prefix}_asset_code`, asset.asset_code);
  if (asset.asset_issuer) params.set(`${prefix}_asset_issuer`, asset.asset_issuer);
  return params;
}

/** Merge multiple URLSearchParams into one */
export function mergeParams(...paramsList: URLSearchParams[]): URLSearchParams {
  const merged = new URLSearchParams();
  for (const params of paramsList) {
    for (const [k, v] of params) merged.set(k, v);
  }
  return merged;
}

/** Format asset for display: "XLM" or "USDC" or "CODE:ISSUER" (truncated) */
export function formatAsset(asset: ResolvedAsset): string {
  if (asset.asset_type === "native") return "XLM";
  // Check if it's well-known
  for (const [name, known] of Object.entries(WELL_KNOWN)) {
    if (known.code === asset.asset_code && known.issuer === asset.asset_issuer) return name;
  }
  return `${asset.asset_code}:${asset.asset_issuer?.slice(0, 4)}…${asset.asset_issuer?.slice(-4)}`;
}

/** Horizon base URL. Defaults to mainnet since DEX/asset data lives there. */
export function horizonUrl(testnet = false): string {
  return testnet ? HORIZON_TESTNET : HORIZON_PUBLIC;
}

/** StellarExpert base URL. Defaults to mainnet since asset analytics live there. */
export function stellarExpertUrl(testnet = false): string {
  return testnet ? STELLAR_EXPERT_TESTNET : STELLAR_EXPERT_PUBLIC;
}

/**
 * Horizon URL for account-scoped lookups (e.g. /accounts/<G-address>).
 *
 * Unlike `horizonUrl()`, this one respects `STELLAR_NETWORK` and
 * defaults to **testnet** — matching the project's testnet-first
 * stance (auto-funded wallets, friendbot, Circle testnet faucet).
 *
 * Do NOT use this for DEX/asset queries — those should stay on
 * mainnet where the liquidity actually lives.
 */
export function accountHorizonUrl(): string {
  return process.env.STELLAR_NETWORK === "mainnet"
    ? HORIZON_PUBLIC
    : HORIZON_TESTNET;
}

/** StellarExpert asset ID format: CODE-ISSUER-TYPE */
export function stellarExpertAssetId(asset: ResolvedAsset): string {
  if (asset.asset_type === "native") return "XLM";
  const type = asset.asset_type === "credit_alphanum4" ? 1 : 2;
  return `${asset.asset_code}-${asset.asset_issuer}-${type}`;
}

/** Format Horizon destination_assets param: "native" or "CODE:ISSUER" */
export function toPathAsset(asset: ResolvedAsset): string {
  if (asset.asset_type === "native") return "native";
  return `${asset.asset_code}:${asset.asset_issuer}`;
}
