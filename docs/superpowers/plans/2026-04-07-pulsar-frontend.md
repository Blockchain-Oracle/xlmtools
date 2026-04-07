# PULSAR Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished dark-theme website and documentation site for PULSAR — the Stellar-native MCP server — so hackathon judges see a real product, not just CLI code in a repo.

**Architecture:** Monorepo with two new Next.js apps alongside the existing `packages/cli` and `packages/api`. The **web app** (`apps/web`) is the marketing/product site with landing page, tool catalog, activity stream, and stats. The **docs app** (`apps/docs`) uses Nextra 4 for technical documentation. Both apps fetch live data from the existing PULSAR API server. Web first, docs later.

**Tech Stack:**
- Next.js 15, React 19, Tailwind CSS 4, TypeScript
- shadcn/ui (Radix primitives + Tailwind) for UI components
- SWR for data fetching
- Framer Motion for subtle animations
- Nextra 4 + nextra-theme-docs for docs site
- pnpm workspace monorepo

---

## Architecture Overview

### Directory Structure (Final State)

```
stellar-agents/
├── apps/
│   ├── web/                    ← NEW: Main website (Next.js 15 + Tailwind)
│   │   ├── app/
│   │   │   ├── page.tsx                 Landing page (/)
│   │   │   ├── layout.tsx               Root layout + navbar + footer
│   │   │   ├── globals.css              Tailwind + dark theme tokens
│   │   │   ├── tools/page.tsx           Tool catalog (/tools)
│   │   │   ├── explore/page.tsx         Transaction stream (/explore)
│   │   │   └── stats/[address]/page.tsx Stats per address (/stats/:address)
│   │   ├── components/
│   │   │   ├── ui/                      shadcn/ui primitives (button, card, badge, etc.)
│   │   │   ├── navbar.tsx               Site navigation
│   │   │   ├── footer.tsx               Site footer
│   │   │   ├── install-command.tsx       Copy-to-clipboard install block
│   │   │   ├── tool-card.tsx            Individual tool display card
│   │   │   ├── tool-grid.tsx            Filterable tool catalog grid
│   │   │   ├── activity-stream.tsx      Live transaction feed
│   │   │   ├── stats-bar.tsx            Network stats (txs, volume, agents)
│   │   │   └── logo-bar.tsx             Client logos (Claude, Cursor, etc.)
│   │   ├── lib/
│   │   │   ├── tools.ts                 Tool metadata (name, desc, price, category)
│   │   │   └── api.ts                   API client + SWR fetchers
│   │   ├── public/
│   │   │   ├── logos/                   Client + ecosystem logos (SVG)
│   │   │   └── og.png                   OpenGraph image
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── docs/                   ← NEW: Docs site (Nextra 4)
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx           Nextra layout + navbar
│       │   │   ├── [[...mdxPath]]/page.tsx  Catch-all MDX renderer
│       │   │   └── globals.css          Nextra theme + brand colors
│       │   └── content/
│       │       ├── _meta.ts             Top-level navigation
│       │       ├── index.mdx            Introduction
│       │       ├── getting-started/
│       │       │   ├── _meta.ts
│       │       │   ├── index.mdx        Overview
│       │       │   ├── installation.mdx  Install + fund wallet
│       │       │   └── first-tool.mdx   Make your first tool call
│       │       ├── tools/
│       │       │   ├── _meta.ts
│       │       │   ├── index.mdx        Tool reference overview
│       │       │   ├── paid-tools.mdx   search, research, youtube, etc.
│       │       │   └── stellar-tools.mdx DEX, swap, oracle, etc.
│       │       ├── guides/
│       │       │   ├── _meta.ts
│       │       │   ├── payment-flow.mdx  How MPP works
│       │       │   └── stellar-wallet.mdx Wallet setup guide
│       │       └── reference/
│       │           ├── _meta.ts
│       │           └── api.mdx          API endpoint reference
│       ├── mdx-components.tsx
│       ├── next.config.mjs
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── cli/                    ← EXISTING: MCP server (@pulsar/mcp)
│   └── api/                    ← EXISTING: Express API server
│
├── pnpm-workspace.yaml         ← MODIFY: Add "apps/*"
├── package.json                ← MODIFY: Add web/docs dev scripts
└── screenshots/                ← EXISTING: Design reference screenshots
```

### Data Flow

