"use client";

import Link from "next/link";
import Image from "next/image";
import { GitFork } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/tools", label: "Tools" },
  { href: "/explore", label: "Explore" },
  { href: "/stats", label: "Stats" },
];

export function Navbar() {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-border",
        "bg-background/90 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Left: logo + wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logos/pulsar.svg"
            alt="PULSAR"
            width={18}
            height={18}
            className="size-[18px] dark:invert-0 invert"
          />
          <span className="font-mono text-sm font-bold tracking-[0.18em] text-foreground">
            PULSAR
          </span>
        </Link>

        {/* Right: nav links + github + theme toggle + CTA */}
        <nav className="flex items-center gap-0.5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/40"
            >
              {label}
            </Link>
          ))}

          <a
            href="https://github.com/pulsarmcp/pulsar"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 flex items-center gap-1.5 px-2.5 py-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/40"
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
