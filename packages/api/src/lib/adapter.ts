import type { Request, Response } from "express";

export function nodeToWebRequest(req: Request, baseUrl: string): globalThis.Request {
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

export async function sendWebResponse(webRes: globalThis.Response, res: Response): Promise<void> {
  webRes.headers.forEach((value, key) => res.setHeader(key, value));
  res.status(webRes.status).send(await webRes.text());
}
