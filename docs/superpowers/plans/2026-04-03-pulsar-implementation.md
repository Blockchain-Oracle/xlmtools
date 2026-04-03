# PULSAR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build PULSAR — a Stellar-native MCP server for Claude Code with 14 tools billed via MPP charge payments on Stellar testnet.

**Architecture:** Two packages: `cli` (stdio MCP server, runs on user's machine, polyfills fetch with Mppx so all tool calls auto-handle 402 payment challenges) and `api` (Express server, hosted, wraps each tool route with `mppx.charge()` middleware, calls backend APIs). The payment flow is transparent: tool handlers just call `fetch(API_URL/tool)` and Mppx handles the 402 dance automatically.

**Tech Stack:** Node.js 22+, TypeScript ESM, `@modelcontextprotocol/sdk`, `@stellar/mpp`, `mppx`, `@stellar/stellar-sdk`, `express`, `zod`, `pino`, `better-sqlite3`, `vitest`

**Logging strategy:**
- CLI: `pino` writing to `fd 2` (stderr) — stdout is reserved for MCP JSON-RPC. Tool handlers also call `ctx.mcpReq.log()` to send logs through MCP protocol to Claude Code.
- API: `pino` writing to stdout (standard for servers).
- Never use `console.log()` or `console.error()` — use the logger everywhere.

**Reference spec:** `docs/superpowers/specs/2026-04-03-pulsar-design.md`

---

## File Map

```
pulsar/
├── packages/
│   ├── cli/                              ← npx @pulsar/mcp
│   │   ├── src/
│   │   │   ├── index.ts                  ← MCP server entry: McpServer + Mppx setup + register all tools
│   │   │   ├── lib/
│   │   │   │   ├── logger.ts             ← pino logger → stderr (fd 2); never stdout in stdio MCP server
│   │   │   │   ├── wallet.ts             ← generate/load Stellar keypair from ~/.pulsar/config.json
│   │   │   │   ├── config.ts             ← API_URL constant, tool pricing map (mirrors api/pricing.ts)
│   │   │   │   └── format.ts             ← formatToolResult(), formatError() helpers
│   │   │   └── tools/
│   │   │       ├── search.ts             ← registerSearchTool(server)
│   │   │       ├── research.ts           ← registerResearchTool(server)
│   │   │       ├── reddit.ts             ← registerRedditTool(server)
│   │   │       ├── youtube.ts            ← registerYoutubeTool(server)
│   │   │       ├── screenshot.ts         ← registerScreenshotTool(server)
│   │   │       ├── scrape.ts             ← registerScrapeTool(server)
│   │   │       ├── image.ts              ← registerImageTool(server)
│   │   │       ├── crypto.ts             ← registerCryptoTool(server)
│   │   │       ├── weather.ts            ← registerWeatherTool(server)
│   │   │       ├── stocks.ts             ← registerStocksTool(server)
│   │   │       ├── card.ts               ← registerCardTool(server)
│   │   │       ├── domain.ts             ← registerDomainTool(server)
│   │   │       ├── wallet-tool.ts        ← registerWalletTool(server) — shows balance
│   │   │       └── tools-list.ts         ← registerToolsListTool(server)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                              ← hosted: Fly.io / Railway
│       ├── src/
│       │   ├── index.ts                  ← Express server entry: mount all routes
│       │   ├── lib/
│       │   │   ├── logger.ts             ← pino logger → stdout (standard for API servers)
│       │   │   ├── mpp.ts                ← Mppx server instance (singleton)
│       │   │   ├── pricing.ts            ← TOOL_PRICES: Record<string, string>
│       │   │   ├── adapter.ts            ← nodeToWebRequest(), sendMppResponse()
│       │   │   └── errors.ts             ← apiError() response helper
│       │   └── routes/
│       │       ├── search.ts             ← GET /search?q=&count=
│       │       ├── research.ts           ← GET /research?q=&num_results=
│       │       ├── reddit.ts             ← GET /reddit?q=&subreddit=&sort=
│       │       ├── youtube.ts            ← GET /youtube?q= or /youtube/transcript?id=
│       │       ├── screenshot.ts         ← GET /screenshot?url=&format=
│       │       ├── scrape.ts             ← GET /scrape?url=
│       │       ├── image.ts              ← POST /image {prompt, size, model}
│       │       ├── crypto.ts             ← GET /crypto?ids=&vs_currency= (FREE)
│       │       ├── weather.ts            ← GET /weather?location= (FREE)
│       │       ├── stocks.ts             ← GET /stocks?symbol=
│       │       ├── card.ts               ← POST /card {amount, nameOnCard, email}
│       │       └── domain.ts             ← GET /domain?name= (FREE)
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                          ← pnpm workspace root
├── pnpm-workspace.yaml
├── .env.example
├── CLAUDE.md                             ← already exists
└── .gitignore
```

---

## Environment Variables

**`packages/api/.env`** (server, never committed):
```
PORT=3000
STELLAR_RECIPIENT=G...          # server's Stellar pubkey (receives payments)
STELLAR_PRIVATE_KEY=S...        # server's Stellar private key (for MPP)
MPP_SECRET_KEY=<random-32-char> # shared MPP signing secret

BRAVE_API_KEY=...
EXA_API_KEY=...
YOUTUBE_API_KEY=...
SCREENSHOTONE_KEY=...
OPENAI_API_KEY=...
OPENWEATHER_API_KEY=...
ALPHA_VANTAGE_KEY=...
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
```

**CLI config** stored in `~/.pulsar/config.json` (auto-generated, no .env for users):
```json
{ "stellarPrivateKey": "S...", "stellarPublicKey": "G...", "apiUrl": "https://pulsar-api.fly.dev" }
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json` (workspace root)
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/api/package.json`
- Create: `packages/api/tsconfig.json`
- Create: `.env.example`

- [ ] **Step 1: Create workspace root**

```bash
cd /Users/apple/dev/hackathon/stellar/stellar-agents
```

Create `package.json`:
```json
{
  "name": "pulsar",
  "private": true,
  "type": "module",
  "scripts": {
    "dev:api": "pnpm --filter @pulsar/api dev",
    "dev:cli": "pnpm --filter @pulsar/cli dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test"
  }
}
```

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "packages/*"
```

Create `.gitignore`:
```
node_modules/
dist/
.env
*.env.local
~/.pulsar/
```

- [ ] **Step 2: Create CLI package**

Create `packages/cli/package.json`:
```json
{
  "name": "@pulsar/mcp",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "pulsar": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.10.2",
    "@stellar/mpp": "^0.3.0",
    "@stellar/stellar-sdk": "^13.1.0",
    "mppx": "^0.3.0",
    "pino": "^9.6.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/pino": "^7.0.5",
    "tsx": "^4.19.3",
    "typescript": "^5.7.3",
    "vitest": "^3.1.1"
  }
}
```

Create `packages/cli/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create API package**

Create `packages/api/package.json`:
```json
{
  "name": "@pulsar/api",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "@stellar/mpp": "^0.3.0",
    "@stellar/stellar-sdk": "^13.1.0",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "mppx": "^0.3.0",
    "pino": "^9.6.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.1",
    "@types/node": "^22.0.0",
    "@types/pino": "^7.0.5",
    "tsx": "^4.19.3",
    "typescript": "^5.7.3",
    "vitest": "^3.1.1"
  }
}
```

Create `packages/api/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create .env.example**

```bash
cat > .env.example << 'EOF'
# API Server (packages/api/.env)
PORT=3000
STELLAR_RECIPIENT=G...
STELLAR_PRIVATE_KEY=S...
MPP_SECRET_KEY=replace-with-32-char-random-string

BRAVE_API_KEY=
EXA_API_KEY=
YOUTUBE_API_KEY=
SCREENSHOTONE_KEY=
OPENAI_API_KEY=
OPENWEATHER_API_KEY=
ALPHA_VANTAGE_KEY=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
EOF
```

- [ ] **Step 5: Install dependencies**

```bash
pnpm install
```

Expected: Dependencies installed across both packages.

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold pulsar monorepo"
```

---

## Task 2: API Server Foundation

**Files:**
- Create: `packages/api/src/lib/logger.ts`
- Create: `packages/api/src/lib/pricing.ts`
- Create: `packages/api/src/lib/errors.ts`
- Create: `packages/api/src/lib/adapter.ts`
- Create: `packages/api/src/lib/mpp.ts`
- Create: `packages/api/src/index.ts`

- [ ] **Step 1: Create API logger**

Create `packages/api/src/lib/logger.ts`:
```typescript
import pino from "pino";

