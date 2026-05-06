"use client";

import { Globe, TrendingUp, TrendingDown, DollarSign, BarChart2 } from "lucide-react";

interface Props {
  data: Record<string, unknown> | null;
  loading: boolean;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className={`card-glow bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] fade-in`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
        <span className="text-xs text-[var(--text-secondary)] font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function GlobalStats({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] animate-pulse h-24" />
        ))}
      </div>
    );
  }

  const mcap = (data.total_market_cap as Record<string, number>)?.usd ?? 0;
  const vol = (data.total_volume as Record<string, number>)?.usd ?? 0;
  const btcDom = (data.market_cap_percentage as Record<string, number>)?.btc ?? 0;
  const change = data.market_cap_change_percentage_24h_usd as number ?? 0;
  const positive = change >= 0;

  function fmt(n: number) {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toFixed(0)}`;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Globe className="w-4 h-4 text-blue-400" />}
        label="Market Cap Total"
        value={fmt(mcap)}
        color="bg-blue-500/10"
      />
      <StatCard
        icon={<BarChart2 className="w-4 h-4 text-cyan-400" />}
        label="Volume 24h"
        value={fmt(vol)}
        color="bg-cyan-500/10"
      />
      <StatCard
        icon={
          positive ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )
        }
        label="Variação 24h"
        value={`${positive ? "+" : ""}${change.toFixed(2)}%`}
        color={positive ? "bg-green-500/10" : "bg-red-500/10"}
      />
      <StatCard
        icon={<DollarSign className="w-4 h-4 text-yellow-400" />}
        label="Dominância BTC"
        value={`${btcDom.toFixed(1)}%`}
        sub="do market cap total"
        color="bg-yellow-500/10"
      />
    </div>
  );
}