```
┌─────────────┐    ┌──────────────────────┐    ┌──────────────┐
│  apps/web   │───▶│  packages/api        │───▶│  Horizon API │
│  (Next.js)  │    │  (Express, port 3000)│    │  Stellar     │
│             │    │                      │───▶│  Expert API  │
│  /tools     │    │  /dex-orderbook      │    │  Reflector   │
│  /explore   │    │  /swap-quote         │    └──────────────┘
│  /stats     │    │  /stellar-asset      │
└─────────────┘    │  /health             │
                   │  + new routes:       │
                   │  /api/activity       │
                   │  /api/network-stats  │
                   └──────────────────────┘
```

The web app calls the PULSAR API server for live data. We add 2 new lightweight API routes (`/api/activity` and `/api/network-stats`) to the existing API server to support the website.

### Key Design Decisions

1. **`apps/` vs `packages/`** — New frontend apps go in `apps/` (standard Turborepo convention). Existing `packages/cli` and `packages/api` stay where they are. The workspace config adds `"apps/*"` to the glob.

2. **No Turborepo** — We don't need Turborepo's build orchestration for a hackathon. Plain pnpm workspace scripts suffice. The Stack-AI repo uses Turborepo, but it's overkill for us.

3. **Web and Docs are separate Next.js apps** — Different frameworks (vanilla Next.js vs Nextra), different concerns, different deploy targets. Clean separation.

4. **Tool metadata lives in the web app** — `apps/web/lib/tools.ts` is a static array of all 20 tools with name, description, price, category, and whether they're free. This avoids an API call and ensures the catalog always matches what's shipped.

5. **Activity data comes from the API server** — The web app calls the PULSAR API, which queries Horizon for recent operations. No separate database.

6. **Dark theme only** — No light/dark toggle. frames.ag-style full dark. Simpler CSS, stronger brand.

7. **shadcn/ui for components** — Not a full component library install. We cherry-pick: `button`, `card`, `badge`, `input`, `dialog`. Copy-paste pattern, fully customizable.

---

## Phase 1: Web App (Priority)

### Task 1: Scaffold `apps/web` — workspace + Next.js + Tailwind

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json` (root)
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`

- [ ] **Step 1: Update workspace config**

Add `"apps/*"` to `pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 2: Add root dev scripts**

In root `package.json`, add:
```json
"dev:web": "pnpm --filter @pulsar/web dev",
"dev:docs": "pnpm --filter @pulsar/docs dev"
```

- [ ] **Step 3: Create `apps/web/package.json`**

```json
{
  "name": "@pulsar/web",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001"
  },
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "swr": "latest",
    "framer-motion": "latest",
    "lucide-react": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "typescript": "latest",
    "tailwindcss": "latest",
    "@tailwindcss/postcss": "latest"
  }
}
```

Note: Use `pnpm add` in `apps/web/` for each dependency (per project rule: never hardcode versions). The JSON above shows the dep list, not pinned versions.

- [ ] **Step 4: Create Next.js config, tsconfig, postcss, Tailwind config**

`apps/web/next.config.ts`:
```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
}

export default config
```

`apps/web/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

`apps/web/postcss.config.js`:
```js
module.exports = { plugins: { '@tailwindcss/postcss': {} } }
```

`apps/web/tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#7C3AED', // Stellar purple
          light: '#A78BFA',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 5: Create root layout + globals.css**

`apps/web/app/globals.css`:
```css
@import 'tailwindcss';

:root {
  --background: #000000;
  --foreground: #ffffff;
  --muted: #888888;
  --border: #1a1a1a;
  --card: #0a0a0a;
  --accent: #7C3AED;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: 'Inter', system-ui, sans-serif;
}
```

`apps/web/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'PULSAR — Stellar-Native MCP Tools',
  description: 'Pay-per-call tools for AI agents on Stellar. No API keys, no subscriptions.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Create placeholder landing page**

`apps/web/app/page.tsx`:
```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">PULSAR</h1>
    </main>
  )
}
```

- [ ] **Step 7: Install deps + verify dev server starts**

```bash
cd apps/web && pnpm install
pnpm dev
# Visit http://localhost:3001 — should show "PULSAR" centered
```

- [ ] **Step 8: Commit**

```bash
git add apps/web pnpm-workspace.yaml package.json
git commit -m "feat(web): scaffold Next.js app with Tailwind dark theme"
```

---

### Task 2: Navbar + Footer + Install Command components

**Files:**
- Create: `apps/web/components/navbar.tsx`
- Create: `apps/web/components/footer.tsx`
- Create: `apps/web/components/install-command.tsx`
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Build Navbar**

