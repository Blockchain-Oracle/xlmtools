#!/usr/bin/env node
/**
 * @xlmtools/mcp — XLMTools MCP stdio server entry point.
 *
 * This package is a THIN wrapper: all tool implementations live in
 * `@xlmtools/cli` (the standalone CLI package), which exports a
 * `createMcpServer()` factory. Here we import that factory, wire it
 * up to an `StdioServerTransport`, and connect.
 *
 * Why two packages instead of one with two bins: npx can't decide
 * which bin to run when a package has multiple bins and none matches
 * the package tail name. So shipping a dedicated single-bin package
 * (`@xlmtools/mcp` → `xlmtools-mcp`) is the only clean way to make
 *   `claude mcp add xlmtools npx @xlmtools/mcp`
 * just work for every MCP host that spawns via npx.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "@xlmtools/cli";

async function main(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  // MCP stdio protocol uses stdout; logs must go to stderr.
  process.stderr.write(
    `[xlmtools-mcp] fatal: ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`,
  );
  process.exit(1);
});
