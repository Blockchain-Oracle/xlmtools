import { StatsLookup } from "@/components/stats-lookup";

export const metadata = {
  title: "Your History — XLMTools",
  description:
    "See every XLMTools tool call ever made from your Stellar wallet. Free calls and paid receipts, live.",
};

export default function StatsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <div className="mb-8">
        <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
          Your History
        </span>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Every tool call, one address away.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-lg">
          Paste your Stellar wallet address to see the full history of tools
          you&apos;ve called through XLMTools — free ones and paid receipts
          alike, newest first.
        </p>
      </div>

      <StatsLookup />
    </main>
  );
}
