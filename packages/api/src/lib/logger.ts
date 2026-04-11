import pino from "pino";

export const logger = pino({
  name: "xlmtools-api",
  level: process.env.LOG_LEVEL ?? "info",
});
