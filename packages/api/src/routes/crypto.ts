import { Router } from "express";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const cryptoRoute = Router();

cryptoRoute.get("/", async (req, res) => {
  const ids = req.query.ids as string | undefined;
  const vs_currency = (req.query.vs_currency as string) ?? "usd";

  if (!ids) {
    apiError(res, 400, "ids query param required (e.g. bitcoin,ethereum)");
    return;
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(vs_currency)}&include_24hr_change=true&include_market_cap=true`;

  logger.info({ ids, vs_currency }, "fetching crypto prices");

  const response = await fetch(url, { headers: { Accept: "application/json" } });

  if (!response.ok) {
    logger.warn({ status: response.status }, "CoinGecko API error");
    apiError(res, 502, `CoinGecko API error: ${response.status}`);
    return;
  }

  res.json(await response.json());
});
