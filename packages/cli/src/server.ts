/**
 * XLMTools MCP server factory.
 *
 * Builds and returns a fully-registered `McpServer` instance —
 * without connecting any transport. Consumers are responsible for
 * choosing the transport and calling `server.connect(transport)`.
 *
 * Currently used by `@xlmtools/mcp` (stdio transport wrapper).
 * Could also be used to host over HTTP/SSE in the future by wiring
 * a different transport.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Mppx } from "mppx/client";
import { stellar } from "@stellar/mpp/charge/client";
import { loadOrCreateWallet, getKeypair } from "./lib/wallet.js";
import { logger } from "./lib/logger.js";
import { registerCryptoTool } from "./tools/crypto.js";
import { registerWeatherTool } from "./tools/weather.js";
import { registerDomainTool } from "./tools/domain.js";
import { registerToolsListTool } from "./tools/tools-list.js";
import { registerWalletTool } from "./tools/wallet-tool.js";
import { registerSearchTool } from "./tools/search.js";
import { registerResearchTool } from "./tools/research.js";
import { registerYoutubeTool } from "./tools/youtube.js";
import { registerScreenshotTool } from "./tools/screenshot.js";
import { registerScrapeTool } from "./tools/scrape.js";
import { registerImageTool } from "./tools/image.js";
import { registerStocksTool } from "./tools/stocks.js";
import { registerDexOrderbookTool } from "./tools/dex-orderbook.js";
import { registerDexCandlesTool } from "./tools/dex-candles.js";
import { registerDexTradesTool } from "./tools/dex-trades.js";
import { registerSwapQuoteTool } from "./tools/swap-quote.js";
import { registerStellarAssetTool } from "./tools/stellar-asset.js";
import { registerStellarAccountTool } from "./tools/stellar-account.js";
import { registerStellarPoolsTool } from "./tools/stellar-pools.js";
import { registerOraclePriceTool } from "./tools/oracle-price.js";
import { registerBudgetTool } from "./tools/budget.js";

/**
 * Build a fully-configured XLMTools MCP server with all 21 tools
 * registered. The caller must connect a transport.
 *
 * Side effects on first call:
 *   - Loads or creates the user's Stellar wallet at ~/.xlmtools/config.json
 *   - Initializes Mppx with a Stellar charge method (polyfills fetch
 *     to auto-handle 402 payment challenges)
 */
export function createMcpServer(): McpServer {
  const config = loadOrCreateWallet();
  const keypair = getKeypair(config);

  // Mppx polyfills global fetch to auto-handle 402 payments
  Mppx.create({
    methods: [
      stellar.charge({
        keypair,
        mode: "pull",
        onProgress(event) {
          logger.debug({ eventType: event.type }, "MPP payment event");
        },
      }),
    ],
  });

  // { logging: {} } enables ctx.mcpReq.log() in tool handlers
  const server = new McpServer(
    { name: "xlmtools", version: "0.2.0" },
    { capabilities: { tools: {}, logging: {} } },
  );

  // Free tools
  registerCryptoTool(server);
  registerWeatherTool(server);
  registerDomainTool(server);
  registerToolsListTool(server);
  registerWalletTool(server);
  registerBudgetTool(server);

  // Paid tools
  registerSearchTool(server);
  registerResearchTool(server);
  registerYoutubeTool(server);
  registerScreenshotTool(server);
  registerScrapeTool(server);
  registerImageTool(server);
  registerStocksTool(server);

  // Stellar-native tools (free)
  registerDexOrderbookTool(server);
  registerDexCandlesTool(server);
  registerDexTradesTool(server);
  registerSwapQuoteTool(server);
  registerStellarAssetTool(server);
  registerStellarAccountTool(server);
  registerStellarPoolsTool(server);
  registerOraclePriceTool(server);

  return server;
}
