"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const INSTALL_METHODS = [
  {
    id: "cli",
    label: "Install via CLI",
    description:
      "Uses the community skills CLI to install from our GitHub repo",
    command: "pnpm dlx skills add github:pulsarmcp/pulsar --skill pulsar",
  },
  {
    id: "prompt",
    label: "Install via prompt",
    description:
      "Paste this into any agent. The agent fetches the skill and installs itself.",
    command:
      "Read https://pulsar.tools/skill.md and follow the instructions to install PULSAR.",
  },
  {
    id: "manual",
    label: "Install manually",
    description:
      "Create ~/.claude/skills/pulsar/SKILL.md and paste the content below",
    command: "mkdir -p ~/.claude/skills/pulsar",
  },
];

interface SkillContentProps {
  content: string;
}

export function SkillContent({ content }: SkillContentProps) {
  const [copiedMethod, setCopiedMethod] = useState<string | null>(null);
  const [contentCopied, setContentCopied] = useState(false);

  async function copyCommand(id: string, command: string) {
    await navigator.clipboard.writeText(command);
    setCopiedMethod(id);
    setTimeout(() => setCopiedMethod(null), 2000);
  }

  async function copyContent() {
    await navigator.clipboard.writeText(content);
    setContentCopied(true);
    setTimeout(() => setContentCopied(false), 2000);
  }

  function downloadContent() {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SKILL.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Install methods */}
      <section>
        <div className="mb-6">
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Three ways to install
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            Pick your flavor.
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {INSTALL_METHODS.map((method) => (
            <div
              key={method.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {method.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {method.description}
                  </p>
                </div>
                <button
                  onClick={() => copyCommand(method.id, method.command)}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md transition-all",
                    copiedMethod === method.id
                      ? "text-emerald-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  {copiedMethod === method.id ? (
                    <>
                      <Check className="size-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <code className="block font-mono text-xs text-foreground/80 bg-muted/40 rounded-md px-3 py-2 overflow-x-auto">
                {method.command}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* Full skill content */}
      <section>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Full skill content
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              SKILL.md
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              This is the complete file. Copy it into{" "}
              <code className="font-mono bg-muted/60 px-1 py-0.5 rounded">
                ~/.claude/skills/pulsar/SKILL.md
              </code>
              .
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={downloadContent}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            >
              <Download className="size-3" />
              Download
            </button>
            <button
              onClick={copyContent}
              className={cn(
                "flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-md border transition-all",
                contentCopied
                  ? "border-emerald-500/50 text-emerald-500"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              {contentCopied ? (
                <>
                  <Check className="size-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  Copy All
                </>
              )}
            </button>
          </div>
        </div>

        <pre className="rounded-xl border border-border bg-card p-5 overflow-x-auto text-xs font-mono text-foreground/85 leading-relaxed whitespace-pre-wrap">
          {content}
        </pre>
      </section>
    </div>
  );
}
