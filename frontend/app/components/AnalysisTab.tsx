"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import { fetchChart, fetchMarkets, formatCurrency, formatPercent } from "../lib/api";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, BarChart2, Activity, Layers, GitCompare } from "lucide-react";
import CoinComparator from "./CoinComparator";

const COINS = [
  { symbol: "BTC", id: "bitcoin", name: "Bitcoin" },
  { symbol: "ETH", id: "ethereum", name: "Ethereum" },
  { symbol: "BNB", id: "binancecoin", name: "BNB" },
  { symbol: "SOL", id: "solana", name: "Solana" },
  { symbol: "ADA", id: "cardano", name: "Cardano" },
  { symbol: "XRP", id: "ripple", name: "XRP" },
  { symbol: "DOGE", id: "dogecoin", name: "Dogecoin" },
  { symbol: "DOT", id: "polkadot", name: "Polkadot" },
  { symbol: "MATIC", id: "matic-network", name: "Polygon" },
  { symbol: "AVAX", id: "avalanche-2", name: "Avalanche" },
];

const PERIODS = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1A", days: 365 },
];

function StatCard({
  icon,
  label,
  value,
  sub,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  const color =
    positive === undefined
      ? "text-white"
      : positive
      ? "text-green-400"
      : "text-red-400";

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-blue-500/10">{icon}</div>
        <span className="text-xs text-[var(--text-secondary)] font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AnalysisTab({ currency }: { currency: string }) {
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState("bitcoin");
  const [days, setDays] = useState(30);
  const [chartData, setChartData] = useState<{ time: string; price: number; volume: number }[]>([]);
  const [coinInfo, setCoinInfo] = useState<Record<string, number> | null>(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useLayoutEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setLoadingChart(true);
    fetchChart(selectedId, days, currency)
      .then((raw) => {
        const prices: [number, number][] = raw.prices ?? [];
        const volumes: [number, number][] = raw.total_volumes ?? [];
        const volMap = new Map(volumes.map(([ts, v]) => [ts, v]));

        const formatted = prices.map(([ts, price]) => ({
          time:
            days === 1
              ? new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
              : new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          price: parseFloat(price.toFixed(2)),
          volume: parseFloat(((volMap.get(ts) ?? 0) / 1e6).toFixed(2)),
        }));
        setChartData(formatted);
      })
      .catch(console.error)
      .finally(() => setLoadingChart(false));
  }, [selectedId, days, currency]);

  useEffect(() => {
    setLoadingInfo(true);
    fetchMarkets([selectedId], currency)
      .then((d) => {
        const coin = d.data?.[0];
        if (coin) setCoinInfo(coin);
      })
      .catch(console.error)
      .finally(() => setLoadingInfo(false));
  }, [selectedId, currency]);

  const priceChange = coinInfo?.price_change_percentage_24h ?? 0;
  const positive = priceChange >= 0;
  const totalChange =
    chartData.length >= 2
      ? ((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price) * 100
      : 0;

  function fmtCompact(n: number) {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n?.toLocaleString() ?? "—"}`;
  }

  const selected = COINS.find((c) => c.id === selectedId)!;

  return (
    <div className="space-y-6">
      {/* Coin selector + period */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48">
          <p className="text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Selecionar moeda</p>
          <div className="flex flex-wrap gap-2">
            {COINS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedId === c.id
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-blue-500/40 hover:text-white"
                }`}
              >
                <span className="font-bold">{c.symbol}</span>
                <span className="hidden sm:inline opacity-60">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      {loadingInfo ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : coinInfo ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<DollarSign className="w-4 h-4 text-blue-400" />}
            label="Preço atual"
            value={formatCurrency(coinInfo.current_price, currency.toUpperCase())}
            sub={`${formatPercent(priceChange)} (24h)`}
            positive={positive}
          />
          <StatCard
            icon={<Activity className="w-4 h-4 text-yellow-400" />}
            label="Máx / Mín 24h"
            value={formatCurrency(coinInfo.high_24h, currency.toUpperCase())}
            sub={`Mín: ${formatCurrency(coinInfo.low_24h, currency.toUpperCase())}`}
          />
          <StatCard
            icon={<BarChart2 className="w-4 h-4 text-cyan-400" />}
            label="Volume 24h"
            value={fmtCompact(coinInfo.total_volume)}
            sub="Volume negociado"
          />
          <StatCard
            icon={<Layers className="w-4 h-4 text-purple-400" />}
            label="Market Cap"
            value={fmtCompact(coinInfo.market_cap)}
            sub={`ATH: ${formatCurrency(coinInfo.ath, currency.toUpperCase())}`}
          />
        </div>
      ) : null}

      {/* Chart */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-white">
              {selected.name} — Preço & Volume
            </h3>
            <span
              className={`text-sm font-semibold flex items-center gap-1 ${
                totalChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {totalChange >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {totalChange >= 0 ? "+" : ""}
              {totalChange.toFixed(2)}%
            </span>
          </div>
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                onClick={() => setDays(p.days)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  days === p.days
                    ? "bg-blue-500 text-white"
                    : "text-[var(--text-secondary)] hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loadingChart ? (
          <div className="h-72 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="h-72 overflow-hidden">
            {mounted && <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={totalChange >= 0 ? "#10b981" : "#ef4444"}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={totalChange >= 0 ? "#10b981" : "#ef4444"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="price"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                  tickFormatter={(v) =>
                    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                  }
                />
                <YAxis
                  yAxisId="vol"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tickFormatter={(v) => `${v}M`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a2235",
                    border: "1px solid #1e2d45",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v, name) =>
                    name === "price"
                      ? [`$${Number(v).toLocaleString()}`, "Preço"]
                      : [`$${Number(v).toLocaleString()}M`, "Volume"]
                  }
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#94a3b8", fontSize: 11 }}>
                      {value === "price" ? "Preço" : "Volume (M)"}
                    </span>
                  )}
                />
                <Bar
                  yAxisId="vol"
                  dataKey="volume"
                  fill="#3b82f620"
                  stroke="#3b82f640"
                  radius={[2, 2, 0, 0]}
                />
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  stroke={totalChange >= 0 ? "#10b981" : "#ef4444"}
                  strokeWidth={2}
                  fill="url(#priceGrad)"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>}
          </div>
        )}
      </div>

      {/* Comparador */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
        <div className="flex items-center gap-2 mb-4">
          <GitCompare className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white">Comparador de Moedas</h3>
        </div>
        <CoinComparator currency={currency} />
      </div>
    </div>
  );
}
