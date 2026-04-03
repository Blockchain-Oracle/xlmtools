import "dotenv/config";
import express from "express";
import { logger } from "./lib/logger.js";
import { cryptoRoute } from "./routes/crypto.js";
import { weatherRoute } from "./routes/weather.js";
import { domainRoute } from "./routes/domain.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "pulsar-api", version: "0.1.0" });
});

app.use("/crypto", cryptoRoute);
app.use("/weather", weatherRoute);
app.use("/domain", domainRoute);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  logger.info({ port: PORT }, "PULSAR API running");
});
