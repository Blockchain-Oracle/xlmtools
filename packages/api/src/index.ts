import "dotenv/config";
import express from "express";
import { logger } from "./lib/logger.js";
import { cryptoRoute } from "./routes/crypto.js";
import { weatherRoute } from "./routes/weather.js";
import { domainRoute } from "./routes/domain.js";
import { searchRoute } from "./routes/search.js";
import { researchRoute } from "./routes/research.js";
import { redditRoute } from "./routes/reddit.js";
import { youtubeRoute } from "./routes/youtube.js";
import { screenshotRoute } from "./routes/screenshot.js";
import { scrapeRoute } from "./routes/scrape.js";
import { imageRoute } from "./routes/image.js";
import { stocksRoute } from "./routes/stocks.js";


const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "pulsar-api", version: "0.1.0" });
});

app.use("/crypto", cryptoRoute);
app.use("/weather", weatherRoute);
app.use("/domain", domainRoute);
app.use("/search", searchRoute);
app.use("/research", researchRoute);
app.use("/reddit", redditRoute);
app.use("/youtube", youtubeRoute);
app.use("/screenshot", screenshotRoute);
app.use("/scrape", scrapeRoute);
app.use("/image", imageRoute);
app.use("/stocks", stocksRoute);
const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  logger.info({ port: PORT }, "PULSAR API running");
});
