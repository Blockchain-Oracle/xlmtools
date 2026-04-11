"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GitFork, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

// TODO: point docs link to deployed docs URL once live (e.g. docs.pulsar.tools)
const DOCS_URL =
  "https://github.com/Blockchain-Oracle/pulsar/tree/main/packages/docs";
const GITHUB_URL = "https://github.com/Blockchain-Oracle/pulsar";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    // Lock body scroll while open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-border",
        "bg-background/90 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left: logo + wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 hover:opacity-80 transition-opacity shrink-0"
          onClick={() => setMobileOpen(false)}
        >
          <PulsarLogo className="size-6 sm:size-7 text-foreground shrink-0" />
          <span className="font-mono text-sm sm:text-base font-bold tracking-[0.15em] text-foreground">
            PULSAR
          </span>
        </Link>

        {/* Desktop nav — hidden below md */}
        <nav className="hidden md:flex items-center gap-0.5">
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
            href={GITHUB_URL}
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
              "ml-2 inline-flex items-center",
              "rounded-full border border-border bg-card px-4 py-1.5",
              "font-mono text-[11px] tracking-[0.12em] font-semibold uppercase",
              "text-foreground transition-all duration-150",
              "hover:bg-foreground hover:text-background hover:border-foreground/20",
            )}
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center justify-center size-9 rounded-md text-foreground hover:bg-muted/60 transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 top-16 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-0 right-0 md:hidden border-b border-border bg-background shadow-lg"
            >
              <div className="flex flex-col px-4 py-4 gap-0.5">
                {navLinks.map(({ href, label, external }) =>
                  external ? (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                    >
                      <span>{label}</span>
                      <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground/50">
                        ↗
                      </span>
                    </a>
                  ) : (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-sm text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                    >
                      {label}
                    </Link>
                  ),
                )}

                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                >
                  <GitFork className="size-4" />
                  GitHub
                </a>

                <Link
                  href="/tools"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "mt-3 flex items-center justify-center",
                    "rounded-full border border-border bg-card px-4 py-3",
                    "font-mono text-xs tracking-[0.12em] font-semibold uppercase",
                    "text-foreground transition-all",
                    "hover:bg-foreground hover:text-background",
                  )}
                >
                  Get Started
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
