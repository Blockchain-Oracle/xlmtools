"use client";

import { ScrollProgress } from "@/components/ui/scroll-progress";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { HeroBanner } from "@/components/hero-banner";
import { HeroHeading } from "@/components/hero-heading";
import { HeroCta } from "@/components/hero-cta";
import { InstallCommand } from "@/components/install-command";
import { LogoBar } from "@/components/logo-bar";
import { StatsBar } from "@/components/stats-bar";
import { SetupSteps } from "@/components/setup-steps";

export default function Home() {
  return (
    <>
      <ScrollProgress />

      <main className="flex flex-1 flex-col items-center px-6">
        {/* Hero section — grid pattern background */}
        <section className="relative w-full flex flex-col items-center overflow-hidden pb-16">
          {/* Interactive grid background */}
          <InteractiveGridPattern
            width={40}
            height={40}
            squares={[40, 20]}
            className="opacity-30"
            squaresClassName="stroke-border/50 hover:fill-muted/40"
          />

          {/* Radial fade mask over the grid */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, hsl(var(--background)) 80%)",
            }}
          />

          {/* Hero content — above the grid/mask */}
          <div className="relative z-20 flex flex-col items-center gap-6 text-center max-w-2xl mt-8">
            <HeroBanner />

            <div className="mt-4">
              <HeroHeading />
            </div>

            <p className="text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed">
              Pay-per-call MCP tools on Stellar.
              <br />
              No API keys, no subscriptions.
            </p>

            <InstallCommand />

            <HeroCta />
          </div>
        </section>

        {/* Logo bar */}
        <div className="mb-12 w-full flex justify-center">
          <LogoBar />
        </div>

        {/* Stats bar */}
        <div className="mb-16 w-full flex justify-center">
          <StatsBar />
        </div>

        {/* Section divider */}
        <div className="w-full max-w-4xl mb-16 flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            How it works
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Setup steps */}
        <div className="mb-24 w-full flex justify-center">
          <SetupSteps />
        </div>
      </main>
    </>
  );
}
