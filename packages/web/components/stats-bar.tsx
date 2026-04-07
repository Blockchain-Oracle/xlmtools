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
        "flex items-center justify-center",
        "divide-x divide-border",
        "rounded-xl border border-border bg-card",
        "w-full max-w-lg"
      )}
    >
      {stats.map(({ label, value, type }) => (
        <div
          key={label}
          className="flex flex-1 flex-col items-center gap-1 px-5 py-4"
        >
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
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
