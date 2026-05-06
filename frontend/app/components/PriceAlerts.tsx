"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, PlusCircle, Trash2, CheckCircle, RotateCcw } from "lucide-react";
import { usePriceAlerts } from "../hooks/usePriceAlerts";
import { formatCurrency } from "../lib/api";

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
}

interface Props {
  markets: MarketCoin[];
}

export default function PriceAlerts({ markets }: Props) {
  const { alerts, addAlert, removeAlert, resetAlert, checkAlerts } = usePriceAlerts();
  const [form, setForm] = useState({
    coinId: "bitcoin",
    targetPrice: "",
    direction: "above" as "above" | "below",
  });
  const [showForm, setShowForm] = useState(false);

  const priceMap = Object.fromEntries(markets.map((c) => [c.id, c.current_price]));

  useEffect(() => {
    if (markets.length > 0) checkAlerts(priceMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markets]);

  function handleAdd() {
    const targetPrice = parseFloat(form.targetPrice);
    if (!targetPrice || targetPrice <= 0) return;
    const coin = AVAILABLE_COINS.find((c) => c.id === form.coinId)!;
    addAlert({ coinId: coin.id, symbol: coin.symbol, name: coin.name, targetPrice, direction: form.direction });
    setForm({ coinId: "bitcoin", targetPrice: "", direction: "above" });
    setShowForm(false);
  }

  const triggeredAlerts = alerts.filter((a) => a.triggered);
  const pendingAlerts = alerts.filter((a) => !a.triggered);

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-yellow-400" />
          <h3 className="font-semibold text-white">Alertas de Preço</h3>
          {triggeredAlerts.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">
              {triggeredAlerts.length} disparado(s)
            </span>
          )}
          {pendingAlerts.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">
              {pendingAlerts.length} ativo(s)
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Novo alerta
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
            <p className="text-xs text-[var(--text-secondary)] mb-1">Condição</p>
            <select
              value={form.direction}
              onChange={(e) => setForm({ ...form, direction: e.target.value as "above" | "below" })}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="above">Subir acima de</option>
              <option value="below">Cair abaixo de</option>
            </select>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">Preço alvo (USD)</p>
            <input
              type="number"
              min="0"
              placeholder="45000"
              value={form.targetPrice}
              onChange={(e) => setForm({ ...form, targetPrice: e.target.value })}
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

      {alerts.length === 0 ? (
        <div className="px-4 py-10 text-center text-[var(--text-secondary)]">
          <BellOff className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>Nenhum alerta configurado.</p>
          <p className="text-xs mt-1">Clique em &quot;Novo alerta&quot; para começar.</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]/50">
          {alerts.map((alert) => {
            const currentPrice = priceMap[alert.coinId] ?? 0;
            const coin = AVAILABLE_COINS.find((c) => c.id === alert.coinId);
            return (
              <div
                key={alert.id}
                className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5 ${
                  alert.triggered ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {alert.triggered ? (
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <Bell className="w-4 h-4 text-yellow-400 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {coin?.symbol ?? alert.symbol} —{" "}
                      {alert.direction === "above" ? "acima de" : "abaixo de"}{" "}
                      <span className="text-blue-400">{formatCurrency(alert.targetPrice, "USD")}</span>
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {alert.triggered
                        ? "Alerta disparado!"
                        : currentPrice > 0
                        ? `Preço atual: ${formatCurrency(currentPrice, "USD")}`
                        : "Aguardando dados..."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {alert.triggered && (
                    <button
                      onClick={() => resetAlert(alert.id)}
                      className="text-[var(--text-secondary)] hover:text-blue-400 transition-colors"
                      title="Resetar alerta"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
