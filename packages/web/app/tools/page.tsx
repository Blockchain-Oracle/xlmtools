import { ToolGrid } from "@/components/tool-grid"

export const metadata = {
  title: "Tools — PULSAR",
  description: "20 pay-per-call MCP tools for AI agents on Stellar.",
}

export default function ToolsPage() {
  return (
    <main className="flex flex-1 flex-col px-6 py-12 max-w-6xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground mb-3">
          The tools
        </h1>
        <p className="text-base text-muted-foreground">
          No subscriptions, no credits and no API keys required.
        </p>
      </div>

      <ToolGrid />
    </main>
  )
}
