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
  featured?: boolean
}

interface BrandLogoProps {
  stem: string
  name: string
  hasDark: boolean
}

function BrandLogo({ stem, name, hasDark }: BrandLogoProps) {
  return (
    <div className="size-8 flex items-center justify-center rounded-md bg-muted/60 shrink-0 overflow-hidden p-1.5">
      {hasDark ? (
        <>
          <Image
            src={`/logos/${stem}-dark.svg`}
            alt={name}
            width={20}
            height={20}
            className="size-full object-contain block dark:hidden"
          />
          <Image
            src={`/logos/${stem}.svg`}
            alt={name}
            width={20}
            height={20}
            className="size-full object-contain hidden dark:block"
          />
        </>
      ) : (
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

export function ToolCard({ tool, featured = false }: ToolCardProps) {
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
      mode="orb"
      className={cn("rounded-xl cursor-default")}
      glowFrom="#6366f1"
      glowTo="#8b5cf6"
      glowSize={300}
      glowBlur={50}
      glowOpacity={0.55}
    >
      <div className={cn("flex flex-col gap-3.5 p-5", featured && "pb-6")}>
        {/* Header row: brand logo / category icon + name + price */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {hasBrandLogo ? (
              <BrandLogo stem={tool.logo!} name={tool.title} hasDark={tool.logoHasDark ?? false} />
            ) : (
              <div className="size-8 flex items-center justify-center rounded-md bg-muted/60 shrink-0 text-muted-foreground">
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
              className="shrink-0 font-mono text-[10px] px-1.5 text-emerald-600 border-emerald-300/60 dark:text-emerald-400 dark:border-emerald-800"
            >
              FREE
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed text-muted-foreground">
          {tool.description}
        </p>

        {/* Footer: category + copy button */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-muted-foreground/70">
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
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/40"
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
