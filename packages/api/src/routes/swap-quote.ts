import { Router } from "express";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import {
  resolveAsset,
  assetQueryParams,
  mergeParams,
  formatAsset,
  toPathAsset,
  horizonUrl,
} from "../lib/stellar.js";

export const swapQuoteRoute = Router();

swapQuoteRoute.get("/", async (req, res) => {
  const from = req.query.from as string | undefined;   // "XLM"
  const to = req.query.to as string | undefined;       // "USDC"
  const amount = req.query.amount as string | undefined; // "100"
  const mode = (req.query.mode as string) ?? "send";   // "send" or "receive"

  if (!from || !to || !amount) {
    apiError(res, 400, 'Required: from, to, amount (e.g. from=XLM&to=USDC&amount=100)');
    return;
  }

  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    apiError(res, 400, "amount must be a positive number");
    return;
  }

  let source, dest;
  try {
    source = resolveAsset(from);
    dest = resolveAsset(to);
  } catch (e) {
    apiError(res, 400, String(e));
    return;
  }

  logger.info({ from, to, amount, mode }, "fetching swap quote");

  if (mode === "receive") {
    // Strict receive: "I want exactly {amount} of {to}, what's the cheapest {from}?"
    const params = mergeParams(
      assetQueryParams(dest, "destination"),
    );
    params.set("destination_amount", amount);
    params.set("source_assets", toPathAsset(source));

    const url = `${horizonUrl()}/paths/strict-receive?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as Record<string, unknown>;
      apiError(res, 502, `Horizon error: ${JSON.stringify(body)}`);
      return;
    }

    const data = await response.json() as { _embedded: { records: PathRecord[] } };
    const paths = data._embedded.records;

    if (paths.length === 0) {
      res.json({
        found: false,
        message: `No swap path found from ${formatAsset(source)} to ${formatAsset(dest)}`,
        suggestion: "Try a different amount or asset pair",
      });
      return;
    }

    const best = paths[0];
    const rate = (parseFloat(best.source_amount) / parseFloat(best.destination_amount)).toFixed(7);

    res.json({
      found: true,
      mode: "strict_receive",
      you_receive: `${best.destination_amount} ${formatAsset(dest)}`,
      you_pay: `${best.source_amount} ${formatAsset(source)}`,
      rate: `1 ${formatAsset(dest)} = ${rate} ${formatAsset(source)}`,
      hops: best.path.length,
      path: best.path.length > 0
        ? best.path.map(formatPathAsset).join(" → ")
        : "direct",
      slippage_tip: `Set send_max to ~${(parseFloat(best.source_amount) * 1.01).toFixed(7)} for 1% slippage protection`,
      alternatives: paths.length,
    });
  } else {
    // Strict send: "I send exactly {amount} of {from}, what's the best I get?"
    const params = assetQueryParams(source, "source");
    params.set("source_amount", amount);
    params.set("destination_assets", toPathAsset(dest));

    const url = `${horizonUrl()}/paths/strict-send?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as Record<string, unknown>;
      apiError(res, 502, `Horizon error: ${JSON.stringify(body)}`);
      return;
    }

    const data = await response.json() as { _embedded: { records: PathRecord[] } };
    const paths = data._embedded.records;

    if (paths.length === 0) {
      res.json({
        found: false,
        message: `No swap path found from ${formatAsset(source)} to ${formatAsset(dest)}`,
        suggestion: "Try a different amount or asset pair",
      });
      return;
    }

    const best = paths[0];
    const rate = (parseFloat(best.destination_amount) / parseFloat(best.source_amount)).toFixed(7);

    res.json({
      found: true,
      mode: "strict_send",
      you_send: `${best.source_amount} ${formatAsset(source)}`,
      you_receive: `${best.destination_amount} ${formatAsset(dest)}`,
      rate: `1 ${formatAsset(source)} = ${rate} ${formatAsset(dest)}`,
      hops: best.path.length,
      path: best.path.length > 0
        ? best.path.map(formatPathAsset).join(" → ")
        : "direct",
      slippage_tip: `Set dest_min to ~${(parseFloat(best.destination_amount) * 0.99).toFixed(7)} for 1% slippage protection`,
      alternatives: paths.length,
    });
  }
});

interface PathAsset {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}

interface PathRecord {
  source_asset_type: string;
  source_amount: string;
  destination_asset_type: string;
  destination_amount: string;
  path: PathAsset[];
}

function formatPathAsset(a: PathAsset): string {
  if (a.asset_type === "native") return "XLM";
  return a.asset_code ?? "?";
}
