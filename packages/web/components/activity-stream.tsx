"use client";

import { useState } from "react";
import { AnimatedList } from "@/components/ui/animated-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  time: string;
  tool: string;
  amount: string | null;
  txHash: string | null;
  status: "success" | "free" | "pending";
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "1", time: "2 min ago", tool: "search", amount: "$0.003", txHash: "abc123def456", status: "success" },
  { id: "2", time: "5 min ago", tool: "dex-orderbook", amount: null, txHash: null, status: "free" },
  { id: "3", time: "8 min ago", tool: "swap-quote", amount: null, txHash: null, status: "free" },
  { id: "4", time: "12 min ago", tool: "image", amount: "$0.040", txHash: "789ghi012jkl", status: "success" },
  { id: "5", time: "15 min ago", tool: "oracle-price", amount: null, txHash: null, status: "free" },
  { id: "6", time: "18 min ago", tool: "research", amount: "$0.010", txHash: "mno345pqr678", status: "success" },
  { id: "7", time: "22 min ago", tool: "stellar-asset", amount: null, txHash: null, status: "free" },
  { id: "8", time: "25 min ago", tool: "screenshot", amount: "$0.010", txHash: "stu901vwx234", status: "success" },
  { id: "9", time: "30 min ago", tool: "dex-candles", amount: null, txHash: null, status: "free" },
  { id: "10", time: "33 min ago", tool: "scrape", amount: "$0.002", txHash: "yza567bcd890", status: "success" },
];

function TransactionRow({ tx }: { tx: Transaction }) {
  const explorerUrl = tx.txHash
    ? `https://stellar.expert/explorer/testnet/tx/${tx.txHash}`
    : null;

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_auto] items-center gap-6 px-5 py-4",
        "rounded-xl border border-border/40 bg-card/50",
        "hover:bg-card hover:border-foreground/10 transition-all duration-200 group"
      )}
    >
      {/* Left: time + tool name */}
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

      {/* Amount badge */}
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

      {/* Tx link */}
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
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground font-mono">
          {MOCK_TRANSACTIONS.length} recent transactions
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={cn(
            "gap-1.5 text-xs font-mono",
            autoRefresh && "text-foreground"
          )}
        >
          <RefreshCw className={cn("size-3", autoRefresh && "animate-spin")} />
          {autoRefresh ? "Live" : "Paused"}
        </Button>
      </div>

      <AnimatedList delay={120}>
        {MOCK_TRANSACTIONS.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </AnimatedList>
    </div>
  );
}
