import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Tools",
    display: "number" as const,
    numValue: 20,
    textValue: "",
  },
  {
    label: "Settle time",
    display: "text" as const,
    numValue: 0,
    textValue: "~1s",
  },
  {
    label: "Subscription cost",
    display: "text" as const,
    numValue: 0,
    textValue: "$0",
  },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-3">
      {stats.map(({ label, display, numValue, textValue }, index) => (
        <div
          key={label}
          className={cn(
            "flex flex-col items-center gap-3 py-16 px-8",
            index > 0 && "border-l border-border"
          )}
        >
          <div className="font-mono text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground tabular-nums leading-none">
            {display === "number" ? (
              <NumberTicker
                value={numValue}
                className="font-mono text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground tabular-nums"
              />
            ) : (
              textValue
            )}
          </div>
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground text-center">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
