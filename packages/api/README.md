# @pulsar/api

PULSAR API server — hosted Express 5 server that verifies MPP payments, calls backend services, and returns results with spending receipts.

## How it works

The API server sits between the CLI and third-party services. It gates paid tools behind MPP payment verification and holds all backend API keys so users never need their own.

```
@pulsar/mcp (user's machine)
    |  HTTPS + MPP payment credentials
    v
@pulsar/api (this package, hosted)
    |  - mppx verifies signed payment proofs
    |  - extracts Payment-Receipt header (tx hash)
    |  - logs every paid call to in-memory call log
    |  - calls backend APIs with server-side keys
    |
    v
Backend services (Brave, Exa, OpenAI, YouTube, etc.)
```

## Setup

### Environment variables

Create a `.env` file in this package directory:

```env
# Required
STELLAR_RECIPIENT=G...    # Your Stellar public key (receives USDC)
MPP_SECRET_KEY=random     # Any random string (mppx credential verification)

# Backend API keys (one per paid tool)
BRAVE_API_KEY=            # search tool
EXA_API_KEY=              # research tool
YOUTUBE_API_KEY=          # youtube tool
SCREENSHOTONE_KEY=        # screenshot tool
OPENAI_API_KEY=           # image tool (DALL-E 3)
ALPHA_VANTAGE_KEY=        # stocks tool
OPENWEATHER_API_KEY=      # weather tool (free tool, but needs key)
```

Users never see or configure these. They install the CLI and use tools — the API handles everything server-side.

## Development

```bash
# From the monorepo root
pnpm dev:api

# Or directly
cd packages/api
pnpm dev
```

The dev script uses `tsx watch` for hot-reload. Server starts on port 3000 (configurable via `PORT` env var).

## Build

```bash
pnpm build
```

Compiles TypeScript to `dist/`. Run with `node dist/index.js` or `pnpm start`.

## Endpoints

### Paid tools (MPP-gated)

| Method | Path | Price | Backend |
| --- | --- | --- | --- |
| GET | /search | $0.003 | Brave Search |
| GET | /research | $0.010 | Exa AI |
| GET | /youtube | $0.002 | YouTube Data API |
| GET | /screenshot | $0.010 | ScreenshotOne |
| GET | /scrape | $0.002 | Jina Reader |
| POST | /image | $0.040 | OpenAI DALL-E 3 |
| GET | /stocks | $0.001 | Alpha Vantage |

### Free tools (no auth)

| Method | Path | Backend |
| --- | --- | --- |
| GET | /crypto | CoinGecko |
| GET | /weather | OpenWeatherMap |
| GET | /domain | DNS lookup |
| GET | /dex-orderbook | StellarExpert |
| GET | /dex-candles | StellarExpert |
| GET | /dex-trades | StellarExpert |
| GET | /swap-quote | Stellar Horizon |
| GET | /stellar-asset | StellarExpert |
| GET | /stellar-account | Stellar Horizon |
| GET | /stellar-pools | Stellar Horizon |
| GET | /oracle-price | Reflector |

### System endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | /health | None | Returns `{ status: "ok" }` |
| GET | /stats | None (CORS) | Aggregate usage stats |
| GET | /stats/recent | None (CORS) | Recent call log entries |

## Architecture

### Key modules

| File | Purpose |
| --- | --- |
| `src/index.ts` | Express app, route registration, CORS |
| `src/lib/mpp.ts` | Mppx server setup for payment verification |
| `src/lib/receipt.ts` | Extract Payment-Receipt header, enrich responses, log calls |
| `src/lib/call-log.ts` | In-memory call log (max 1000 entries) |
| `src/lib/pricing.ts` | Tool prices |
| `src/lib/adapter.ts` | Express-to-Web Request/Response adapters |
| `src/lib/errors.ts` | Error response helper |
| `src/lib/logger.ts` | pino logger (stdout) |
| `src/routes/*.ts` | One route file per tool |

### Payment verification flow

1. Paid route creates a Web Request via `nodeToWebRequest()`
2. `mppx.charge({ amount, description })` checks for valid payment credentials
3. If no credentials → returns 402 with payment instructions
4. If valid credentials → payment verified, route handler executes
5. `result.withReceipt()` attaches `Payment-Receipt` header with tx hash
6. `withReceiptBody()` extracts the receipt and adds it to the JSON response
7. `recordCall()` logs the call to the in-memory stats