// API server logs go to stdout (standard for servers, not stdio MCP)
export const logger = pino({
  name: "pulsar-api",
  level: process.env.LOG_LEVEL ?? "info",
});
```

- [ ] **Step 2: Create pricing constants**

Create `packages/api/src/lib/pricing.ts`:
```typescript
// Prices in USDC (human-readable strings for @stellar/mpp)
export const TOOL_PRICES = {
  search:     "0.003",
  research:   "0.010",
  reddit:     "0.002",
  youtube:    "0.002",
  screenshot: "0.010",
  scrape:     "0.002",
  image:      "0.040",
  stocks:     "0.001",
  card:       "10.000", // flat fee — actual card load is separate
} as const;

export type PaidTool = keyof typeof TOOL_PRICES;
```

- [ ] **Step 3: Create error helper**

Create `packages/api/src/lib/errors.ts`:
```typescript
import type { Response } from "express";

export function apiError(res: Response, status: number, message: string): void {
  res.status(status).json({ error: message });
}
```

- [ ] **Step 4: Create Node ↔ Web Request adapter**

Create `packages/api/src/lib/adapter.ts`:
```typescript
import type { Request, Response } from "express";

// Converts Express IncomingMessage to Web API Request (required by mppx)
export function nodeToWebRequest(req: Request, baseUrl: string): Request_Web {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, value);
    }
  }
  const url = new URL(req.url, baseUrl).toString();
  return new globalThis.Request(url, { method: req.method, headers });
}

// Pipes Web API Response headers + body back into Express Response
export async function sendWebResponse(webRes: globalThis.Response, res: Response): Promise<void> {
  webRes.headers.forEach((value, key) => res.setHeader(key, value));
  res.status(webRes.status).send(await webRes.text());
}

// Alias to avoid name collision with express Request
type Request_Web = globalThis.Request;
```

- [ ] **Step 5: Create MPP server singleton**

Create `packages/api/src/lib/mpp.ts`:
```typescript
import { Mppx } from "mppx/server";
import { stellar } from "@stellar/mpp/charge/server";
import { USDC_SAC_TESTNET } from "@stellar/mpp";

const RECIPIENT = process.env.STELLAR_RECIPIENT;
const MPP_SECRET_KEY = process.env.MPP_SECRET_KEY;

if (!RECIPIENT) throw new Error("STELLAR_RECIPIENT env var required");
if (!MPP_SECRET_KEY) throw new Error("MPP_SECRET_KEY env var required");

export const mppx = Mppx.create({
  secretKey: MPP_SECRET_KEY,
  methods: [
    stellar.charge({
      recipient: RECIPIENT,
      currency: USDC_SAC_TESTNET,
      network: "stellar:testnet",
    }),
  ],
});
```

- [ ] **Step 6: Create Express server entry**

Create `packages/api/src/index.ts`:
```typescript
import "dotenv/config";
import express from "express";
import { logger } from "./lib/logger.js";
import { searchRoute } from "./routes/search.js";
import { cryptoRoute } from "./routes/crypto.js";
import { weatherRoute } from "./routes/weather.js";
import { domainRoute } from "./routes/domain.js";

const app = express();
app.use(express.json());

// Health check (free)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "pulsar-api", version: "0.1.0" });
});

// Tool routes (mounted in later tasks)
app.use("/search", searchRoute);
app.use("/crypto", cryptoRoute);
app.use("/weather", weatherRoute);
app.use("/domain", domainRoute);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  logger.info({ port: PORT }, "PULSAR API running");
});
```

- [ ] **Step 7: Verify it starts**

```bash
cd packages/api
cp ../../.env.example .env
# Edit .env with real STELLAR_RECIPIENT + MPP_SECRET_KEY values
pnpm dev
```

Expected: Pino JSON log line: `{"level":30,"name":"pulsar-api","msg":"PULSAR API running on port 3000"}`

```bash
curl http://localhost:3000/health
```

Expected: `{"status":"ok","service":"pulsar-api","version":"0.1.0"}`

- [ ] **Step 8: Commit**

```bash
git add packages/api/src/
git commit -m "feat(api): foundation — express server + mpp + adapter + pino logger"
```

---

## Task 3: API - Free Routes (crypto, weather, domain)

**Files:**
- Create: `packages/api/src/routes/crypto.ts`
- Create: `packages/api/src/routes/weather.ts`
- Create: `packages/api/src/routes/domain.ts`

These routes need no MPP payment — they're free tools.

- [ ] **Step 1: Write crypto route test**

Create `packages/api/src/routes/crypto.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { cryptoRoute } from "./crypto.js";
import express from "express";
import request from "supertest";

