/**
 * Shared fetch helper for tool calls against the XLMTools API.
 *
 * Every API request gets stamped with `X-XLMTools-Client: <G-address>`
 * so the server can attribute calls back to the user's wallet on the
 * /stats/by-client endpoint. The header is self-declared (no signature)
 * which is fine because:
 *   - Paid calls are additionally verified by the Stellar tx receipt
 *   - Free calls have no economic value to spoof
 *
 * Usage:
 *   const config = loadOrCreateWallet();
 *   const res = await apiFetch(config, `/crypto?ids=${ids}`);
 */

export interface ClientConfig {
  apiUrl: string;
  stellarPublicKey: string;
}

export async function apiFetch(
  config: ClientConfig,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${config.apiUrl}${path}`;
  const headers = new Headers(init?.headers);
  headers.set("X-XLMTools-Client", config.stellarPublicKey);
  return fetch(url, { ...init, headers });
}
