import { AddressStats } from "@/components/address-stats";

interface Props {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { address } = await params;
  return {
    title: `${address.slice(0, 8)}… — XLMTools Stats`,
    description: `Usage statistics for Stellar address ${address}`,
  };
}

export default async function AddressStatsPage({ params }: Props) {
  const { address } = await params;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Account Stats
        </h1>
      </div>

      <AddressStats address={address} />
    </main>
  );
}
