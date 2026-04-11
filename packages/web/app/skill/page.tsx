import { promises as fs } from "node:fs";
import path from "node:path";
import { SkillContent } from "@/components/skill-content";

export const metadata = {
  title: "Skill — PULSAR",
  description:
    "Install the PULSAR skill in Claude, Cursor, or any MCP-compatible agent. Three install methods.",
};

async function loadSkillContent(): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), "public", "skill.md");
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return "# skill.md not found\n\nRun pnpm build in the web package.";
  }
}

export default async function SkillPage() {
  const content = await loadSkillContent();

  return (
    <main className="flex flex-1 flex-col">
      {/* Header */}
      <div className="w-full bg-secondary border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Agent Skill
          </span>
          <h1 className="mt-3 text-5xl sm:text-6xl font-bold tracking-tighter text-foreground leading-[0.9]">
            The skill.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-lg">
            Install PULSAR as an Agent Skill in Claude, Cursor, Windsurf, or
            any MCP-compatible host. The skill teaches your agent when and how
            to use PULSAR tools — including paid tool warnings, decision trees,
            and receipt handling.
          </p>
        </div>
      </div>

      {/* Skill content */}
      <div className="max-w-4xl mx-auto w-full px-6 py-12">
        <SkillContent content={content} />
      </div>
    </main>
  );
}
