"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

// ── MCP client rotation (only used on the "mcp" tab) ─────────

interface McpClient {
  name: string;
  command: string;
  hue: number; // 0-360 for subtle accent color rotation
}

const MCP_CLIENTS: McpClient[] = [
  {
    name: "Claude Code",
    command: "claude mcp add pulsar npx @pulsar/mcp",
    hue: 200,
  },
  {
    name: "Cursor",
    command: '"mcpServers": { "pulsar": { "command": "npx", "args": ["-y", "@pulsar/mcp"] } }',
    hue: 160,
  },
  {
    name: "Windsurf",
    command: '"mcpServers": { "pulsar": { "command": "npx", "args": ["-y", "@pulsar/mcp"] } }',
    hue: 280,
  },
  {
    name: "VS Code",
    command: '"servers": { "pulsar": { "type": "stdio", "command": "npx", "args": ["-y", "@pulsar/mcp"] } }',
    hue: 220,
  },
  {
    name: "Zed",
    command: '"context_servers": { "pulsar": { "source": "custom", "command": "npx", "args": ["-y", "@pulsar/mcp"] } }',
    hue: 40,
  },
];

const ROTATE_MS = 3500;

// ── Install method tabs ──────────────────────────────────────

interface InstallTab {
  id: string;
  label: string;
  note: string;
  // Static command, OR "rotate" which triggers MCP client rotation
  command?: string;
  rotate?: boolean;
}

const TABS: InstallTab[] = [
  {
    id: "mcp",
    label: "mcp",
    note: "Auto-rotating through every MCP client",
    rotate: true,
  },
  {
    id: "prompt",
    label: "prompt",
    note: "Paste into any agent — it reads the skill and installs itself",
    command:
      "Read https://pulsar.tools/skill.md and follow the instructions to install PULSAR.",
  },
  {
    id: "pnpm",
    label: "pnpm",
    note: "pnpm dlx",
    command: "pnpm dlx skills add github:pulsarmcp/pulsar --skill pulsar",
  },
  {
    id: "npx",
    label: "npx",
    note: "Node package runner",
    command: "npx skills add github:pulsarmcp/pulsar --skill pulsar",
  },
  {
    id: "bunx",
    label: "bunx",
    note: "Bun package runner",
    command: "bunx skills add github:pulsarmcp/pulsar --skill pulsar",
  },
];

// ── Component ────────────────────────────────────────────────

export function InstallCommand() {
  const [activeTabId, setActiveTabId] = useState(TABS[0].id);
  const [clientIndex, setClientIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [paused, setPaused] = useState(false);

  const activeTab = TABS.find((t) => t.id === activeTabId) ?? TABS[0];
  const activeClient = MCP_CLIENTS[clientIndex];

  // Rotate MCP clients when on the "mcp" tab
  useEffect(() => {
    if (activeTab.id !== "mcp" || paused) return;
    const id = setInterval(() => {
      setClientIndex((i) => (i + 1) % MCP_CLIENTS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [activeTab.id, paused]);

  const displayCommand = activeTab.rotate
    ? activeClient.command
    : activeTab.command ?? "";

  // Accent hue: rotates on mcp tab, static on others
  const accentHue = activeTab.rotate ? activeClient.hue : 220;

  async function handleCopy() {
    await navigator.clipboard.writeText(displayCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="w-full max-w-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Install method tabs */}
      <div className="flex items-center gap-1 mb-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTabId(tab.id);
              setCopied(false);
              setClientIndex(0);
            }}
            className={cn(
              "font-mono text-xs tracking-tight px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer",
              activeTabId === tab.id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground/80",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Client name (only on mcp tab) */}
      <div className="h-5 mb-1.5 flex items-center">
        <AnimatePresence mode="wait">
          {activeTab.rotate && (
            <motion.div
              key={activeClient.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <motion.span
                className="size-1.5 rounded-full shrink-0"
                animate={{
                  backgroundColor: `oklch(0.7 0.15 ${accentHue})`,
                  boxShadow: `0 0 8px oklch(0.7 0.15 ${accentHue} / 0.6)`,
                }}
                transition={{ duration: 0.6 }}
              />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                {activeClient.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Command box */}
      <motion.div
        animate={{
          borderColor: activeTab.rotate
            ? `oklch(0.7 0.08 ${accentHue} / 0.4)`
            : "var(--border)",
        }}
        transition={{ duration: 0.8 }}
        className={cn(
          "relative flex items-center justify-between gap-4",
          "rounded-xl border bg-card px-5 py-4",
          "overflow-hidden",
        )}
      >
        {/* Subtle color wash on mcp tab */}
        {activeTab.rotate && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: `linear-gradient(90deg, oklch(0.7 0.12 ${accentHue} / 0.04), transparent 60%)`,
            }}
            transition={{ duration: 1.2 }}
          />
        )}

        <div className="flex-1 min-w-0 overflow-hidden relative z-10">
          <AnimatePresence mode="wait">
            <motion.code
              key={`${activeTab.id}-${activeTab.rotate ? clientIndex : "static"}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-sm text-foreground select-all block truncate"
            >
              {displayCommand}
            </motion.code>
          </AnimatePresence>
        </div>

        <button
          onClick={handleCopy}
          className={cn(
            "relative z-10 shrink-0 flex items-center gap-1.5 font-mono text-[11px] tracking-wider uppercase px-2.5 py-1 rounded-md transition-all",
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
      </motion.div>

      {/* Note */}
      <AnimatePresence mode="wait">
        {activeTab.note && (
          <motion.p
            key={activeTab.id + "-note"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-2 text-[11px] font-mono tracking-wide text-muted-foreground/70"
          >
            {activeTab.note}
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
