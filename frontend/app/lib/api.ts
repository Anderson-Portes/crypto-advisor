const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchMarkets(coins?: string[], currency = "usd") {
  const params = new URLSearchParams({ currency });
  if (coins?.length) params.set("coins", coins.join(","));
  const res = await fetch(`${API_BASE}/crypto/markets?${params}`);
  if (!res.ok) throw new Error("Failed to fetch markets");
  return res.json();
}

export async function fetchGlobalStats() {
  const res = await fetch(`${API_BASE}/crypto/global`);
  if (!res.ok) throw new Error("Failed to fetch global stats");
  return res.json();
}

export async function fetchTrending() {
  const res = await fetch(`${API_BASE}/crypto/trending`);
  if (!res.ok) throw new Error("Failed to fetch trending");
  return res.json();
}

export async function fetchChart(coinId: string, days: number, currency = "usd") {
  const res = await fetch(`${API_BASE}/crypto/chart/${coinId}?days=${days}&currency=${currency}`);
  if (!res.ok) throw new Error("Failed to fetch chart");
  return res.json();
}

export async function fetchNews(query?: string) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  const res = await fetch(`${API_BASE}/news/?${params}`);
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

export async function fetchFearGreed(): Promise<{ value: number; classification: string }> {
  const res = await fetch(`${API_BASE}/crypto/fear-greed`);
  if (!res.ok) throw new Error("Failed to fetch fear & greed");
  return res.json();
}

export async function sendChat(message: string, history: { role: string; content: string }[]) {
  const res = await fetch(`${API_BASE}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error("Failed to send chat");
  return res.json();
}

export function formatCurrency(value: number, currency = "USD", compact = false): string {
  if (compact && value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (compact && value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
