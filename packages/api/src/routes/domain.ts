import { Router } from "express";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const domainRoute = Router();

domainRoute.get("/", async (req, res) => {
  const name = req.query.name as string | undefined;
  if (!name) {
    apiError(res, 400, "name query param required (e.g. stellar-tools.xyz)");
    return;
  }

  logger.info({ name }, "checking domain availability");

  try {
    const { promises: dns } = await import("node:dns");
    await dns.lookup(name);
    res.json({ domain: name, available: false, note: "DNS resolves — likely registered" });
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOTFOUND") {
      res.json({ domain: name, available: true, note: "No DNS record found — likely available" });
    } else {
      logger.warn({ name, err: String(err) }, "DNS lookup failed");
      apiError(res, 502, `DNS lookup failed: ${String(err)}`);
    }
  }
});
