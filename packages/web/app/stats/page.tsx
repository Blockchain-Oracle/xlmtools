import { StatsLookup } from "@/components/stats-lookup";

export const metadata = {
  title: "Stats — XLMTools",
  description: "Look up usage statistics for any Stellar address.",
};

export default function StatsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Stats
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Look up usage statistics for any Stellar address.
        </p>
      </div>

      <StatsLookup />
    </main>
  );
}