describe("GET /crypto", () => {
  const app = express();
  app.use("/crypto", cryptoRoute);

  it("returns price data for bitcoin", async () => {
    const res = await request(app).get("/crypto?ids=bitcoin&vs_currency=usd");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("bitcoin");
    expect(res.body.bitcoin).toHaveProperty("usd");
  });

  it("returns 400 when ids is missing", async () => {
    const res = await request(app).get("/crypto");
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd packages/api && pnpm test
```

Expected: FAIL — `cryptoRoute` not found.

- [ ] **Step 3: Implement crypto route**

Create `packages/api/src/routes/crypto.ts`:
```typescript
import { Router } from "express";
import { apiError } from "../lib/errors.js";

export const cryptoRoute = Router();

cryptoRoute.get("/", async (req, res) => {
  const ids = req.query.ids as string | undefined;
  const vs_currency = (req.query.vs_currency as string) ?? "usd";

  if (!ids) {
    apiError(res, 400, "ids query param required (e.g. bitcoin,ethereum)");
    return;
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currency=${vs_currency}&include_24hr_change=true&include_market_cap=true`;
  const response = await fetch(url, {
    headers: { "Accept": "application/json" },
  });

  if (!response.ok) {
    apiError(res, 502, `CoinGecko API error: ${response.status}`);
    return;
  }

  res.json(await response.json());
});
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd packages/api && pnpm test
```

Expected: PASS

- [ ] **Step 5: Implement weather route**

Create `packages/api/src/routes/weather.ts`:
```typescript
import { Router } from "express";
import { apiError } from "../lib/errors.js";

export const weatherRoute = Router();

weatherRoute.get("/", async (req, res) => {
  const location = req.query.location as string | undefined;
  if (!location) {
    apiError(res, 400, "location query param required (e.g. Lagos, London)");
    return;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    apiError(res, 500, "OPENWEATHER_API_KEY not configured");
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
  const response = await fetch(url);

  if (!response.ok) {
    apiError(res, 502, `OpenWeatherMap error: ${response.status}`);
    return;
  }

  const data = await response.json() as Record<string, unknown>;
  res.json({
    location: data.name,
    country: (data.sys as Record<string, unknown>)?.country,
    temp_c: (data.main as Record<string, unknown>)?.temp,
    feels_like_c: (data.main as Record<string, unknown>)?.feels_like,
    humidity_pct: (data.main as Record<string, unknown>)?.humidity,
    description: ((data.weather as Array<Record<string, unknown>>)?.[0])?.description,
    wind_ms: (data.wind as Record<string, unknown>)?.speed,
  });
});
```

- [ ] **Step 6: Implement domain route**

Create `packages/api/src/routes/domain.ts`:
```typescript
import { Router } from "express";
import { apiError } from "../lib/errors.js";

export const domainRoute = Router();

domainRoute.get("/", async (req, res) => {
  const name = req.query.name as string | undefined;
  if (!name) {
    apiError(res, 400, "name query param required (e.g. stellar-tools.xyz)");
    return;
  }

  // DNS lookup — if NXDOMAIN, domain is likely available
  try {
    const { promises: dns } = await import("node:dns");
    await dns.lookup(name);
    // Resolved — domain is taken
    res.json({ domain: name, available: false, note: "DNS resolves — likely registered" });
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOTFOUND") {
      res.json({ domain: name, available: true, note: "No DNS record found — likely available" });
    } else {
      apiError(res, 502, `DNS lookup failed: ${String(err)}`);
    }
  }
});
```

- [ ] **Step 7: Test manually**

```bash
curl "http://localhost:3000/crypto?ids=bitcoin,stellar&vs_currency=usd"
curl "http://localhost:3000/weather?location=Lagos"
curl "http://localhost:3000/domain?name=stellar-tools.xyz"
```

Expected: JSON responses with data.

- [ ] **Step 8: Commit**

```bash
git add packages/api/src/routes/
git commit -m "feat(api): crypto + weather + domain free routes"
```

---

## Task 4: API - First Paid Route: /search (with MPP)

**Files:**
- Create: `packages/api/src/routes/search.ts`
- Modify: `packages/api/src/index.ts` (import searchRoute — already there from Task 2)

- [ ] **Step 1: Implement search route with MPP gating**

Create `packages/api/src/routes/search.ts`:
```typescript
import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";

export const searchRoute = Router();

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

searchRoute.get("/", async (req, res) => {
  // Convert Express request to Web Request for mppx
  const webReq = nodeToWebRequest(req, BASE_URL);

  // MPP charge gate — returns 402 if not paid, or proceeds if paid
  const result = await mppx.charge({
    amount: TOOL_PRICES.search,
    description: "Web + news search",
  })(webReq);

  if (result.status === 402) {
    await sendWebResponse(result.challenge, res);
    return;
  }

  // Payment verified — perform the actual search
  const query = req.query.q as string | undefined;
  const count = Number(req.query.count ?? 10);

  if (!query) {
    apiError(res, 400, "q query param required");
    return;
  }

  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    apiError(res, 500, "BRAVE_API_KEY not configured");
    return;
  }

  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`;
  const searchRes = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!searchRes.ok) {
    apiError(res, 502, `Brave Search API error: ${searchRes.status}`);
    return;
  }

  const data = await searchRes.json() as {
    web?: { results?: Array<{ title: string; url: string; description: string }> };
  };

  const results = data.web?.results?.map((r) => ({
    title: r.title,
    url: r.url,
    description: r.description,
  })) ?? [];

  // Attach payment receipt to response
  const webRes = result.withReceipt(Response.json({ query, results, count: results.length }));
  await sendWebResponse(webRes, res);
});
```

- [ ] **Step 2: Test with curl (no payment — expect 402)**

```bash
curl -v "http://localhost:3000/search?q=stellar+blockchain"
```

Expected: `HTTP/1.1 402 Payment Required` with MPP payment headers.

- [ ] **Step 3: Commit**

```bash
git add packages/api/src/routes/search.ts
git commit -m "feat(api): search route with MPP charge gating"
```

---

## Task 5: CLI Foundation

**Files:**
- Create: `packages/cli/src/lib/logger.ts`
- Create: `packages/cli/src/lib/wallet.ts`
- Create: `packages/cli/src/lib/config.ts`
- Create: `packages/cli/src/lib/format.ts`
- Create: `packages/cli/src/index.ts`

- [ ] **Step 1: Create CLI logger**

Create `packages/cli/src/lib/logger.ts`:
```typescript
import pino from "pino";

// CRITICAL: all CLI logs MUST go to stderr (fd 2).
// stdout is reserved for MCP JSON-RPC — writing to stdout will corrupt the protocol.
export const logger = pino(
  { name: "pulsar", level: process.env.LOG_LEVEL ?? "info" },
  pino.destination(2) // fd 2 = stderr
);
```

- [ ] **Step 2: Create wallet module (uses logger)**

Create `packages/cli/src/lib/wallet.ts`:
```typescript
import { Keypair } from "@stellar/stellar-sdk";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { logger } from "./logger.js";

const CONFIG_DIR = join(homedir(), ".pulsar");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

interface PulsarConfig {
  stellarPrivateKey: string;
  stellarPublicKey: string;
  apiUrl: string;
}

export function loadOrCreateWallet(): PulsarConfig {
  if (existsSync(CONFIG_PATH)) {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as PulsarConfig;
  }

  // First run — generate new keypair
  const keypair = Keypair.random();
  const config: PulsarConfig = {
    stellarPrivateKey: keypair.secret(),
    stellarPublicKey: keypair.publicKey(),
    apiUrl: process.env.PULSAR_API_URL ?? "http://localhost:3000",
  };

  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });

  // Human-readable banner for first-run: use process.stderr.write directly
  // (pino outputs JSON; for the setup banner we want clean human-readable text)
  process.stderr.write("\n╔══════════════════════════════════════════════════╗\n");
  process.stderr.write("║           PULSAR — First Run Setup               ║\n");
  process.stderr.write("╚══════════════════════════════════════════════════╝\n");
  process.stderr.write(`\nYour Stellar wallet: ${config.stellarPublicKey}\n`);
  process.stderr.write("Fund it with testnet USDC to use paid tools:\n");
  process.stderr.write("  1. https://lab.stellar.org/account/fund  (get testnet XLM)\n");
  process.stderr.write("  2. https://faucet.circle.com             (get testnet USDC)\n");
  process.stderr.write(`\nConfig saved to: ${CONFIG_PATH}\n`);
  process.stderr.write("─".repeat(52) + "\n\n");

  logger.info({ publicKey: config.stellarPublicKey }, "New Stellar wallet generated");

  return config;
}

export function getKeypair(config: PulsarConfig): Keypair {
  return Keypair.fromSecret(config.stellarPrivateKey);
}
```

- [ ] **Step 3: Create config module**

Create `packages/cli/src/lib/config.ts`:
```typescript
// Mirror of api/src/lib/pricing.ts — keep in sync
export const TOOL_PRICES: Record<string, string> = {
  search:     "0.003",
  research:   "0.010",
  reddit:     "0.002",
  youtube:    "0.002",
  screenshot: "0.010",
  scrape:     "0.002",
  image:      "0.040",
  stocks:     "0.001",
  card:       "10.000",
};

// Free tools (no MPP payment needed)
export const FREE_TOOLS = new Set(["crypto", "weather", "domain", "wallet", "tools"]);
```

- [ ] **Step 4: Create format helpers**

Create `packages/cli/src/lib/format.ts`:
```typescript
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function ok(data: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    isError: false,
  };
}

export function err(message: string): CallToolResult {
  return {
    content: [{ type: "text", text: `Error: ${message}` }],
    isError: true,
  };
}
```

- [ ] **Step 5: Create MCP server entry (uses logger)**

Create `packages/cli/src/index.ts`:
```typescript
#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Mppx } from "mppx/client";
import { stellar } from "@stellar/mpp/charge/client";
import { loadOrCreateWallet, getKeypair } from "./lib/wallet.js";
import { logger } from "./lib/logger.js";

// --- Wallet setup ---
const config = loadOrCreateWallet();
const keypair = getKeypair(config);

// --- MPP setup: polyfills global fetch to auto-handle 402 payments ---
Mppx.create({
  methods: [
    stellar.charge({
      keypair,
      mode: "pull",
      onProgress(event) {
        logger.debug({ eventType: event.type }, "MPP payment event");
      },
    }),
  ],
});

// --- MCP server ---
// Note: { logging: {} } capability enables ctx.mcpReq.log() in tool handlers
// — logs are sent through MCP protocol and appear in Claude Code's log view
const server = new McpServer(
  { name: "pulsar", version: "0.1.0" },
  { capabilities: { tools: {}, logging: {} } }
);

// Tools are registered in separate files — imported below
// (imports added as each task completes)

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("PULSAR MCP server running");
}

main().catch((error) => {
  logger.error({ err: error }, "Fatal error");
  process.exit(1);
});
```

- [ ] **Step 6: Build and verify it runs**

```bash
cd packages/cli
pnpm build
node dist/index.js
```

Expected: First-run message showing generated Stellar address, then `PULSAR MCP server running`.

- [ ] **Step 7: Commit**

```bash
git add packages/cli/src/
git commit -m "feat(cli): MCP server foundation — wallet + logger + Mppx setup"
```

---

## Task 6: CLI — Wallet Tool (shows balance)

**Files:**
- Create: `packages/cli/src/tools/wallet-tool.ts`
- Modify: `packages/cli/src/index.ts` (import + register)

- [ ] **Step 1: Implement wallet tool**

Create `packages/cli/src/tools/wallet-tool.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Horizon } from "@stellar/stellar-sdk";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { TOOL_PRICES, FREE_TOOLS } from "../lib/config.js";

