"use client";
import { useEffect, useState } from "react";

export interface Holding {
  uid: string;
  id: string;
  symbol: string;
  name: string;
  image: string;
  amount: number;
  buyPrice: number;
}

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("portfolio");
    if (saved) setHoldings(JSON.parse(saved));
  }, []);

  function save(next: Holding[]) {
    setHoldings(next);
    localStorage.setItem("portfolio", JSON.stringify(next));
  }

  function addHolding(h: Omit<Holding, "uid">) {
    save([...holdings, { ...h, uid: crypto.randomUUID() }]);
  }

  function removeHolding(uid: string) {
    save(holdings.filter((h) => h.uid !== uid));
  }

  return { holdings, addHolding, removeHolding };
}
