"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";

const COMMAND = "claude mcp add pulsar npx @pulsar/mcp";

export function InstallCommand() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-between gap-4",
        "rounded-xl border border-border bg-card px-5 py-3.5",
        "w-full max-w-xl overflow-hidden"
      )}
    >
      <code className="font-mono text-sm text-foreground select-all">
        {COMMAND}
      </code>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className={cn(
          "shrink-0 gap-1.5 font-mono text-xs transition-all",
          copied
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
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
        colorFrom="#a855f7"
        colorTo="#38bdf8"
        borderWidth={1.5}
      />
    </div>
  );
}
