"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { fetchChart } from "../lib/api";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const PERIOD_OPTIONS = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1A", days: 365 },
];

interface Props {
  coinId: string;
  currency: string;
  onClose: () => void;
}

export default function CoinChart({ coinId, currency, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [days, setDays] = useState(7);
  const [data, setData] = useState<{ time: string; price: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setLoading(true);
    fetchChart(coinId, days, currency)
      .then((raw) => {
        const prices: [number, number][] = raw.prices ?? [];
        const formatted = prices.map(([ts, price]) => ({
          time: new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          price: parseFloat(price.toFixed(2)),
        }));
        setData(formatted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [coinId, days, currency]);

  const change = data.length >= 2 ? ((data[data.length - 1].price - data[0].price) / data[0].price) * 100 : 0;
  const positive = change >= 0;

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white capitalize">{coinId}</h3>
          <span className={`text-sm font-semibold flex items-center gap-1 ${positive ? "text-green-400" : "text-red-400"}`}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change >= 0 ? "+" : ""}{change.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p.days}
                onClick={() => setDays(p.days)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  days === p.days ? "bg-blue-500 text-white" : "text-[var(--text-secondary)] hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-[var(--text-secondary)]">
          <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="h-48 overflow-hidden">
          {mounted && <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={positive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={positive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                interval="preserveStartEnd"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={60}
                tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
              />
              <Tooltip
                contentStyle={{ background: "#1a2235", border: "1px solid #1e2d45", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#94a3b8" }}
                formatter={(v) => [`$${Number(v).toLocaleString()}`, "Preço"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={positive ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>}
        </div>
      )}
    </div>
  );
}
