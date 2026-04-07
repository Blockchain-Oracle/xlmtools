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

/** Tools to feature prominently at the top (shown when no search/filter active) */
const FEATURED_NAMES = ["dex-orderbook", "research", "image", "swap-quote"]

export function ToolGrid() {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<FilterTab>("all")

  const showFeatured = query.trim() === "" && activeTab === "all"

  const featuredTools = useMemo(
    () => tools.filter((t) => FEATURED_NAMES.includes(t.name)),
    []
  )

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    const base = showFeatured
      ? tools.filter((t) => !FEATURED_NAMES.includes(t.name))
      : tools

    return base.filter((tool) => {
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
  }, [query, activeTab, showFeatured])

  const totalVisible = showFeatured ? featuredTools.length + filtered.length : filtered.length

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Search + filters */}
      <div className="flex flex-col gap-4">
        {/* Prominent search bar */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <Input
            placeholder="Search tools…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-12 text-base rounded-xl border-border bg-card focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-mono font-medium transition-colors",
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

      {/* Featured section */}
      {showFeatured && featuredTools.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
            Featured
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredTools.map((tool, i) => (
              <BlurFade key={tool.name} delay={0.04 * i} inView>
                <ToolCard tool={tool} featured />
              </BlurFade>
            ))}
          </div>
        </div>
      )}

      {/* Result count + section header */}
      <div className="flex items-center justify-between -mb-2">
        <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
          {showFeatured ? "All tools" : "Results"}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          {totalVisible} tool{totalVisible !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Main grid — 2 columns on desktop like frames.ag */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((tool, i) => (
          <BlurFade key={tool.name} delay={0.04 * i} inView>
            <ToolCard tool={tool} />
          </BlurFade>
        ))}
      </div>

      {filtered.length === 0 && !showFeatured && (
        <p className="text-center text-sm text-muted-foreground py-12">
          No tools match your search.
        </p>
      )}
    </div>
  )
}