`apps/web/components/navbar.tsx`:
```tsx
'use client'

import Link from 'next/link'

const NAV_ITEMS = [
  { label: 'Tools', href: '/tools' },
  { label: 'Explore', href: '/explore' },
  { label: 'Docs', href: '/docs', external: true },
]

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            PULSAR
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {NAV_ITEMS.map(({ label, href, external }) => (
            <Link
              key={href}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {label}
            </Link>
          ))}
          <a
            href="https://github.com/user/pulsar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Build Footer**

`apps/web/components/footer.tsx`:
```tsx
export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">
          PULSAR — Stellar-native MCP tools, billed via MPP.
        </p>
        <div className="flex gap-4 text-sm text-[var(--muted)]">
          <a href="https://github.com/user/pulsar" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)]">GitHub</a>
          <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)]">Stellar</a>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Build Install Command (copy-to-clipboard)**

`apps/web/components/install-command.tsx`:
```tsx
'use client'

import { useState } from 'react'

const COMMAND = 'claude mcp add pulsar npx @pulsar/mcp'

export function InstallCommand() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(COMMAND)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 rounded border border-[var(--border)] bg-[var(--card)] px-4 py-3 font-mono text-sm">
      <code className="flex-1 text-[var(--muted)]">
        <span className="text-[var(--foreground)]">{COMMAND}</span>
      </code>
      <button
        onClick={copy}
        className="shrink-0 rounded bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-gray-200 transition-colors"
      >
        {copied ? 'COPIED' : 'COPY'}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Wire into layout**

Update `apps/web/app/layout.tsx` body to include Navbar + Footer wrapping children.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components apps/web/app/layout.tsx
git commit -m "feat(web): add navbar, footer, install command components"
```

---

### Task 3: Landing page — Hero + Logo Bar + Stats Bar

**Files:**
- Modify: `apps/web/app/page.tsx`
- Create: `apps/web/components/logo-bar.tsx`
- Create: `apps/web/components/stats-bar.tsx`
- Create: `apps/web/public/logos/` (SVGs for Claude, Cursor, Windsurf, Stellar, Circle)

- [ ] **Step 1: Build Logo Bar**

`apps/web/components/logo-bar.tsx` — Row of client/ecosystem logos. Reference: `stellar-org-01-hero.png` for the pattern. Use simple SVG text placeholders initially, replace with real logos later.

Logos to show: **Claude Code**, **Cursor**, **Windsurf**, **Stellar**, **Circle (USDC)**

- [ ] **Step 2: Build Stats Bar**

`apps/web/components/stats-bar.tsx` — Horizontal stats row like frames.ag bottom bar. Shows: Total Tools (20), Network (Stellar Testnet), Payment (MPP/USDC). Later: live data from API.

- [ ] **Step 3: Build Hero section on landing page**

Layout (inspired by `frames-ag-01-hero.png`):
```
[Navbar]

          ALL TOOLS FREE DURING TESTNET

    Stellar-native tools
    for superagents.

    Pay-per-call MCP tools on Stellar.
    No API keys, no subscriptions.

    [IF YOU'RE NEW HERE] [USE TOOLS] [CHECK BALANCE]

    ┌──────────────────────────────────────────┐
    │ claude mcp add pulsar npx @pulsar/mcp    │ COPY
    └──────────────────────────────────────────┘

    [Claude] [Cursor] [Windsurf] [Stellar] [Circle]

──────────────────────────────────────────────
  TOOLS 20  │  NETWORK Stellar  │  PAYMENT MPP/USDC
```

- [ ] **Step 4: Add 3-step setup section below hero**

Three columns: 1) Install → 2) Fund wallet → 3) Use tools. Reference: `frames-ag-05-agentwallet.png` left panel.

- [ ] **Step 5: Verify landing page renders**

```bash
cd apps/web && pnpm dev
# Visit http://localhost:3001 — full landing page with hero, logos, stats
```

- [ ] **Step 6: Commit**

```bash
git add apps/web
git commit -m "feat(web): landing page with hero, logo bar, stats, 3-step setup"
```

---

### Task 4: Tool catalog page (`/tools`)

**Files:**
- Create: `apps/web/lib/tools.ts`
- Create: `apps/web/components/tool-card.tsx`
- Create: `apps/web/components/tool-grid.tsx`
- Create: `apps/web/app/tools/page.tsx`

- [ ] **Step 1: Create tool metadata**

`apps/web/lib/tools.ts` — Static array of all 20 tools:

