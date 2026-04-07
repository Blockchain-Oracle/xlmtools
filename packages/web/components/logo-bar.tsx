"use client"

import Image from "next/image"
import { Marquee } from "@/components/ui/marquee"
import { cn } from "@/lib/utils"

interface LogoItem {
  name: string
  /** Filename stem in /logos/ — light suffix is -dark, dark suffix is base */
  stem: string
  /** Whether a separate dark-mode variant exists (stem + "-dark.svg") */
  hasDark: boolean
  width: number
}

const LOGOS: LogoItem[] = [
  { name: "Claude", stem: "claude", hasDark: true, width: 72 },
  { name: "Cursor", stem: "cursor", hasDark: true, width: 72 },
  { name: "Windsurf", stem: "windsurf", hasDark: false, width: 88 },
  { name: "Stellar", stem: "stellar", hasDark: true, width: 80 },
  { name: "Circle", stem: "circle", hasDark: false, width: 64 },
]

function LogoItem({ logo }: { logo: LogoItem }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center mx-6",
        "opacity-40 hover:opacity-80 transition-opacity duration-200"
      )}
      title={logo.name}
    >
      {logo.hasDark ? (
        <>
          {/* Light mode: use dark-colored variant */}
          <Image
            src={`/logos/${logo.stem}-dark.svg`}
            alt={logo.name}
            width={logo.width}
            height={24}
            className="h-6 w-auto block dark:hidden"
          />
          {/* Dark mode: use white variant */}
          <Image
            src={`/logos/${logo.stem}.svg`}
            alt={logo.name}
            width={logo.width}
            height={24}
            className="h-6 w-auto hidden dark:block"
          />
        </>
      ) : (
        /* Single variant — invert in light mode */
        <Image
          src={`/logos/${logo.stem}.svg`}
          alt={logo.name}
          width={logo.width}
          height={24}
          className="h-6 w-auto dark:invert-0 invert"
        />
      )}
    </div>
  )
}

export function LogoBar() {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Works with
      </p>

      <div className="w-full relative overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-background to-transparent" />

        <Marquee pauseOnHover repeat={4} className="[--duration:28s] [--gap:0px]">
          {LOGOS.map((logo) => (
            <LogoItem key={logo.name} logo={logo} />
          ))}
        </Marquee>
      </div>
    </div>
  )
}
