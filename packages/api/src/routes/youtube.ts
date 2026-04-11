import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { withReceiptBody } from "../lib/receipt.js";

export const youtubeRoute = Router();

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

youtubeRoute.get("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);

  const result = await mppx.charge({
    amount: TOOL_PRICES.youtube,
    description: "YouTube search / captions",
  })(webReq);

  if (result.status === 402) {
    await sendWebResponse(result.challenge as globalThis.Response, res);
    return;
  }

  const query = req.query.q as string | undefined;
  const videoId = req.query.id as string | undefined;

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    apiError(res, 500, "YOUTUBE_API_KEY not configured");
    return;
  }

  if (videoId) {
    // Captions mode
    logger.info({ videoId }, "youtube captions request");

    const captionsUrl =
      `https://www.googleapis.com/youtube/v3/captions` +
      `?part=snippet&videoId=${encodeURIComponent(videoId)}&key=${apiKey}`;

    const captionsRes = await fetch(captionsUrl);

    if (!captionsRes.ok) {
      logger.warn({ status: captionsRes.status }, "YouTube captions API error");
      apiError(res, 502, `YouTube captions API error: ${captionsRes.status}`);
      return;
    }

    const data = (await captionsRes.json()) as {
      items?: Array<{
        id: string;
        snippet: {
          language: string;
          name: string;
          trackKind: string;
        };
      }>;
    };

    const captions =
      data.items?.map((item) => ({
        id: item.id,
        language: item.snippet.language,
        name: item.snippet.name,
        trackKind: item.snippet.trackKind,
      })) ?? [];

    logger.info({ videoId, captionCount: captions.length }, "youtube captions complete");

    const captionBody = { videoId, captions, count: captions.length };
    const captionWrapped = result.withReceipt(Response.json(captionBody));
    const captionWebRes = withReceiptBody(req, captionWrapped as globalThis.Response, captionBody, "youtube");
    await sendWebResponse(captionWebRes, res);
    return;
  }

  if (!query) {
    apiError(res, 400, "q or id query param required");
    return;
  }

  // Search mode
  logger.info({ query }, "youtube search request");

  const searchUrl =
    `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${apiKey}`;

  const searchRes = await fetch(searchUrl);

  if (!searchRes.ok) {
    logger.warn({ status: searchRes.status }, "YouTube search API error");
    apiError(res, 502, `YouTube search API error: ${searchRes.status}`);
    return;
  }

  const data = (await searchRes.json()) as {
    items?: Array<{
      id: { videoId: string };
      snippet: {
        title: string;
        description: string;
        channelTitle: string;
        publishedAt: string;
      };
    }>;
  };

  const results =
    data.items?.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channel: item.snippet.channelTitle,
      published: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    })) ?? [];

  logger.info({ query, resultCount: results.length }, "youtube search complete");

  const searchBody = { query, results, count: results.length };
  const searchWrapped = result.withReceipt(Response.json(searchBody));
  const searchWebRes = withReceiptBody(req, searchWrapped as globalThis.Response, searchBody, "youtube");
  await sendWebResponse(searchWebRes, res);
});
