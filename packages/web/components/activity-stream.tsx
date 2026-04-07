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
        "grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3",
        "rounded-lg border border-border/60 bg-card/40",
        "hover:bg-card hover:border-border transition-colors"
      )}
    >
      {/* Left: time + tool name */}
      <div className="flex items-center gap-4 min-w-0">
        <span className="text-xs text-muted-foreground font-mono w-20 shrink-0 tabular-nums">
          {tx.time}
        </span>
        <span className="text-sm font-medium text-foreground truncate font-mono">
          {tx.tool}
        </span>
      </div>

      {/* Amount badge */}
      <div className="shrink-0">
        {tx.amount ? (
          <Badge
            variant="secondary"
            className="font-mono text-xs tabular-nums"
          >
            {tx.amount}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs text-emerald-600 border-emerald-300/60 dark:text-emerald-400 dark:border-emerald-800"
          >
            FREE
          </Badge>
        )}
      </div>

      {/* Tx link */}
      <div className="shrink-0 w-5 flex justify-center">
        {explorerUrl ? (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/50 hover:text-foreground transition-colors"
            title="View on Stellar Expert"
          >
            <ExternalLink className="size-3.5" />
          </a>
        ) : (
          <span className="size-3.5" />
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
