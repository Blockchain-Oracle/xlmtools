import { ToolGrid } from "@/components/tool-grid"

export const metadata = {
  title: "Tools — XLMTools",
  description: "20 pay-per-call MCP tools for AI agents on Stellar.",
}

export default function ToolsPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Page header — alternating bg */}
      <div className="w-full bg-secondary border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            21 tools available
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-[0.9]">
            The tools.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            No subscriptions, no credits, no API keys. Pay per call in USDC on Stellar.
          </p>
        </div>
      </div>

      {/* Tool grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 w-full">
        <ToolGrid />
      </div>
    </main>
  )
}
