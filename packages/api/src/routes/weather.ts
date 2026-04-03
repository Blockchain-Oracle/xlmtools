import { Router } from "express";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const weatherRoute = Router();

weatherRoute.get("/", async (req, res) => {
  const location = req.query.location as string | undefined;
  if (!location) {
    apiError(res, 400, "location query param required (e.g. Lagos, London)");
    return;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    apiError(res, 500, "OPENWEATHER_API_KEY not configured");
    return;
  }

  logger.info({ location }, "fetching weather");

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
  const response = await fetch(url);

  if (!response.ok) {
    logger.warn({ status: response.status, location }, "OpenWeatherMap error");
    apiError(res, 502, `OpenWeatherMap error: ${response.status}`);
    return;
  }

  const data = await response.json() as Record<string, unknown>;
  res.json({
    location: data.name,
    country: (data.sys as Record<string, unknown>)?.country,
    temp_c: (data.main as Record<string, unknown>)?.temp,
    feels_like_c: (data.main as Record<string, unknown>)?.feels_like,
    humidity_pct: (data.main as Record<string, unknown>)?.humidity,
    description: ((data.weather as Array<Record<string, unknown>>)?.[0])?.description,
    wind_ms: (data.wind as Record<string, unknown>)?.speed,
  });
});
