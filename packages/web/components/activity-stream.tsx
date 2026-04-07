"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatedList } from "@/components/ui/animated-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface Transaction {
  id: string;
  time: string;
  tool: string;
  amount: string | null;
  txHash: string | null;
  status: "success" | "free";
}

interface ApiCallEntry {
  tool: string;
  amount: string;
  currency: string;
  tx_hash: string;
  timestamp: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function apiToTransaction(entry: ApiCallEntry, idx: number): Transaction {
  return {
    id: `${entry.tx_hash}-${idx}`,
    time: timeAgo(entry.timestamp),
    tool: entry.tool,
    amount: `$${entry.amount}`,
    txHash: entry.tx_hash,
    status: "success",
  };
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const explorerUrl = tx.txHash
    ? `https://stellar.expert/explorer/testnet/tx/${tx.txHash}`
    : null;

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_auto] items-center gap-6 px-5 py-4",
        "rounded-xl border border-border/40 bg-card/50",
        "hover:bg-card hover:border-foreground/10 transition-all duration-200 group",
      )}
    >
      <div className="flex items-center gap-6 min-w-0">
        <span className="text-[11px] text-muted-foreground/60 font-mono w-20 shrink-0 tabular-nums font-medium uppercase tracking-wider">
          {tx.time}
        </span>
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-sm font-bold text-foreground truncate font-mono tracking-tight">
            {tx.tool}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        {tx.amount ? (
          <div className="px-2 py-0.5 rounded bg-foreground/5 border border-foreground/10">
            <span className="font-mono text-[11px] font-bold text-foreground tabular-nums">
              {tx.amount}
            </span>
          </div>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] font-bold text-emerald-600 border-emerald-500/20 bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-400/20"
          >
            FREE
          </Badge>
        )}
      </div>

      <div className="shrink-0 w-8 flex justify-center">
        {explorerUrl ? (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-all"
            title="View on Stellar Expert"
          >
            <ExternalLink className="size-3.5" />
          </a>
        ) : (
          <div className="size-3.5" />
        )}
      </div>
    </div>
  );
}

export function ActivityStream() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [connected, setConnected] = useState(false);

  const fetchCalls = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/stats/recent?limit=20`);
      if (!res.ok) return;
      const data = (await res.json()) as { calls: ApiCallEntry[] };
      setTransactions(data.calls.map(apiToTransaction));
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchCalls, 5000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchCalls]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground font-mono">
          {connected
            ? `${transactions.length} recent transactions`
            : "Waiting for API connection..."}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={cn(
            "gap-1.5 text-xs font-mono",
            autoRefresh && "text-foreground",
          )}
        >
          <RefreshCw
            className={cn("size-3", autoRefresh && "animate-spin")}
          />
          {autoRefresh ? "Live" : "Paused"}
        </Button>
      </div>

      {transactions.length > 0 ? (
        <AnimatedList delay={120}>
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </AnimatedList>
      ) : (
        <div className="text-center py-16 text-sm text-muted-foreground">
          {connected
            ? "No transactions yet. Make a paid tool call to see it here."
            : "Connect to the API server to see live transactions."}
        </div>
      )}
    </div>
  );
}