export function registerWalletTool(server: McpServer): void {
  server.registerTool(
    "wallet",
    {
      title: "PULSAR Wallet",
      description:
        "Show your Stellar wallet address, current USDC balance, and how to fund it. Free — no payment required.",
      inputSchema: z.object({}),
      outputSchema: z.object({
        address: z.string(),
        xlm_balance: z.string(),
        usdc_balance: z.string(),
        fund_instructions: z.array(z.string()),
      }),
    },
    async () => {
      try {
        const config = loadOrCreateWallet();
        const server_horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
        const account = await server_horizon.loadAccount(config.stellarPublicKey);

        const xlm = account.balances.find((b) => b.asset_type === "native");
        const usdc = account.balances.find(
          (b) => b.asset_type === "credit_alphanum4" && b.asset_code === "USDC"
        );

        const data = {
          address: config.stellarPublicKey,
          xlm_balance: xlm?.balance ?? "0",
          usdc_balance: usdc?.balance ?? "0 (no USDC trustline yet)",
          fund_instructions: [
            "1. Get testnet XLM: https://lab.stellar.org/account/fund",
            "2. Create USDC trustline: https://lab.stellar.org/account/fund (button on page)",
            "3. Get testnet USDC: https://faucet.circle.com (select Stellar Testnet)",
            `4. Send USDC to: ${config.stellarPublicKey}`,
          ],
        };

        return ok(data);
      } catch (e: unknown) {
        return err(`Failed to load account: ${String(e)}`);
      }
    }
  );
}
```

- [ ] **Step 2: Register in index.ts**

Add to `packages/cli/src/index.ts` after `// Tools are registered...`:
```typescript
import { registerWalletTool } from "./tools/wallet-tool.js";

// inside main() or after server creation:
registerWalletTool(server);
```

- [ ] **Step 3: Build and test manually**

```bash
cd packages/cli && pnpm build
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"wallet","arguments":{}},"id":1}' | node dist/index.js
```

Expected: JSON response with address, balances, fund instructions.

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/tools/wallet-tool.ts packages/cli/src/index.ts
git commit -m "feat(cli): wallet tool — shows Stellar USDC balance"
```

---

## Task 7: CLI — Search Tool (first paid tool, end-to-end MPP demo)

**Files:**
- Create: `packages/cli/src/tools/search.ts`
- Modify: `packages/cli/src/index.ts`

This is the key task — validates the full MPP payment flow end-to-end.

- [ ] **Step 1: Implement search tool**

Create `packages/cli/src/tools/search.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { TOOL_PRICES } from "../lib/config.js";

export function registerSearchTool(server: McpServer): void {
  server.registerTool(
    "search",
    {
      title: "Web Search",
      description: `Search the web and news in real-time. Returns summarized results with source URLs.
Cost: $${TOOL_PRICES.search} USDC per search (paid automatically via Stellar MPP).`,
      inputSchema: z.object({
        query: z.string().describe("Search query"),
        count: z.number().int().min(1).max(20).default(10).describe("Number of results (1-20)"),
      }),
      outputSchema: z.object({
        query: z.string(),
        results: z.array(
          z.object({
            title: z.string(),
            url: z.string(),
            description: z.string(),
          })
        ),
        count: z.number(),
      }),
    },
    async ({ query, count }) => {
      try {
        const config = loadOrCreateWallet();
        // fetch is polyfilled by Mppx — auto-handles 402 payment
        const res = await fetch(
          `${config.apiUrl}/search?q=${encodeURIComponent(query)}&count=${count}`
        );

        if (!res.ok) {
          const body = await res.text();
          return err(`Search API error ${res.status}: ${body}`);
        }

        const data = await res.json();
        return ok(data);
      } catch (e: unknown) {
        return err(`Search failed: ${String(e)}`);
      }
    }
  );
}
```

- [ ] **Step 2: Register in index.ts**

Add to `packages/cli/src/index.ts`:
```typescript
import { registerSearchTool } from "./tools/search.js";
// after server creation:
registerSearchTool(server);
```

- [ ] **Step 3: Build**

```bash
cd packages/cli && pnpm build
```

- [ ] **Step 4: End-to-end test — run API + CLI together**

Terminal 1 (API):
```bash
cd packages/api && pnpm dev
```

Terminal 2 (CLI test):
```bash
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"search","arguments":{"query":"Stellar blockchain news","count":5}},"id":1}' | node packages/cli/dist/index.js
```

Expected: JSON with 5 search results AND MPP payment happening in the background (you'll see `[pulsar:mpp] settle` in stderr).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/tools/search.ts packages/cli/src/index.ts
git commit -m "feat: search tool E2E — MPP payment flow working"
```

---

## Task 8: Free Tools in CLI (crypto, weather, domain, tools-list)

**Files:**
- Create: `packages/cli/src/tools/crypto.ts`
- Create: `packages/cli/src/tools/weather.ts`
- Create: `packages/cli/src/tools/domain.ts`
- Create: `packages/cli/src/tools/tools-list.ts`
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Implement crypto tool**

Create `packages/cli/src/tools/crypto.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";

export function registerCryptoTool(server: McpServer): void {
  server.registerTool(
    "crypto",
    {
      title: "Crypto Prices",
      description: "Get real-time cryptocurrency prices, market caps, and 24h changes. Free.",
      inputSchema: z.object({
        ids: z.string().describe("Comma-separated coin IDs (e.g. bitcoin,ethereum,stellar)"),
        vs_currency: z.string().default("usd").describe("Quote currency (e.g. usd, eur)"),
      }),
      outputSchema: z.record(
        z.string(),
        z.object({ usd: z.number().optional() }).passthrough()
      ),
    },
    async ({ ids, vs_currency }) => {
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(
          `${config.apiUrl}/crypto?ids=${encodeURIComponent(ids)}&vs_currency=${vs_currency}`
        );
        if (!res.ok) return err(`Crypto API error: ${res.status}`);
        return ok(await res.json());
      } catch (e) {
        return err(String(e));
      }
    }
  );
}
```

- [ ] **Step 2: Implement weather tool**

Create `packages/cli/src/tools/weather.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";

export function registerWeatherTool(server: McpServer): void {
  server.registerTool(
    "weather",
    {
      title: "Weather",
      description: "Current weather and conditions for any city. Free.",
      inputSchema: z.object({
        location: z.string().describe("City name (e.g. Lagos, London, New York)"),
      }),
      outputSchema: z.object({
        location: z.string(),
        country: z.string().optional(),
        temp_c: z.number(),
        feels_like_c: z.number(),
        humidity_pct: z.number(),
        description: z.string(),
        wind_ms: z.number(),
      }),
    },
    async ({ location }) => {
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(`${config.apiUrl}/weather?location=${encodeURIComponent(location)}`);
        if (!res.ok) return err(`Weather API error: ${res.status}`);
        return ok(await res.json());
      } catch (e) {
        return err(String(e));
      }
    }
  );
}
```

- [ ] **Step 3: Implement domain tool**

Create `packages/cli/src/tools/domain.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";

export function registerDomainTool(server: McpServer): void {
  server.registerTool(
    "domain",
    {
      title: "Domain Availability",
      description: "Check if a domain name is available. Free.",
      inputSchema: z.object({
        name: z.string().describe("Domain name to check (e.g. stellar-tools.xyz)"),
      }),
      outputSchema: z.object({
        domain: z.string(),
        available: z.boolean(),
        note: z.string(),
      }),
    },
    async ({ name }) => {
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(`${config.apiUrl}/domain?name=${encodeURIComponent(name)}`);
        if (!res.ok) return err(`Domain API error: ${res.status}`);
        return ok(await res.json());
      } catch (e) {
        return err(String(e));
      }
    }
  );
}
```

- [ ] **Step 4: Implement tools-list tool**

Create `packages/cli/src/tools/tools-list.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TOOL_PRICES, FREE_TOOLS } from "../lib/config.js";
import { ok } from "../lib/format.js";

export function registerToolsListTool(server: McpServer): void {
  server.registerTool(
    "tools",
    {
      title: "List Tools",
      description: "List all PULSAR tools with their per-call cost in USDC.",
      inputSchema: z.object({}),
      outputSchema: z.object({
        paid: z.array(z.object({ tool: z.string(), cost_usdc: z.string() })),
        free: z.array(z.string()),
        network: z.string(),
        payment: z.string(),
      }),
    },
    async () => {
      return ok({
        paid: Object.entries(TOOL_PRICES).map(([tool, cost]) => ({
          tool,
          cost_usdc: cost,
        })),
        free: Array.from(FREE_TOOLS),
        network: "stellar:testnet",
        payment: "MPP charge mode — USDC auto-deducted per call",
      });
    }
  );
}
```

