"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { BlurFade } from "@/components/ui/blur-fade"
import { ToolCard } from "@/components/tool-card"
import { cn } from "@/lib/utils"
import { tools } from "@/lib/tools"
import type { ToolCategory } from "@/lib/tools"

type FilterTab = ToolCategory | "all" | "free"

const TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "stellar", label: "Stellar" },
  { value: "search", label: "Search" },
  { value: "ai", label: "AI" },
  { value: "data", label: "Data" },
  { value: "utility", label: "Utility" },
  { value: "free", label: "Free" },
]

export function ToolGrid() {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<FilterTab>("all")

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return tools.filter((tool) => {
      const matchesCategory =
        activeTab === "all"
          ? true
          : activeTab === "free"
            ? tool.free
            : tool.category === activeTab

      const matchesQuery =
        q === "" ||
        tool.name.toLowerCase().includes(q) ||
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q)

      return matchesCategory && matchesQuery
    })
  }, [query, activeTab])

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search + filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tools…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-mono font-medium transition-colors",
                activeTab === value
                  ? "bg-foreground text-background"
                  : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground font-mono">
        {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((tool, i) => (
          <BlurFade key={tool.name} delay={0.05 * i} inView>
            <ToolCard tool={tool} />
          </BlurFade>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          No tools match your search.
        </p>
      )}
    </div>
  )
}
