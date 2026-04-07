import { ActivityStream } from "@/components/activity-stream";
import { DotPattern } from "@/components/ui/dot-pattern";

export const metadata = {
  title: "Explorer — PULSAR",
  description: "Live transaction stream for PULSAR tool calls on Stellar.",
};

export default function ExplorePage() {
  return (
    <main className="relative mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      {/* Subtle dot background */}
      <DotPattern
        width={20}
        height={20}
        cr={1}
        className="opacity-[0.06] dark:opacity-[0.04] text-foreground"
      />

      <div className="relative z-10">
        {/* Page header */}
        <div className="mb-10">
          <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
            On-Chain Activity
          </span>
          <h1
            className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            style={{ letterSpacing: "-0.018em" }}
          >
            Explorer
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Live transaction stream. Every paid tool call leaves a receipt on
            Stellar.
          </p>
        </div>

        {/* Column headers — like frames.ag */}
        <div
          className="mb-3 grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-2 rounded-lg border border-border/60 bg-muted/30"
        >
          <div className="flex items-center gap-4">
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
    </main>
  );
}