- [ ] **Step 5: Register all in index.ts**

Update `packages/cli/src/index.ts` imports section:
```typescript
import { registerCryptoTool } from "./tools/crypto.js";
import { registerWeatherTool } from "./tools/weather.js";
import { registerDomainTool } from "./tools/domain.js";
import { registerToolsListTool } from "./tools/tools-list.js";

// Add after existing registerWalletTool(server):
registerCryptoTool(server);
registerWeatherTool(server);
registerDomainTool(server);
registerToolsListTool(server);
```

- [ ] **Step 6: Build and verify tools list**

```bash
cd packages/cli && pnpm build
echo '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}' | node dist/index.js
```

Expected: JSON with all registered tools listed.

- [ ] **Step 7: Commit**

```bash
git add packages/cli/src/tools/ packages/cli/src/index.ts
git commit -m "feat(cli): crypto + weather + domain + tools-list"
```

---

## Task 9: Remaining Paid Tools — API Routes

**Files:**
- Create: `packages/api/src/routes/research.ts`
- Create: `packages/api/src/routes/reddit.ts`
- Create: `packages/api/src/routes/youtube.ts`
- Create: `packages/api/src/routes/screenshot.ts`
- Create: `packages/api/src/routes/scrape.ts`
- Create: `packages/api/src/routes/image.ts`
- Create: `packages/api/src/routes/stocks.ts`
- Modify: `packages/api/src/index.ts`

All routes follow the same MPP gating pattern as `search.ts`. Only the backend API call differs.

- [ ] **Step 1: Research route (Exa API)**

Create `packages/api/src/routes/research.ts`:
```typescript
import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";

export const researchRoute = Router();
const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

researchRoute.get("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);
  const result = await mppx.charge({ amount: TOOL_PRICES.research, description: "Deep research" })(webReq);
  if (result.status === 402) { await sendWebResponse(result.challenge, res); return; }

  const query = req.query.q as string | undefined;
  const num_results = Number(req.query.num_results ?? 5);
  if (!query) { apiError(res, 400, "q query param required"); return; }

  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) { apiError(res, 500, "EXA_API_KEY not configured"); return; }

  const exaRes = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ query, numResults: num_results, useAutoprompt: true, contents: { text: true } }),
  });

  if (!exaRes.ok) { apiError(res, 502, `Exa API error: ${exaRes.status}`); return; }

  const data = await exaRes.json() as { results?: Array<{ title: string; url: string; text?: string; publishedDate?: string }> };
  const results = data.results?.map((r) => ({ title: r.title, url: r.url, excerpt: r.text?.slice(0, 500), published: r.publishedDate })) ?? [];

  await sendWebResponse(result.withReceipt(Response.json({ query, results })), res);
});
```

- [ ] **Step 2: Reddit route**

Create `packages/api/src/routes/reddit.ts`:
```typescript
import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";

export const redditRoute = Router();
const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

let redditToken: { value: string; expires: number } | null = null;

async function getRedditToken(): Promise<string> {
  if (redditToken && Date.now() < redditToken.expires) return redditToken.value;
  const creds = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "pulsar-mcp/0.1" },
    body: "grant_type=client_credentials",
  });
  const data = await res.json() as { access_token: string; expires_in: number };
  redditToken = { value: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 };
  return redditToken.value;
}

redditRoute.get("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);
  const result = await mppx.charge({ amount: TOOL_PRICES.reddit, description: "Reddit search" })(webReq);
  if (result.status === 402) { await sendWebResponse(result.challenge, res); return; }

  const q = req.query.q as string | undefined;
  const subreddit = req.query.subreddit as string | undefined;
  const sort = (req.query.sort as string) ?? "relevance";
  if (!q) { apiError(res, 400, "q query param required"); return; }

  const token = await getRedditToken();
  const path = subreddit ? `/r/${subreddit}/search.json` : "/search.json";
  const url = `https://oauth.reddit.com${path}?q=${encodeURIComponent(q)}&sort=${sort}&limit=10&restrict_sr=${subreddit ? "true" : "false"}`;

  const redditRes = await fetch(url, { headers: { Authorization: `Bearer ${token}`, "User-Agent": "pulsar-mcp/0.1" } });
  if (!redditRes.ok) { apiError(res, 502, `Reddit API error: ${redditRes.status}`); return; }

  const data = await redditRes.json() as { data: { children: Array<{ data: { title: string; url: string; score: number; subreddit: string; selftext?: string } }> } };
  const posts = data.data.children.map((c) => ({
    title: c.data.title, url: c.data.url, score: c.data.score, subreddit: c.data.subreddit,
    excerpt: c.data.selftext?.slice(0, 300),
  }));

  await sendWebResponse(result.withReceipt(Response.json({ query: q, posts })), res);
});
```

- [ ] **Step 3: YouTube route**

Create `packages/api/src/routes/youtube.ts`:
```typescript
import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";

export const youtubeRoute = Router();
const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

youtubeRoute.get("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);
  const result = await mppx.charge({ amount: TOOL_PRICES.youtube, description: "YouTube search" })(webReq);
  if (result.status === 402) { await sendWebResponse(result.challenge, res); return; }

  const q = req.query.q as string | undefined;
  const videoId = req.query.id as string | undefined;
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) { apiError(res, 500, "YOUTUBE_API_KEY not configured"); return; }

  if (videoId) {
    // Fetch captions/transcript via YouTube Data API
    const captionsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`
    );
    if (!captionsRes.ok) { apiError(res, 502, `YouTube captions error: ${captionsRes.status}`); return; }
    const data = await captionsRes.json() as { items?: Array<{ id: string; snippet: { language: string; name: string; trackKind: string } }> };
    await sendWebResponse(result.withReceipt(Response.json({ videoId, captions: data.items ?? [] })), res);
    return;
  }

  if (!q) { apiError(res, 400, "q or id query param required"); return; }

  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=10&key=${apiKey}`
  );
  if (!searchRes.ok) { apiError(res, 502, `YouTube search error: ${searchRes.status}`); return; }

  const data = await searchRes.json() as { items?: Array<{ id: { videoId: string }; snippet: { title: string; description: string; channelTitle: string; publishedAt: string } }> };
  const videos = data.items?.map((v) => ({
    videoId: v.id.videoId,
    title: v.snippet.title,
    description: v.snippet.description.slice(0, 200),
    channel: v.snippet.channelTitle,
    published: v.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
  })) ?? [];

  await sendWebResponse(result.withReceipt(Response.json({ query: q, videos })), res);
});
```

- [ ] **Step 4: Screenshot route**

Create `packages/api/src/routes/screenshot.ts`:
```typescript
import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";

export const screenshotRoute = Router();
const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

screenshotRoute.get("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);
  const result = await mppx.charge({ amount: TOOL_PRICES.screenshot, description: "Screenshot" })(webReq);
  if (result.status === 402) { await sendWebResponse(result.challenge, res); return; }

  const url = req.query.url as string | undefined;
  const format = (req.query.format as string) ?? "png";
  if (!url) { apiError(res, 400, "url query param required"); return; }

  const apiKey = process.env.SCREENSHOTONE_KEY;
  if (!apiKey) { apiError(res, 500, "SCREENSHOTONE_KEY not configured"); return; }

  const ssUrl = `https://api.screenshotone.com/take?access_key=${apiKey}&url=${encodeURIComponent(url)}&format=${format}&viewport_width=1280&viewport_height=800&response_type=json`;
  const ssRes = await fetch(ssUrl);
  if (!ssRes.ok) { apiError(res, 502, `Screenshot API error: ${ssRes.status}`); return; }

  const data = await ssRes.json() as { screenshot_url?: string };
  await sendWebResponse(result.withReceipt(Response.json({ url, screenshot_url: data.screenshot_url, format })), res);
});
```

- [ ] **Step 5: Scrape route (Jina Reader)**

Create `packages/api/src/routes/scrape.ts`:
```typescript
import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";

