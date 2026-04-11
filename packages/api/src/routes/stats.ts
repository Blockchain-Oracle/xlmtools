import { Router } from "express";
import { getStats, getRecentCalls, getTotalCalls } from "../lib/call-log.js";

export const statsRoute = Router();

statsRoute.get("/", (_req, res) => {
  res.json(getStats());
});

statsRoute.get("/recent", (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  res.json({
    calls: getRecentCalls(limit, offset),
    total: getTotalCalls(),
    limit,
    offset,
  });
});
