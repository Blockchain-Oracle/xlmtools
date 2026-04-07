"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2, Wallet, Coins, Layers, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ElementType;
}

function StatCard({ label, value, suffix, prefix, icon: Icon }: StatCardProps) {
  return (
    <Card className="border border-border/50 bg-card">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <div className="size-8 flex items-center justify-center rounded-lg bg-muted/50 text-muted-foreground border border-border/50">
            <Icon className="size-4" />
          </div>
        </div>
        <p className="text-3xl font-bold text-foreground tracking-tight">
          {prefix}
          <NumberTicker value={value} className="text-foreground" />
          {suffix}
        </p>
      </CardContent>
    </Card>
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
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-8 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-6">
          <p className="text-sm text-destructive font-medium text-center">
            {data?.error ?? "Failed to load account data. Is the API server running?"}
          </p>
        </CardContent>
      </Card>
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
    <div className="space-y-8">
      {/* Address header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border/40 pb-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Account Address
          </span>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono text-foreground font-medium bg-muted/50 px-2 py-0.5 rounded border border-border/50 break-all">
              {address}
            </code>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-md"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
        {data.home_domain && (
          <Badge variant="secondary" className="px-3 py-1 font-mono text-[11px] bg-muted/80 text-muted-foreground border border-border/50 uppercase tracking-wider">
            {data.home_domain}
          </Badge>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="XLM Balance" value={Math.floor(xlmBalance)} suffix=" XLM" icon={Coins} />
        <StatCard label="USDC Balance" value={Math.floor(usdcAmount)} prefix="$" icon={Wallet} />
        <StatCard label="Assets Held" value={data.total_assets} icon={Layers} />
        <StatCard label="Signers" value={data.signers} icon={Users} />
      </div>

      {/* Balance list */}
      <Card className="border border-border/50 bg-card overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/40 px-6 py-4">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Layers className="size-3.5" />
            All Balances
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {data.balances.map((b: BalanceEntry, i: number) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between px-6 py-4",
                  "hover:bg-muted/20 transition-colors"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="size-7 flex items-center justify-center rounded bg-muted/50 text-[10px] font-bold font-mono text-muted-foreground border border-border/50">
                    { (b.asset ?? b.asset_code ?? "XLM").slice(0, 3).toUpperCase() }
                  </div>
                  <span className="text-sm font-semibold text-foreground tracking-tight">
                    {b.asset ?? b.asset_code ?? "XLM"}
                  </span>
                </div>
                <span className="text-sm font-mono font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">
                  {b.balance}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
