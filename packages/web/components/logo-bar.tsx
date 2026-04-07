import { cn } from "@/lib/utils";

const logos = [
  "Claude Code",
  "Cursor",
  "Windsurf",
  "Stellar",
  "Circle",
];

export function LogoBar() {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Works with
      </p>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {logos.map((name, i) => (
          <span key={name} className="flex items-center gap-6">
            <span
              className={cn(
                "font-mono text-sm font-medium",
                "text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              )}
            >
              {name}
            </span>
            {i < logos.length - 1 && (
              <span className="text-border select-none" aria-hidden>
                ·
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
