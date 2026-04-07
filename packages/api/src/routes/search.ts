import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { withReceiptBody } from "../lib/receipt.js";

export const searchRoute = Router();

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

searchRoute.get("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);

  // MPP charge gate — returns handler then invokes it with the web request
  const result = await mppx.charge({
    amount: TOOL_PRICES.search,
    description: "Web + news search",
  })(webReq);

  if (result.status === 402) {
    await sendWebResponse(result.challenge as globalThis.Response, res);
    return;
  }

  // Payment verified — perform the search
  const query = req.query.q as string | undefined;
  const count = Number(req.query.count ?? 10);

  if (!query) {
    apiError(res, 400, "q query param required");
    return;
  }

  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    apiError(res, 500, "BRAVE_API_KEY not configured");
    return;
  }

  logger.info({ query, count }, "brave search request");

  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`;
  const searchRes = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!searchRes.ok) {
    logger.warn({ status: searchRes.status }, "Brave Search API error");
    apiError(res, 502, `Brave Search API error: ${searchRes.status}`);
    return;
  }

  const data = (await searchRes.json()) as {
    web?: {
      results?: Array<{ title: string; url: string; description: string }>;
    };
  };

  const results =
    data.web?.results?.map((r) => ({
      title: r.title,
      url: r.url,
      description: r.description,
    })) ?? [];

  logger.info({ query, resultCount: results.length }, "brave search complete");

  const body = { query, results, count: results.length };
  const wrapped = result.withReceipt(Response.json(body));
  const webRes = withReceiptBody(wrapped as globalThis.Response, body, "search");
  await sendWebResponse(webRes, res);
});
