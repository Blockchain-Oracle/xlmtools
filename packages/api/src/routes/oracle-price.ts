import { Router } from "express";
import { apiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import {
  Contract,
  TransactionBuilder,
  Account,
  xdr,
  Address,
  scValToNative,
  Networks,
} from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";

export const oraclePriceRoute = Router();

// Reflector contract addresses
const CONTRACTS = {
  dex: {
    mainnet: "CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M",
    testnet: "CAVLP5DH2GJPZMVO7IJY4CVOD5MWEFTJFVPD2YY2FQXOQHRGHK4D6HLP",
    desc: "Stellar DEX prices",
  },
  crypto: {
    mainnet: "CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN",
    testnet: "CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63",
    desc: "External CEX/DEX prices (BTC, ETH, etc.)",
  },
  fiat: {
    mainnet: "CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC",
    testnet: "CCSSOHTBL3LEWUCBBEB5NJFC2OKFRC74OWEIJIZLRJBGAAU4VMU5NV4W",
    desc: "Fiat exchange rates (EUR, GBP, etc.)",
  },
};

// Soroban RPC endpoints
const RPC_MAINNET = "https://soroban-rpc.mainnet.stellar.gateway.fm";
const RPC_TESTNET = "https://soroban-testnet.stellar.org";

// Dummy source for simulation (no funding needed)
const DUMMY_SOURCE = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

oraclePriceRoute.get("/", async (req, res) => {
  const asset = req.query.asset as string | undefined;
  const feed = (req.query.feed as string) ?? "crypto";
  const testnet = req.query.testnet === "true";

  if (!asset) {
    apiError(res, 400, 'asset required (e.g. "BTC", "ETH", "EUR"). feed can be "crypto", "fiat", or "dex".');
    return;
  }

  const contractInfo = CONTRACTS[feed as keyof typeof CONTRACTS];
  if (!contractInfo) {
    apiError(res, 400, `Invalid feed. Use: ${Object.keys(CONTRACTS).join(", ")}`);
    return;
  }

  const contractId = testnet ? contractInfo.testnet : contractInfo.mainnet;
  const rpcUrl = testnet ? RPC_TESTNET : RPC_MAINNET;
  const network = testnet ? Networks.TESTNET : Networks.PUBLIC;

  logger.info({ asset, feed, testnet }, "fetching oracle price");

  try {
    const server = new Server(rpcUrl);
    const contract = new Contract(contractId);

    // Build asset ScVal for the contract call
    const assetScVal = buildAssetScVal(asset.trim());

    // First get decimals
    const decimals = await simulateCall(server, contract, "decimals", [], network);
    const decimalCount = Number(decimals);

    // Get last price
    const priceData = await simulateCall(server, contract, "lastprice", [assetScVal], network);

    const priceParsed = priceData as { price: bigint; timestamp: bigint } | null;

    if (priceParsed == null) {
      res.json({
        found: false,
        asset,
        feed: contractInfo.desc,
        message: `No price data available for "${asset}" on the ${feed} feed`,
      });
      return;
    }

    const rawPrice = Number(priceParsed.price);
    const actualPrice = rawPrice / Math.pow(10, decimalCount);
    const timestamp = Number(priceParsed.timestamp);
    const age = Math.floor(Date.now() / 1000) - timestamp;

    res.json({
      found: true,
      asset,
      feed: contractInfo.desc,
      price_usd: actualPrice,
      timestamp: new Date(timestamp * 1000).toISOString(),
      age_seconds: age,
      stale: age > 600, // > 10 min = potentially stale
      decimals: decimalCount,
      network: testnet ? "testnet" : "mainnet",
    });
  } catch (e) {
    logger.error({ err: e, asset, feed }, "oracle price error");
    apiError(res, 502, `Oracle read failed: ${String(e)}`);
  }
});

/** Build Reflector Asset ScVal — "Other" variant for ticker symbols */
function buildAssetScVal(code: string): xdr.ScVal {
  // For now, all user-facing tickers use the "Other" variant (BTC, ETH, EUR, etc.)
  // The "Stellar" variant requires a Soroban contract address which is less user-friendly
  return xdr.ScVal.scvVec([
    xdr.ScVal.scvSymbol("Other"),
    xdr.ScVal.scvSymbol(code),
  ]);
}

/** Simulate a read-only contract call */
async function simulateCall(
  server: Server,
  contract: Contract,
  method: string,
  args: xdr.ScVal[],
  network: string,
): Promise<unknown> {
  const operation = contract.call(method, ...args);
  const account = new Account(DUMMY_SOURCE, "0");
  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: network,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);

  if ("error" in simResult) {
    throw new Error(`Simulation failed: ${(simResult as { error: string }).error}`);
  }

  const successResult = simResult as { result?: { retval: xdr.ScVal } };
  const retval = successResult.result?.retval;
  if (!retval) return null;

  // Check for Option::None
  const val = retval.value();
  if (val === false || val === undefined) return null;

  return scValToNative(retval);
}