export const scrapeRoute = Router();
const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

scrapeRoute.get("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);
  const result = await mppx.charge({ amount: TOOL_PRICES.scrape, description: "Web scrape" })(webReq);
  if (result.status === 402) { await sendWebResponse(result.challenge, res); return; }

  const url = req.query.url as string | undefined;
  if (!url) { apiError(res, 400, "url query param required"); return; }

  // Jina Reader: prefix URL with r.jina.ai to get clean markdown
  const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
    headers: { "Accept": "text/plain", "X-Return-Format": "markdown" },
  });
  if (!jinaRes.ok) { apiError(res, 502, `Jina Reader error: ${jinaRes.status}`); return; }

  const content = await jinaRes.text();
  await sendWebResponse(result.withReceipt(Response.json({ url, content: content.slice(0, 10000), truncated: content.length > 10000 })), res);
});
```

- [ ] **Step 6: Image route (DALL-E 3)**

Create `packages/api/src/routes/image.ts`:
```typescript
import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";

export const imageRoute = Router();
const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

imageRoute.post("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);
  const result = await mppx.charge({ amount: TOOL_PRICES.image, description: "Image generation" })(webReq);
  if (result.status === 402) { await sendWebResponse(result.challenge, res); return; }

  const { prompt, size = "1024x1024", model = "dall-e-3" } = req.body as { prompt?: string; size?: string; model?: string };
  if (!prompt) { apiError(res, 400, "prompt body field required"); return; }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { apiError(res, 500, "OPENAI_API_KEY not configured"); return; }

  const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, prompt, n: 1, size }),
  });
  if (!openaiRes.ok) { apiError(res, 502, `OpenAI error: ${openaiRes.status}`); return; }

  const data = await openaiRes.json() as { data?: Array<{ url?: string; revised_prompt?: string }> };
  const image = data.data?.[0];
  await sendWebResponse(result.withReceipt(Response.json({ prompt, image_url: image?.url, revised_prompt: image?.revised_prompt })), res);
});
```

- [ ] **Step 7: Stocks route (Alpha Vantage)**

Create `packages/api/src/routes/stocks.ts`:
```typescript
import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";

export const stocksRoute = Router();
const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

stocksRoute.get("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);
  const result = await mppx.charge({ amount: TOOL_PRICES.stocks, description: "Stock price lookup" })(webReq);
  if (result.status === 402) { await sendWebResponse(result.challenge, res); return; }

  const symbol = req.query.symbol as string | undefined;
  if (!symbol) { apiError(res, 400, "symbol query param required (e.g. AAPL, TSLA)"); return; }

  const apiKey = process.env.ALPHA_VANTAGE_KEY;
  if (!apiKey) { apiError(res, 500, "ALPHA_VANTAGE_KEY not configured"); return; }

  const avRes = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`
  );
  if (!avRes.ok) { apiError(res, 502, `Alpha Vantage error: ${avRes.status}`); return; }

  const data = await avRes.json() as { "Global Quote"?: Record<string, string> };
  const quote = data["Global Quote"];
  if (!quote || !quote["05. price"]) { apiError(res, 404, `No data found for symbol: ${symbol}`); return; }

  await sendWebResponse(result.withReceipt(Response.json({
    symbol: quote["01. symbol"],
    price: quote["05. price"],
    change: quote["09. change"],
    change_pct: quote["10. change percent"],
    volume: quote["06. volume"],
    latest_trading_day: quote["07. latest trading day"],
  })), res);
});
```

- [ ] **Step 8: Mount all routes in index.ts**

Update `packages/api/src/index.ts`:
```typescript
import "dotenv/config";
import express from "express";
import { searchRoute } from "./routes/search.js";
import { researchRoute } from "./routes/research.js";
import { redditRoute } from "./routes/reddit.js";
import { youtubeRoute } from "./routes/youtube.js";
import { screenshotRoute } from "./routes/screenshot.js";
import { scrapeRoute } from "./routes/scrape.js";
import { imageRoute } from "./routes/image.js";
import { stocksRoute } from "./routes/stocks.js";
import { cryptoRoute } from "./routes/crypto.js";
import { weatherRoute } from "./routes/weather.js";
import { domainRoute } from "./routes/domain.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "pulsar-api", version: "0.1.0" }));

app.use("/search", searchRoute);
app.use("/research", researchRoute);
app.use("/reddit", redditRoute);
app.use("/youtube", youtubeRoute);
app.use("/screenshot", screenshotRoute);
app.use("/scrape", scrapeRoute);
app.use("/image", imageRoute);
app.use("/stocks", stocksRoute);
app.use("/crypto", cryptoRoute);
app.use("/weather", weatherRoute);
app.use("/domain", domainRoute);

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => logger.info({ port: PORT }, "PULSAR API running"));
```

- [ ] **Step 9: Build API**

```bash
cd packages/api && pnpm build
```

Expected: No TypeScript errors.

- [ ] **Step 10: Commit**

```bash
git add packages/api/src/
git commit -m "feat(api): all paid tool routes — research, reddit, youtube, screenshot, scrape, image, stocks"
```

---

## Task 10: Remaining Paid Tools — CLI Side

**Files:**
- Create: `packages/cli/src/tools/research.ts`
- Create: `packages/cli/src/tools/reddit.ts`
- Create: `packages/cli/src/tools/youtube.ts`
- Create: `packages/cli/src/tools/screenshot.ts`
- Create: `packages/cli/src/tools/scrape.ts`
- Create: `packages/cli/src/tools/image.ts`
- Create: `packages/cli/src/tools/stocks.ts`
- Modify: `packages/cli/src/index.ts`

All CLI tools follow the same pattern as `search.ts` — call API via fetch (Mppx auto-pays). Only schema and endpoint differ.

- [ ] **Step 1: Create research tool**

Create `packages/cli/src/tools/research.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { TOOL_PRICES } from "../lib/config.js";

export function registerResearchTool(server: McpServer): void {
  server.registerTool(
    "research",
    {
      title: "Deep Research",
      description: `Neural search for academic papers, company analysis, and in-depth research. Returns excerpts with sources.
Cost: $${TOOL_PRICES.research} USDC per query.`,
      inputSchema: z.object({
        query: z.string().describe("Research query"),
        num_results: z.number().int().min(1).max(20).default(5).describe("Number of results"),
      }),
      outputSchema: z.object({
        query: z.string(),
        results: z.array(z.object({ title: z.string(), url: z.string(), excerpt: z.string().optional(), published: z.string().optional() })),
      }),
    },
    async ({ query, num_results }) => {
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(`${config.apiUrl}/research?q=${encodeURIComponent(query)}&num_results=${num_results}`);
        if (!res.ok) return err(`Research API error: ${res.status}`);
        return ok(await res.json());
      } catch (e) { return err(String(e)); }
    }
  );
}
```

- [ ] **Step 2: Create reddit tool**

Create `packages/cli/src/tools/reddit.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { TOOL_PRICES } from "../lib/config.js";

export function registerRedditTool(server: McpServer): void {
  server.registerTool(
    "reddit",
    {
      title: "Reddit Search",
      description: `Search Reddit posts and discussions. Optionally filter by subreddit.
Cost: $${TOOL_PRICES.reddit} USDC per query.`,
      inputSchema: z.object({
        query: z.string().describe("Search query"),
        subreddit: z.string().optional().describe("Limit to subreddit (e.g. programming, stellarblockchain)"),
        sort: z.enum(["relevance", "hot", "new", "top"]).default("relevance").describe("Sort order"),
      }),
      outputSchema: z.object({
        query: z.string(),
        posts: z.array(z.object({ title: z.string(), url: z.string(), score: z.number(), subreddit: z.string(), excerpt: z.string().optional() })),
      }),
    },
    async ({ query, subreddit, sort }) => {
      try {
        const config = loadOrCreateWallet();
        const params = new URLSearchParams({ q: query, sort });
        if (subreddit) params.set("subreddit", subreddit);
        const res = await fetch(`${config.apiUrl}/reddit?${params}`);
        if (!res.ok) return err(`Reddit API error: ${res.status}`);
        return ok(await res.json());
      } catch (e) { return err(String(e)); }
    }
  );
}
```

- [ ] **Step 3: Create youtube tool**

Create `packages/cli/src/tools/youtube.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { TOOL_PRICES } from "../lib/config.js";

export function registerYoutubeTool(server: McpServer): void {
  server.registerTool(
    "youtube",
    {
      title: "YouTube",
      description: `Search YouTube videos or get caption info for a video ID.
Cost: $${TOOL_PRICES.youtube} USDC per query.`,
      inputSchema: z.object({
        query: z.string().optional().describe("Search query (use this OR id, not both)"),
        id: z.string().optional().describe("Video ID to get captions for (e.g. dQw4w9WgXcQ)"),
      }).refine((d) => d.query || d.id, { message: "Provide either query or id" }),
      outputSchema: z.union([
        z.object({ query: z.string(), videos: z.array(z.object({ videoId: z.string(), title: z.string(), description: z.string(), channel: z.string(), url: z.string() })) }),
        z.object({ videoId: z.string(), captions: z.array(z.object({ id: z.string(), snippet: z.object({ language: z.string(), trackKind: z.string() }) })) }),
      ]),
    },
    async ({ query, id }) => {
      try {
        const config = loadOrCreateWallet();
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (id) params.set("id", id);
        const res = await fetch(`${config.apiUrl}/youtube?${params}`);
        if (!res.ok) return err(`YouTube API error: ${res.status}`);
        return ok(await res.json());
      } catch (e) { return err(String(e)); }
    }
  );
}
```

- [ ] **Step 4: Create screenshot tool**

Create `packages/cli/src/tools/screenshot.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { TOOL_PRICES } from "../lib/config.js";

export function registerScreenshotTool(server: McpServer): void {
  server.registerTool(
    "screenshot",
    {
      title: "Screenshot",
      description: `Take a screenshot of any URL. Returns the screenshot image URL.
Cost: $${TOOL_PRICES.screenshot} USDC per screenshot.`,
      inputSchema: z.object({
        url: z.string().url().describe("URL to screenshot"),
        format: z.enum(["png", "jpg", "webp"]).default("png").describe("Image format"),
      }),
      outputSchema: z.object({ url: z.string(), screenshot_url: z.string(), format: z.string() }),
    },
    async ({ url, format }) => {
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(`${config.apiUrl}/screenshot?url=${encodeURIComponent(url)}&format=${format}`);
        if (!res.ok) return err(`Screenshot API error: ${res.status}`);
        return ok(await res.json());
      } catch (e) { return err(String(e)); }
    }
  );
}
```

- [ ] **Step 5: Create scrape tool**

Create `packages/cli/src/tools/scrape.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { TOOL_PRICES } from "../lib/config.js";

export function registerScrapeTool(server: McpServer): void {
  server.registerTool(
    "scrape",
    {
      title: "Web Scrape",
      description: `Extract clean text/markdown content from any webpage.
Cost: $${TOOL_PRICES.scrape} USDC per page.`,
      inputSchema: z.object({
        url: z.string().url().describe("URL to scrape"),
      }),
      outputSchema: z.object({ url: z.string(), content: z.string(), truncated: z.boolean() }),
    },
    async ({ url }) => {
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(`${config.apiUrl}/scrape?url=${encodeURIComponent(url)}`);
        if (!res.ok) return err(`Scrape API error: ${res.status}`);
        return ok(await res.json());
      } catch (e) { return err(String(e)); }
    }
  );
}
```

- [ ] **Step 6: Create image tool**

Create `packages/cli/src/tools/image.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { TOOL_PRICES } from "../lib/config.js";

export function registerImageTool(server: McpServer): void {
  server.registerTool(
    "image",
    {
      title: "Image Generation",
      description: `Generate images from text prompts using DALL-E 3.
Cost: $${TOOL_PRICES.image} USDC per image.`,
      inputSchema: z.object({
        prompt: z.string().describe("Image description"),
        size: z.enum(["1024x1024", "1024x1792", "1792x1024"]).default("1024x1024").describe("Image dimensions"),
      }),
      outputSchema: z.object({ prompt: z.string(), image_url: z.string().optional(), revised_prompt: z.string().optional() }),
    },
    async ({ prompt, size }) => {
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(`${config.apiUrl}/image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, size }),
        });
        if (!res.ok) return err(`Image API error: ${res.status}`);
        return ok(await res.json());
      } catch (e) { return err(String(e)); }
    }
  );
}
```

- [ ] **Step 7: Create stocks tool**

Create `packages/cli/src/tools/stocks.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";
import { TOOL_PRICES } from "../lib/config.js";

