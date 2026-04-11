"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TransactionRow,
  apiToTransaction,
  type ApiCallEntry,
  type Transaction,
} from "@/components/transaction-row";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const PAGE_SIZE = 7;

interface ByClientResponse {
  address: string;
  calls: ApiCallEntry[];
  total: number;
  limit: number;
  offset: number;
}

export function AddressStats({ address }: { address: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [connected, setConnected] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isLivePage = page === 0;
  const liveRefresh = autoRefresh && isLivePage;
  const explorerUrl = `https://stellar.expert/explorer/testnet/account/${address}`;

  const fetchCalls = useCallback(
    async (pageToFetch: number) => {
      try {
        const offset = pageToFetch * PAGE_SIZE;
        const res = await fetch(
          `${API_URL}/stats/by-client?address=${encodeURIComponent(
            address,
          )}&limit=${PAGE_SIZE}&offset=${offset}`,
        );
        if (!res.ok) {
          // Don't leave `loaded` false on non-2xx — otherwise the UI
          // stays stuck on "Loading..." forever when the API is up
          // but returning errors.
          setConnected(false);
          setLoaded(true);
          return;
        }
        const data = (await res.json()) as ByClientResponse;
        setTransactions(data.calls.map(apiToTransaction));
        setTotal(data.total);
        setConnected(true);
        setLoaded(true);
      } catch {
        setConnected(false);
        setLoaded(true);
      }
    },
    [address],
  );

  // Reset view state when the address changes so the user doesn't
  // briefly see the previous address's data under the new header.
  useEffect(() => {
    setPage(0);
    setTransactions([]);
    setTotal(0);
    setLoaded(false);
  }, [address]);

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
    <div className="space-y-6">
      {/* Address header */}
      <div className="flex items-start justify-between gap-4 flex-wrap border-b border-border/40 pb-6">
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Account
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-xs sm:text-sm font-mono text-foreground font-medium bg-muted/50 px-2 py-0.5 rounded border border-border/50 break-all">
              {address}
            </code>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-md shrink-0"
              title="View on Stellar Expert"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Summary + Live toggle */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground font-mono">
          {!loaded
            ? "Loading..."
            : !connected
              ? "Waiting for API connection..."
              : total > 0
                ? `${windowStart}–${windowEnd} of ${total} calls`
                : "No activity yet"}
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
          <RefreshCw className={cn("size-3", liveRefresh && "animate-spin")} />
          {liveRefresh ? "Live" : "Paused"}
        </Button>
      </div>

      {/* History list or empty state */}
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
        <div className="rounded-xl border border-border/40 bg-card/50 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {loaded && connected
              ? "No activity yet for this address. Run any tool to see it here."
              : "Loading history..."}
          </p>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-between gap-3">
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
