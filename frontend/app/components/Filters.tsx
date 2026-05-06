"use client";

import { Search, SlidersHorizontal, Star } from "lucide-react";

const CURRENCIES = ["usd", "brl", "eur", "btc"];
const SORT_OPTIONS = [
  { value: "market_cap_desc", label: "Market Cap ↓" },
  { value: "price_desc", label: "Preço ↓" },
  { value: "price_asc", label: "Preço ↑" },
  { value: "change_desc", label: "Variação ↓" },
  { value: "change_asc", label: "Variação ↑" },
];

const AVAILABLE_COINS = [
  { symbol: "BTC", id: "bitcoin" },
  { symbol: "ETH", id: "ethereum" },
  { symbol: "BNB", id: "binancecoin" },
  { symbol: "SOL", id: "solana" },
  { symbol: "ADA", id: "cardano" },
  { symbol: "XRP", id: "ripple" },
  { symbol: "DOGE", id: "dogecoin" },
  { symbol: "DOT", id: "polkadot" },
  { symbol: "MATIC", id: "matic-network" },
  { symbol: "AVAX", id: "avalanche-2" },
];

interface Props {
  search: string;
  setSearch: (v: string) => void;
  currency: string;
  setCurrency: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  selectedCoins: string[];
  toggleCoin: (id: string) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (v: boolean) => void;
  favoritesCount: number;
}

export default function Filters({
  search,
  setSearch,
  currency,
  setCurrency,
  sortBy,
  setSortBy,
  selectedCoins,
  toggleCoin,
  showFavoritesOnly,
  setShowFavoritesOnly,
  favoritesCount,
}: Props) {
  return (
    <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border)] space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
        <SlidersHorizontal className="w-4 h-4" />
        Filtros
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
        <input
          type="text"
          placeholder="Buscar moeda..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[var(--text-secondary)] focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Favorites toggle */}
      <button
        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
          showFavoritesOnly
            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/40"
            : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-transparent hover:border-[var(--border)]"
        }`}
      >
        <span className="flex items-center gap-2">
          <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-yellow-400" : ""}`} />
          Apenas favoritos
        </span>
        {favoritesCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px]">
            {favoritesCount}
          </span>
        )}
      </button>

      {/* Currency */}
      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-2 font-medium">Moeda de referência</p>
        <div className="flex flex-wrap gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                currency === c
                  ? "bg-blue-500 text-white"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-2 font-medium">Ordenar por</p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Coin filter */}
      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-2 font-medium">Moedas visíveis</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_COINS.map((c) => {
            const active = selectedCoins.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCoin(c.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-transparent hover:border-[var(--border)]"
                }`}
              >
                {c.symbol}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