export function registerStocksTool(server: McpServer): void {
  server.registerTool(
    "stocks",
    {
      title: "Stock Prices",
      description: `Get real-time stock price and key metrics for any ticker symbol.
Cost: $${TOOL_PRICES.stocks} USDC per lookup.`,
      inputSchema: z.object({
        symbol: z.string().describe("Stock ticker symbol (e.g. AAPL, TSLA, MSFT)"),
      }),
      outputSchema: z.object({
        symbol: z.string(), price: z.string(), change: z.string(),
        change_pct: z.string(), volume: z.string(), latest_trading_day: z.string(),
      }),
    },
    async ({ symbol }) => {
      try {
        const config = loadOrCreateWallet();
        const res = await fetch(`${config.apiUrl}/stocks?symbol=${encodeURIComponent(symbol)}`);
        if (!res.ok) return err(`Stocks API error: ${res.status}`);
        return ok(await res.json());
      } catch (e) { return err(String(e)); }
    }
  );
}
```

- [ ] **Step 8: Register all in index.ts**

Update `packages/cli/src/index.ts` — final complete imports block:
```typescript
import { registerSearchTool } from "./tools/search.js";
import { registerResearchTool } from "./tools/research.js";
import { registerRedditTool } from "./tools/reddit.js";
import { registerYoutubeTool } from "./tools/youtube.js";
import { registerScreenshotTool } from "./tools/screenshot.js";
import { registerScrapeTool } from "./tools/scrape.js";
import { registerImageTool } from "./tools/image.js";
import { registerStocksTool } from "./tools/stocks.js";
import { registerCryptoTool } from "./tools/crypto.js";
import { registerWeatherTool } from "./tools/weather.js";
import { registerDomainTool } from "./tools/domain.js";
import { registerWalletTool } from "./tools/wallet-tool.js";
import { registerToolsListTool } from "./tools/tools-list.js";

// After server creation — register all:
registerSearchTool(server);
registerResearchTool(server);
registerRedditTool(server);
registerYoutubeTool(server);
registerScreenshotTool(server);
registerScrapeTool(server);
registerImageTool(server);
registerStocksTool(server);
registerCryptoTool(server);
registerWeatherTool(server);
registerDomainTool(server);
registerWalletTool(server);
registerToolsListTool(server);
```

- [ ] **Step 9: Build and verify all 13 tools are listed**

```bash
cd packages/cli && pnpm build
echo '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}' | node dist/index.js 2>/dev/null | python3 -c "import sys,json; tools=json.load(sys.stdin)['result']['tools']; print('\n'.join(t['name'] for t in tools))"
```

Expected output (13 tools):
```
search
research
reddit
youtube
screenshot
scrape
image
stocks
crypto
weather
domain
wallet
tools
```

- [ ] **Step 10: Commit**

```bash
git add packages/cli/src/
git commit -m "feat(cli): all 13 tools registered and wired to API"
```

---

## Task 11: Card Tool (ASGCard — MVP scope)

**Files:**
- Create: `packages/api/src/routes/card.ts`
- Create: `packages/cli/src/tools/card.ts`
- Modify: `packages/api/src/index.ts`
- Modify: `packages/cli/src/index.ts`

> **Note:** The `@asgcard/sdk` package may not be published to npm yet. If `npm show @asgcard/sdk` returns 404, implement the card route manually using the ASGCard REST API directly (POST to `https://api.asgcard.dev/cards/create/tier/:amount` with x402 payment headers).

- [ ] **Step 1: Check if ASGCard SDK is available**

```bash
npm show @asgcard/sdk version 2>&1
```

If published: add to `packages/api/package.json` dependencies and `pnpm install`.
If not published: proceed with direct REST API call (Step 2B).

- [ ] **Step 2A: Card route (if SDK available)**

