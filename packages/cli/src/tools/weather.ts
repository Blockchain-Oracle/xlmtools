import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";

export function registerWeatherTool(server: McpServer): void {
  server.registerTool(
    "weather",
    {
      title: "Weather",
      description: "Current weather and conditions for any city. Free.",
      inputSchema: z.object({
        location: z.string().describe("City name (e.g. Lagos, London, New York)"),
      }),
    },
    async ({ location }) => {
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(`${config.apiUrl}/weather?location=${encodeURIComponent(location)}`);
        if (!res.ok) return err(`Weather API error: ${res.status}`);
        return ok(await res.json());
      } catch (e) { return err(String(e)); }
    }
  );
}
