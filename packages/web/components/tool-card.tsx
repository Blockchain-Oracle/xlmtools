"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Database, Search, Sparkles, Star, Wrench } from "lucide-react"
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
    <>
      {hasDark ? (
        <>
          <Image
            src={`/logos/${stem}-dark.svg`}
            alt={name}
            width={18}
            height={18}
            className="size-full object-contain block dark:hidden"
          />
          <Image
            src={`/logos/${stem}.svg`}
            alt={name}
            width={18}
            height={18}
            className="size-full object-contain hidden dark:block"
          />
        </>
      ) : (
        <Image
          src={`/logos/${stem}.svg`}
          alt={name}
          width={18}
          height={18}
          className="size-full object-contain"
        />
      )}
    </>
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

  return (
    <button
      onClick={handleCopy}
      title={`Copy prompt: ${tool.title}`}
      className={cn(
        "group w-full text-left flex items-center gap-3 sm:gap-3.5 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border transition-all duration-200 cursor-pointer min-w-0",
        copied
          ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/5"
          : featured
            ? "border-border bg-card hover:border-foreground/25 hover:bg-muted/50 active:scale-[0.99]"
            : "border-border/70 bg-card hover:border-foreground/20 hover:bg-muted/40 active:scale-[0.99]"
      )}
    >
      {/* Icon / Logo */}
      <div className="size-8 shrink-0 flex items-center justify-center rounded-lg bg-muted border border-border/60 overflow-hidden p-1.5">
        {tool.logo ? (
          <BrandLogo stem={tool.logo} name={tool.title} hasDark={tool.logoHasDark ?? false} />
        ) : (
          <span className="text-muted-foreground">{categoryIcon[tool.category]}</span>
        )}
      </div>

      {/* Text block — grows to fill space */}
      <div className="flex-1 min-w-0">
        {/* Row 1: name + price */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground truncate tracking-tight">
            {tool.title}
          </span>
          {tool.price ? (
            <span className="font-mono text-xs font-medium text-muted-foreground tabular-nums shrink-0">
              {tool.price}
            </span>
          ) : (
            <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider shrink-0">
              Free
            </span>
          )}
        </div>

        {/* Row 2: description + category */}
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground truncate flex-1">
            {tool.description}
          </p>
          <span className="font-mono text-[9px] tracking-widest text-muted-foreground/50 uppercase shrink-0">
            {categoryLabel[tool.category]}
          </span>
        </div>
      </div>

      {/* Copy feedback — shows briefly after click */}
      <div className={cn(
        "shrink-0 size-5 flex items-center justify-center rounded-md transition-all duration-200",
        copied
          ? "opacity-100 text-emerald-500"
          : "opacity-0 group-hover:opacity-60 text-muted-foreground"
      )}>
        <Check className="size-3.5" />
      </div>
    </button>
  )
}
