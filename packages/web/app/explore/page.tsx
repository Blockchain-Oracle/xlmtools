import { ActivityStream } from "@/components/activity-stream";
import { DotPattern } from "@/components/ui/dot-pattern";

export const metadata = {
  title: "Explorer — XLMTools",
  description: "Live transaction stream for XLMTools tool calls on Stellar.",
};

export default function ExplorePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Page header — alternating bg */}
      <div className="w-full bg-secondary border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            On-Chain Activity
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-[0.9]">
            Explorer
          </h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            Every paid tool call leaves a verifiable receipt on Stellar.
          </p>
        </div>
      </div>

      {/* Stream */}
      <div className="relative max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12">
        <DotPattern
          width={24}
          height={24}
          cr={1}
          className="text-foreground/[0.07] dark:text-foreground/[0.06]"
        />

        <div className="relative z-10">
          {/* Column headers — hidden on mobile (row layout handles the columns itself) */}
          <div className="mb-3 hidden sm:grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-2.5 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-6">
              <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase w-20 shrink-0">
                Time
              </span>
              <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                Tool
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Amount
            </span>
            <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Tx
            </span>
          </div>

          <ActivityStream />
        </div>
      </div>
    </main>
  );
}
