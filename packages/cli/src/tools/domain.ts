import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";

export function registerDomainTool(server: McpServer): void {
  server.registerTool(
    "domain",
    {
      title: "Domain Availability",
      description: "Check if a domain name is available. Free.",      inputSchema: z.object({
        name: z.string().describe("Domain name to check (e.g. stellar-tools.xyz)"),
      }),
    },
    async ({ name }) => {
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(`${config.apiUrl}/domain?name=${encodeURIComponent(name)}`);
        if (!res.ok) return err(`Domain API error: ${res.status}`);
        return ok(await res.json());
      } catch (e) { return err(String(e)); }
    }
  );
}
