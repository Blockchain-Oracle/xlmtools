"use client";

import { InstallCommand } from "@/components/install-command";
import { LogoBar } from "@/components/logo-bar";
import { StatsBar } from "@/components/stats-bar";
import { SetupSteps } from "@/components/setup-steps";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center">
      {/* Hero */}
      <section className="flex w-full flex-col items-center px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="flex max-w-2xl flex-col items-center gap-8 text-center">
          <BlurFade delay={0}>
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              STELLAR-NATIVE MCP SERVER
            </span>
          </BlurFade>

          <BlurFade delay={0.1}>
            <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
              Outperform regular&nbsp;agents.
            </h1>
          </BlurFade>

          <BlurFade delay={0.15}>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              The best way for AI to access and pay for quality tools
              &mdash;&nbsp;no API keys, subscriptions, or package install.
            </p>
          </BlurFade>

          <BlurFade delay={0.2}>
            <div className="w-full max-w-xl">
              <InstallCommand />
            </div>
          </BlurFade>

          <BlurFade delay={0.25}>
            <div className="flex items-center gap-4">
              <Link href="/tools">
                <ShimmerButton
                  shimmerColor="#ffffff"
                  background="rgba(255,255,255,0.08)"
                  className="border-border px-7 py-2.5 text-sm font-semibold text-foreground"
                >
                  Get Started
                </ShimmerButton>
              </Link>
              <Link
                href="#"
                className="rounded-full border border-border px-7 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/20"
              >
                View Docs
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
      <section className="w-full flex justify-center px-6 pb-20">
        <StatsBar />
      </section>

      {/* Divider */}
      <div className="w-full max-w-4xl px-6 pb-16 flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          How it works
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Setup steps */}
      <section className="w-full flex justify-center px-6 pb-32">
        <SetupSteps />
      </section>
    </main>
  );
}
