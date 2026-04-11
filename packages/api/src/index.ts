import "dotenv/config";
import express from "express";
import cors from "cors";
import { logger } from "./lib/logger.js";
import { cryptoRoute } from "./routes/crypto.js";
import { weatherRoute } from "./routes/weather.js";
import { domainRoute } from "./routes/domain.js";
import { searchRoute } from "./routes/search.js";
import { researchRoute } from "./routes/research.js";

import { youtubeRoute } from "./routes/youtube.js";
import { screenshotRoute } from "./routes/screenshot.js";
import { scrapeRoute } from "./routes/scrape.js";
import { imageRoute } from "./routes/image.js";
import { stocksRoute } from "./routes/stocks.js";
import { dexOrderbookRoute } from "./routes/dex-orderbook.js";
import { dexCandlesRoute } from "./routes/dex-candles.js";
import { dexTradesRoute } from "./routes/dex-trades.js";
import { swapQuoteRoute } from "./routes/swap-quote.js";
import { stellarAssetRoute } from "./routes/stellar-asset.js";
import { stellarAccountRoute } from "./routes/stellar-account.js";
import { stellarPoolsRoute } from "./routes/stellar-pools.js";
import { oraclePriceRoute } from "./routes/oracle-price.js";
import { statsRoute } from "./routes/stats.js";
import { discoveryRoute } from "./routes/discovery.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "xlmtools-api", version: "0.1.0" });
});

// Agent discovery endpoints
app.use("/.well-known", cors(), discoveryRoute);
app.use("/llms.txt", cors(), discoveryRoute);

app.use("/crypto", cryptoRoute);
app.use("/weather", weatherRoute);
app.use("/domain", domainRoute);
app.use("/search", searchRoute);
app.use("/research", researchRoute);

app.use("/youtube", youtubeRoute);
app.use("/screenshot", screenshotRoute);
app.use("/scrape", scrapeRoute);
app.use("/image", imageRoute);
app.use("/stocks", stocksRoute);

// Stellar-native tools (free — no MPP gate)
app.use("/dex-orderbook", dexOrderbookRoute);
app.use("/dex-candles", dexCandlesRoute);
app.use("/dex-trades", dexTradesRoute);
app.use("/swap-quote", swapQuoteRoute);
app.use("/stellar-asset", stellarAssetRoute);
app.use("/stellar-account", stellarAccountRoute);
app.use("/stellar-pools", stellarPoolsRoute);
app.use("/oracle-price", oraclePriceRoute);

// Stats API (call log — in-memory, no auth)
app.use("/stats", cors(), statsRoute);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  logger.info({ port: PORT }, "XLMTools API running");
});
