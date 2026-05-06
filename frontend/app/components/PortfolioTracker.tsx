"use client";

import { useState } from "react";
import { PlusCircle, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import { formatCurrency, formatPercent } from "../lib/api";

const AVAILABLE_COINS = [
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

interface MarketCoin {
  id: string;
  current_price: number;
  image: string;
  name: string;
  symbol: string;
}

interface Props {
  markets: MarketCoin[];
  currency: string;
}

export default function PortfolioTracker({ markets, currency }: Props) {
  const { holdings, addHolding, removeHolding } = usePortfolio();
  const [form, setForm] = useState({ coinId: "bitcoin", amount: "", buyPrice: "" });
  const [showForm, setShowForm] = useState(false);

  const priceMap = Object.fromEntries(markets.map((c) => [c.id, c.current_price]));
  const imageMap = Object.fromEntries(markets.map((c) => [c.id, c.image]));
  const nameMap = Object.fromEntries(markets.map((c) => [c.id, c.name]));

  const enriched = holdings.map((h) => {
    const currentPrice = priceMap[h.id] ?? 0;
    const currentValue = currentPrice * h.amount;
    const costBasis = h.buyPrice * h.amount;
    const pnl = currentValue - costBasis;
    const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return { ...h, currentPrice, currentValue, costBasis, pnl, pnlPct };
  });

  const totalValue = enriched.reduce((s, h) => s + h.currentValue, 0);
  const totalCost = enriched.reduce((s, h) => s + h.costBasis, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  function handleAdd() {
    const amount = parseFloat(form.amount);
    const buyPrice = parseFloat(form.buyPrice);
    if (!amount || !buyPrice || amount <= 0 || buyPrice <= 0) return;
    const coin = AVAILABLE_COINS.find((c) => c.id === form.coinId)!;
    addHolding({
      id: coin.id,
      symbol: coin.symbol,
      name: nameMap[coin.id] ?? coin.name,
      image: imageMap[coin.id] ?? "",
      amount,
      buyPrice,
    });
    setForm({ coinId: "bitcoin", amount: "", buyPrice: "" });
    setShowForm(false);
  }

  function fmt(n: number) {
    return formatCurrency(n, currency.toUpperCase(), n >= 1_000_000);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-[var(--text-secondary)]">Valor Total</span>
          </div>
          <p className="text-xl font-bold text-white">{totalValue > 0 ? fmt(totalValue) : "—"}</p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 mb-1">
            {totalPnl >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className="text-xs text-[var(--text-secondary)]">P&L Total</span>
          </div>
          <p className={`text-xl font-bold ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalCost > 0 ? `${totalPnl >= 0 ? "+" : ""}${fmt(totalPnl)}` : "—"}
          </p>
          {totalCost > 0 && (
            <p className={`text-xs mt-0.5 ${totalPnlPct >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatPercent(totalPnlPct)}
            </p>
          )}
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[var(--text-secondary)]">Custo Total</span>
          </div>
          <p className="text-xl font-bold text-white">{totalCost > 0 ? fmt(totalCost) : "—"}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{holdings.length} ativo(s)</p>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <h3 className="font-semibold text-white">Meu Portfólio</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </div>

        {showForm && (
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex flex-wrap gap-3 items-end">
            <div>
              <p className="text-xs text-[var(--text-secondary)] mb-1">Moeda</p>
              <select
                value={form.coinId}
                onChange={(e) => setForm({ ...form, coinId: e.target.value })}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {AVAILABLE_COINS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.symbol} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] mb-1">Quantidade</p>
              <input
                type="number"
                min="0"
                placeholder="0.5"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white w-32 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] mb-1">Preço de compra (USD)</p>
              <input
                type="number"
                min="0"
                placeholder="45000"
                value={form.buyPrice}
                onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white w-36 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] rounded-lg text-sm hover:border-blue-500/40 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {holdings.length === 0 ? (
          <div className="px-4 py-12 text-center text-[var(--text-secondary)]">
            <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Nenhum ativo adicionado.</p>
            <p className="text-xs mt-1">Clique em &quot;Adicionar&quot; para começar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--text-secondary)] text-xs border-b border-[var(--border)]">
                  <th className="text-left px-4 py-3 font-medium">Ativo</th>
                  <th className="text-right px-4 py-3 font-medium">Qtd</th>
                  <th className="text-right px-4 py-3 font-medium">Preço médio</th>
                  <th className="text-right px-4 py-3 font-medium">Preço atual</th>
                  <th className="text-right px-4 py-3 font-medium">Valor</th>
                  <th className="text-right px-4 py-3 font-medium">P&L</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((h) => (
                  <tr
                    key={h.uid}
                    className="border-b border-[var(--border)]/50 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {h.image && (
                          <img src={h.image} alt={h.name} className="w-6 h-6 rounded-full" />
                        )}
                        <div>
                          <p className="font-semibold text-white">{h.name}</p>
                          <p className="text-xs text-[var(--text-secondary)] uppercase">{h.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-mono">{h.amount}</td>
                    <td className="px-4 py-3 text-right text-[var(--text-secondary)]">{fmt(h.buyPrice)}</td>
                    <td className="px-4 py-3 text-right text-white font-mono">
                      {h.currentPrice > 0 ? fmt(h.currentPrice) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-white font-semibold">
                      {h.currentValue > 0 ? fmt(h.currentValue) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {h.currentPrice > 0 ? (
                        <>
                          <p className={`font-semibold ${h.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {h.pnl >= 0 ? "+" : ""}
                            {fmt(h.pnl)}
                          </p>
                          <p className={`text-xs ${h.pnlPct >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {formatPercent(h.pnlPct)}
                          </p>
                        </>
                      ) : (
                        <span className="text-[var(--text-secondary)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeHolding(h.uid)}
                        className="text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
