"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatPercent } from "../lib/api";
import { useState } from "react";
import CoinChart from "./CoinChart";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  total_volume: number;
  market_cap_rank: number;
  sparkline_in_7d?: { price: number[] };
}

interface Props {
  data: Coin[];
  loading: boolean;
  currency: string;
}

function MiniSparkline({ prices }: { prices: number[] }) {
  if (!prices?.length) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = prices
    .map((p, i) => `${(i / (prices.length - 1)) * w},${h - ((p - min) / range) * h}`)
    .join(" ");
  const positive = prices[prices.length - 1] >= prices[0];
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={positive ? "#10b981" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CryptoTable({ data, loading, currency }: Props) {
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] animate-pulse h-16" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-[var(--border)] text-center text-[var(--text-secondary)]">
        Nenhuma moeda encontrada com os filtros aplicados.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selectedCoin && (
        <CoinChart coinId={selectedCoin} currency={currency} onClose={() => setSelectedCoin(null)} />
      )}

      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] text-xs">
                <th className="text-left px-4 py-3 font-medium">#</th>
                <th className="text-left px-4 py-3 font-medium">Moeda</th>
                <th className="text-right px-4 py-3 font-medium">Preço</th>
                <th className="text-right px-4 py-3 font-medium">1h</th>
                <th className="text-right px-4 py-3 font-medium">24h</th>
                <th className="text-right px-4 py-3 font-medium">7d</th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Volume 24h</th>
                <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Market Cap</th>
                <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">7 dias</th>
              </tr>
            </thead>
            <tbody>
              {data.map((coin) => {
                const change24 = coin.price_change_percentage_24h ?? 0;
                const change1h = coin.price_change_percentage_1h_in_currency ?? 0;
                const change7d = coin.price_change_percentage_7d_in_currency ?? 0;
                return (
                  <tr
                    key={coin.id}
                    onClick={() => setSelectedCoin(selectedCoin === coin.id ? null : coin.id)}
                    className="border-b border-[var(--border)]/50 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-[var(--text-secondary)] text-xs">{coin.market_cap_rank}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />
                        <div>
                          <p className="font-semibold text-white">{coin.name}</p>
                          <p className="text-xs text-[var(--text-secondary)] uppercase">{coin.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                      {formatCurrency(coin.current_price, currency.toUpperCase())}
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-semibold ${change1h >= 0 ? "text-green-400" : "text-red-400"}`}>
                      <span className="flex items-center justify-end gap-0.5">
                        {change1h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatPercent(change1h)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-semibold ${change24 >= 0 ? "text-green-400" : "text-red-400"}`}>
                      <span className="flex items-center justify-end gap-0.5">
                        {change24 >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatPercent(change24)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-semibold ${change7d >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatPercent(change7d)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-[var(--text-secondary)] hidden md:table-cell">
                      {formatCurrency(coin.total_volume, currency.toUpperCase(), true)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-[var(--text-secondary)] hidden lg:table-cell">
                      {formatCurrency(coin.market_cap, currency.toUpperCase(), true)}
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <MiniSparkline prices={coin.sparkline_in_7d?.price ?? []} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
