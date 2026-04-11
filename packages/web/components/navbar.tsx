"use client";

import Link from "next/link";
import { GitFork } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

// TODO: point docs link to deployed docs URL once live (e.g. docs.pulsar.tools)
const DOCS_URL = "https://github.com/Blockchain-Oracle/pulsar/tree/main/packages/docs";

const navLinks = [
  { href: "/tools", label: "Tools" },
  { href: "/skill", label: "Skill" },
  { href: "/explore", label: "Explore" },
  { href: "/stats", label: "Stats" },
  { href: DOCS_URL, label: "Docs", external: true },
];

function PulsarLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <polyline
        points="2,20 8,20 11,10 14,30 17,14 20,26 23,6 26,34 29,18 32,18 38,18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Navbar() {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-border",
        "bg-background/90 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Left: logo + wordmark */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <PulsarLogo className="size-7 text-foreground shrink-0" />
          <span className="font-mono text-base font-bold tracking-[0.15em] text-foreground">
            PULSAR
          </span>
        </Link>

        {/* Right: nav links + github + theme toggle + CTA */}
        <nav className="flex items-center gap-0.5">
          {navLinks.map(({ href, label, external }) =>
            external ? (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/40"
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/40"
              >
                {label}
              </Link>
            ),
          )}

          <a
            href="https://github.com/Blockchain-Oracle/pulsar"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 flex items-center gap-1.5 px-2.5 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/40"
            aria-label="GitHub"
          >
            <GitFork className="size-4" />
          </a>

          <ThemeToggle />

          <Link
            href="/tools"
            className={cn(
              "ml-2 hidden sm:inline-flex items-center",
              "rounded-full border border-border bg-card px-4 py-1.5",
              "font-mono text-[11px] tracking-[0.12em] font-semibold uppercase",
              "text-foreground transition-all duration-150",
              "hover:bg-foreground hover:text-background hover:border-foreground/20"
            )}
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
