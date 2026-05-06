"use client";

import { useLayoutEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#f7931a", "#627eea", "#f3ba2f", "#9945ff", "#e84142", "#3b82f6"];

interface Props {
  globalStats: Record<string, unknown> | null;
  loading: boolean;
}

export default function DominanceChart({ globalStats, loading }: Props) {
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => { setMounted(true); }, []);

  if (loading || !globalStats) {
    return <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 h-64 animate-pulse" />;
  }

  const pct = (globalStats.market_cap_percentage as Record<string, number>) ?? {};
  const top5 = Object.entries(pct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const othersTotal = 100 - top5.reduce((s, [, v]) => s + v, 0);

  const data = [
    ...top5.map(([name, value]) => ({ name: name.toUpperCase(), value: parseFloat(value.toFixed(1)) })),
    { name: "Outros", value: parseFloat(othersTotal.toFixed(1)) },
  ];

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Dominância de Mercado</h3>
      <div className="h-52 overflow-hidden">
        {mounted && <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#1a2235", border: "1px solid #1e2d45", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${Number(v)}%`, "Dominância"]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>}
      </div>
    </div>
  );
}
