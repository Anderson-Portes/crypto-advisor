"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchMarkets, fetchGlobalStats, fetchTrending, fetchNews } from "./lib/api";
import Header from "./components/Header";
import GlobalStats from "./components/GlobalStats";
import Filters from "./components/Filters";
import CryptoTable from "./components/CryptoTable";
import NewsSection from "./components/NewsSection";
import TipsSection from "./components/TipsSection";
import TrendingSection from "./components/TrendingSection";
import DominanceChart from "./components/DominanceChart";
import PerformanceChart from "./components/PerformanceChart";
import AnalysisTab from "./components/AnalysisTab";
import ChatBot from "./components/ChatBot";
import { LayoutDashboard, Newspaper, Lightbulb, RefreshCw, LineChart } from "lucide-react";

const DEFAULT_COINS = [
  "bitcoin", "ethereum", "binancecoin", "solana", "cardano",
  "ripple", "dogecoin", "polkadot", "matic-network", "avalanche-2",
];

type Tab = "markets" | "analysis" | "news" | "tips";

export default function Home() {
  const [tab, setTab] = useState<Tab>("markets");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [sortBy, setSortBy] = useState("market_cap_desc");
  const [selectedCoins, setSelectedCoins] = useState<string[]>(DEFAULT_COINS);

  const [markets, setMarkets] = useState([]);
  const [globalStats, setGlobalStats] = useState<Record<string, unknown> | null>(null);
  const [trending, setTrending] = useState([]);
  const [news, setNews] = useState([]);

  const [loadingMarkets, setLoadingMarkets] = useState(true);
  const [loadingGlobal, setLoadingGlobal] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);

  function toggleCoin(id: string) {
    setSelectedCoins((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((c) => c !== id) : prev) : [...prev, id]
    );
  }

  const loadMarkets = useCallback(async () => {
    setLoadingMarkets(true);
    try {
      const data = await fetchMarkets(selectedCoins, currency);
      setMarkets(data.data ?? []);
    } catch { /* ignore */ }
    finally { setLoadingMarkets(false); }
  }, [selectedCoins, currency]);

  const loadGlobal = useCallback(async () => {
    setLoadingGlobal(true);
    try { setGlobalStats(await fetchGlobalStats()); }
    catch { /* ignore */ }
    finally { setLoadingGlobal(false); }
  }, []);

  const loadTrending = useCallback(async () => {
    setLoadingTrending(true);
    try {
      const d = await fetchTrending();
      setTrending(d.coins ?? []);
    } catch { /* ignore */ }
    finally { setLoadingTrending(false); }
  }, []);

  const loadNews = useCallback(async (query?: string) => {
    setLoadingNews(true);
    try {
      const d = await fetchNews(query);
      setNews(d.articles ?? []);
    } catch { /* ignore */ }
    finally { setLoadingNews(false); }
  }, []);

  useEffect(() => {
    loadMarkets();
    loadGlobal();
    loadTrending();
    loadNews();
    setLastUpdated(new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadMarkets(); }, [loadMarkets]);

  async function refresh() {
    setRefreshing(true);
    await Promise.all([loadMarkets(), loadGlobal(), loadTrending()]);
    setLastUpdated(new Date());
    setRefreshing(false);
  }

  const filteredMarkets = [...markets]
    .filter((c: { name: string; symbol: string }) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: Record<string, number>, b: Record<string, number>) => {
      switch (sortBy) {
        case "price_desc": return b.current_price - a.current_price;
        case "price_asc": return a.current_price - b.current_price;
        case "change_desc": return b.price_change_percentage_24h - a.price_change_percentage_24h;
        case "change_asc": return a.price_change_percentage_24h - b.price_change_percentage_24h;
        default: return b.market_cap - a.market_cap;
      }
    });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "markets", label: "Mercados", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "analysis", label: "Análise", icon: <LineChart className="w-4 h-4" /> },
    { id: "news", label: "Notícias", icon: <Newspaper className="w-4 h-4" /> },
    { id: "tips", label: "Dicas", icon: <Lightbulb className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header lastUpdated={lastUpdated} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <GlobalStats data={globalStats} loading={loadingGlobal} />

        {/* Tab Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 bg-[var(--bg-card)] border border-[var(--border)] p-1 rounded-xl">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "text-[var(--text-secondary)] hover:text-white"
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {tab === "markets" && (
            <button
              onClick={refresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-white border border-[var(--border)] hover:border-blue-500/40 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar
            </button>
          )}
        </div>

        {/* Markets Tab */}
        {tab === "markets" && (
          <div className="space-y-6">
            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DominanceChart globalStats={globalStats} loading={loadingGlobal} />
              <PerformanceChart data={filteredMarkets} loading={loadingMarkets} />
            </div>

            {/* Filters + table */}
            <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">
              <div className="space-y-4">
                <Filters
                  search={search}
                  setSearch={setSearch}
                  currency={currency}
                  setCurrency={setCurrency}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  selectedCoins={selectedCoins}
                  toggleCoin={toggleCoin}
                />
                <TrendingSection coins={trending} loading={loadingTrending} />
              </div>
              <CryptoTable data={filteredMarkets} loading={loadingMarkets} currency={currency} />
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {tab === "analysis" && <AnalysisTab currency={currency} />}

        {/* News Tab */}
        {tab === "news" && (
          <NewsSection articles={news} loading={loadingNews} onSearch={(q) => loadNews(q)} />
        )}

        {/* Tips Tab */}
        {tab === "tips" && <TipsSection />}
      </main>

      <ChatBot />
    </div>
  );
}
