import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { withReceiptBody } from "../lib/receipt.js";

export const screenshotRoute = Router();

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

screenshotRoute.get("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);

  const result = await mppx.charge({
    amount: TOOL_PRICES.screenshot,
    description: "Web page screenshot",
  })(webReq);

  if (result.status === 402) {
    await sendWebResponse(result.challenge as globalThis.Response, res);
    return;
  }

  const url = req.query.url as string | undefined;
  const format = (req.query.format as string | undefined) ?? "png";

  if (!url) {
    apiError(res, 400, "url query param required");
    return;
  }

  const accessKey = process.env.SCREENSHOTONE_KEY;
  if (!accessKey) {
    apiError(res, 500, "SCREENSHOTONE_KEY not configured");
    return;
  }

  logger.info({ url, format }, "screenshot request");

  const screenshotUrl =
    `https://api.screenshotone.com/take` +
    `?access_key=${encodeURIComponent(accessKey)}` +
    `&url=${encodeURIComponent(url)}` +
    `&format=${encodeURIComponent(format)}` +
    `&viewport_width=1280` +
    `&viewport_height=800` +
    `&response_type=json`;

  const screenshotRes = await fetch(screenshotUrl);

  if (!screenshotRes.ok) {
    logger.warn({ status: screenshotRes.status }, "ScreenshotOne API error");
    apiError(res, 502, `ScreenshotOne API error: ${screenshotRes.status}`);
    return;
  }

  const data = (await screenshotRes.json()) as {
    screenshot_url?: string;
    [key: string]: unknown;
  };

  logger.info({ url }, "screenshot complete");

  const body = { url, screenshot_url: data.screenshot_url, format };
  const wrapped = result.withReceipt(Response.json(body));
  const webRes = withReceiptBody(wrapped as globalThis.Response, body, "screenshot");
  await sendWebResponse(webRes, res);
});
