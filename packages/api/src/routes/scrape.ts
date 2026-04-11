import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { withReceiptBody } from "../lib/receipt.js";

export const scrapeRoute = Router();

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

scrapeRoute.get("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);

  const result = await mppx.charge({
    amount: TOOL_PRICES.scrape,
    description: "Web page scrape via Jina Reader",
  })(webReq);

  if (result.status === 402) {
    await sendWebResponse(result.challenge as globalThis.Response, res);
    return;
  }

  const url = req.query.url as string | undefined;

  if (!url) {
    apiError(res, 400, "url query param required");
    return;
  }

  logger.info({ url }, "scrape request");

  const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
    headers: {
      "X-Return-Format": "markdown",
    },
  });

  if (!jinaRes.ok) {
    logger.warn({ status: jinaRes.status }, "Jina Reader API error");
    apiError(res, 502, `Jina Reader API error: ${jinaRes.status}`);
    return;
  }

  const text = await jinaRes.text();
  const MAX_LENGTH = 10000;
  const truncated = text.length > MAX_LENGTH;
  const content = truncated ? text.slice(0, MAX_LENGTH) : text;

  logger.info({ url, length: text.length, truncated }, "scrape complete");

  const body = { url, content, truncated };
  const wrapped = result.withReceipt(Response.json(body));
  const webRes = withReceiptBody(req, wrapped as globalThis.Response, body, "scrape");
  await sendWebResponse(webRes, res);
});
