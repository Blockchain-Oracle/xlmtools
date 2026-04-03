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

export const dexTradesRoute = Router();

dexTradesRoute.get("/", async (req, res) => {
  const pair = req.query.pair as string | undefined;
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 200);
  const tradeType = (req.query.trade_type as string) ?? "all";

  if (!pair || !pair.includes("/")) {
    apiError(res, 400, 'pair required (e.g. "XLM/USDC")');
    return;
  }

  if (!["all", "orderbook", "liquidity_pool"].includes(tradeType)) {
    apiError(res, 400, 'trade_type must be "all", "orderbook", or "liquidity_pool"');
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
  params.set("limit", String(limit));
  params.set("order", "desc");
  params.set("trade_type", tradeType);

  const url = `${horizonUrl()}/trades?${params}`;
  logger.info({ pair, limit, tradeType }, "fetching trades");

  const response = await fetch(url);
  if (!response.ok) {
    apiError(res, 502, `Horizon error: ${response.status}`);
    return;
  }

  const data = await response.json() as {
    _embedded: { records: TradeRecord[] };
  };

  const trades = data._embedded.records.map((t) => ({
    time: t.ledger_close_time,
    type: t.trade_type,
    base_amount: t.base_amount,
    counter_amount: t.counter_amount,
    price: t.price ? `${t.price.n}/${t.price.d}` : undefined,
    seller: t.base_is_seller ? "base" : "counter",
    ...(t.trade_type === "liquidity_pool" ? { pool_fee_bp: t.liquidity_pool_fee_bp } : {}),
  }));

  res.json({
    pair: `${formatAsset(base)}/${formatAsset(counter)}`,
    trade_type: tradeType,
    count: trades.length,
    trades,
  });
});

interface TradeRecord {
  ledger_close_time: string;
  trade_type: string;
  base_amount: string;
  counter_amount: string;
  base_is_seller: boolean;
  price?: { n: number; d: number };
  liquidity_pool_fee_bp?: number;
}
