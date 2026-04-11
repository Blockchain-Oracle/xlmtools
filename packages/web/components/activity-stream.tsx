"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const PAGE_SIZE = 7;

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
  paid: boolean;
  timestamp: string;
  amount?: string;
  currency?: string;
  tx_hash?: string;
}

interface RecentResponse {
  calls: ApiCallEntry[];
  total: number;
  limit: number;
  offset: number;
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
    id: `${entry.tx_hash ?? entry.tool}-${entry.timestamp}-${idx}`,
    time: timeAgo(entry.timestamp),
    tool: entry.tool,
    amount: entry.paid && entry.amount ? `$${entry.amount}` : null,
    txHash: entry.tx_hash ?? null,
    status: entry.paid ? "success" : "free",
  };
}

function TransactionRow({ tx, isLatest }: { tx: Transaction; isLatest: boolean }) {
  const explorerUrl = tx.txHash
    ? `https://stellar.expert/explorer/testnet/tx/${tx.txHash}`
    : null;

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_auto] items-center gap-3 sm:gap-6 px-3 sm:px-5 py-3 sm:py-4",
        "rounded-xl border border-border/40 bg-card/50",
        "hover:bg-card hover:border-foreground/10 transition-all duration-200 group",
      )}
    >
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        <span className="text-[10px] sm:text-[11px] text-muted-foreground/60 font-mono w-14 sm:w-20 shrink-0 tabular-nums font-medium uppercase tracking-wider">
          {tx.time}
        </span>
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("size-2 rounded-full bg-emerald-500 shrink-0", isLatest && "animate-pulse")} />
          <span className="text-xs sm:text-sm font-bold text-foreground truncate font-mono tracking-tight">
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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [connected, setConnected] = useState(false);

  // Auto-refresh only makes sense on page 1 — when browsing history
  // pages, live updates would shift the viewed window under the user.
  const isLivePage = page === 0;
  const liveRefresh = autoRefresh && isLivePage;

  const fetchCalls = useCallback(async (pageToFetch: number) => {
    try {
      const offset = pageToFetch * PAGE_SIZE;
      const res = await fetch(
        `${API_URL}/stats/recent?limit=${PAGE_SIZE}&offset=${offset}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as RecentResponse;
      setTransactions(data.calls.map(apiToTransaction));
      setTotal(data.total);
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchCalls(page);
  }, [fetchCalls, page]);

  useEffect(() => {
    if (!liveRefresh) return;
    const id = setInterval(() => fetchCalls(0), 5000);
    return () => clearInterval(id);
  }, [liveRefresh, fetchCalls]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;
  const windowStart = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const windowEnd = Math.min(total, (page + 1) * PAGE_SIZE);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 gap-3">
        <p className="text-xs text-muted-foreground font-mono">
          {connected
            ? total > 0
              ? `${windowStart}–${windowEnd} of ${total} calls`
              : "No calls yet"
            : "Waiting for API connection..."}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
          disabled={!isLivePage}
          className={cn(
            "gap-1.5 text-xs font-mono",
            liveRefresh && "text-foreground",
          )}
          title={
            isLivePage
              ? "Toggle live updates"
              : "Live updates pause on history pages"
          }
        >
          <RefreshCw
            className={cn("size-3", liveRefresh && "animate-spin")}
          />
          {liveRefresh ? "Live" : "Paused"}
        </Button>
      </div>

      {transactions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {transactions.map((tx, i) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              isLatest={isLivePage && i === 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-sm text-muted-foreground">
          {connected
            ? "No tool calls yet. Fire off any tool (free or paid) to see it here."
            : "Connect to the API server to see live transactions."}
        </div>
      )}

      {/* Pagination controls — only rendered when there's more than one page */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!canPrev}
            className="gap-1.5 text-xs font-mono"
          >
            <ChevronLeft className="size-3.5" />
            Prev
          </Button>

          <span className="text-xs text-muted-foreground font-mono tabular-nums">
            Page {page + 1} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={!canNext}
            className="gap-1.5 text-xs font-mono"
          >
            Next
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
