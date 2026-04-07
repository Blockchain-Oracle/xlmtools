export type ToolCategory = "stellar" | "search" | "ai" | "data" | "utility"

export interface Tool {
  name: string
  title: string
  description: string
  price: string | null // null = free
  category: ToolCategory
  free: boolean
}

export const tools: Tool[] = [
  // Paid search tools
  {
    name: "search",
    title: "Web Search",
    description: "Web and news search across the open internet.",
    price: "$0.003/query",
    category: "search",
    free: false,
  },
  {
    name: "research",
    title: "Deep Research",
    description: "Neural deep-research across multiple sources.",
    price: "$0.010/query",
    category: "search",
    free: false,
  },
  {
    name: "youtube",
    title: "YouTube",
    description: "Video search with transcript and caption extraction.",
    price: "$0.002/call",
    category: "search",
    free: false,
  },

  // Paid AI tools
  {
    name: "screenshot",
    title: "Screenshot",
    description: "Capture a full-page screenshot of any URL.",
    price: "$0.010/screenshot",
    category: "ai",
    free: false,
  },
  {
    name: "scrape",
    title: "Scrape",
    description: "Extract clean text content from any webpage.",
    price: "$0.002/page",
    category: "ai",
    free: false,
  },
  {
    name: "image",
    title: "Image Generation",
    description: "Generate images with DALL-E 3.",
    price: "$0.040/image",
    category: "ai",
    free: false,
  },

  // Paid data tools
  {
    name: "stocks",
    title: "Stocks",
    description: "Real-time stock prices and financial data.",
    price: "$0.001/query",
    category: "data",
    free: false,
  },

  // Free Stellar-native tools
  {
    name: "dex-orderbook",
    title: "DEX Orderbook",
    description: "Live bids and asks for any Stellar trading pair.",
    price: null,
    category: "stellar",
    free: true,
  },
  {
    name: "dex-candles",
    title: "DEX Candles",
    description: "OHLCV price chart data from the Stellar DEX.",
    price: null,
    category: "stellar",
    free: true,
  },
  {
    name: "dex-trades",
    title: "DEX Trades",
    description: "Recent trade history on the Stellar DEX.",
    price: null,
    category: "stellar",
    free: true,
  },
  {
    name: "swap-quote",
    title: "Swap Quote",
    description: "Find the best swap path between any two Stellar assets.",
    price: null,
    category: "stellar",
    free: true,
  },
  {
    name: "stellar-asset",
    title: "Asset Info",
    description: "Asset metadata, issuer info, and trust rating.",
    price: null,
    category: "stellar",
    free: true,
  },
  {
    name: "stellar-account",
    title: "Account Lookup",
    description: "Stellar account balances, flags, and signers.",
    price: null,
    category: "stellar",
    free: true,
  },
  {
    name: "stellar-pools",
    title: "Liquidity Pools",
    description: "Stellar AMM liquidity pool info and reserves.",
    price: null,
    category: "stellar",
    free: true,
  },
  {
    name: "oracle-price",
    title: "Oracle Price",
    description: "Decentralized price feeds via Reflector oracle.",
    price: null,
    category: "stellar",
    free: true,
  },

  // Free utility tools
  {
    name: "crypto",
    title: "Crypto Prices",
    description: "Live crypto prices and market data via CoinGecko.",
    price: null,
    category: "data",
    free: true,
  },
  {
    name: "weather",
    title: "Weather",
    description: "Current weather and forecasts for any location.",
    price: null,
    category: "utility",
    free: true,
  },
  {
    name: "domain",
    title: "Domain Check",
    description: "Check domain name availability instantly.",
    price: null,
    category: "utility",
    free: true,
  },
  {
    name: "wallet",
    title: "Wallet",
    description: "Check your MPP channel balance and payment state.",
    price: null,
    category: "utility",
    free: true,
  },
  {
    name: "tools",
    title: "List Tools",
    description: "List all available PULSAR tools and their prices.",
    price: null,
    category: "utility",
    free: true,
  },
]
