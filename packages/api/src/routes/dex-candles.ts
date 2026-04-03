import { Router } from "express";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import {
  resolveAsset,
  assetQueryParams,
  mergeParams,
  formatAsset,
  horizonUrl,
} from "../lib/stellar.js";

export const dexCandlesRoute = Router();

/** Valid resolutions: user-friendly name → milliseconds */
const RESOLUTIONS: Record<string, number> = {
  "1m": 60000,
  "5m": 300000,
  "15m": 900000,
  "1h": 3600000,
  "1d": 86400000,
  "1w": 604800000,
};

dexCandlesRoute.get("/", async (req, res) => {
  const pair = req.query.pair as string | undefined;
  const resolution = (req.query.resolution as string) ?? "1h";
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 200);

  if (!pair || !pair.includes("/")) {
    apiError(res, 400, 'pair required (e.g. "XLM/USDC")');
    return;
  }

  const resMs = RESOLUTIONS[resolution];
  if (!resMs) {
    apiError(res, 400, `Invalid resolution. Use: ${Object.keys(RESOLUTIONS).join(", ")}`);
    return;
  }

  const [baseStr, counterStr] = pair.split("/", 2);

  let base, counter;
  try {
    base = resolveAsset(baseStr);
    counter = resolveAsset(counterStr);
  } catch (e) {
    apiError(res, 400, String(e));
    return;
  }

  const params = mergeParams(
    assetQueryParams(base, "base"),
    assetQueryParams(counter, "counter"),
  );
  params.set("resolution", String(resMs));
  params.set("limit", String(limit));
  params.set("order", "desc"); // most recent first

  const url = `${horizonUrl()}/trade_aggregations?${params}`;
  logger.info({ pair, resolution, limit }, "fetching candles");

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    apiError(res, 502, `Horizon error: ${JSON.stringify(body)}`);
    return;
  }

  const data = await response.json() as {
    _embedded: {
      records: {
        timestamp: string;
        trade_count: string;
        base_volume: string;
        counter_volume: string;
        avg: string;
        high: string;
        low: string;
        open: string;
        close: string;
      }[];
    };
  };

  const candles = data._embedded.records.map((r) => ({
    time: new Date(Number(r.timestamp)).toISOString(),
    open: r.open,
    high: r.high,
    low: r.low,
    close: r.close,
    volume: r.base_volume,
    trades: Number(r.trade_count),
  }));

  res.json({
    pair: `${formatAsset(base)}/${formatAsset(counter)}`,
    resolution,
    count: candles.length,
    candles,
  });
});
