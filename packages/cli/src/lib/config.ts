export const TOOL_PRICES: Record<string, string> = {
  search:     "0.003",
  research:   "0.010",
  reddit:     "0.002",
  youtube:    "0.002",
  screenshot: "0.010",
  scrape:     "0.002",
  image:      "0.040",
  stocks:     "0.001",
};

export const FREE_TOOLS = new Set(["crypto", "weather", "domain", "wallet", "tools"]);
