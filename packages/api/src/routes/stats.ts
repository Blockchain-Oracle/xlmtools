import { Router } from "express";
import { getStats, getRecentCalls } from "../lib/call-log.js";

export const statsRoute = Router();

statsRoute.get("/", (_req, res) => {
  res.json(getStats());
});

statsRoute.get("/recent", (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  res.json({ calls: getRecentCalls(limit) });
});
