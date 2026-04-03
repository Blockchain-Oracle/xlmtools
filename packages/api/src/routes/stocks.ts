import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const stocksRoute = Router();

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

stocksRoute.get("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);

  const result = await mppx.charge({
    amount: TOOL_PRICES.stocks,
    description: "Stock quote via Alpha Vantage",
  })(webReq);

  if (result.status === 402) {
    await sendWebResponse(result.challenge as globalThis.Response, res);
    return;
  }

  const symbol = req.query.symbol as string | undefined;

  if (!symbol) {
    apiError(res, 400, "symbol query param required");
    return;
  }

  const apiKey = process.env.ALPHA_VANTAGE_KEY;
  if (!apiKey) {
    apiError(res, 500, "ALPHA_VANTAGE_KEY not configured");
    return;
  }

  logger.info({ symbol }, "stocks request");

  const avUrl =
    `https://www.alphavantage.co/query` +
    `?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;

  const avRes = await fetch(avUrl);

  if (!avRes.ok) {
    logger.warn({ status: avRes.status }, "Alpha Vantage API error");
    apiError(res, 502, `Alpha Vantage API error: ${avRes.status}`);
    return;
  }

  const data = (await avRes.json()) as {
    "Global Quote"?: {
      "01. symbol": string;
      "05. price": string;
      "09. change": string;
      "10. change percent": string;
      "06. volume": string;
      "07. latest trading day": string;
    };
  };

  const quote = data["Global Quote"];
  if (!quote) {
    logger.warn({ symbol }, "Alpha Vantage returned no quote");
    apiError(res, 502, "Alpha Vantage returned no data for symbol");
    return;
  }

  logger.info({ symbol }, "stocks request complete");

  const webRes = result.withReceipt(
    Response.json({
      symbol: quote["01. symbol"],
      price: quote["05. price"],
      change: quote["09. change"],
      change_pct: quote["10. change percent"],
      volume: quote["06. volume"],
      latest_trading_day: quote["07. latest trading day"],
    }),
  );
  await sendWebResponse(webRes as globalThis.Response, res);
});