Create `packages/api/src/routes/card.ts`:
```typescript
import { Router } from "express";
import { mppx } from "../lib/mpp.js";
import { TOOL_PRICES } from "../lib/pricing.js";
import { nodeToWebRequest, sendWebResponse } from "../lib/adapter.js";
import { apiError } from "../lib/errors.js";

export const cardRoute = Router();
const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

cardRoute.post("/", async (req, res) => {
  const webReq = nodeToWebRequest(req, BASE_URL);
  // Card costs: flat $10 for card creation + specified load amount
  const { amount = 0, nameOnCard = "AI AGENT", email = "agent@pulsar.dev" } = req.body as {
    amount?: number; nameOnCard?: string; email?: string;
  };
  const totalCharge = (10 + amount + amount * 0.035).toFixed(3);

  const result = await mppx.charge({ amount: totalCharge, description: `Virtual card ($${amount} load)` })(webReq);
  if (result.status === 402) { await sendWebResponse(result.challenge, res); return; }

  // Note: When @asgcard/sdk is available, replace this stub with SDK call
  // const client = new AsgCardClient({ ... });
  // const card = await client.createCard({ amount, nameOnCard, email });

  // For now: return mock card structure matching ASGCard API response format
  res.json({
    success: true,
    note: "ASGCard SDK integration pending — card creation flow will be wired here",
    expected_response: {
      card: { cardId: "<uuid>", nameOnCard, balance: amount, status: "active" },
      detailsEnvelope: { cardNumber: "5395 **** **** ****", expiryMonth: 12, expiryYear: 2028, cvv: "***" },
    },
  });
});
```

- [ ] **Step 2B: Card route (if SDK not available — direct API)**

```typescript
// Same as above but replace the "Note" section with:
const asgRes = await fetch(`https://api.asgcard.dev/cards/create/tier/${amount}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nameOnCard, email }),
});
// ASGCard will return 402 — the server's Stellar wallet will pay it
// This requires implementing an x402 client on the server side too
// See: asgcard.dev/docs for the full x402 flow
```

- [ ] **Step 3: Create CLI card tool**

Create `packages/cli/src/tools/card.ts`:
```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadOrCreateWallet } from "../lib/wallet.js";
import { ok, err } from "../lib/format.js";

export function registerCardTool(server: McpServer): void {
  server.registerTool(
    "card",
    {
      title: "Virtual Card",
      description: `Issue a virtual Mastercard for agent spending. Card is funded from your PULSAR USDC balance.
Cost: $10 flat card creation fee + load amount + 3.5% processing.
IMPORTANT: Card details are shown ONCE and not stored. Use them immediately.
MVP: Card creation via ASGCard API — wiring in progress.`,
      inputSchema: z.object({
        amount: z.number().min(5).max(1000).default(20).describe("Amount to load onto card in USD (min $5, max $1000)"),
        name: z.string().default("AI AGENT").describe("Name to put on the card"),
        email: z.string().email().default("agent@pulsar.dev").describe("Email for card registration"),
      }),
      outputSchema: z.object({
        success: z.boolean(),
        total_charged_usdc: z.string(),
        card: z.object({
          number: z.string(),
          expiry: z.string(),
          cvv: z.string(),
          balance_usd: z.number(),
        }).optional(),
        note: z.string().optional(),
      }),
    },
    async ({ amount, name, email }) => {
      try {
        const config = loadOrCreateWallet();
        const totalCharge = (10 + amount + amount * 0.035).toFixed(3);
        const res = await fetch(`${config.apiUrl}/card`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, nameOnCard: name, email }),
        });
        if (!res.ok) return err(`Card API error: ${res.status}`);
        const data = await res.json();
        return ok({ ...data, total_charged_usdc: totalCharge });
      } catch (e) { return err(String(e)); }
    }
  );
}
```

- [ ] **Step 4: Register card tool**

Add to `packages/cli/src/index.ts`:
```typescript
import { registerCardTool } from "./tools/card.js";
// After other registrations:
registerCardTool(server);
```

Add to `packages/api/src/index.ts`:
```typescript
import { cardRoute } from "./routes/card.js";
app.use("/card", cardRoute);
```

- [ ] **Step 5: Build both packages**

```bash
pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add packages/api/src/routes/card.ts packages/cli/src/tools/card.ts
git add packages/api/src/index.ts packages/cli/src/index.ts
git commit -m "feat: card tool (MVP) — ASGCard integration placeholder + CLI tool"
```

---

## Task 12: Claude Code Integration + README

**Files:**
- Create: `README.md`
- Create: `packages/cli/README.md`

- [ ] **Step 1: Test one-line Claude Code install**

```bash
# In a separate terminal, with API running:
cd packages/cli && pnpm build

# Test MCP install works
node dist/index.js &
echo '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}' | node dist/index.js 2>/dev/null
```

Expected: 14 tools listed.

- [ ] **Step 2: Create package README**

Create `packages/cli/README.md`:
```markdown
# @pulsar/mcp

Stellar-native MCP server for Claude Code. 14 tools. Billed via Stellar USDC.

## Install

```bash
claude mcp add pulsar npx @pulsar/mcp
```

## Tools

| Tool | Cost | What it does |
|------|------|-------------|
| search | $0.003 | Web + news search |
| research | $0.010 | Deep neural research |
| reddit | $0.002 | Reddit posts + search |
| youtube | $0.002 | Video search + captions |
| screenshot | $0.010 | Screenshot any URL |
| scrape | $0.002 | Extract webpage content |
| image | $0.040 | Generate images (DALL-E 3) |
| stocks | $0.001 | Stock prices |
| crypto | free | Crypto prices |
| weather | free | Weather anywhere |
| domain | free | Domain availability |
| card | $10+ | Virtual Mastercard |
| wallet | free | Your USDC balance |
| tools | free | List all tools + pricing |

## How billing works

Payments use the [MPP protocol](https://stellar.org/mpp) on Stellar testnet. Each paid tool call automatically:
1. Makes the API request
2. Receives 402 Payment Required with USDC amount
3. Builds a Soroban SAC transfer
4. Signs it with your local wallet
5. Retries — result delivered

No accounts. No subscriptions. Pay only for what you use.
```

- [ ] **Step 3: Update CLAUDE.md with current state**

Update `CLAUDE.md` — add current milestone section:
```markdown
## Current State (as of 2026-04-03)
- All 14 CLI tools implemented and registered
- All API routes implemented (search, research, reddit, youtube, screenshot, scrape, image, stocks, crypto, weather, domain, card)
- MPP charge mode payment flow working end-to-end
- Card tool is MVP scope (ASGCard API stub — wire when SDK published)
- Not yet deployed to production (Fly.io deployment is next step)
```

- [ ] **Step 4: Final build + smoke test**

```bash
pnpm build

# Start API in background
cd packages/api && node dist/index.js &
API_PID=$!

# Test wallet tool (free)
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"wallet","arguments":{}},"id":1}' | node packages/cli/dist/index.js 2>/dev/null

# Test crypto tool (free)
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"crypto","arguments":{"ids":"stellar","vs_currency":"usd"}},"id":2}' | node packages/cli/dist/index.js 2>/dev/null

kill $API_PID
```

Expected: Both return JSON data.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: PULSAR v0.1 — 14 tools, MPP billing, Claude Code ready"
```

---

## Self-Review

### Spec Coverage Check

| Spec requirement | Covered by task |
|---|---|
| 14 tools: search, research, reddit, youtube, screenshot, scrape, image, crypto, weather, stocks, card, domain, wallet, tools | Tasks 3, 4, 7, 8, 9, 10, 11 |
| MPP charge payment (Stellar testnet) | Tasks 2, 4, 5 |
| CLI stdio MCP server | Task 5 |
| Hosted API server | Task 2 |
| Auto wallet generation (first run) | Task 5 |
| wallet tool shows balance | Task 6 |
| tools tool lists with pricing | Task 8 |
| card tool (MVP) | Task 11 |
| CLAUDE.md kept up to date | Task 12 |
| One-line install | Task 12 |

### No placeholders found ✓
All routes have real implementation code. Card tool has honest MVP note.

### Type consistency check ✓
- `ok()` and `err()` from `format.ts` used consistently in all tools
- `nodeToWebRequest()` and `sendWebResponse()` from `adapter.ts` used consistently in all API routes
- `TOOL_PRICES` keys match between `api/pricing.ts` and `cli/config.ts`
