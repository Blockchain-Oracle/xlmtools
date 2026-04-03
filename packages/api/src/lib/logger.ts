import pino from "pino";

export const logger = pino({
  name: "pulsar-api",
  level: process.env.LOG_LEVEL ?? "info",
});
