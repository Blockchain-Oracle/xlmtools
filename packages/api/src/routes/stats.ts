import { Router } from "express";
import {
  getStats,
  getRecentCalls,
  getTotalCalls,
  getCallsByClient,
  countCallsByClient,
} from "../lib/call-log.js";

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

/**
 * Per-address tool-call history.
 *
 *   GET /stats/by-client?address=G...&limit=7&offset=0
 *
 * Returns paginated entries from the in-memory call log filtered to
 * the given Stellar address (matched against the X-XLMTools-Client
 * header that was on each call when it was made). Same response
 * shape as /stats/recent so the frontend can reuse the same renderer.
 *
 * Returns an empty `calls` array if the address has never made a
 * call through this API — that's the "fresh wallet / typo" case.
 */
statsRoute.get("/by-client", (req, res) => {
  const address = String(req.query.address ?? "").trim();
  if (!address) {
    res.status(400).json({ error: "address query param required" });
    return;
  }
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  res.json({
    address,
    calls: getCallsByClient(address, limit, offset),
    total: countCallsByClient(address),
    limit,
    offset,
  });
});
