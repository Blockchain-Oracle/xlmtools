"use client";

import useSWR from "swr";
import { NumberTicker } from "@/components/ui/number-ticker";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

function StatCard({ label, value, suffix, prefix }: StatCardProps) {
  return (
    <NeonGradientCard className="p-6">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold text-foreground">
        {prefix}
        <NumberTicker value={value} />
        {suffix}
      </p>
    </NeonGradientCard>
  );
}

interface BalanceEntry {
  asset: string;
  balance: string;
  asset_code?: string;
}

interface AccountData {
  address: string;
  xlm_balance: string;
  total_assets: number;
  balances: BalanceEntry[];
  home_domain?: string | null;
  signers: number;
  error?: string;
}

export function AddressStats({ address }: { address: string }) {
  const { data, error, isLoading } = useSWR<AccountData>(
    `${API_URL}/stellar-account?address=${address}`,
    fetcher
  );

  const explorerUrl = `https://stellar.expert/explorer/testnet/account/${address}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-destructive">
          {data?.error ?? "Failed to load account data. Is the API server running?"}
        </p>
      </div>
    );
  }

  if (!data) return null;

  const xlmBalance = parseFloat(data.xlm_balance) || 0;
  const usdcBalance =
    data.balances.find(
      (b: BalanceEntry) => b.asset === "USDC" || b.asset_code === "USDC"
    );
  const usdcAmount = usdcBalance ? parseFloat(usdcBalance.balance) || 0 : 0;

  return (
    <div className="space-y-6">
      {/* Address header */}
      <div className="flex items-center gap-3 flex-wrap">
        <code className="text-sm font-mono text-muted-foreground break-all">
          {address}
        </code>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ExternalLink className="size-4" />
        </a>
        {data.home_domain && (
          <Badge variant="outline" className="text-xs">
            {data.home_domain}
          </Badge>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="XLM Balance" value={Math.floor(xlmBalance)} suffix=" XLM" />
        <StatCard label="USDC Balance" value={Math.floor(usdcAmount)} prefix="$" />
        <StatCard label="Assets Held" value={data.total_assets} />
        <StatCard label="Signers" value={data.signers} />
      </div>

      {/* Balance list */}
      <div className="rounded-lg border border-border">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">All Balances</h3>
        </div>
        <div className="divide-y divide-border">
          {data.balances.map((b: BalanceEntry, i: number) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between px-4 py-3",
                "hover:bg-card/50 transition-colors"
              )}
            >
              <span className="text-sm text-foreground">
                {b.asset ?? b.asset_code ?? "XLM"}
              </span>
              <span className="text-sm font-mono text-muted-foreground">
                {b.balance}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
