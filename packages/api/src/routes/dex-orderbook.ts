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

export const dexOrderbookRoute = Router();

dexOrderbookRoute.get("/", async (req, res) => {
  const pair = req.query.pair as string | undefined; // "XLM/USDC"
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 200);

  if (!pair || !pair.includes("/")) {
    apiError(res, 400, 'pair required (e.g. "XLM/USDC")');
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
    assetQueryParams(base, "selling"),
    assetQueryParams(counter, "buying"),
  );
  params.set("limit", String(limit));

  const url = `${horizonUrl()}/order_book?${params}`;
  logger.info({ pair, limit }, "fetching orderbook");

  const response = await fetch(url);
  if (!response.ok) {
    apiError(res, 502, `Horizon error: ${response.status}`);
    return;
  }

  const raw = await response.json() as {
    bids: { price: string; amount: string; price_r: { n: number; d: number } }[];
    asks: { price: string; amount: string; price_r: { n: number; d: number } }[];
  };

  // Format for readability
  const bestBid = raw.bids[0]?.price ?? "—";
  const bestAsk = raw.asks[0]?.price ?? "—";
  const spread = raw.bids[0] && raw.asks[0]
    ? ((parseFloat(raw.asks[0].price) - parseFloat(raw.bids[0].price)) / parseFloat(raw.asks[0].price) * 100).toFixed(3)
    : null;

  res.json({
    pair: `${formatAsset(base)}/${formatAsset(counter)}`,
    best_bid: bestBid,
    best_ask: bestAsk,
    spread_pct: spread ? `${spread}%` : null,
    bid_count: raw.bids.length,
    ask_count: raw.asks.length,
    bids: raw.bids.slice(0, limit).map((b) => ({
      price: b.price,
      amount: b.amount,
    })),
    asks: raw.asks.slice(0, limit).map((a) => ({
      price: a.price,
      amount: a.amount,
    })),
  });
});
