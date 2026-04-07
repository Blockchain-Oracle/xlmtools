"use client";

import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function HeroCta() {
  return (
    <div className="flex items-center gap-4 flex-wrap justify-center">
      <Link href="/tools">
        <ShimmerButton
          shimmerColor="#a855f7"
          background="rgba(88, 28, 135, 0.8)"
          className="text-sm font-semibold px-7 py-2.5 border-purple-500/30"
        >
          Get Started
        </ShimmerButton>
      </Link>

      <Link href="#">
        <InteractiveHoverButton className="text-sm border-border text-foreground">
          View Docs
        </InteractiveHoverButton>
      </Link>
    </div>
  );
}
