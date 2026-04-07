import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";

const stats = [
  { label: "TOOLS", value: 20, type: "number" as const },
  { label: "NETWORK", value: "Stellar Testnet", type: "text" as const },
  { label: "PAYMENT", value: "MPP / USDC", type: "text" as const },
];

export function StatsBar() {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center",
        "divide-x divide-border",
        "rounded-xl border border-border bg-card",
        "w-full max-w-xl"
      )}
    >
      {stats.map(({ label, value, type }) => (
        <div
          key={label}
          className="flex flex-1 flex-col items-center gap-0.5 px-6 py-4 min-w-[100px]"
        >
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            {label}
          </span>
          <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
            {type === "number" ? (
              <NumberTicker
                value={value as number}
                className="font-mono text-sm font-semibold tabular-nums"
              />
            ) : (
              value
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
