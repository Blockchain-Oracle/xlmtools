export type ToolCategory = "stellar" | "search" | "ai" | "data" | "utility"

export interface Tool {
  name: string
  title: string
  description: string
  price: string | null // null = free
  category: ToolCategory
  free: boolean
  prompt: string
  /** Optional brand logo stem from /logos/ (e.g. "stellar", "youtube") */
  logo?: string
  /** Whether a separate -dark.svg variant exists for the logo */
  logoHasDark?: boolean
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
    prompt: "search for the latest news about Stellar blockchain",
  },
  {
    name: "research",
    title: "Deep Research",
    description: "Neural deep-research across multiple sources.",
    price: "$0.010/query",
    category: "search",
    free: false,
    prompt: "research the current state of AI agent payment protocols",
  },
  {
    name: "youtube",
    title: "YouTube",
    description: "Video search with transcript and caption extraction.",
    price: "$0.002/call",
    category: "search",
    free: false,
    prompt: "find YouTube videos about Stellar lumens and get transcripts",
    logo: "youtube",
    logoHasDark: true,
  },

  // Paid AI tools
  {
    name: "screenshot",
    title: "Screenshot",
    description: "Capture a full-page screenshot of any URL.",
    price: "$0.010/screenshot",
    category: "ai",
    free: false,
    prompt: "take a screenshot of https://stellar.org",
  },
  {
    name: "scrape",
    title: "Scrape",
    description: "Extract clean text content from any webpage.",
    price: "$0.002/page",
    category: "ai",
    free: false,
    prompt: "scrape https://stellar.org/learn and extract the main content",
  },
  {
    name: "image",
    title: "Image Generation",
    description: "Generate images with DALL-E 3.",
    price: "$0.040/image",
    category: "ai",
    free: false,
    prompt: "generate an image of a futuristic Stellar blockchain network",
    logo: "openai",
    logoHasDark: false,
  },

  // Paid data tools
  {
    name: "stocks",
    title: "Stocks",
    description: "Real-time stock prices and financial data.",
    price: "$0.001/query",
    category: "data",
    free: false,
    prompt: "get the current price and market cap for AAPL and TSLA",
  },

  // Free Stellar-native tools
  {
    name: "dex-orderbook",
    title: "DEX Orderbook",
    description: "Live bids and asks for any Stellar trading pair.",
    price: null,
    category: "stellar",
    free: true,
    prompt: "show me the XLM/USDC orderbook on the Stellar DEX",
    logo: "stellar",
    logoHasDark: true,
  },
  {
    name: "dex-candles",
    title: "DEX Candles",
    description: "OHLCV price chart data from the Stellar DEX.",
    price: null,
    category: "stellar",
    free: true,
    prompt: "get hourly OHLCV candles for XLM/USDC over the last 24 hours",
    logo: "stellar",
    logoHasDark: true,
  },
  {
    name: "dex-trades",
    title: "DEX Trades",
    description: "Recent trade history on the Stellar DEX.",
    price: null,
    category: "stellar",
    free: true,
    prompt: "show recent trades for the XLM/USDC pair on Stellar DEX",
    logo: "stellar",
    logoHasDark: true,
  },
  {
    name: "swap-quote",
    title: "Swap Quote",
    description: "Find the best swap path between any two Stellar assets.",
    price: null,
    category: "stellar",
    free: true,
    prompt: "get the best swap quote to convert 100 XLM to USDC",
    logo: "stellar",
    logoHasDark: true,
  },
  {
    name: "stellar-asset",
    title: "Asset Info",
    description: "Asset metadata, issuer info, and trust rating.",
    price: null,
    category: "stellar",
    free: true,
    prompt: "look up info for the USDC asset on Stellar issued by Circle",
    logo: "stellar",
    logoHasDark: true,
  },
  {
    name: "stellar-account",
    title: "Account Lookup",
    description: "Stellar account balances, flags, and signers.",
    price: null,
    category: "stellar",
    free: true,
    prompt: "look up balances and info for Stellar account GAAZI4...",
    logo: "stellar",
    logoHasDark: true,
  },
  {
    name: "stellar-pools",
    title: "Liquidity Pools",
    description: "Stellar AMM liquidity pool info and reserves.",
    price: null,
    category: "stellar",
    free: true,
    prompt: "find the XLM/USDC liquidity pool on Stellar and show reserves",
    logo: "stellar",
    logoHasDark: true,
  },
  {
    name: "oracle-price",
    title: "Oracle Price",
    description: "Decentralized price feeds via Reflector oracle.",
    price: null,
    category: "stellar",
    free: true,
    prompt: "get the Reflector oracle price for XLM in USD",
    logo: "stellar",
    logoHasDark: true,
  },

  // Free utility/data tools
  {
    name: "crypto",
    title: "Crypto Prices",
    description: "Live crypto prices and market data via CoinGecko.",
    price: null,
    category: "data",
    free: true,
    prompt: "get current prices for bitcoin, ethereum, and stellar",
  },
  {
    name: "weather",
    title: "Weather",
    description: "Current weather and forecasts for any location.",
    price: null,
    category: "utility",
    free: true,
    prompt: "what is the current weather in San Francisco?",
  },
  {
    name: "domain",
    title: "Domain Check",
    description: "Check domain name availability instantly.",
    price: null,
    category: "utility",
    free: true,
    prompt: "check if pulsarmcp.io and pulsarmcp.com are available",
  },
  {
    name: "wallet",
    title: "Wallet",
    description: "Check your MPP channel balance and payment state.",
    price: null,
    category: "utility",
    free: true,
    prompt: "check my XLMTools wallet balance and payment channel status",
  },
  {
    name: "tools",
    title: "List Tools",
    description: "List all available XLMTools tools and their prices.",
    price: null,
    category: "utility",
    free: true,
    prompt: "list all available XLMTools tools with their prices",
  },
]
