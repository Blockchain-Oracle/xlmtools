"use client";

import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

interface ClientLogo {
  name: string;
  src: string;
  /** Set true if the SVG is dark-colored and needs invert for dark mode */
  invertInDark: boolean;
}

const CLIENTS: ClientLogo[] = [
  { name: "Claude", src: "/logos/mcp-clients/claude.svg", invertInDark: false },
  { name: "Cursor", src: "/logos/mcp-clients/cursor-cube.svg", invertInDark: true },
  { name: "DeepSeek", src: "/logos/mcp-clients/DeepSeek-icon.svg", invertInDark: false },
  { name: "Gemini", src: "/logos/mcp-clients/Google_Gemini_icon_2025.svg", invertInDark: false },
  { name: "Grok", src: "/logos/mcp-clients/Grok_Logomark_Light.svg", invertInDark: true },
  { name: "OpenAI", src: "/logos/mcp-clients/OpenAI-black-monoblossom.svg", invertInDark: true },
  { name: "Replicate", src: "/logos/mcp-clients/replicate.svg", invertInDark: true },
  { name: "Zed", src: "/logos/mcp-clients/zed-logo.svg", invertInDark: true },
];

function ClientItem({ client }: { client: ClientLogo }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 mx-8",
        "opacity-50 hover:opacity-100 transition-opacity duration-200"
      )}
    >
      <Image
        src={client.src}
        alt={client.name}
        width={20}
        height={20}
        className={cn(
          "h-5 w-5 object-contain",
          client.invertInDark && "dark:invert"
        )}
      />
      <span className="text-sm font-medium text-foreground whitespace-nowrap">
        {client.name}
      </span>
    </div>
  );
}

export function LogoBar() {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        Works with
      </p>

      <div className="w-full relative overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        <Marquee pauseOnHover repeat={4} className="[--duration:30s] [--gap:0px]">
          {CLIENTS.map((client) => (
            <ClientItem key={client.name} client={client} />
          ))}
        </Marquee>
      </div>
    </div>
  );
}
