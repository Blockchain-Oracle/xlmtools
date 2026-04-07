"use client";

import { InstallCommand } from "@/components/install-command";
import { LogoBar } from "@/components/logo-bar";
import { StatsBar } from "@/components/stats-bar";
import { SetupSteps } from "@/components/setup-steps";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { WordRotate } from "@/components/ui/word-rotate";
import { Terminal, TypingAnimation, AnimatedSpan } from "@/components/ui/terminal";
import Link from "next/link";

const TAGLINES = [
  "Pay per call.",
  "No subscriptions.",
  "One-line install.",
  "Stellar-native.",
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">

      {/* ══════════════════════════════════════════
          HERO — left text, right terminal
          ══════════════════════════════════════════ */}
      <section className="relative w-full bg-background overflow-hidden">
        <DotPattern
          width={28}
          height={28}
          cr={1}
          className="absolute inset-0 text-foreground/[0.08] dark:text-foreground/[0.05]"
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-28 sm:py-36 grid lg:grid-cols-2 gap-16 lg:items-center">
          {/* Left: copy */}
          <div className="flex flex-col gap-8">
            <BlurFade delay={0}>
              <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                Stellar-Native MCP Server
              </span>
            </BlurFade>

            <BlurFade delay={0.06}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] text-foreground">
                Outperform<br />regular<br />agents.
              </h1>
            </BlurFade>

            <BlurFade delay={0.12}>
              <WordRotate
                words={TAGLINES}
                duration={2800}
                className="text-lg font-semibold text-muted-foreground"
              />
            </BlurFade>

            <BlurFade delay={0.16}>
              <p className="text-sm leading-relaxed text-muted-foreground/70 max-w-sm">
                The best way for AI to access and pay for quality tools—no
                API keys, subscriptions, or package installs.
              </p>
            </BlurFade>

            <BlurFade delay={0.20}>
              <div className="max-w-md">
                <InstallCommand />
              </div>
            </BlurFade>

            <BlurFade delay={0.24}>
              <div className="flex items-center gap-3">
                <Link href="/tools">
                  <ShimmerButton
                    shimmerColor="#ffffff"
                    background="var(--foreground)"
                    className="px-7 py-2.5 text-sm font-bold text-background rounded-full"
                  >
                    Explore Tools
                  </ShimmerButton>
                </Link>
                <Link
                  href="#how-it-works"
                  className="rounded-full border border-border px-7 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                >
                  How It Works
                </Link>
              </div>
            </BlurFade>
          </div>

          {/* Right: terminal */}
          <BlurFade delay={0.10} inView>
            <Terminal
              className="w-full max-w-full dark:bg-[oklch(0.07_0_0)] shadow-2xl border-border/50"
              sequence
              startOnView
            >
              <TypingAnimation duration={28} className="text-foreground/90 font-mono">
                $ claude mcp add pulsar npx @pulsar/mcp
              </TypingAnimation>

              <AnimatedSpan className="text-foreground/40 font-mono mt-1">
                <span>  ↳ installing @pulsar/mcp ...</span>
              </AnimatedSpan>

              <AnimatedSpan className="text-foreground/70 font-mono">
                <span>  ✓ server configured</span>
              </AnimatedSpan>

              <AnimatedSpan className="text-foreground/20 font-mono mt-3 text-[11px]">
                <span>────────────────────────────────────</span>
              </AnimatedSpan>

              <AnimatedSpan className="text-foreground/55 font-mono mt-1">
                <span>User  search for latest Stellar news</span>
              </AnimatedSpan>

              <AnimatedSpan className="text-foreground/45 font-mono">
                <span>Tool  pulsar/search</span>
              </AnimatedSpan>

              <AnimatedSpan className="text-foreground/65 font-mono">
                <span>Pay   $0.003 USDC  ·  settled 1.2s</span>
              </AnimatedSpan>

              <AnimatedSpan className="text-foreground/85 font-mono mt-1">
                <span>  ✓ 8 results returned</span>
              </AnimatedSpan>

              <AnimatedSpan className="text-foreground/25 font-mono mt-3 text-[10px] tracking-widest uppercase">
                <span>tx/abc123def456 · stellar testnet</span>
              </AnimatedSpan>
            </Terminal>
          </BlurFade>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LOGO BAR — alternating section
          ══════════════════════════════════════════ */}
      <section className="w-full border-y border-border bg-secondary py-14">
        <LogoBar />
      </section>

      {/* ══════════════════════════════════════════
          STATS — base background
          ══════════════════════════════════════════ */}
      <section className="w-full bg-background border-b border-border">
        <div className="max-w-5xl mx-auto">
          <StatsBar />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — alternating section
          ══════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="w-full bg-secondary border-b border-border"
      >
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="mb-12">
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              How it works
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
              Three steps to start.
            </h2>
          </div>
          <SetupSteps />
        </div>
      </section>

    </main>
  );
}
