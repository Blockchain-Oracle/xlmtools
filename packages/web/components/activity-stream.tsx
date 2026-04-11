"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TransactionRow,
  apiToTransaction,
  type ApiCallEntry,
  type Transaction,
} from "@/components/transaction-row";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const PAGE_SIZE = 7;

interface RecentResponse {
  calls: ApiCallEntry[];
  total: number;
  limit: number;
  offset: number;
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
