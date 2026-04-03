import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const redditRoute = Router();

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

// Cached token state
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getRedditToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET not configured");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "PULSAR/0.1.0",
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenRes.ok) {
    throw new Error(`Reddit OAuth error: ${tokenRes.status}`);
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = tokenData.access_token;
  // Expire 60 seconds early for safety
  tokenExpiresAt = now + (tokenData.expires_in - 60) * 1000;

  return cachedToken;
}

redditRoute.get("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);

  const result = await mppx.charge({
    amount: TOOL_PRICES.reddit,
    description: "Reddit search",
  })(webReq);

  if (result.status === 402) {
    await sendWebResponse(result.challenge as globalThis.Response, res);
    return;
  }

  const query = req.query.q as string | undefined;
  const subreddit = req.query.subreddit as string | undefined;
  const sort = (req.query.sort as string | undefined) ?? "relevance";

  if (!query) {
    apiError(res, 400, "q query param required");
    return;
  }

  logger.info({ query, subreddit, sort }, "reddit search request");

  let token: string;
  try {
    token = await getRedditToken();
  } catch (err) {
    logger.error({ err }, "Reddit OAuth failed");
    apiError(res, 500, "Reddit authentication failed");
    return;
  }

  const searchPath = subreddit
    ? `/r/${encodeURIComponent(subreddit)}/search.json`
    : "/search.json";

  const searchUrl =
    `https://oauth.reddit.com${searchPath}` +
    `?q=${encodeURIComponent(query)}&sort=${encodeURIComponent(sort)}&limit=10`;

  const redditRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "PULSAR/0.1.0",
    },
  });

  if (!redditRes.ok) {
    logger.warn({ status: redditRes.status }, "Reddit search API error");
    apiError(res, 502, `Reddit search API error: ${redditRes.status}`);
    return;
  }

  const data = (await redditRes.json()) as {
    data?: {
      children?: Array<{
        data: {
          title: string;
          url: string;
          score: number;
          subreddit: string;
          selftext?: string;
        };
      }>;
    };
  };

  const results =
    data.data?.children?.map((child) => ({
      title: child.data.title,
      url: child.data.url,
      score: child.data.score,
      subreddit: child.data.subreddit,
      excerpt: child.data.selftext?.slice(0, 300),
    })) ?? [];

  logger.info({ query, resultCount: results.length }, "reddit search complete");

  const webRes = result.withReceipt(
    Response.json({ query, results, count: results.length }),
  );
  await sendWebResponse(webRes as globalThis.Response, res);
});
