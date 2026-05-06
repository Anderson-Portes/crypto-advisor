"use client";

import { Flame } from "lucide-react";

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number;
  data?: { price_change_percentage_24h?: { usd?: number } };
}

interface Props {
  coins: TrendingCoin[];
  loading: boolean;
}

export default function TrendingSection({ coins, loading }: Props) {
  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 space-y-3">
      <h2 className="font-semibold text-white flex items-center gap-2 text-sm">
        <Flame className="w-4 h-4 text-orange-400" />
        Em Alta Agora
      </h2>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[var(--bg-secondary)] rounded-lg p-2 animate-pulse h-10" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {coins.slice(0, 7).map((coin, i) => {
            const change = coin.data?.price_change_percentage_24h?.usd ?? 0;
            const positive = change >= 0;
            return (
              <div
                key={coin.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="text-xs text-[var(--text-secondary)] w-4">{i + 1}</span>
                <img src={coin.thumb} alt={coin.name} className="w-6 h-6 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{coin.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] uppercase">{coin.symbol}</p>
                </div>
                <span className={`text-xs font-bold ${positive ? "text-green-400" : "text-red-400"}`}>
                  {positive ? "+" : ""}{change.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
