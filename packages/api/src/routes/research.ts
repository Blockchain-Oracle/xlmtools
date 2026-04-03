import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const researchRoute = Router();

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

researchRoute.get("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);

  const result = await mppx.charge({
    amount: TOOL_PRICES.research,
    description: "Deep research via Exa",
  })(webReq);

  if (result.status === 402) {
    await sendWebResponse(result.challenge as globalThis.Response, res);
    return;
  }

  const query = req.query.q as string | undefined;
  const numResults = Number(req.query.num_results ?? 5);

  if (!query) {
    apiError(res, 400, "q query param required");
    return;
  }

  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    apiError(res, 500, "EXA_API_KEY not configured");
    return;
  }

  logger.info({ query, numResults }, "exa research request");

  const exaRes = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query,
      numResults,
      useAutoprompt: true,
      contents: { text: true },
    }),
  });

  if (!exaRes.ok) {
    logger.warn({ status: exaRes.status }, "Exa API error");
    apiError(res, 502, `Exa API error: ${exaRes.status}`);
    return;
  }

  const data = (await exaRes.json()) as {
    results?: Array<{
      title: string;
      url: string;
      text?: string;
      publishedDate?: string;
    }>;
  };

  const results =
    data.results?.map((r) => ({
      title: r.title,
      url: r.url,
      excerpt: r.text?.slice(0, 500),
      published: r.publishedDate,
    })) ?? [];

  logger.info({ query, resultCount: results.length }, "exa research complete");

  const webRes = result.withReceipt(
    Response.json({ query, results, count: results.length }),
  );
  await sendWebResponse(webRes as globalThis.Response, res);
});
