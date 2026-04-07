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
        "bg-background/80 backdrop-blur-md"
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
            width={20}
            height={20}
            className="size-5 dark:invert-0 invert"
          />
          <span className="font-mono text-sm font-semibold tracking-widest text-foreground">
            PULSAR
          </span>
        </Link>

        {/* Right: nav links + github + theme toggle + CTA */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
            >
              {label}
            </Link>
          ))}

          <a
            href="https://github.com/pulsarmcp/pulsar"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
          >
            <GitFork className="size-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <ThemeToggle />

          <Link
            href="/tools"
            className={cn(
              "ml-2 hidden sm:inline-flex",
              "rounded-full border border-border bg-card px-4 py-1.5",
              "font-mono text-[11px] tracking-[0.15em] font-semibold uppercase",
              "text-foreground transition-colors",
              "hover:bg-foreground hover:text-background"
            )}
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
