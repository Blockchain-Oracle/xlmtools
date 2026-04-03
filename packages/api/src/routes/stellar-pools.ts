import { Router } from "express";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { resolveAsset, formatAsset, horizonUrl } from "../lib/stellar.js";

export const stellarPoolsRoute = Router();

stellarPoolsRoute.get("/", async (req, res) => {
  const asset = req.query.asset as string | undefined;
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 200);

  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("order", "desc");

  // Optional filter by asset
  if (asset) {
    try {
      const resolved = resolveAsset(asset);
      if (resolved.asset_type === "native") {
        params.set("reserves", "native");
      } else {
        params.set("reserves", `${resolved.asset_code}:${resolved.asset_issuer}`);
      }
    } catch (e) {
      apiError(res, 400, String(e));
      return;
    }
  }

  const url = `${horizonUrl()}/liquidity_pools?${params}`;
  logger.info({ asset, limit }, "fetching liquidity pools");

  const response = await fetch(url);
  if (!response.ok) {
    apiError(res, 502, `Horizon error: ${response.status}`);
    return;
  }

  const data = await response.json() as {
    _embedded: { records: PoolRecord[] };
  };

  const pools = data._embedded.records.map((p) => ({
    id: p.id,
    fee_pct: `${p.fee_bp / 100}%`,
    total_trustlines: p.total_trustlines,
    total_shares: p.total_shares,
    reserves: p.reserves.map((r) => ({
      asset: formatPoolAsset(r.asset),
      amount: r.amount,
    })),
    last_modified: p.last_modified_time,
  }));

  res.json({
    filter: asset ?? "all",
    count: pools.length,
    pools,
  });
});

function formatPoolAsset(raw: string): string {
  if (raw === "native") return "XLM";
  // Pool assets are "CODE:ISSUER"
  const colon = raw.indexOf(":");
  if (colon === -1) return raw;
  const code = raw.slice(0, colon);
  const issuer = raw.slice(colon + 1);
  return `${code}:${issuer.slice(0, 4)}…${issuer.slice(-4)}`;
}

interface PoolRecord {
  id: string;
  fee_bp: number;
  type: string;
  total_trustlines: string;
  total_shares: string;
  reserves: { asset: string; amount: string }[];
  last_modified_time: string;
}