```ts
export interface Tool {
  name: string
  title: string
  description: string
  price: string | null  // null = free
  category: 'search' | 'ai' | 'data' | 'stellar' | 'utility'
  free: boolean
}

export const TOOLS: Tool[] = [
  // Paid tools
  { name: 'search', title: 'Web Search', description: 'Search the web and news in real-time.', price: '$0.003', category: 'search', free: false },
  { name: 'research', title: 'Deep Research', description: 'Neural research across papers and the web.', price: '$0.010', category: 'search', free: false },
  // ... all 20 tools
  // Stellar-native free tools
  { name: 'dex-orderbook', title: 'DEX Orderbook', description: 'Live bids/asks for any Stellar pair.', price: null, category: 'stellar', free: true },
  { name: 'swap-quote', title: 'Swap Quote', description: 'Best swap path between any Stellar assets.', price: null, category: 'stellar', free: true },
  { name: 'oracle-price', title: 'Oracle Price', description: 'Reflector decentralized oracle feed.', price: null, category: 'stellar', free: true },
  // ... etc
]
```

- [ ] **Step 2: Build ToolCard component**

Reference: `frames-ag-02-tools-page.png` card design. Each card shows: title, description, price badge (or "FREE"), category badge.

- [ ] **Step 3: Build ToolGrid with search + category filter**

Search bar + filter tabs (ALL, STELLAR, SEARCH, AI, DATA, FREE). Grid of ToolCards.

- [ ] **Step 4: Create page**

`apps/web/app/tools/page.tsx` — imports ToolGrid, renders with heading "The tools" like frames.ag.

- [ ] **Step 5: Verify tools page**

```bash
# Visit http://localhost:3001/tools — card grid with all 20 tools, search works, filters work
```

- [ ] **Step 6: Commit**

```bash
git add apps/web
git commit -m "feat(web): tool catalog page with search and category filters"
```

---

### Task 5: Activity/Explorer page (`/explore`)

**Files:**
- Create: `apps/web/components/activity-stream.tsx`
- Create: `apps/web/app/explore/page.tsx`
- Create: `apps/web/lib/api.ts`

This is the transaction stream page. Reference: `frames-ag-04-activity-feed.png`.

- [ ] **Step 1: Create API client**

`apps/web/lib/api.ts`:
```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

export const fetcher = (url: string) => fetch(url).then(r => r.json())

export function apiUrl(path: string): string {
  return `${API_URL}${path}`
}
```

- [ ] **Step 2: Build ActivityStream component**

Table with columns: TIME, TOOL, AMOUNT, TX HASH (links to stellar.expert). Uses SWR for live updates. Auto-refresh toggle. Each tx hash links to `https://stellar.expert/explorer/testnet/tx/{hash}`.

For MVP: If the API doesn't have an activity endpoint yet, show mock data with the correct structure. We'll wire real data when the API route is added.

- [ ] **Step 3: Create explore page**

`apps/web/app/explore/page.tsx`:
```tsx
import { ActivityStream } from '@/components/activity-stream'

export default function ExplorePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold mb-2">Explorer</h1>
      <p className="text-[var(--muted)] mb-8">
        Live transaction stream. Every paid tool call leaves a receipt on Stellar.
      </p>
      <ActivityStream />
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web
git commit -m "feat(web): explore page with activity stream"
```

---

### Task 6: Stats page (`/stats/:address`)

**Files:**
- Create: `apps/web/app/stats/page.tsx` (address input form)
- Create: `apps/web/app/stats/[address]/page.tsx` (stats display)

- [ ] **Step 1: Build stats input page**

`/stats` — Simple input field for a Stellar G-address. Submits to `/stats/{address}`.

- [ ] **Step 2: Build per-address stats page**

`/stats/{address}` — Calls PULSAR API to get account info + transaction history. Shows:
- XLM balance
- Total tool calls
- Total USDC spent
- Most used tool
- Recent transactions list (links to stellar.expert)

Display as number cards (NOT charts). Reference: `frames-ag-05-agentwallet.png` stats row.

- [ ] **Step 3: Commit**

```bash
git add apps/web
git commit -m "feat(web): stats page with per-address lookup"
```

---

## Phase 2: Docs App (After Web)

### Task 7: Scaffold `apps/docs` — Nextra 4

**Files:**
- Create: `apps/docs/package.json`
- Create: `apps/docs/next.config.mjs`
- Create: `apps/docs/tsconfig.json`
- Create: `apps/docs/mdx-components.tsx`
- Create: `apps/docs/src/app/layout.tsx`
- Create: `apps/docs/src/app/[[...mdxPath]]/page.tsx`
- Create: `apps/docs/src/app/globals.css`
- Create: `apps/docs/src/content/_meta.ts`
- Create: `apps/docs/src/content/index.mdx`

