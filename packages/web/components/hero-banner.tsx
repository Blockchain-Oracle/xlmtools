"use client";

import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { cn } from "@/lib/utils";

export function HeroBanner() {
  return (
    <div className="mt-8 mb-2">
      <div
        className={cn(
          "inline-flex items-center rounded-full border border-border",
          "bg-card/50 px-4 py-1.5",
          "transition-all duration-300 ease-in hover:bg-card"
        )}
      >
        <AnimatedShinyText
          shimmerWidth={120}
          className={cn(
            "font-mono text-[10px] tracking-widest uppercase",
            "text-muted-foreground"
          )}
        >
          ALL TOOLS FREE DURING TESTNET
        </AnimatedShinyText>
      </div>
    </div>
  );
}
