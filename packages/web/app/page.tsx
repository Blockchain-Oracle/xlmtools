"use client";

import { InstallCommand } from "@/components/install-command";
import { LogoBar } from "@/components/logo-bar";
import { StatsBar } from "@/components/stats-bar";
import { SetupSteps } from "@/components/setup-steps";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { RetroGrid } from "@/components/ui/retro-grid";
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
    <main className="flex flex-1 flex-col items-center">
      {/* Hero */}
      <section className="relative flex w-full flex-col items-center overflow-hidden px-6 pt-28 pb-24 sm:pt-36 sm:pb-32">
        {/* Retro grid background */}
        <RetroGrid
          className="bottom-0 top-0"
          angle={65}
          cellSize={60}
          opacity={0.35}
          lightLineColor="oklch(0.45 0 0)"
          darkLineColor="oklch(0.35 0 0)"
        />

        {/* Hero content */}
        <div className="relative z-10 flex max-w-3xl flex-col items-center gap-7 text-center">
          <BlurFade delay={0}>
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              STELLAR-NATIVE MCP SERVER
            </span>
          </BlurFade>

          <BlurFade delay={0.08}>
            <h1
              className="text-5xl font-semibold text-foreground sm:text-6xl lg:text-7xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Outperform regular&nbsp;agents.
            </h1>
          </BlurFade>

          <BlurFade delay={0.14}>
            <WordRotate
              words={TAGLINES}
              duration={2800}
              className="text-base font-medium text-muted-foreground sm:text-lg"
            />
          </BlurFade>

          <BlurFade delay={0.18}>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground/80 sm:text-base">
              The best way for AI to access and pay for quality tools&mdash;no
              API keys, subscriptions, or package installs.
            </p>
          </BlurFade>

          <BlurFade delay={0.22}>
            <div className="w-full max-w-xl">
              <InstallCommand />
            </div>
          </BlurFade>

          <BlurFade delay={0.27}>
            <div className="flex items-center gap-4">
              <Link href="/tools">
                <ShimmerButton
                  shimmerColor="#ffffff"
                  background="rgba(255,255,255,0.06)"
                  className="border-border px-7 py-2.5 text-sm font-semibold text-foreground"
                >
                  Explore Tools
                </ShimmerButton>
              </Link>
              <Link
                href="#how-it-works"
                className="rounded-full border border-border px-7 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/20"
              >
                How It Works
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Logo bar */}
      <section className="w-full px-6 pb-16">
        <LogoBar />
      </section>

      {/* Stats bar */}
      <section className="w-full flex justify-center px-6 pb-24">
        <StatsBar />
      </section>

      {/* Terminal demo + section divider */}
      <section className="w-full flex flex-col items-center px-6 pb-24">
        <div className="w-full max-w-4xl">
          {/* Section label */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-border" />
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              Live Demo
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Two-column layout: copy + terminal */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <BlurFade delay={0.1} inView>
              <div className="flex flex-col gap-5">
                <h2
                  className="text-3xl font-semibold text-foreground sm:text-4xl"
                  style={{ letterSpacing: "-0.018em" }}
                >
                  Install once.
                  <br />
                  Pay only for what you use.
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  PULSAR uses Stellar&apos;s MPP micropayment protocol. Each
                  tool call is automatically metered and charged in USDC — no
                  subscriptions, no rate limits, no overhead.
                </p>
                <ul className="flex flex-col gap-2 text-sm">
                  {[
                    "Pay $0.001–$0.04 per call, never more",
                    "Payments settle on Stellar in seconds",
                    "Every transaction verifiable on-chain",
                    "Works in Claude, Cursor, and any MCP host",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <span className="mt-0.5 font-mono text-xs text-foreground/60">
                        →
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>

            <BlurFade delay={0.15} inView>
              <Terminal className="max-w-full" sequence startOnView>
                <TypingAnimation duration={35}>
                  $ claude mcp add pulsar npx @pulsar/mcp
                </TypingAnimation>

                <AnimatedSpan className="text-muted-foreground mt-2">
                  <span>Installing PULSAR MCP server...</span>
                </AnimatedSpan>

                <AnimatedSpan className="text-green-500 dark:text-green-400">
                  <span>✓ PULSAR added to Claude MCP config</span>
                </AnimatedSpan>

                <AnimatedSpan className="text-muted-foreground mt-2">
                  <span>You: search for latest Stellar news</span>
                </AnimatedSpan>

                <AnimatedSpan className="text-muted-foreground">
                  <span>Claude: [calling pulsar/search...]</span>
                </AnimatedSpan>

                <AnimatedSpan className="text-yellow-500 dark:text-yellow-400">
                  <span>⚡ MPP charge: $0.003 USDC → verified</span>
                </AnimatedSpan>

                <AnimatedSpan className="text-green-500 dark:text-green-400">
                  <span>✓ Results returned in 1.2s</span>
                </AnimatedSpan>

                <AnimatedSpan className="text-muted-foreground/60 mt-2 text-xs">
                  <span>Stellar testnet · tx/abc123def456</span>
                </AnimatedSpan>
              </Terminal>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Setup steps */}
      <section
        id="how-it-works"
        className="w-full flex flex-col items-center px-6 pb-32"
      >
        <div className="w-full max-w-4xl">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-border" />
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              How it works
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <SetupSteps />
        </div>
      </section>
    </main>
  );
}
