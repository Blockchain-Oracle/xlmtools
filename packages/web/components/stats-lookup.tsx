"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function StatsLookup() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) return;
    // No format validation — the empty state on the history page handles
    // typos (shows "No activity yet for this address").
    router.push(`/stats/${trimmed}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex gap-2">
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Paste your Stellar address (G...)"
          className="font-mono text-sm"
        />
        <Button type="submit" className="shrink-0 gap-1.5">
          <Search className="size-4" />
          Look up
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Not sure what your address is? Run{" "}
        <code className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-foreground">
          xlm wallet
        </code>{" "}
        in your terminal to see it.
      </p>
    </form>
  );
}
