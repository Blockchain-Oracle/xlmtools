"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsLookup() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();

    if (!trimmed.startsWith("G") || trimmed.length !== 56) {
      setError("Enter a valid Stellar address (starts with G, 56 characters)");
      return;
    }

    setError(null);
    router.push(`/stats/${trimmed}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex gap-2">
        <Input
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setError(null);
          }}
          placeholder="G... (Stellar public key)"
          className={cn(
            "font-mono text-sm",
            error && "border-destructive"
          )}
        />
        <Button type="submit" className="shrink-0 gap-1.5">
          <Search className="size-4" />
          Look up
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </form>
  );
}
