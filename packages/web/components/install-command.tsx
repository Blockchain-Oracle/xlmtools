"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";

interface InstallOption {
  client: string;
  command: string;
}

const OPTIONS: InstallOption[] = [
  { client: "Claude Code", command: "claude mcp add pulsar npx @pulsar/mcp" },
  { client: "Standalone CLI", command: "npm install -g @pulsar/mcp" },
  { client: "Cursor / Windsurf / Claude Desktop", command: "npx -y @pulsar/mcp" },
  { client: "Goose", command: "goose configure  # add @pulsar/mcp as stdio extension" },
];

const ROTATE_MS = 3500;

export function InstallCommand() {
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % OPTIONS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [paused]);

  const current = OPTIONS[index];

  async function handleCopy() {
    await navigator.clipboard.writeText(current.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="w-full max-w-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Client tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {OPTIONS.map((opt, i) => (
          <button
            key={opt.client}
            onClick={() => {
              setIndex(i);
              setPaused(true);
            }}
            className={cn(
              "font-mono text-[10px] tracking-wider uppercase px-2 py-1 rounded-md transition-all",
              i === index
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            {opt.client}
          </button>
        ))}
      </div>

      {/* Command box */}
      <div
        className={cn(
          "relative flex items-center justify-between gap-4",
          "rounded-xl border border-border bg-card px-5 py-3.5",
          "w-full overflow-hidden",
        )}
      >
        <div className="flex-1 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.code
              key={current.command}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-sm text-foreground select-all block truncate"
            >
              {current.command}
            </motion.code>
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={cn(
            "shrink-0 gap-1.5 font-mono text-xs transition-all",
            copied
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={copied ? "Copied!" : "Copy command"}
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              COPIED
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              COPY
            </>
          )}
        </Button>

        <BorderBeam
          size={80}
          duration={5}
          colorFrom="#64748b"
          colorTo="#94a3b8"
          borderWidth={1.5}
        />
      </div>
    </div>
  );
}
