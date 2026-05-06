"use client";

import { useLayoutEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

interface Coin {
  id: string;
  symbol: string;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
}

interface Props {
  data: Coin[];
  loading: boolean;
}

export default function PerformanceChart({ data, loading }: Props) {
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => { setMounted(true); }, []);

  if (loading || !data.length) {
    return <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 h-64 animate-pulse" />;
  }

  const sorted = [...data]
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .map((c) => ({
      symbol: c.symbol.toUpperCase(),
      "24h": parseFloat((c.price_change_percentage_24h ?? 0).toFixed(2)),
      "7d": parseFloat((c.price_change_percentage_7d_in_currency ?? 0).toFixed(2)),
    }));

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Performance Comparativa (24h)</h3>
      <div className="h-52 overflow-hidden">
        {mounted && <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <XAxis dataKey="symbol" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ background: "#1a2235", border: "1px solid #1e2d45", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => { const n = Number(v); return [`${n > 0 ? "+" : ""}${n}%`, "24h"]; }}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <ReferenceLine y={0} stroke="#1e2d45" strokeWidth={1} />
            <Bar dataKey="24h" radius={[4, 4, 0, 0]}>
              {sorted.map((entry, i) => (
                <Cell key={i} fill={entry["24h"] >= 0 ? "#10b981" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>}
      </div>
    </div>
  );
}
