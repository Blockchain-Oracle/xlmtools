import { ActivityStream } from "@/components/activity-stream";

export const metadata = {
  title: "Explorer — PULSAR",
  description: "Live transaction stream for PULSAR tool calls on Stellar.",
};

export default function ExplorePage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Explorer
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Live transaction stream. Every paid tool call leaves a receipt on
          Stellar.
        </p>
      </div>

      <ActivityStream />
    </main>
  );
}
