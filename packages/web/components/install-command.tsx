"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstallTab {
  id: string;
  label: string;
  command: string;
  note?: string;
}

const TABS: InstallTab[] = [
  {
    id: "mcp",
    label: "mcp",
    command: "claude mcp add pulsar npx @pulsar/mcp",
    note: "Claude Code — one command",
  },
  {
    id: "prompt",
    label: "prompt",
    command:
      "Read https://pulsar.tools/skill.md and follow the instructions to install PULSAR.",
    note: "Paste into any agent — it reads the skill and installs itself",
  },
  {
    id: "pnpm",
    label: "pnpm",
    command:
      "pnpm dlx skills add github:pulsarmcp/pulsar --skill pulsar",
  },
  {
    id: "npx",
    label: "npx",
    command:
      "npx skills add github:pulsarmcp/pulsar --skill pulsar",
  },
  {
    id: "bunx",
    label: "bunx",
    command:
      "bunx skills add github:pulsarmcp/pulsar --skill pulsar",
  },
];

export function InstallCommand() {
  const [activeId, setActiveId] = useState(TABS[0].id);
  const [copied, setCopied] = useState(false);

  const active = TABS.find((t) => t.id === activeId) ?? TABS[0];

  async function handleCopy() {
    await navigator.clipboard.writeText(active.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveId(tab.id);
              setCopied(false);
            }}
            className={cn(
              "font-mono text-xs tracking-tight px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer",
              activeId === tab.id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground/80",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Command box */}
      <div
        className={cn(
          "relative flex items-center justify-between gap-4",
          "rounded-xl border border-border bg-card px-5 py-4",
          "overflow-hidden",
        )}
      >
        <div className="flex-1 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.code
              key={active.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-sm text-foreground select-all block truncate"
            >
              {active.command}
            </motion.code>
          </AnimatePresence>
        </div>

        <button
          onClick={handleCopy}
          className={cn(
            "shrink-0 flex items-center gap-1.5 font-mono text-[11px] tracking-wider uppercase px-2.5 py-1 rounded-md transition-all",
            copied
              ? "text-emerald-500"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
          )}
          aria-label={copied ? "Copied!" : "Copy command"}
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Active tab note */}
      <AnimatePresence mode="wait">
        {active.note && (
          <motion.p
            key={active.id + "-note"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-2 text-[11px] font-mono tracking-wide text-muted-foreground/70"
          >
            {active.note}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Client logos row */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50">
          Works with
        </span>
        {[
          "Claude Code",
          "Claude Desktop",
          "Cursor",
          "Windsurf",
          "VS Code",
          "Zed",
          "Cline",
          "Continue",
          "Goose",
        ].map((client) => (
          <span
            key={client}
            className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground/60"
          >
            {client}
          </span>
        ))}
      </div>
    </div>
  );
}
