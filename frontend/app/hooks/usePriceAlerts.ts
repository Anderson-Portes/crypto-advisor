"use client";
import { useCallback, useEffect, useState } from "react";

export interface PriceAlert {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  targetPrice: number;
  direction: "above" | "below";
  triggered: boolean;
}

export function usePriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("price_alerts");
    if (saved) setAlerts(JSON.parse(saved));
  }, []);

  function save(next: PriceAlert[]) {
    setAlerts(next);
    localStorage.setItem("price_alerts", JSON.stringify(next));
  }

  function addAlert(alert: Omit<PriceAlert, "id" | "triggered">) {
    save([...alerts, { ...alert, id: crypto.randomUUID(), triggered: false }]);
  }

  function removeAlert(id: string) {
    save(alerts.filter((a) => a.id !== id));
  }

  function resetAlert(id: string) {
    save(alerts.map((a) => (a.id === id ? { ...a, triggered: false } : a)));
  }

  const checkAlerts = useCallback(
    (prices: Record<string, number>) => {
      setAlerts((prev) => {
        const updated = prev.map((a) => {
          if (a.triggered) return a;
          const price = prices[a.coinId];
          if (!price) return a;
          const triggered =
            (a.direction === "above" && price >= a.targetPrice) ||
            (a.direction === "below" && price <= a.targetPrice);
          return triggered ? { ...a, triggered: true } : a;
        });
        if (updated.some((a, i) => a.triggered !== prev[i].triggered)) {
          localStorage.setItem("price_alerts", JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    },
    []
  );

  const triggeredCount = alerts.filter((a) => a.triggered).length;

  return { alerts, addAlert, removeAlert, resetAlert, checkAlerts, triggeredCount };
}
