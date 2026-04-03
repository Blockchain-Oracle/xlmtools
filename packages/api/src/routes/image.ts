import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const imageRoute = Router();

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

imageRoute.post("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);

  const result = await mppx.charge({
    amount: TOOL_PRICES.image,
    description: "AI image generation via DALL-E 3",
  })(webReq);

  if (result.status === 402) {
    await sendWebResponse(result.challenge as globalThis.Response, res);
    return;
  }

  const { prompt, size, model } = req.body as {
    prompt?: string;
    size?: string;
    model?: string;
  };

  if (!prompt) {
    apiError(res, 400, "prompt body field required");
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    apiError(res, 500, "OPENAI_API_KEY not configured");
    return;
  }

  logger.info({ prompt: prompt.slice(0, 80), size, model }, "image generation request");

  const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model ?? "dall-e-3",
      prompt,
      n: 1,
      size: size ?? "1024x1024",
    }),
  });

  if (!dalleRes.ok) {
    logger.warn({ status: dalleRes.status }, "OpenAI image API error");
    apiError(res, 502, `OpenAI image API error: ${dalleRes.status}`);
    return;
  }

  const data = (await dalleRes.json()) as {
    data?: Array<{ url: string; revised_prompt?: string }>;
  };

  const image = data.data?.[0];
  if (!image) {
    logger.warn({}, "OpenAI returned no image");
    apiError(res, 502, "OpenAI returned no image data");
    return;
  }

  logger.info({}, "image generation complete");

  const webRes = result.withReceipt(
    Response.json({
      prompt,
      image_url: image.url,
      revised_prompt: image.revised_prompt,
    }),
  );
  await sendWebResponse(webRes as globalThis.Response, res);
});
