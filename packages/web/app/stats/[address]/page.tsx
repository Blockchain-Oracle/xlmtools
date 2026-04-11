import { AddressStats } from "@/components/address-stats";

interface Props {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { address } = await params;
  return {
    title: `${address.slice(0, 8)}… — XLMTools History`,
    description: `XLMTools tool-call history for Stellar address ${address}`,
  };
}

export default async function AddressStatsPage({ params }: Props) {
  const { address } = await params;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <div className="mb-6">
        <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
          Your History
        </span>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Tool-call history
        </h1>
      </div>

      <AddressStats address={address} />
    </main>
  );
}
