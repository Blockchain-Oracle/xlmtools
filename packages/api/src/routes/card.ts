import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const cardRoute = Router();

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

cardRoute.post("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);
  const {
    amount = 0,
    nameOnCard = "AI AGENT",
    email = "agent@pulsar.dev",
  } = req.body as {
    amount?: number;
    nameOnCard?: string;
    email?: string;
  };

  if (typeof amount !== "number" || amount < 5 || amount > 1000) {
    apiError(res, 400, "amount must be a number between 5 and 1000");
    return;
  }

  const totalCharge = (10 + amount + amount * 0.035).toFixed(3);

  // MPP charge gate: flat $10 card creation fee + load amount + 3.5% processing
  const result = await mppx.charge({
    amount: totalCharge,
    description: `Virtual card ($${amount} load)`,
  })(webReq);

  if (result.status === 402) {
    await sendWebResponse(result.challenge as globalThis.Response, res);
    return;
  }

  logger.info({ amount, nameOnCard }, "card creation request");

  // ASGCard SDK integration
  // @asgcard/sdk v1.1.4 exists on npm — to wire the real integration:
  //   1. Add "@asgcard/sdk" to packages/api/package.json dependencies
  //   2. Replace the stub below with:
  //
  //   import { ASGCardClient } from "@asgcard/sdk";
  //   const asgcard = new ASGCardClient({
  //     privateKey: process.env.ASGCARD_STELLAR_KEY!,
  //     // baseUrl defaults to https://api.asgcard.dev
  //   });
  //   const card = await asgcard.createCard({ amount, nameOnCard, email });
  //   // card = { card: { cardId, nameOnCard, lastFour, balance, status, createdAt },
  //   //           detailsEnvelope: { cardNumber, cvv, expiryMonth, expiryYear },
  //   //           payment: { txHash } }

  const responseData = {
    success: true,
    note: "ASGCard SDK integration pending — add @asgcard/sdk to package.json and ASGCARD_STELLAR_KEY env var to enable real card creation",
    charged_usdc: totalCharge,
    expected_response: {
      card: {
        cardId: "<uuid>",
        nameOnCard,
        lastFour: "****",
        balance: amount,
        status: "active",
        createdAt: new Date().toISOString(),
      },
      detailsEnvelope: {
        cardNumber: "5395 **** **** ****",
        expiryMonth: 12,
        expiryYear: 2028,
        cvv: "***",
      },
    },
  };

  const webRes = result.withReceipt(Response.json(responseData));
  await sendWebResponse(webRes as globalThis.Response, res);
});
