"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { fetchMarkets, fetchChart, formatCurrency, formatPercent } from "../lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "matic-network", symbol: "MATIC", name: "Polygon" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
];

const COLORS = ["#3b82f6", "#10b981"];

interface CoinMetrics {
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  high_24h: number;
  low_24h: number;
  ath: number;
}

export default function CoinComparator({ currency }: { currency: string }) {
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState(["bitcoin", "ethereum"]);
  const [metrics, setMetrics] = useState<Record<string, CoinMetrics>>({});
  const [chartData, setChartData] = useState<Record<string, { time: string; pct: number }[]>>({});
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (selected.length < 2) return;
    setLoading(true);
    Promise.all([
      fetchMarkets(selected, currency).then((d) => {
        const map: Record<string, CoinMetrics> = {};
        (d.data ?? []).forEach((c: CoinMetrics & { id: string }) => { map[c.id] = c; });
        setMetrics(map);
      }),
      ...selected.map((id) =>
        fetchChart(id, 30, currency).then((raw) => {
          const prices: [number, number][] = raw.prices ?? [];
          const base = prices[0]?.[1] ?? 1;
          const formatted = prices.map(([ts, price]) => ({
            time: new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            pct: parseFloat((((price - base) / base) * 100).toFixed(2)),
          }));
          setChartData((prev) => ({ ...prev, [id]: formatted }));
        })
      ),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selected, currency]);

  function toggleCoin(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev;
        return prev.filter((c) => c !== id);
      }
      return [prev[1] ?? prev[0], id];
    });
  }

  const [idA, idB] = selected;
  const coinA = COINS.find((c) => c.id === idA);
  const coinB = COINS.find((c) => c.id === idB);
  const metricsA = metrics[idA];
  const metricsB = metrics[idB];

  const mergedChart = (() => {
    const aData = chartData[idA] ?? [];
    const bData = chartData[idB] ?? [];
    return aData.map((pt, i) => ({
      time: pt.time,
      [idA]: pt.pct,
      [idB]: bData[i]?.pct ?? 0,
    }));
  })();

  function fmtCompact(n: number) {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return formatCurrency(n, currency.toUpperCase());
  }

  const rows: {
    label: string;
    key: keyof CoinMetrics;
    fmt: (v: number) => string;
    better: "high" | "low";
  }[] = [
    { label: "Preço atual", key: "current_price", fmt: (v) => formatCurrency(v, currency.toUpperCase()), better: "high" },
    { label: "Market Cap", key: "market_cap", fmt: fmtCompact, better: "high" },
    { label: "Volume 24h", key: "total_volume", fmt: fmtCompact, better: "high" },
    { label: "Variação 24h", key: "price_change_percentage_24h", fmt: formatPercent, better: "high" },
    { label: "Variação 7d", key: "price_change_percentage_7d_in_currency", fmt: formatPercent, better: "high" },
    { label: "Máx 24h", key: "high_24h", fmt: (v) => formatCurrency(v, currency.toUpperCase()), better: "high" },
    { label: "Mín 24h", key: "low_24h", fmt: (v) => formatCurrency(v, currency.toUpperCase()), better: "high" },
    { label: "ATH", key: "ath", fmt: (v) => formatCurrency(v, currency.toUpperCase()), better: "high" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-2 font-medium">
          Selecione 2 moedas para comparar
        </p>
        <div className="flex flex-wrap gap-2">
          {COINS.map((c) => {
            const idx = selected.indexOf(c.id);
            const isSelected = idx !== -1;
            return (
              <button
                key={c.id}
                onClick={() => toggleCoin(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  isSelected
                    ? idx === 0
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-blue-500/40 hover:text-white"
                }`}
              >
                {c.symbol}
                {isSelected && (
                  <span
                    className={`text-[10px] font-bold ${
                      idx === 0 ? "text-blue-300" : "text-emerald-300"
                    }`}
                  >
                    {idx === 0 ? "A" : "B"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {mounted && mergedChart.length > 0 && (
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white text-sm">
                  Performance relativa — 30 dias (%)
                </h4>
                <div className="flex gap-4 text-xs">
                  {selected.map((id, i) => {
                    const coin = COINS.find((c) => c.id === id);
                    return (
                      <div key={id} className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-0.5 rounded"
                          style={{ background: COLORS[i] }}
                        />
                        <span className="text-[var(--text-secondary)]">{coin?.symbol}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="h-48 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mergedChart}>
                    <defs>
                      {selected.map((id, i) => (
                        <linearGradient key={id} id={`cmpGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1a2235",
                        border: "1px solid #1e2d45",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v, name) => {
                        const coin = COINS.find((c) => c.id === name);
                        return [`${Number(v).toFixed(2)}%`, coin?.symbol ?? String(name)];
                      }}
                    />
                    {selected.map((id, i) => (
                      <Area
                        key={id}
                        type="monotone"
                        dataKey={id}
                        stroke={COLORS[i]}
                        strokeWidth={2}
                        fill={`url(#cmpGrad${i})`}
                        dot={false}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {metricsA && metricsB && coinA && coinB && (
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="grid grid-cols-3 text-xs text-[var(--text-secondary)] font-medium border-b border-[var(--border)] px-4 py-3">
                <span>Métrica</span>
                <span className="text-center text-blue-400">{coinA.symbol}</span>
                <span className="text-center text-emerald-400">{coinB.symbol}</span>
              </div>
              {rows.map((row) => {
                const valA = metricsA[row.key] as number;
                const valB = metricsB[row.key] as number;
                const aWins = row.better === "high" ? valA > valB : valA < valB;
                const bWins = row.better === "high" ? valB > valA : valB < valA;
                return (
                  <div
                    key={row.key}
                    className="grid grid-cols-3 items-center px-4 py-2.5 border-b border-[var(--border)]/50 hover:bg-white/5 transition-colors text-sm"
                  >
                    <span className="text-[var(--text-secondary)] text-xs">{row.label}</span>
                    <span
                      className={`text-center font-semibold ${
                        aWins ? "text-blue-400" : "text-white"
                      }`}
                    >
                      {row.fmt(valA)}
                      {aWins && <span className="ml-1 text-[10px]">▲</span>}
                    </span>
                    <span
                      className={`text-center font-semibold ${
                        bWins ? "text-emerald-400" : "text-white"
                      }`}
                    >
                      {row.fmt(valB)}
                      {bWins && <span className="ml-1 text-[10px]">▲</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
