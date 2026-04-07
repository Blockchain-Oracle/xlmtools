const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function apiUrl(path: string): string {
  return `${API_URL}${path}`
}
