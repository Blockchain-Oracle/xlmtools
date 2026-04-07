"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Copy, Database, Search, Sparkles, Star, Wrench } from "lucide-react"
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

interface BrandLogoProps {
  stem: string
  name: string
  hasDark: boolean
}

function BrandLogo({ stem, name, hasDark }: BrandLogoProps) {
  return (
    <div className="size-7 flex items-center justify-center rounded-md bg-muted/60 shrink-0 overflow-hidden p-1">
      {hasDark ? (
        <>
          {/* Light mode: use colored -dark variant */}
          <Image
            src={`/logos/${stem}-dark.svg`}
            alt={name}
            width={20}
            height={20}
            className="size-full object-contain block dark:hidden"
          />
          {/* Dark mode: use white variant */}
          <Image
            src={`/logos/${stem}.svg`}
            alt={name}
            width={20}
            height={20}
            className="size-full object-contain hidden dark:block"
          />
        </>
      ) : (
        /* Single variant — invert in light mode to stay visible */
        <Image
          src={`/logos/${stem}.svg`}
          alt={name}
          width={20}
          height={20}
          className="size-full object-contain invert dark:invert-0"
        />
      )}
    </div>
  )
}

export function ToolCard({ tool }: ToolCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tool.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // fallback for non-secure contexts
    }
  }

  const hasBrandLogo = Boolean(tool.logo)

  return (
    <MagicCard
      className={cn("rounded-xl cursor-default")}
      gradientColor="#1a1a1a"
      gradientOpacity={1}
    >
      <div className="flex flex-col gap-3 p-4">
        {/* Header row: brand logo / category icon + name + price */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {hasBrandLogo ? (
              <BrandLogo stem={tool.logo!} name={tool.title} hasDark={tool.logoHasDark ?? false} />
            ) : (
              <div className="size-7 flex items-center justify-center rounded-md bg-muted/60 shrink-0 text-muted-foreground">
                {categoryIcon[tool.category]}
              </div>
            )}
            <span className="font-mono text-sm font-semibold text-foreground leading-tight truncate">
              {tool.title}
            </span>
          </div>

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
              className="shrink-0 font-mono text-[10px] px-1.5 text-emerald-500 border-emerald-700/50 dark:text-emerald-400 dark:border-emerald-800"
            >
              FREE
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {tool.description}
        </p>

        {/* Footer: category + copy button */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            {categoryIcon[tool.category]}
            <span className="text-[10px] font-mono tracking-wider uppercase">
              {categoryLabel[tool.category]}
            </span>
          </div>

          <button
            onClick={handleCopy}
            title="Copy sample prompt"
            className={cn(
              "flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono transition-all",
              copied
                ? "text-emerald-500 dark:text-emerald-400"
                : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/40"
            )}
          >
            {copied ? (
              <>
                <Check className="size-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </MagicCard>
  )
}