Reference: Stack-AI-MCP `apps/docs/` structure (already studied).

- [ ] **Step 1: Create `apps/docs/package.json`**

Dependencies: `next`, `react`, `react-dom`, `nextra@^4`, `nextra-theme-docs@^4`, `@types/mdx`, `lucide-react`, `typescript`.

- [ ] **Step 2: Create Nextra config files**

Copy the proven pattern from Stack-AI-MCP:
- `next.config.mjs` — wraps with `nextra({ search: { codeblocks: true } })`
- `mdx-components.tsx` — re-exports nextra-theme-docs components
- `src/app/layout.tsx` — Nextra Layout with PULSAR branding
- `src/app/[[...mdxPath]]/page.tsx` — Catch-all MDX renderer
- `src/app/globals.css` — Import nextra theme + PULSAR brand colors

- [ ] **Step 3: Create top-level navigation**

`src/content/_meta.ts`:
```ts
export default {
  index: { title: 'Introduction', theme: { layout: 'full' } },
  'getting-started': { title: 'Getting Started' },
  tools: { title: 'Tool Reference' },
  guides: { title: 'Guides' },
  reference: { title: 'API Reference' },
}
```

- [ ] **Step 4: Create introduction page**

`src/content/index.mdx` — Overview of PULSAR with install command, tool count, links to getting started.

- [ ] **Step 5: Verify docs dev server**

```bash
cd apps/docs && pnpm install && pnpm dev
# Visit http://localhost:3003 — Nextra docs site with sidebar
```

- [ ] **Step 6: Commit**

```bash
git add apps/docs
git commit -m "feat(docs): scaffold Nextra 4 docs site"
```

---

### Task 8: Docs content — Getting Started + Tool Reference

**Files:**
- Create: `apps/docs/src/content/getting-started/*.mdx`
- Create: `apps/docs/src/content/tools/*.mdx`

- [ ] **Step 1: Write Getting Started pages**

- `installation.mdx` — Install command, prerequisites (Node 22+, Claude Code), fund wallet steps with screenshots
- `first-tool.mdx` — Walk through making a search call, seeing the result, checking the receipt

- [ ] **Step 2: Write Tool Reference pages**

- `paid-tools.mdx` — All 7 paid tools with params, examples, pricing
- `stellar-tools.mdx` — All 8 Stellar-native tools with params, examples, what makes them unique

- [ ] **Step 3: Commit**

```bash
git add apps/docs
git commit -m "docs: getting started guide and tool reference"
```

---

### Task 9: Docs content — Guides + API Reference

**Files:**
- Create: `apps/docs/src/content/guides/*.mdx`
- Create: `apps/docs/src/content/reference/*.mdx`

- [ ] **Step 1: Write Payment Flow guide**

`payment-flow.mdx` — How MPP works, channel lifecycle, settlement. Diagram showing: CLI → 402 → sign commitment → API verifies → calls backend → returns result.

- [ ] **Step 2: Write Stellar Wallet guide**

`stellar-wallet.mdx` — How to fund on testnet, Circle faucet, checking balance, what happens when you run out.

- [ ] **Step 3: Write API Reference**

`api.mdx` — All API endpoints, request/response formats, error codes.

- [ ] **Step 4: Commit**

```bash
git add apps/docs
git commit -m "docs: payment flow guide, wallet setup, API reference"
```

---

## Phase 3: API Support Routes (for web app)

### Task 10: Add `/api/network-stats` and `/api/activity` to API server

**Files:**
- Create: `packages/api/src/routes/network-stats.ts`
- Create: `packages/api/src/routes/activity.ts`
- Modify: `packages/api/src/index.ts`

These are lightweight routes the web app calls for live data.

- [ ] **Step 1: Network stats route**

`/api/network-stats` — Returns: total tools (20), network (testnet/mainnet), version. Static for now, dynamic later.

- [ ] **Step 2: Activity route**

`/api/activity` — Queries Horizon for recent operations involving the PULSAR API wallet. Returns simplified transaction list.

- [ ] **Step 3: Wire into API index + commit**

```bash
git add packages/api
git commit -m "feat(api): add network-stats and activity endpoints for web app"
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| **Phase 1: Web** | Tasks 1-6 | Full website: landing, tools, explore, stats |
| **Phase 2: Docs** | Tasks 7-9 | Nextra docs: getting started, tools, guides, API ref |
| **Phase 3: API** | Task 10 | Backend routes for live data on the website |

**Build order:** Task 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

Phase 1 (web) is the hackathon priority. Phase 2 (docs) adds credibility. Phase 3 (API routes) wires live data.
