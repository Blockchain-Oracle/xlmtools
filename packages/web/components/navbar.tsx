"use client";

import Link from "next/link";
import { GitFork, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-semibold tracking-widest text-foreground hover:text-foreground/80 transition-colors"
        >
          <Zap className="size-4 text-primary" />
          PULSAR
        </Link>

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
            className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
          >
            <GitFork className="size-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
