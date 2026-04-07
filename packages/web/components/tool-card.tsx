import { Database, Search, Sparkles, Star, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { MagicCard } from "@/components/ui/magic-card"
import { cn } from "@/lib/utils"
import type { Tool, ToolCategory } from "@/lib/tools"

const categoryIcon: Record<ToolCategory, React.ReactNode> = {
  stellar: <Star className="size-3.5" />,
  search: <Search className="size-3.5" />,
  ai: <Sparkles className="size-3.5" />,
  data: <Database className="size-3.5" />,
  utility: <Wrench className="size-3.5" />,
}

const categoryLabel: Record<ToolCategory, string> = {
  stellar: "Stellar",
  search: "Search",
  ai: "AI",
  data: "Data",
  utility: "Utility",
}

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <MagicCard
      className={cn("rounded-xl cursor-default")}
      gradientColor="#1a1a1a"
      gradientOpacity={1}
    >
      <div className="flex flex-col gap-3 p-4">
        {/* Header row: name + price */}
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-sm font-semibold text-foreground leading-tight">
            {tool.title}
          </span>
          {tool.price ? (
            <Badge
              variant="outline"
              className="shrink-0 font-mono text-[10px] px-1.5 tabular-nums"
            >
              {tool.price}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="shrink-0 font-mono text-[10px] px-1.5 text-emerald-400 border-emerald-800"
            >
              FREE
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {tool.description}
        </p>

        {/* Footer: category + tool name */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            {categoryIcon[tool.category]}
            <span className="text-[10px] font-mono tracking-wider uppercase">
              {categoryLabel[tool.category]}
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/50">
            {tool.name}
          </span>
        </div>
      </div>
    </MagicCard>
  )
}
