"use client";

import { useState, useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

// ── MCP server install options (all supported clients) ──────

interface McpOption {
  client: string;
  command: string;
  hue: number;
}

const MCP_OPTIONS: McpOption[] = [
  { client: "Claude Code", command: "claude mcp add pulsar npx @pulsar/mcp", hue: 200 },
  { client: "Standalone CLI", command: "npm install -g @pulsar/mcp", hue: 140 },
  { client: "Cursor", command: '// .cursor/mcp.json — "pulsar": { "command": "npx", "args": ["-y", "@pulsar/mcp"] }', hue: 260 },
  { client: "Windsurf", command: "// ~/.codeium/windsurf/mcp_config.json — same mcpServers schema", hue: 290 },
  { client: "Claude Desktop", command: '// claude_desktop_config.json — "pulsar": { "command": "npx", "args": ["-y", "@pulsar/mcp"] }', hue: 220 },
  { client: "VS Code Copilot", command: '// .vscode/mcp.json — "servers": { "pulsar": { "type": "stdio", "command": "npx" } }', hue: 180 },
  { client: "Gemini CLI", command: "gemini mcp add pulsar npx -y @pulsar/mcp", hue: 30 },
  { client: "OpenAI Codex", command: "codex mcp add pulsar npx -y @pulsar/mcp", hue: 340 },
  { client: "Zed", command: '// ~/.config/zed/settings.json — "context_servers": { "pulsar": ... }', hue: 60 },
  { client: "Continue", command: "// .continue/mcpServers/pulsar.yaml — stdio command: npx -y @pulsar/mcp", hue: 120 },
  { client: "Cline", command: '// cline_mcp_settings.json — "pulsar": { "command": "npx", "args": ["-y", "@pulsar/mcp"] }', hue: 90 },
  { client: "Goose", command: "goose configure  # add @pulsar/mcp as stdio extension", hue: 40 },
  { client: "OpenCode", command: "// opencode.json — mcp: { pulsar: { command: 'npx', args: ['-y', '@pulsar/mcp'] } }", hue: 310 },
];

// ── Skill install options ────────────────────────────────────

interface SkillOption {
  label: string;
  command: string;
  hue: number;
}

const SKILL_OPTIONS: SkillOption[] = [
  { label: "Prompt", command: "Read https://pulsar.tools/skill.md and follow the instructions.", hue: 180 },
  { label: "pnpm dlx", command: "pnpm dlx skills add github:Blockchain-Oracle/pulsar --skill pulsar", hue: 20 },
  { label: "npx", command: "npx skills add github:Blockchain-Oracle/pulsar --skill pulsar", hue: 300 },
  { label: "bunx", command: "bunx skills add github:Blockchain-Oracle/pulsar --skill pulsar", hue: 80 },
];

const ROTATE_MS = 3500;

// ── Shared rotating card ─────────────────────────────────────

interface RotatingCardProps<T extends { command: string; hue: number }> {
  eyebrow: string;
  title: string;
  subtitle: string;
  options: T[];
  renderLabel: (opt: T) => string;
  footer?: ReactNode;
}

function RotatingCard<T extends { command: string; hue: number }>({
  eyebrow,
  title,
  subtitle,
  options,
  renderLabel,
  footer,
}: RotatingCardProps<T>) {
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % options.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, options.length]);

  const current = options[index];

  async function handleCopy() {
    await navigator.clipboard.writeText(current.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="flex flex-col h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60">
          {eyebrow}
        </span>
        <h3 className="text-2xl font-bold text-foreground tracking-tight mt-1">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Spacer — pushes command group to bottom for alignment */}
      <div className="flex-1 min-h-6" />

      {/* Current option label */}
      <div className="flex items-center gap-2 h-4 mb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={renderLabel(current)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <motion.span
              className="size-1.5 rounded-full shrink-0"
              animate={{
                backgroundColor: `oklch(0.7 0.15 ${current.hue})`,
                boxShadow: `0 0 8px oklch(0.7 0.15 ${current.hue} / 0.6)`,
              }}
              transition={{ duration: 0.6 }}
            />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              {renderLabel(current)}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Command box */}
      <motion.div
        animate={{
          borderColor: `oklch(0.7 0.08 ${current.hue} / 0.4)`,
        }}
        transition={{ duration: 0.8 }}
        className="relative flex items-center justify-between gap-3 rounded-xl border bg-card px-5 py-4 overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: `linear-gradient(90deg, oklch(0.7 0.12 ${current.hue} / 0.05), transparent 60%)`,
          }}
          transition={{ duration: 1.2 }}
        />

        <div className="flex-1 min-w-0 overflow-hidden relative z-10">
          <AnimatePresence mode="wait">
            <motion.code
              key={current.command}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-sm text-foreground select-all block truncate"
            >
              {current.command}
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

      {/* Option dots (clickable — padded hit target, small visible dot) */}
      <div className="flex items-center gap-0.5 mt-3 -mx-2">
        {options.map((opt, i) => (
          <button
            key={renderLabel(opt)}
            onClick={() => {
              setIndex(i);
              setPaused(true);
            }}
            title={renderLabel(opt)}
            aria-label={`Jump to ${renderLabel(opt)}`}
            className="group p-2 cursor-pointer"
          >
            <span
              className={cn(
                "block h-1 rounded-full transition-all",
                i === index
                  ? "w-6 bg-foreground"
                  : "w-1.5 bg-muted-foreground/40 group-hover:bg-muted-foreground/80 group-hover:w-3",
              )}
            />
          </button>
        ))}
      </div>

      {footer && <div className="mt-auto pt-2">{footer}</div>}
    </div>
  );
}

// ── MCP Install card ─────────────────────────────────────────

export function McpInstall() {
  return (
    <RotatingCard
      eyebrow="MCP Server"
      title="One command, every client."
      subtitle="PULSAR runs as an MCP server in 12+ clients. Pick yours — config auto-rotates."
      options={MCP_OPTIONS}
      renderLabel={(o) => o.client}
    />
  );
}

// ── Skill Install card ───────────────────────────────────────

export function SkillInstall() {
  return (
    <RotatingCard
      eyebrow="Agent Skill"
      title="Teach agents when to use it."
      subtitle="Cross-client SKILL.md format. Works natively in Claude Code, Cursor 2.4+, Windsurf, VS Code Copilot, Codex CLI, Gemini CLI, Goose, and Cline."
      options={SKILL_OPTIONS}
      renderLabel={(o) => o.label}
    />
  );
}

// ── Legacy wrapper (keeps existing imports working) ──────────

export function InstallCommand() {
  return <McpInstall />;
}
