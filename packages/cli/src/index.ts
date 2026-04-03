#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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
  { name: "pulsar", version: "0.1.0" },
  { capabilities: { tools: {}, logging: {} } }
);

// Free tools
registerCryptoTool(server);
registerWeatherTool(server);
registerDomainTool(server);
registerToolsListTool(server);
registerWalletTool(server);

// Paid tools
registerSearchTool(server);
registerResearchTool(server);

registerYoutubeTool(server);
registerScreenshotTool(server);
registerScrapeTool(server);
registerImageTool(server);
registerStocksTool(server);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("PULSAR MCP server running");
}

main().catch((error) => {
  logger.error({ err: error }, "Fatal error");
  process.exit(1);
});
