import "dotenv/config";
import express from "express";
import { logger } from "./lib/logger.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "pulsar-api", version: "0.1.0" });
});

// Routes will be added in later tasks

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  logger.info({ port: PORT }, "PULSAR API running");
});
